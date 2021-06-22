import React, { useEffect, useState } from 'react';

import { Heading1, SubParagraph } from '@entur/typography';
import ValidationReports from '../../components/ValidationReports';

import firebase from 'firebase/app';
import { TextField } from '@entur/form';
import { SearchIcon } from '@entur/icons';
import { IconButton } from '@entur/button';
import { BackArrowIcon } from '@entur/icons';
import { Link } from '@entur/typography';
import { useHistory, useParams } from 'react-router-dom';

type PathParams = {
  slug: string;
}

const Home = () => {
  const [reports, setReports] = useState<any>(null);
  const [filterSearch, setFilterSearch] = useState<string>();
  const { slug } = useParams<PathParams>();
  const history = useHistory();

  useEffect(() => {
    const fetchReports = async () => {
      const timestamp = new Date().getTime() - 1000 * 60 * 60 * 24; // last 24 hours
      const db = firebase.firestore();

      if (slug) {
        const snapshot = await db
          .collectionGroup('reports')
          .where('stage', '==', 'original')
          .where('slug', '==', slug)
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
  }, [slug]);

  return (
    <div>
      <Heading1>GBFS Validation reports</Heading1>
      <SubParagraph>
        <Link href="https://enturas.atlassian.net/wiki/spaces/PUBLIC/pages/1883439205/Mobility+Data+Collection+-+GBFS+v2.2" target="_NEW">
          Mobility Data Collection - GBFS v2.2 @ ENtur
        </Link>
      </SubParagraph>
      {!slug && (
        <TextField
          label="Filter systems"
          style={{ width: '15rem' }}
          prepend={<SearchIcon inline />}
          value={filterSearch}
          placeholder="voi"
          onChange={(e) => setFilterSearch(e.target.value)}
        />
      )}

      {slug && (
        <IconButton onClick={() => history.push('/')}>
          <BackArrowIcon />
        </IconButton>
        
      )}
      
      {reports && (
        <ValidationReports
          reports={reports.filter((report: any) => report.stage === 'original')}
          filter={filterSearch}
          selectedSlug={slug}
        />
      )}
    </div>
  );
};

export default Home;
