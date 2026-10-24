import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import App from './App.jsx';
import { AuthProvider } from './AuthContext.jsx';

// Renders <App /> into the page. Vite only reads JSX inside .jsx files, so this entry
// file builds the tree with createElement. It is the same as:
// <React.StrictMode><BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter></React.StrictMode>
const h = React.createElement;

ReactDOM.createRoot(document.getElementById('root')).render(
  h(React.StrictMode, null, h(BrowserRouter, null, h(AuthProvider, null, h(App))))
);
