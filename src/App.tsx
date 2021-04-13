import { Router, Switch, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Auth0Provider, withAuthenticationRequired } from '@auth0/auth0-react';

import Profile from './pages/Profile';
import Home from './pages/Home';
import Info from './pages/Info';

import './App.css';

export const history = createBrowserHistory();

const ProtectedRoute = ({ component, ...args }: any) => (
  <Route component={withAuthenticationRequired(component)} {...args} />
);

const onRedirectCallback = (appState: any): void => {
  history.replace(appState?.returnTo || window.location.pathname);
};

function App() {
  return (
    <Auth0Provider
      domain="<DOMAIN>"
      clientId="<CLIENT_ID>"
      audience="<AUDIENCE>"
      redirectUri={window.location.origin + '<RELATIVE_CALLBACK_URL>'}
      cacheLocation="localstorage"
      useRefreshTokens
      onRedirectCallback={onRedirectCallback}
    >
      <Router history={history}>
        <div className="app">
          <div className="app-content">
            <Switch>
              <Route path="/info">
                <Info />
              </Route>
              <ProtectedRoute path="/profil" component={Profile} />
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    </Auth0Provider>
  );
}

export default App;
