let timerElement = document.getElementById('timer');
let lastPressTimeElement = document.getElementById('lastPressTime');
let button = document.getElementById('pressButton');
let updateTime;

// Replace with your own Google Sheets API key and Sheet ID
const apiKey = 'AIzaSyB9e2GXqhq9CVH3uCc1cLZhTpx1DGGOQFc';
const sheetId = '1wwP-3RjsNA8t6CetYyCmQtCrRSqb11P1myH-aJTbd8A';
const sheetRange = 'Sheet1!A1:A1';

function updateTimer() {
    let currentTime = new Date();
    let timeDifference = currentTime - updateTime;
    let seconds = Math.floor(timeDifference / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    hours %= 24;
    minutes %= 60;
    seconds %= 60;

    timerElement.innerHTML = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
}

function updateButtonPressTime() {
    let currentTime = new Date().toISOString();
    console.log( gapi.client);
    gapi.client.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: sheetRange,
        valueInputOption: 'RAW',
        resource: {
            values: [[currentTime]]
        }
    }).then(response => {
        updateTime = new Date(currentTime);
        lastPressTimeElement.innerHTML = `Last press time: ${updateTime.toLocaleString("en-US", { timeZone: "America/Chicago" })}`;
    }, error => {
        console.error(error.result.error.message);
    });
}

function getLastButtonPressTime() {
    console.log('Getting last button press time...');
    gapi.client.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: sheetRange,
    }).then(response => {
        let result = response.result;
        if (result.values && result.values.length > 0) {
            updateTime = new Date(result.values[0][0]);
            lastPressTimeElement.innerHTML = `Last press time: ${updateTime.toLocaleString("en-US", { timeZone: "America/Chicago" })}`;
            setInterval(updateTimer, 1000);
        } else {
            timerElement.innerHTML = 'No data found.';
        }
    }, error => {
        console.error(error.result.error.message);
    });
}

function initClient() {
    console.log('Initializing client...');
        gapi.client.init({
            apiKey: apiKey,
            client_id: ' 664462795185-8rf7aaqt8dsuu93oieiflh75qf0ftqbm.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/spreadsheets',
            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        }).then(() => {
            console.log('Client initialized.');
            getLastButtonPressTime();
        }).catch(error => {
            console.error(error);
        });
}

gapi.load('client', initClient);
