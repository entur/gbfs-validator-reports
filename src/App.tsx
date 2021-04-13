import React from 'react'

import { Router, Switch, Route, Link, useLocation } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { Auth0Provider, withAuthenticationRequired } from '@auth0/auth0-react'

import { HomeIcon, FileIcon, UserIcon } from '@entur/icons'
import { SideNavigation, SideNavigationItem } from '@entur/menu'

import Profile from './pages/Profile'
import Home from './pages/Home'
import Info from './pages/Info'

import './App.css'

export const history = createBrowserHistory()

const ProtectedRoute = ({ component, ...args }: any) => (
    <Route component={withAuthenticationRequired(component)} {...args} />
)

const onRedirectCallback = (appState: any): void => {
    history.replace(appState?.returnTo || window.location.pathname)
}

const Menu = () => {
    const location = useLocation()

    return (
        <SideNavigation className="menu">
            <SideNavigationItem
                as={Link}
                to="/"
                active={location.pathname === '/'}
            >
                <HomeIcon /> Hjem
            </SideNavigationItem>
            <SideNavigationItem
                as={Link}
                to="/info"
                active={location.pathname === '/info'}
            >
                <FileIcon /> Informasjon
            </SideNavigationItem>
            <SideNavigationItem
                as={Link}
                to="/profil"
                active={location.pathname === '/profil'}
            >
                <UserIcon /> Profilside
            </SideNavigationItem>
        </SideNavigation>
    )
}

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
                    <Menu />
                    <div className="app-content">
                        <Switch>
                            <Route path="/info">
                                <Info />
                            </Route>
                            <ProtectedRoute
                                path="/profil"
                                component={Profile}
                            />
                            <Route path="/">
                                <Home />
                            </Route>
                        </Switch>
                    </div>
                </div>
            </Router>
        </Auth0Provider>
    )
}

export default App
