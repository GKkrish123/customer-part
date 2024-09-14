import React, { useState, useEffect } from 'react';
import { HotTable } from '@handsontable/react';
import ExcelJS from 'exceljs';
import 'handsontable/dist/handsontable.full.min.css';
import { Button, FileButton, Select } from '@mantine/core';
import withAuth from '../auth/withAuth';
import { registerAllModules } from 'handsontable/registry';
import { textRenderer } from 'handsontable/renderers';
registerAllModules();

const SpreadSheet = ({ isAdmin = true }) => {
  const [sheets, setSheets] = useState({});
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [data, setData] = useState([]);
  const [hotInstance, setHotInstance] = useState(null);
  const [mergeCells, setMergeCells] = useState([]);
  const [cellStyles, setCellStyles] = useState([]);
  const [media, setMedia] = useState([]);
  const [columnWidths, setColumnWidths] = useState([]);
  const [rowHeights, setRowHeights] = useState([]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file, {});

    const sheetsData = {};
    const colsWidths = {};
    const rowsHeights = {};
    const merges = [];
    const styles = [];
    const media = [];

    workbook.eachSheet((sheet, sheetId) => {
      const sheetName = sheet.name;
      const sheetData = [];
      sheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
        const rowData = [];
        row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
          rowData[colIndex - 1] = cell.value;
          // Extract cell styles
          if (cell.style) {
            styles.push({
              row: rowIndex - 1,
              col: colIndex - 1,
              backgroundColor: cell.style.fill?.fgColor?.argb ? `#${cell.style.fill.fgColor.argb.slice(2)}` : undefined,
              color: cell.style.font?.color?.argb ? `#${cell.style.font.color.argb.slice(2)}` : undefined,
              fontWeight: cell.style.font?.bold ? 'bold' : undefined,
              fontStyle: cell.style.font?.italic ? 'italic' : undefined,
              border: cell.style.border,
            });
          }
        });
        sheetData.push(rowData);
      });

      sheetsData[sheetName] = sheetData;
      colsWidths[sheetName] = sheet.columns.map(col => (col.width * 5) || 100);
      rowsHeights[sheetName] = sheet._rows.map(row => row.height || 24);
      Object.entries(sheet._merges).forEach(merge => {
        merges.push({
          row: merge[1].top - 1,
          col: merge[1].left - 1,
          rowspan: merge[1].bottom - merge[1].top + 1,
          colspan: merge[1].right - merge[1].left + 1,
        });
      });

      sheet._media.forEach((mediaItem) => {
        if (mediaItem.type === 'image') {
          const imageData = sheet.workbook.media.find(img => mediaItem.imageId === img.index);
          const { tl, br, ext } = mediaItem.range;
          const image = {
            base64: imageData.buffer.toString('base64'),
            type: imageData.extension, // e.g., png, jpeg
            tl,
            br,
            width: ext.width || 100,
            height: ext.height || 100,
            sheetId: sheetId,
          };
          media.push(image);
        }
      });
    });

    setSheets(sheetsData);
    setSheetNames(Object.keys(sheetsData));
    setColumnWidths(colsWidths);
    setRowHeights(rowsHeights);
    setMergeCells(merges);
    setCellStyles(styles);
    setMedia(media);
    setSelectedSheet(Object.keys(sheetsData)[0]);
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

  const customStylesRenderer = function (hotInstance, TD, row, col, prop, value) {
    textRenderer.apply(this, arguments);

    const cellStyle = cellStyles.find((style) => style.row === row && style.col === col);
    if (cellStyle) {
      TD.style.backgroundColor = cellStyle.backgroundColor || TD.style.backgroundColor;
      TD.style.color = cellStyle.color || TD.style.color;
      TD.style.fontWeight = cellStyle.fontWeight || TD.style.fontWeight;
      TD.style.fontStyle = cellStyle.fontStyle || TD.style.fontStyle;

      if (cellStyle.border) {
        // Apply border styles (assuming border is an object)
        const { top, left, bottom, right } = cellStyle.border;
        if (top) TD.style.borderTop = `thin solid #222222`;
        if (left) TD.style.borderLeft = `thin solid #222222`;
        if (bottom) TD.style.borderBottom = `thin solid #222222`;
        if (right) TD.style.borderRight = `thin solid #222222`;
      }
    }

    media.forEach((media) => {
      const { tl, br } = media;
    
      const endRow = br?.row ?? (tl.row + 1);
      const endCol = br?.col ?? (tl.col + 1);

      if (row >= tl.row && row <= endRow && col >= tl.col && col <= endCol) {
        const img = document.createElement('img');
        img.src = `data:image/${media.type};base64,${media.base64}`;
        img.style.maxWidth = `${media.width}px`;  // Use the width from the media ext
        img.style.maxHeight = `${media.height}px`; // Use the height from the media ext
        TD.innerHTML = ''; // Clear the cell content
        TD.appendChild(img); // Add the image to the cell
      }
    });
  };

  return (
    <div>
      <FileButton onChange={handleFileUpload} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
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
          tableClassName="its-mee"
          data={data}
          colHeaders={true}
          rowHeaders={true}
          readOnly={!isAdmin}
          width="100%"
          height="calc(100vh - 180px)"
          stretchH="all"
          mergeCells={mergeCells}  // Apply merge cells from the Excel sheet
          colWidths={columnWidths[selectedSheet] || []}
          manualRowResize={true}
          manualColumnResize={true}
          rowHeights={rowHeights[selectedSheet] || []}
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
