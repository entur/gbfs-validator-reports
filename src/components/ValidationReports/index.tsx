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
  useSortableData,
} from '@entur/table';
import {
  ButtonGroup,
  IconButton,
  SecondaryButton,
  SecondarySquareButton,
} from '@entur/button';
import { DownloadIcon, ValidationInfoIcon, StatsIcon } from '@entur/icons';
import { Modal } from '@entur/modal';
import { PreformattedText } from '@entur/typography';
import { Pagination } from '@entur/menu';
import { Tooltip } from '@entur/tooltip';
import { useHistory } from 'react-router-dom';

const getFilePresenceStatus = (file: any) => {
  if (!file.exists && file.required) {
    return 'negative';
  } else if (!file.exists) {
    return 'neutral';
  } else {
    return 'positive';
  }
};

const getFileValidationText = (file: any) => {
  if (!file.exists) {
    return 'N/A';
  } else if (file.errorsCount > 0) {
    return 'Invalid';
  } else {
    return 'Valid';
  }
};

const getFileValidationStatus = (file: any) => {
  if (!file.exists) {
    return 'neutral';
  } else if (file.errorsCount > 0) {
    return 'negative';
  } else {
    return 'positive';
  }
};

const downloadFile = (data: string, fileName: string, fileType: string) => {
  const blob = new Blob([data], { type: fileType });
  const a = document.createElement('a');
  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  const clickEvt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  a.dispatchEvent(clickEvt);
  a.remove();
};

const exportToJson = (data: any, fileName: string) => {
  downloadFile(JSON.stringify(data), fileName, 'text/json');
};

const ExpRow = ({ report, selectedSlug }: any) => {
  const history = useHistory();
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
        <DataCell>{report.slug}</DataCell>
        <DataCell>{report.summary.version}</DataCell>
        <DataCell>
          {new Date(report.summary.timestamp).toLocaleString()}
        </DataCell>
        <DataCell
          status={report.summary.errorsCount > 0 ? 'negative' : 'positive'}
        >
          {report.summary.errorsCount > 0 ? 'Invalid' : 'Valid'}
        </DataCell>
        {!selectedSlug && (
          <DataCell>
            <IconButton onClick={() => history.push(`${report.slug}`)}>
              <StatsIcon />
            </IconButton>
          </DataCell>
        )}
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
            <HeaderCell>violationPath</HeaderCell>
            <HeaderCell>schemaPath</HeaderCell>
            <HeaderCell>params</HeaderCell>
            <HeaderCell>message</HeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {file.errors
            .filter(
              (_: any, index: number) =>
                index + 1 >= (currentPage - 1) * resultsPerPage + 1 &&
                index + 1 <= currentPage * resultsPerPage,
            )
            .map((error: any, index: number) => (
              <TableRow key={index}>
                <DataCell
                  style={{ maxWidth: '16rem', overflowWrap: 'break-word' }}
                >
                  {error.violationPath && (
                    <PreformattedText>{error.violationPath}</PreformattedText>
                  )}
                </DataCell>
                <DataCell
                  style={{ maxWidth: '16rem', overflowWrap: 'break-word' }}
                >
                  {error.schemaPath && (
                    <PreformattedText>{error.schemaPath}</PreformattedText>
                  )}
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
      <ButtonGroup>
        <SecondaryButton
          onClick={() => exportToJson(file.schema, `${file.file}.json`)}
        >
          <DownloadIcon /> Download schema
        </SecondaryButton>
        <SecondaryButton
          onClick={() =>
            exportToJson(file.fileContents, `${file.file}-schema.json`)
          }
        >
          <DownloadIcon /> Download source file
        </SecondaryButton>
      </ButtonGroup>
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
          {Object.values(details.files).map((file: any) => (
            <TableRow key={file.file}>
              <DataCell style={{ paddingLeft: '4.5rem' }}>{file.file}</DataCell>
              <DataCell status={getFilePresenceStatus(file)}>
                {file.exists ? 'Exists' : 'Missing'}
              </DataCell>
              <DataCell status={getFileValidationStatus(file)}>
                {getFileValidationText(file)}
              </DataCell>
              <DataCell style={{ display: 'flex' }}>
                {file.exists && file.errorsCount > 0 && (
                  <Tooltip placement="top" content="See detailed error report">
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

const ValidationReports = ({ reports, filter, selectedSlug }: any) => {
  const {
    sortedData,
    getSortableHeaderProps,
    getSortableTableProps,
  } = useSortableData<{
    slug: string;
    hasErrors: boolean;
    version: string;
    timestamp: number;
  }>(reports);

  return (
    <Table {...getSortableTableProps}>
      <TableHead>
        <TableRow>
          <HeaderCell padding="radio">{''}</HeaderCell>
          <HeaderCell {...getSortableHeaderProps({ name: 'slug' })}>
            System
          </HeaderCell>
          <HeaderCell {...getSortableHeaderProps({ name: 'version' })}>
            Version
          </HeaderCell>
          <HeaderCell {...getSortableHeaderProps({ name: 'timestamp' })}>
            Report time
          </HeaderCell>
          <HeaderCell {...getSortableHeaderProps({ name: 'hasErrors' })}>
            Valid
          </HeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedData
          .filter((r: any) => (filter ? r.slug.indexOf(filter) > -1 : true))
          .map((report: any) => (
            <ExpRow
              report={report}
              key={`${report.slug}_${report.timestamp}`}
              selectedSlug={selectedSlug}
            />
          ))}
      </TableBody>
    </Table>
  );
};

export default ValidationReports;
