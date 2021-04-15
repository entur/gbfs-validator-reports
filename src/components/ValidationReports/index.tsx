import { useState } from 'react';
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
import { IconButton } from '@entur/button';
import { ValidationInfoIcon } from '@entur/icons';
import { Modal } from '@entur/modal';
import { ListItem, PreformattedText, UnorderedList } from '@entur/typography';
import { Pagination } from '@entur/menu';

const hashCode = function (s: string) {
  var hash = 0;
  for (var i = 0; i < s.length; i++) {
    var character = s.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

const ExpRow = ({ report, children }: any) => {
  const [open, setopen] = useState<boolean>(false);
  return (
    <>
      <TableRow>
        <DataCell>
          <ExpandRowButton onClick={() => setopen(!open)} open={open} />
        </DataCell>
        <DataCell>{report.provider}</DataCell>
        <DataCell>{report.version}</DataCell>
        <DataCell>{new Date(report.timestamp).toLocaleString()}</DataCell>
        <DataCell status={report.summary.hasErrors ? 'negative' : 'positive'}>
          {report.summary.hasErrors ? 'Invalid' : 'Valid'}
        </DataCell>
      </TableRow>
      <ExpandableRow colSpan={5} open={open}>
        {children}
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
            .map((error: any) => (
              <TableRow key={hashCode(error)}>
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
        file.languages.map((lang: any) => {
          if (file.required && !lang.exists) {
            return (
              <h4>
                Missing file {lang.lang}/{file.file}
              </h4>
            );
          } else if (lang.errors) {
            return (
              <>
                <h4>
                  Error in {lang.lang}/{file.file}
                </h4>
                <FileReportErrorsTable file={lang} />
              </>
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

  return (
    <div style={{ paddingTop: '0.5rem' }}>
      <Table spacing="small">
        <TableHead>
          <TableRow>
            <HeaderCell style={{ paddingLeft: '4.5rem' }}>File</HeaderCell>
            <HeaderCell>Exists</HeaderCell>
            <HeaderCell>Valid</HeaderCell>
            <HeaderCell>{}</HeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {details.files.files.map((file: any) => (
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
                {!file.exists ? 'N/A' : file.errors ? 'Invalid' : 'Valid'}
              </DataCell>
              <DataCell style={{ display: 'flex' }}>
                {file.errors && (
                  <IconButton
                    onClick={() => {
                      setOpenModal(file);
                    }}
                  >
                    <ValidationInfoIcon />
                  </IconButton>
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
        <ExpRow report={report} key={report.provider}>
          <DetailsTable details={report} />
        </ExpRow>
      ))}
    </TableBody>
  </Table>
);

export default ValidationReports;
