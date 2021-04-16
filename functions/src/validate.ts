import * as functions from "firebase-functions";
import Runner from "./runner";

const feeds = [
  {
    provider: "voioslo_proxy",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/voioslo",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "voitrondheim_proxy",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/voitrondheim",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "boltoslo_proxy",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/boltoslo",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "boltlillestrom_proxy",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/boltlillestrom",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "boltfredrikstad_proxy",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/boltfredrikstad",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "boltbergen_proxy",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/boltbergen",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "limeoslo_proxy",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/limeoslo",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "voioslo_original",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/voioslo/original",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "voitrondheim_original",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/voitrondheim/original",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "boltoslo_original",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/boltoslo/original",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "boltlillestrom_original",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/boltlillestrom/original",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "boltfredrikstad_original",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/boltfredrikstad/original",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "boltbergen_original",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/boltbergen/original",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "limeoslo_original",
    url: "https://api.dev.entur.io/mobility/v1/gbfs-v2_2/limeoslo/original",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "voioslo_entur",
    url: "https://api.dev.entur.io/mobility/v2/gbfs/voioslo",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "voitrondheim_entur",
    url: "https://api.dev.entur.io/mobility/v2/gbfs/voitrondheim",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "boltoslo_entur",
    url: "https://api.dev.entur.io/mobility/v2/gbfs/boltoslo",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "boltlillestrom_entur",
    url: "https://api.dev.entur.io/mobility/v2/gbfs/boltlillestrom",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "boltfredrikstad_entur",
    url: "https://api.dev.entur.io/mobility/v2/gbfs/boltfredrikstad",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "boltbergen_entur",
    url: "https://api.dev.entur.io/mobility/v2/gbfs/boltbergen",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
  {
    provider: "limeoslo_entur",
    url: "https://api.dev.entur.io/mobility/v2/gbfs/limeoslo",
    version: "2.2",
    freefloating: true,
    docked: false,
  },
];

export default function(admin: any) {
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
