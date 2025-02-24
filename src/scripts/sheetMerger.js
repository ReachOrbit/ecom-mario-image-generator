const fs = require('fs');
const csv = require('csv-parser');
const { parse } = require('json2csv');

// File paths
const sheet1Path = 'main_sheet.csv';
const sheet2Path = 'competitor_sheet.csv';
const outputPath = 'merged_sheet_with_urls.csv';

// Read Sheet 2 into a dictionary (key: Record ID, value: Favicon URL)
const faviconMap = {};
const competitorUrlMap = {};

fs.createReadStream(sheet2Path)
  .pipe(csv())
  .on('data', (row) => {
    faviconMap[row['Record ID']] = row['Favicon url'] || '';
    competitorUrlMap[row['Record ID']] = row['competitor url'] || '';
  })
  .on('end', () => {
    console.log('Sheet 2 processed. Starting Sheet 1 processing...');

    console.log(faviconMap);
    const updatedRows = [];

    // Read Sheet 1 and update rows
    fs.createReadStream(sheet1Path)
      .pipe(csv())
      .on('data', (row) => {
        // Update the Competitor Logo field
        const recordId = row['Record ID - Company'];
        console.log(recordId);
        row['Competitor Logo'] = faviconMap[recordId] || '';
        row['Competitor URL'] = competitorUrlMap[recordId] || '';
        console.log(faviconMap[recordId], "**");
        // console.log(row);
        updatedRows.push(row);
      })
      .on('end', () => {
        console.log('Sheet 1 processed. Writing updated data...');

        // Convert updated rows back to CSV and save to a new file
        const csvFields = Object.keys(updatedRows[0]);
        const csvData = parse(updatedRows, { fields: csvFields });

        fs.writeFileSync(outputPath, csvData, 'utf8');
        console.log(`Merge completed. Updated sheet saved as '${outputPath}'.`);
      });
  });
