import React, { useEffect, useState } from 'react';

import { Heading1 } from '@entur/typography';
import ValidationReports from '../../components/ValidationReports';

import firebase from 'firebase/app';

const Home: React.FC = () => {
  const [reports, setReports] = useState<any>(null);

  useEffect(() => {
    const fetchReports = async () => {
      // last N hours
      const hours = 24;
      const timestamp = new Date().getTime() - (1000 * 60 * 60 * hours);
      const db = firebase.firestore();
      const reportsRef = db.collection('reports');
      const query = reportsRef.where("timestamp", ">", timestamp);
      const snapshot = await query.get();
      const reportSummaries: any = [];
      snapshot.forEach(doc => reportSummaries.push(doc.data()));
      setReports(reportSummaries);
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
