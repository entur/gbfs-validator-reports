'use strict';

const app = jest.createMockFromModule('firebase/app');

const docData = {
  provider: 'test-provider',
  timestamp: 1,
  version: 2.2,
  hasErrors: false
};

const docResult = {
  data: () => docData
};

const collection = () => {
  return {
    get: () => {
      return {
        size: 1
      };
    }
  };
};

const query = {
  where: () => query,
  orderBy: () => query,
  limit: () => query,
  get: () => {
    return {
      docs: [docResult]
    }
  }
}

const collectionGroup = () => query;

const firestore = () => {
  return {
    collection,
    collectionGroup
  }
}

app.firestore = firestore;

module.exports = app;
