import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useLocation,
  useParams
} from "react-router-dom";
import { withRouter } from 'react-router'

import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import FindByPointComponent from "./components/FindByPointComponent";

export default function App() {
  
  return (
    <Router>
      <div>
        <ul  className="nav">
          <li>
            <Link to="/">
                 <span className="logo"><img id='logo' src="compass.png"/></span> 
                 Stratnames Explorer
            </Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>         
        </ul>

        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/">            
            <FindByPointComponent />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function About() {
  return (
     <div>
        <h2>About</h2>
        <p>Stratnames Explorer App (prototype).</p>
        <p>Please note this site is in development and is available for demonstration purposes only.</p>
     </div>
  );
}


// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search);
}
