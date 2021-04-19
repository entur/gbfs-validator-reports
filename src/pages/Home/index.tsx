import React, { useEffect, useState } from 'react';

import { Heading1 } from '@entur/typography';
import ValidationReports from '../../components/ValidationReports';

import firebase from 'firebase/app';
import { TextField } from '@entur/form';
import { SearchIcon } from '@entur/icons';

const Home: React.FC = () => {
  const [reports, setReports] = useState<any>(null);
  const [filterSearch, setFilterSearch] = useState<string>();

  useEffect(() => {
    const fetchReports = async () => {
      const timestamp = new Date().getTime() - (1000 * 60 * 60 * 24); // last 24 hours
      const db = firebase.firestore();
      const providers = await db.collection('providers').get();
      const snapshot = await db.collectionGroup('reports')
        .where("timestamp", ">", timestamp)
        .orderBy("timestamp", "desc")
        .limit(providers.size)
        .get();
      setReports(
        snapshot.docs.map(docSnapshot => docSnapshot.data())
      );
    };
    fetchReports();
  }, []);

  return (
    <div>
      <Heading1>GBFS Validation reports</Heading1>
      <TextField
        label="Søk på provider"
        style={{ width: '15rem' }}
        prepend={<SearchIcon inline />}
        value={filterSearch}
        placeholder="voi"
        onChange={e => setFilterSearch(e.target.value)}
      />
      {reports && <ValidationReports reports={reports} filter={filterSearch} />}
    </div>
  );
};

export default Home;
