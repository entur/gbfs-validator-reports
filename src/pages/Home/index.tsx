import React, { useEffect, useState } from 'react';

import { Heading1, Paragraph, SubParagraph, Link } from '@entur/typography';
import ValidationReports from '../../components/ValidationReports';

import { TextField } from '@entur/form';
import { SearchIcon, BackArrowIcon } from '@entur/icons';
import { IconButton } from '@entur/button';
import { useHistory, useParams } from 'react-router-dom';
import { getApiBaseUrl } from '../../config';

type PathParams = {
  slug: string;
};

const Home = () => {
  const [reports, setReports] = useState<any>(null);
  const [filterSearch, setFilterSearch] = useState<string>();
  const { slug } = useParams<PathParams>();
  const history = useHistory();

  useEffect(() => {
    const fetchReports = async () => {
      const response = await fetch(
        `${getApiBaseUrl()}validation/systems${slug ? '/' + slug : ''}`,
      );
      let fetchedReports = await response.json();
      if (slug) {
        fetchedReports = {
          [slug]: fetchedReports,
        };
      }

      setReports(
        Object.keys(fetchedReports).map((key) => {
          return {
            slug: key,
            detailsUrl: `${getApiBaseUrl()}validation/systems/${key}`,
            hasErrors: fetchedReports[key].summary.errorsCount > 0,
            version: fetchedReports[key].summary.version,
            timestamp: fetchedReports[key].summary.timestamp,
            ...fetchedReports[key],
          };
        }),
      );
    };
    fetchReports();
  }, [slug]);

  return (
    <div>
      <Heading1>GBFS Validation reports</Heading1>
      <SubParagraph>
        <Link
          href="https://enturas.atlassian.net/wiki/spaces/PUBLIC/pages/1883439205/Mobility+Data+Collection+-+GBFS+v2.2-v2.3"
          target="_NEW"
        >
          Mobility Data Collection - GBFS v2.2-v2.3 @ ENtur
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
        <IconButton onClick={() => history.push(`/`)}>
          <BackArrowIcon />
        </IconButton>
      )}

      {reports && (
        <ValidationReports
          reports={reports}
          filter={filterSearch}
          selectedSlug={slug}
        />
      )}

      {!reports && <Paragraph>No available reports</Paragraph>}
    </div>
  );
};

export default Home;
