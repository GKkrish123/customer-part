import React, { useState, useEffect } from 'react';
import { HotTable } from '@handsontable/react';
import { read, utils } from 'xlsx';
import 'handsontable/dist/handsontable.full.min.css';
import '@mantine/core/styles.css';
import { Button, FileButton, Select } from '@mantine/core';
import withAuth from '../auth/withAuth';

const SpreadSheet = ({ isAdmin = true }) => {
  const [sheets, setSheets] = useState({});
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [data, setData] = useState([]);
  const [hotInstance, setHotInstance] = useState(null);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const binaryStr = evt.target.result;
      const workbook = read(binaryStr, { type: 'binary' });

      const sheetsData = {};
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        sheetsData[sheetName] = utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: "" });
      });

      setSheets(sheetsData);
      setSheetNames(workbook.SheetNames);
      setSelectedSheet(workbook.SheetNames[0]);
    };

    if (file) reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (selectedSheet && sheets[selectedSheet]) {
      setData(sheets[selectedSheet]);
    }
  }, [selectedSheet, sheets]);

  useEffect(() => {
    if (hotInstance && data.length) {
      hotInstance.loadData(data);
    }
  }, [hotInstance, data]);

  const handleSheetChange = (value) => {
    setSelectedSheet(value);
  };

  return (
      <div>
        <FileButton onChange={handleFileUpload} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
          {(props) => <Button {...props}>Upload file</Button>}
        </FileButton>

        {sheetNames.length > 0 && (<Select
          label="Sheet"
          data={sheetNames}
          value={selectedSheet}
          onChange={handleSheetChange}
        />
        )}

        {data.length > 0 && (
          <HotTable
            data={data}
            colHeaders={true}
            rowHeaders={true}
            readOnly={!isAdmin}
            width="100%"
            height="calc(100vh - 180px)"
            stretchH="all"
            licenseKey="non-commercial-and-evaluation"
            afterChange={(changes) => {
              if (isAdmin && changes) {
                console.log('Changes made by admin:', changes);
              }
            }}
            ref={(instance) => setHotInstance(instance?.hotInstance || null)}
          />
        )}
      </div>
  );
};

export default withAuth(SpreadSheet);
