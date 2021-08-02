import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import firebase from 'firebase/app';
import 'firebase/firestore';

const init = async () => {
  const firebaseConfigResponse = await fetch(
    process.env.PUBLIC_URL + '/__/firebase/init.json',
  );
  firebase.initializeApp(await firebaseConfigResponse.json());

  if (window.location.hostname === 'localhost') {
    firebase.firestore().useEmulator('localhost', 8080);
  }

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root'),
  );
};

init();
