import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './../node_modules/bootstrap/dist/css/bootstrap.css';
import './../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './css/style.css';


ReactDOM.render(
    <App/>,
    document.getElementById("app")
);