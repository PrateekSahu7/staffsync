import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx';
import { AuthProvider } from './AuthContext.jsx';
import { ThemeProvider } from './ThemeContext.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import { ConfirmProvider } from './components/ui/Confirm.jsx';

// Renders <App /> into the page. Vite only reads JSX inside .jsx files, so this entry
// file builds the tree with createElement. It is the same as nesting
// ThemeProvider > ToastProvider > ConfirmProvider > BrowserRouter > AuthProvider > App
// inside <React.StrictMode>.
const h = React.createElement;

ReactDOM.createRoot(document.getElementById('root')).render(
  h(
    React.StrictMode,
    null,
    h(ThemeProvider, null,
      h(ToastProvider, null,
        h(ConfirmProvider, null,
          h(BrowserRouter, null,
            h(AuthProvider, null, h(App))))))
  )
);
