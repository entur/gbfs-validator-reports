import React, { useEffect, useState } from 'react';

import { Heading1 } from '@entur/typography';
import ValidationReports from '../../components/ValidationReports';

const Home: React.FC = () => {
  const [reports, setReports] = useState<any>(null);

  useEffect(() => {
    const fetchReports = async () => {
      const response = await fetch('/reports/index.json');
      const index = await response.json();

      index.forEach(async (report: any, i: number) => {
        const fileReportResponse = await fetch(`/reports/${report.file}`);
        index[i].files = await fileReportResponse.json();
      });

      setReports(index);
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
