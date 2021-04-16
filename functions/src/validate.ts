import * as functions from "firebase-functions";
import Runner from "./runner";

type Feed = {
  provider: string;
  url: string;
  version: string;
  freefloating: boolean;
  docked: boolean;
};

export default function(admin: any) {
  const feeds: Feed[] = functions.config().feeds;
  const db: any = admin.firestore();
  const bucket = ( admin.storage() as any ).bucket();

  return functions.https.onRequest(async (request, response) => {
    await Promise.all(feeds.map(async (feed) => {
        try {
            const validator = new Runner(feed.url, {
                freefloating: feed.freefloating,
                docked: feed.docked,
            });
                
            const report = await validator.validation();
            const timestamp = new Date().getTime();
            const blob = bucket.file(`reports/${feed.provider}/${feed.provider}_${timestamp}.json`);
            const blobStream = blob.createWriteStream({
                gzip: true,
                resumable: false,
            });
            const publicUrl = await new Promise((resolve, reject) => {
            blobStream.on("finish", () => {
                resolve(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
            })
                .on("error", (error: any) => reject(error))
                .end(JSON.stringify(report));
            });
    
            const provider = await db.collection("providers").doc(feed.provider).get();
    
            if (!provider || !provider.exists) {
                await provider.ref.set(feed, { merge: true });
            }
    
            await provider.ref
            .collection("reports")
            .add({
                provider: feed.provider,
                timestamp,
                version: feed.version,
                hasErrors: report.summary.hasErrors,
                detailsUrl: publicUrl,
            });

            
        } catch (e) {
            console.log("Error", e);
        }
        return Promise.resolve("OK");
    }));

    response.send("OK");
  });
}
