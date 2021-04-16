import React, { useEffect, useState } from 'react';

import { Heading1 } from '@entur/typography';
import ValidationReports from '../../components/ValidationReports';

import firebase from 'firebase/app';

const Home: React.FC = () => {
  const [reports, setReports] = useState<any>(null);

  useEffect(() => {
    const fetchReports = async () => {
      const timestamp = new Date().getTime() - (1000 * 60 * 60); // last hour
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
      {reports && <ValidationReports reports={reports} />}
    </div>
  );
};

export default Home;
