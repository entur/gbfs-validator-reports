import * as functions from "firebase-functions";
import * as GBFS from "gbfs-validator";

const feeds = [
  {
    provider: "voioslo_proxy",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/voioslo",
    version: "2.2",
    freeFloating: true,
    docking: false,
  },
];

export default function(admin: any) {
  const db: any = admin.firestore();
  const bucket = ( admin.storage() as any ).bucket();

  return functions.https.onRequest(async (request, response) => {
    await Promise.all(feeds.map(async (feed) => {
      const validator = new GBFS(feed.url, {
        freeFloating: feed.freeFloating,
        docking: feed.docking,
      });
      const report = await validator.validation();
      const timestamp = new Date().getTime();
      const blob = bucket.file(`${feed.provider}_${timestamp}.json`);
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
      await db.collection("reports").add({
        provider: feed.provider,
        timestamp,
        version: feed.version,
        hasErrors: report.summary.hasErrors,
        detailsUrl: publicUrl,
      });

      return Promise.resolve("OK");
    }));

    response.send("OK");
  });
}
