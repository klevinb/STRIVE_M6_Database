import React from 'react';
import App from './components/App'
import Backoffice from './components/Backoffice'
import Details from './components/Details'
import { BrowserRouter as Router, Route } from 'react-router-dom'

function MyShop(props) {
    return (
        <Router>
            <Route path="/" exact component={App} />
            <Route path="/productDetails/:id" component={Details} />
            <Route path="/backoffice" exact component={Backoffice} />
        </Router>
    );
}

export default MyShop;