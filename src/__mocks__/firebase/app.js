'use strict';

const app = jest.createMockFromModule('firebase/app');

const docData = {
  slug: 'test-provider',
  stage: 'original',
  timestamp: 1,
  version: 2.2,
  hasErrors: false
};

const docResult = {
  data: () => docData
};

const collection = () => query;

const query = {
  where: () => query,
  orderBy: () => query,
  limit: () => query,
  get: () => {
    return {
      size: 1,
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
