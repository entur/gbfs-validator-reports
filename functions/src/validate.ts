import * as functions from 'firebase-functions';
import * as GBFS from '@entur/gbfs-validator';
import { PubSub } from '@google-cloud/pubsub';
import { VALID_MEMORY_OPTIONS } from 'firebase-functions';
import got from 'got';

const pubsub = new PubSub();

type BasicAuth = {
  type: 'basic_auth';
  basicAuth: {
    user: string;
    password: string;
  }
}

type BearerTokenAuth = {
  type: 'bearer_token',
  bearerToken: {
    token: string;
  }
}

type OauthClientCredentialsGrantAuth = {
  type: 'oauth_client_credentials_grant',
  oauthClientCredentialsGrant: {
    user: string;
    password: string;
    tokenUrl: string;
  };
}

type BoltAuth = {
  type: 'bolt',
  bolt: {
    url: string;
    user_name: string;
    user_pass: string;
  };
}

type Auth = BasicAuth | BearerTokenAuth | OauthClientCredentialsGrantAuth | BoltAuth;

type BoltAccessTokenResponse = {
  access_token: string;
}

type Feed = {
  slug: string;
  url: string;
  freefloating: boolean;
  docked: boolean;
  auth?: Auth;
};

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: '1GB' as typeof VALID_MEMORY_OPTIONS[number],
};

// https://matthiashager.com/converting-snake-case-to-camel-case-object-keys-with-javascript
const toCamel = (s: any) => {
  return s.replace(/([-_][a-z])/ig, ($1: any) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

const isObject = function (o: any) {
  return o === Object(o) && !isArray(o) && typeof o !== 'function';
};

const isArray = function (a: any) {
  return Array.isArray(a);
};

const keysToCamel = function (o: any) {
  if (isObject(o)) {
    const n: any = {};

    Object.keys(o)
      .forEach((k) => {
        n[toCamel(k)] = keysToCamel(o[k]);
      });

    return n;
  } else if (isArray(o)) {
    return o.map((i: any) => {
      return keysToCamel(i);
    });
  }

  return o;
};

export default function (admin: any) {
  const feeds: Feed[] = functions.config().feeds;
  const db: any = admin.firestore();
  const bucket = (admin.storage() as any).bucket();

  return functions.pubsub
    ._scheduleWithOptions('every 10 minutes', runtimeOpts)
    .onRun(async (_) => {
      const runtimeErrors: Error[] = [];
      await Promise.all(
        Object.values(feeds).map(async (feed) => {
          try {

            let auth: Auth | undefined = undefined;

            if (feed.auth?.type === 'bolt') {
              const accessTokenResponse: BoltAccessTokenResponse = await got
                .post(feed.auth.bolt.url, {
                  json: {
                    'user_name': feed.auth.bolt.user_name,
                    'user_pass': feed.auth.bolt.user_pass
                  }
                }).json()

              auth = {
                type: 'bearer_token',
                bearerToken: {
                  token: accessTokenResponse.access_token
                }
              };

              delete feed.auth;
            }

            const validator = new GBFS(feed.url, {
              freefloating: feed.freefloating,
              docked: feed.docked,
              auth: auth || keysToCamel(feed.auth),
            });

            const report = await validator.validation();

            if (report.summary.versionUnimplemented) {
              throw new Error('versionUnimplemented');
            }

            const timestamp = new Date().getTime();
            const blob = bucket.file(
              `reports/${feed.slug}/${feed.slug}_${timestamp}.json`,
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
              .doc(`${feed.slug}`)
              .get();

            if (!provider || !provider.exists || !provider.slug) {
              await provider.ref.set(feed, { merge: true });
            }

            await provider.ref.collection('reports').add({
              slug: feed.slug,
              timestamp,
              version: report.summary.version,
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
