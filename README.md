# gbfs-validator-reports

Validation reports for any public GBFS v2.2 feed. Runs periodically and persists result summaries to firestore and detailed reports to storage. Reports can be explored accompanying web application.

![Architecture](architecture.png "Architecture")


## Development

Fully integrated development environment with local emulation of all firebase services:

    npm start

When making changes to `functions/src/**/*`, after starting the development environment, cd into `functions/` and run

    npm run build

To trigger validation function, which normally runs on a pubsub triggered schedule, an http endpoint is available in local development:

    curl -I http://localhost:5001/gbfs-validator-reports-dev/us-central1/manualTrigger

This will validate all feeds listen in `functions/src/config/dev.json`.

## Deployment

Uses firebase CLI for deployment in CircleCI.

### IAM

The deployment service account requires the following roles:

* Cloud Build Service Account
* Cloud Scheduler Admin
* Firebase Admin
* Service Account User
* API Keys Admin
