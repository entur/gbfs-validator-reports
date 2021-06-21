import React, { useEffect, useState } from 'react';

import { Heading1 } from '@entur/typography';
import ValidationReports from '../../components/ValidationReports';

import firebase from 'firebase/app';
import { TextField } from '@entur/form';
import { SearchIcon } from '@entur/icons';
import { usePathParam } from '../../usePathParam';
import { IconButton } from '@entur/button';
import { BackArrowIcon } from '@entur/icons';

const Home: React.FC = () => {
  const [reports, setReports] = useState<any>(null);
  const [filterSearch, setFilterSearch] = useState<string>();
  const [selectedSlug, setSelectedSlug] = usePathParam(0);

  useEffect(() => {
    const fetchReports = async () => {
      const timestamp = new Date().getTime() - 1000 * 60 * 60 * 24; // last 24 hours
      const db = firebase.firestore();

      if (selectedSlug) {
        const snapshot = await db
          .collectionGroup('reports')
          .where('stage', '==', 'original')
          .where('slug', '==', selectedSlug)
          .where('timestamp', '>', timestamp)
          .orderBy('timestamp', 'desc')
          .limit(25)
          .get();
        setReports(snapshot.docs.map((docSnapshot) => docSnapshot.data()));
      } else {
        const providers = await db.collection('providers')
          .where('stage', '==', 'original')
          .get();

        const snapshot = await db
          .collectionGroup('reports')
          .where('stage', '==', 'original')
          .where('timestamp', '>', timestamp)
          .orderBy('timestamp', 'desc')
          .limit(providers.size)
          .get();
        setReports(snapshot.docs.map((docSnapshot) => docSnapshot.data()));
      }
    };
    fetchReports();
  }, [selectedSlug]);

  return (
    <div>
      <Heading1>GBFS Validation reports</Heading1>
      {selectedSlug === null && (
        <TextField
          label="Filter systems"
          style={{ width: '15rem' }}
          prepend={<SearchIcon inline />}
          value={filterSearch}
          placeholder="voi"
          onChange={(e) => setFilterSearch(e.target.value)}
        />
      )}

      {selectedSlug && (
        <IconButton onClick={() => setSelectedSlug(null)}>
          <BackArrowIcon />
        </IconButton>
        
      )}
      
      {reports && (
        <ValidationReports
          reports={reports.filter((report: any) => report.stage === 'original')}
          filter={filterSearch}
          selectedSlug={selectedSlug}
          setSelectedSlug={setSelectedSlug}
        />
      )}
    </div>
  );
};

export default Home;
