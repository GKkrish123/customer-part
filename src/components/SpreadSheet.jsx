import React, { useState, useEffect } from 'react';
import { HotTable } from '@handsontable/react';
import ExcelJS from 'exceljs';
import 'handsontable/dist/handsontable.full.min.css';
import { ActionIcon, Button, FileButton, Flex, Select } from '@mantine/core';
import withAuth from '../auth/withAuth';
import { registerAllModules } from 'handsontable/registry';
import { textRenderer } from 'handsontable/renderers';
import { useAuth } from '../auth/authContext';
import { saveAs } from 'file-saver';
import { IconDownload } from '@tabler/icons-react';
registerAllModules();

const cellIdToIndexes = (cellId) => {
  const match = cellId.match(/([A-Z]+)(\d+)/);
  if (!match) {
    throw new Error(`Invalid cell ID: ${cellId}`);
  }

  const [, column, row] = match;

  // Convert column part (A, B, C, ..., Z, AA, AB, ...) to index
  let colIndex = 0;
  for (let i = 0; i < column.length; i++) {
    colIndex *= 26;
    colIndex += column.charCodeAt(i) - 64;  // 'A' is 65 in ASCII, so subtract 64
  }

  const rowIndex = parseInt(row, 10) - 1;

  return [rowIndex, colIndex - 1];  // Both row and column are zero-based
}

const editableCells = [
  "G10", "G11", "G12", "G13", "G14", "G15", "G16", "G17", "G18", "G19",
  "H10", "H11", "H12", "H13", "H14", "H15", "H16", "H17", "H18", "H19",
  "I10", "I11", "I12", "I13", "I14", "I15", "I16", "I17", "I18", "I19",
  "J10", "J11", "J12", "J13", "J14", "J15", "J16", "J17", "J18", "J19",
  "K10", "K11", "K12", "K13", "K14", "K15", "K16", "K17", "K18", "K19",
];

const SpreadSheet = () => {
  const { isAdmin, isAppLoading } = useAuth();
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
  const editableRowCols = editableCells.map(cell => cellIdToIndexes(cell));

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
            ...mediaItem
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

  const downloadAsBlob = async () => {
  //   if (!hotInstance) return;

  // const workbook = new ExcelJS.Workbook();
  // const worksheet = workbook.addWorksheet('Sheet1');

  // // Extract data from Handsontable
  // const handsontableData = hotInstance.getData();
  
  // // Apply the data to the Excel worksheet
  // handsontableData.forEach((row, rowIndex) => {
  //   row.forEach((cell, colIndex) => {
  //     worksheet.getCell(rowIndex + 1, colIndex + 1).value = cell;
  //   });
  // });

  // // Apply column widths
  // const columnWidths = hotInstance.getSettings().colWidths || [];
  // columnWidths.forEach((width, index) => {
  //   worksheet.getColumn(index + 1).width = width / 5; // ExcelJS width is typically in characters
  // });

  // // Apply row heights
  // const rowHeights = hotInstance.getSettings().rowHeights || [];
  // rowHeights.forEach((height, index) => {
  //   worksheet.getRow(index + 1).height = height;
  // });

  // // Apply merged cells
  // mergeCells.forEach((merge) => {
  //   worksheet.mergeCells(merge.row + 1, merge.col + 1, merge.row + merge.rowspan, merge.col + merge.colspan);
  // });

  // // Apply cell styles (only basic styles for demo purposes)
  // cellStyles.forEach((style) => {
  //   const cell = worksheet.getCell(style.row + 1, style.col + 1);
  //   if (style.backgroundColor) {
  //     cell.fill = {
  //       type: 'pattern',
  //       pattern: 'solid',
  //       fgColor: { argb: style.backgroundColor.replace('#', '') }
  //     };
  //   }
  //   if (style.color) {
  //     cell.font = {
  //       color: { argb: style.color.replace('#', '') }
  //     };
  //   }
  //   if (style.fontWeight) {
  //     cell.font = { ...cell.font, bold: style.fontWeight === 'bold' };
  //   }
  //   if (style.fontStyle) {
  //     cell.font = { ...cell.font, italic: style.fontStyle === 'italic' };
  //   }
  //   if (style.border) {
  //     cell.border = {
  //       top: { style: 'thin', color: { argb: 'FF000000' } },
  //       left: { style: 'thin', color: { argb: 'FF000000' } },
  //       bottom: { style: 'thin', color: { argb: 'FF000000' } },
  //       right: { style: 'thin', color: { argb: 'FF000000' } }
  //     };
  //   }
  // });

  // // Handle media (images)
  // // media.forEach((mediaItem) => {
  // //   const { base64, type, tl, br, width, height, range, sheetId } = mediaItem;
  // //   worksheet.addImage(0, range);
  // // });

  // // Convert workbook to Blob and trigger download
  // workbook.xlsx.writeBuffer().then((buffer) => {
  //   const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //   saveAs(blob, 'handsontable-changes.xlsx');
  // });
  }

  return (
    <div>
      <Flex align="center">
        <FileButton onChange={handleFileUpload} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
          {(props) => <Button {...props}>Upload file</Button>}
        </FileButton>

        <ActionIcon disabled={data.length === 0} style={{
          marginLeft: "auto"
        }} variant="filled" aria-label="Download" onClick={downloadAsBlob}>
          <IconDownload style={{ width: '70%', height: '70%' }} stroke={1.5} />
        </ActionIcon>
      </Flex>

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
          width="100%"
          height="calc(100vh - 180px)"
          stretchH="all"
          mergeCells={mergeCells}  // Apply merge cells from the Excel sheet
          colWidths={columnWidths[selectedSheet] || []}
          manualRowResize={true}
          manualColumnResize={true}
          autoWrapCol={true}
          autoWrapRow={true}
          rowHeights={rowHeights[selectedSheet] || []}
          cells={(row, col) => ({
            renderer: customStylesRenderer, // Apply custom styles renderer
            readOnly: (!isAdmin && !editableRowCols.find((rc) => rc[0] === row && rc[1] === col)) || isAppLoading
          })}
          licenseKey="non-commercial-and-evaluation"
          ref={(instance) => setHotInstance(instance?.hotInstance || null)}
        />
      )}
    </div>
  );
};

export default withAuth(SpreadSheet);
