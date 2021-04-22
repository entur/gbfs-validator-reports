import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import firebase from 'firebase/app';
import 'firebase/firestore';

const init = async () => {
  const firebaseConfigResponse = await fetch('/__/firebase/init.json');
  firebase.initializeApp(await firebaseConfigResponse.json());

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root'),
  );
};

init();
