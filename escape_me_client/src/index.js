import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './components/App';
import Player from './components/Player';
import registerServiceWorker from './registerServiceWorker';

import { BrowserRouter, Link, Route } from 'react-router-dom';

ReactDOM.render(
    <BrowserRouter>
    <div>
        <Route exact path="/" component={App} />
        <Route path="/player" component={Player} />
    </div>
    </BrowserRouter>,
    document.querySelector('#app')
  );

registerServiceWorker();
