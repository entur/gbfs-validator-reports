import * as functions from 'firebase-functions';
import Runner from './runner';
import * as devConfig from './config/dev.json';
import * as stagingConfig from './config/staging.json';
import * as productionConfig from './config/production.json';
import { PubSub } from '@google-cloud/pubsub';
import { VALID_MEMORY_OPTIONS } from 'firebase-functions';

const configMapping: Record<string, any> = {
  'gbfs-validator-reports-dev': devConfig,
  'gbfs-validator-reports-staging': stagingConfig,
  'gbfs-validator-reports-prod': productionConfig,
};

const getConfig = () => {
  return configMapping[
    JSON.parse(
      process.env.FIREBASE_CONFIG ??
        '{"projectId": "gbfs-validator-reports-dev"}',
    ).projectId
  ];
};

const pubsub = new PubSub();

type Feed = {
  slug: string;
  stage: string;
  url: string;
  version: string;
  freefloating: boolean;
  docked: boolean;
};

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: '1GB' as typeof VALID_MEMORY_OPTIONS[number]
};

export default function (admin: any) {
  const config = getConfig();
  const feeds: Feed[] = config.feeds;
  const db: any = admin.firestore();
  const bucket = (admin.storage() as any).bucket();

  return functions.pubsub
    ._scheduleWithOptions('every 10 minutes', runtimeOpts)
    .onRun(async (_) => {
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
              `reports/${feed.slug}_${feed.stage}/${feed.slug}_${feed.stage}_${timestamp}.json`,
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
              .doc(`${feed.slug}_${feed.stage}`)
              .get();

            if (!provider || !provider.exists || !provider.slug) {
              await provider.ref.set(feed, { merge: true });
            }

            await provider.ref.collection('reports').add({
              slug: feed.slug,
              stage: feed.stage,
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

export const manualTrigger = functions.https.onRequest(
  async (request, response) => {
    await pubsub.topic('firebase-schedule-validate').publishJSON({});
    response.sendStatus(204);
  },
);
