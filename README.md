# En app

Denne web-appen er laget med Enturs mal for Create React App.

Med denne malen får du:

-   Oppsett av de mest elementære pakkene fra designsystemet
-   En enkelt, grunnleggende layout med meny på venstresida
-   Routing-oppsett med `react-router-dom`
-   Auth0-oppsett – fyll kun inn dine credentials
-   Prettier-oppsett for formatering av kode
-   TypeScript

Bidra gjerne til videreutvikling av malen. Du finner repoet på https://github.com/entur/cra-template-entur.

## Innlogging med Auth0

Med denne malen følger klart oppsett av Auth0-autentisering. Alt du trenger å gjøre er å fylle inn ditt prosjekt sine credentials som props til `Auth0Provider` i `App.tsx`.

Det er Auth0 sin egen React-SDK som er tatt i bruk, satt opp til å fungere med `react-router-dom`. Du finner mer informasjon om hvordan dette fungerer i lenkene under.

-   [Offisiell dokumentasjon for `@auth0/auth0-react`](https://auth0.com/docs/libraries/auth0-react).
-   [GitHub-repo for `auth0-react`](https://github.com/auth0/auth0-react)
-   [Protecting a route in a react-router-dom app](https://github.com/auth0/auth0-react/blob/master/EXAMPLES.md#1-protecting-a-route-in-a-react-router-dom-app)
