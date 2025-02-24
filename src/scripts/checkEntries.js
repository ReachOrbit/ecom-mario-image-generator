const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

function countMatchedEntries(csvFilePath, recordIdList) {
    let matchedCount = 0;

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            if (recordIdList.includes(row['Record ID - Contact'])) {
                matchedCount++;
            }
        })
        .on('end', () => {
            console.log(`Number of matched entries: ${matchedCount}`);
        });
}

// Example usage
const csvFilePath = path.resolve(__dirname, '../../ecom-new-data.csv');
const recordIdListPath = path.resolve(__dirname, '../../existingID.txt');
let recordList = [];

// Read the file and split its contents into an array
fs.readFileSync(recordIdListPath, 'utf-8')
    .split(/\r?\n/)
    .forEach(line => {
        if (line.trim()) { // Ensure the line is not empty
            recordList.push(line.trim());
        }
    });

countMatchedEntries(csvFilePath, recordList);


