import React, { useState, useEffect } from 'react';
import { HotTable } from '@handsontable/react';
import { read, utils } from 'xlsx';
import 'handsontable/dist/handsontable.full.min.css';
import { Button, FileButton, Select } from '@mantine/core';
import withAuth from '../auth/withAuth';
import Handsontable from 'handsontable';

const SpreadSheet = ({ isAdmin = true }) => {
  const [sheets, setSheets] = useState({});
  const [sheetNames, setSheetNames] = useState([]);
  const [workbook, setWorkbook] = useState({});
  const [columnWidths, setColumnWidths] = useState([]);
  const [rowHeights, setRowHeights] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [data, setData] = useState([]);
  const [hotInstance, setHotInstance] = useState(null);
  const [mergeCells, setMergeCells] = useState([]);
  const [cellStyles, setCellStyles] = useState([]);
  console.log("mergeCells", mergeCells);
  console.log("cellStyles", cellStyles);
  

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const binaryStr = evt.target.result;
      const workbook = read(binaryStr, { type: 'binary', cellStyles: true });
      setWorkbook(workbook);

      const sheetsData = {};
      const colsWidths = {};
      const rowsHeights = {};
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        sheetsData[sheetName] = utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: "", blankrows: true  });
        colsWidths[sheetName] = worksheet["!cols"]?.map(col => col ? (col.wpx || col.width || 100) : 100) || [];
        rowsHeights[sheetName] = worksheet["!rows"]?.map(row => row.hpx || 24) || [];
      });

      setSheets(sheetsData);
      setSheetNames(workbook.SheetNames);
      setColumnWidths(colsWidths);
      setRowHeights(rowHeights);
      setSheetNames(workbook.SheetNames);
      setSelectedSheet(workbook.SheetNames[0]);

      // Extract merged cells and styles from the first sheet initially
      extractMergesAndStyles(workbook.Sheets[workbook.SheetNames[0]]);
    };

    if (file) reader.readAsArrayBuffer(file);
  };

  // Extract merged cells and styles from the worksheet
  const extractMergesAndStyles = (worksheet) => {
    const merges = worksheet['!merges'] || [];
    const mergeCellsData = merges.map((merge) => ({
      row: merge.s.r,
      col: merge.s.c,
      rowspan: merge.e.r - merge.s.r + 1,
      colspan: merge.e.c - merge.s.c + 1,
    }));
    setMergeCells(mergeCellsData);

    const styles = [];
    for (const cellAddress in worksheet) {
      if (worksheet.hasOwnProperty(cellAddress) && cellAddress[0] !== '!') {
        const cell = worksheet[cellAddress];
        const { r, c } = utils.decode_cell(cellAddress);
        const style = {
          row: r,
          col: c,
          backgroundColor: cell.s?.fill?.fgColor?.rgb ? `#${cell.s.fill.fgColor.rgb}` : undefined,
          color: cell.s?.font?.color?.rgb ? `#${cell.s.font.color.rgb}` : undefined,
          fontWeight: cell.s?.font?.bold ? 'bold' : undefined,
          fontStyle: cell.s?.font?.italic ? 'italic' : undefined,
        };
        styles.push(style);
      }
    }
    setCellStyles(styles);
  };

  useEffect(() => {
    if (selectedSheet && sheets[selectedSheet]) {
      setData(sheets[selectedSheet]);
      extractMergesAndStyles(workbook.Sheets[selectedSheet]);
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

  // Custom cell renderer to apply styles from the Excel file
  const customStylesRenderer = function(hotInstance, TD, row, col, prop, value) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    const cellStyle = cellStyles.find((style) => style.row === row && style.col === col);
    if (cellStyle) {
      TD.style.backgroundColor = cellStyle.backgroundColor || TD.style.backgroundColor;
      TD.style.color = cellStyle.color || TD.style.color;
      TD.style.fontWeight = cellStyle.fontWeight || TD.style.fontWeight;
      TD.style.fontStyle = cellStyle.fontStyle || TD.style.fontStyle;
    }
  };

  return (
    <div>
      <FileButton onChange={handleFileUpload} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
        {(props) => <Button {...props}>Upload file</Button>}
      </FileButton>

      {sheetNames.length > 0 && (
        <Select
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
          mergeCells={mergeCells}  // Apply merge cells from the Excel sheet
          colWidths={columnWidths}
          manualRowResize={true}
          manualColumnResize={true}
          autoWrapRow={true}
          autoWrapCol={true}
          rowHeights={rowHeights}
          cells={(row, col) => ({
            renderer: customStylesRenderer, // Apply custom styles renderer
          })}
          licenseKey="non-commercial-and-evaluation"
          ref={(instance) => setHotInstance(instance?.hotInstance || null)}
        />
      )}
    </div>
  );
};

export default withAuth(SpreadSheet);
