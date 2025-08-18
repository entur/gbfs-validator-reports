import Home from './pages/Home';

import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="app">
        <div className="app-content">
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/:slug">
              <Home />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
