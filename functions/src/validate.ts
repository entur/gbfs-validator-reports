import * as functions from 'firebase-functions';
import Runner from './runner';
import * as config from './config/dev.json';

type Feed = {
  provider: string;
  url: string;
  version: string;
  freefloating: boolean;
  docked: boolean;
};

export default function (admin: any) {
  const feeds: Feed[] = config.feeds;
  const db: any = admin.firestore();
  const bucket = (admin.storage() as any).bucket();

  return functions.pubsub.schedule('every 10 minutes').onRun(async (_) => {
    const runtimeErrors: Error[] = [];
    await Promise.all(
      feeds.map(async (feed) => {
        try {
          const validator = new Runner(feed.url, {
            freefloating: feed.freefloating,
            docked: feed.docked,
          });

          const report = await validator.validation();
          const timestamp = new Date().getTime();
          const blob = bucket.file(
            `reports/${feed.provider}/${feed.provider}_${timestamp}.json`,
          );
          const blobStream = blob.createWriteStream({
            gzip: true,
            resumable: false,
          });
          const publicUrl = await new Promise((resolve, reject) => {
            blobStream
              .on('finish', () => {
                resolve(
                  `https://storage.googleapis.com/${bucket.name}/${blob.name}`,
                );
              })
              .on('error', (error: any) => reject(error))
              .end(JSON.stringify(report));
          });

          const provider = await db
            .collection('providers')
            .doc(feed.provider)
            .get();

          if (!provider || !provider.exists) {
            await provider.ref.set(feed, { merge: true });
          }

          await provider.ref.collection('reports').add({
            provider: feed.provider,
            timestamp,
            version: feed.version,
            hasErrors: report.summary.hasErrors,
            detailsUrl: publicUrl,
          });
        } catch (e) {
          runtimeErrors.push(e);
        }
      }),
    );
    if (runtimeErrors.length > 0) {
      console.log('Finished validation with errors', runtimeErrors);
    }
  });
}
