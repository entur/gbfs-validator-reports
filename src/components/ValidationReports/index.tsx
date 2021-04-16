import { Fragment, useEffect, useState } from 'react';
import {
  DataCell,
  ExpandableRow,
  ExpandRowButton,
  HeaderCell,
  Table,
  TableBody,
  TableHead,
  TableRow,
} from '@entur/table';
import { IconButton, SecondarySquareButton, TertiaryButton } from '@entur/button';
import { ValidationInfoIcon, WarningIcon } from '@entur/icons';
import { Modal } from '@entur/modal';
import { ListItem, PreformattedText, UnorderedList } from '@entur/typography';
import { Pagination } from '@entur/menu';
import { Tooltip } from '@entur/tooltip';
import { Contrast } from '@entur/layout';

const ExpRow = ({ report }: any) => {
  const [open, setopen] = useState<boolean>(false);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const response = await fetch(report.detailsUrl);
      const data = await response.json();
      setDetails(data);
    };

    if (open && !details) {
      fetchDetails();
    }
  }, [open, report.detailsUrl, details]);

  return (
    <>
      <TableRow>
        <DataCell>
          <ExpandRowButton onClick={() => setopen(!open)} open={open} />
        </DataCell>
        <DataCell>{report.provider}</DataCell>
        <DataCell>{report.version}</DataCell>
        <DataCell>{new Date(report.timestamp).toLocaleString()}</DataCell>
        <DataCell status={report.hasErrors ? 'negative' : 'positive'}>
          {report.hasErrors ? 'Invalid' : 'Valid'}
        </DataCell>
      </TableRow>
      <ExpandableRow colSpan={5} open={open}>
        <DetailsTable details={details} />
      </ExpandableRow>
    </>
  );
};

const FileReportErrorsTable = ({ file }: any) => {
  const [currentPage, setPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const numberOfResults = file.errors.length;
  const pageCount = Math.ceil(numberOfResults / resultsPerPage);
  return (
    <>
      <Pagination
        pageCount={pageCount}
        currentPage={currentPage}
        onPageChange={(page) => setPage(page)}
        resultsPerPage={resultsPerPage}
        numberOfResults={numberOfResults}
        onResultsPerPageChange={(e) => setResultsPerPage(e)}
      />
      <Table spacing="small">
        <TableHead>
          <TableRow>
            <HeaderCell>instancePath</HeaderCell>
            <HeaderCell>schemaPath</HeaderCell>
            <HeaderCell>params</HeaderCell>
            <HeaderCell>message</HeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {file.errors
            .filter(
              (item: any, index: number) =>
                index + 1 >= (currentPage - 1) * resultsPerPage + 1 &&
                index + 1 <= currentPage * resultsPerPage,
            )
            .map((error: any, index: number) => (
              <TableRow key={index}>
                <DataCell
                  style={{ maxWidth: '16rem', overflowWrap: 'break-word' }}
                >
                  {error.instancePath && (
                    <PreformattedText>{error.instancePath}</PreformattedText>
                  )}
                </DataCell>
                <DataCell
                  style={{ maxWidth: '16rem', overflowWrap: 'break-word' }}
                >
                  {error.schemaPath && (
                    <PreformattedText>{error.schemaPath}</PreformattedText>
                  )}
                </DataCell>
                <DataCell>
                  <UnorderedList>
                    {Object.entries(error.params).map((entry: any) => (
                      <ListItem title={entry[0]} key={entry[0]}>
                        {entry[1]}
                      </ListItem>
                    ))}
                  </UnorderedList>
                </DataCell>
                <DataCell>{error.message}</DataCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  );
};

const FileReportErrors = ({ file }: any) => {
  return (
    <div className="result">
      <h3>{file.file}</h3>
      {file.languages ? (
        file.languages.map((lang: any, i: number) => {
          if (file.required && !lang.exists) {
            return (
              <h4> 
                Missing file {lang.lang}/{file.file}
              </h4>
            );
          } else if (lang.errors) {
            return (
              <Fragment key={i}>
                <h4>
                  Error in {lang.lang}/{file.file}
                </h4>
                <FileReportErrorsTable file={lang} />
              </Fragment>
            );
          } else {
            return null;
          }
        })
      ) : (
        <FileReportErrorsTable file={file} />
      )}
    </div>
  );
};

const DetailsTable = ({ details }: any) => {
  const [openModal, setOpenModal] = useState<any>(null);

  if (!details) {
    return <p>Loading</p>;
  }

  return (
    <div style={{ paddingTop: '0.5rem' }}>
      <Table>
        <TableHead>
          <TableRow>
            <HeaderCell style={{ paddingLeft: '4.5rem' }}>File</HeaderCell>
            <HeaderCell>Exists</HeaderCell>
            <HeaderCell>Valid</HeaderCell>
            <HeaderCell>{}</HeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {details.files.map((file: any) => (
            <TableRow key={file.file}>
              <DataCell style={{ paddingLeft: '4.5rem' }}>{file.file}</DataCell>
              <DataCell
                status={
                  !file.exists && (file.required || file.recommended)
                    ? 'negative'
                    : !file.exists
                    ? 'neutral'
                    : 'positive'
                }
              >
                {file.exists ? 'Exists' : 'Missing'}
              </DataCell>
              <DataCell
                status={
                  !file.exists
                    ? 'neutral'
                    : file.errors
                    ? 'negative'
                    : 'positive'
                }
              >
                {!file.exists ? 'N/A' : file.hasErrors ? 'Invalid' : 'Valid'}
              </DataCell>
              <DataCell style={{ display: 'flex' }}>
                {!file.exists && file?.errors?.message && (
                  <Tooltip
                    placement="top"
                    content={`Could not validate: ${file.errors.message}`}>
                      <SecondarySquareButton>
                        <WarningIcon />
                      </SecondarySquareButton>
                  </Tooltip>
                  
                )}
                {file.exists && file.errors && (
                  <Tooltip
                    placement="top"
                    content="See detailed error report">
                    <SecondarySquareButton
                      onClick={() => {
                        setOpenModal(file);
                      }}
                    >
                      <ValidationInfoIcon />
                    </SecondarySquareButton>
                  </Tooltip>
                )}
              </DataCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal
        open={openModal !== null}
        onDismiss={() => {
          setOpenModal(null);
        }}
        title="Validation errors"
        size="extraLarge"
      >
        <FileReportErrors file={openModal} />
      </Modal>
    </div>
  );
};

const ValidationReports = ({ reports }: any) => (
  <Table>
    <TableHead>
      <TableRow>
        <HeaderCell padding="radio">{''}</HeaderCell>
        <HeaderCell>Provider</HeaderCell>
        <HeaderCell>Version</HeaderCell>
        <HeaderCell>Report time</HeaderCell>
        <HeaderCell>Valid</HeaderCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {reports.map((report: any) => (
        <ExpRow report={report} key={report.timestamp} />
      ))}
    </TableBody>
  </Table>
);

export default ValidationReports;
