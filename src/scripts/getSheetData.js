const { google } = require('googleapis');
const sheets = google.sheets('v4');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load client secrets from a local file.
fs.readFile(path.join(__dirname, '../../credentials.json'), (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), listMajors);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(path.join(__dirname, 'token.json'), (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    try {
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    } catch (error) {
      console.error('Error setting credentials:', error);
      getNewToken(oAuth2Client, callback);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/spreadsheets'],
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(path.join(__dirname, 'token.json'), JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', path.join(__dirname, 'token.json'));
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/your-spreadsheet-id/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
  const spreadsheetId = '1qFSBPw6hyXgRtrG21OavLwDFRCs1_PxOm8gWLoE26Xc';
  const range = 'SheetF!A1:Z100';
  sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range,
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      rows.map((row) => {
        console.log(`${row}`);
      });
    } else {
      console.log('No data found.');
    }
  });
}
