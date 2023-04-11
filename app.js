let timerElement = document.getElementById('timer');
let lastPressTimeElement = document.getElementById('lastPressTime');
let button = document.getElementById('pressButton');
let updateTime;
let oilCount = 0;
// Replace with your own Google Sheets API key and Sheet ID
const apiKey = 'AIzaSyB9e2GXqhq9CVH3uCc1cLZhTpx1DGGOQFc';
const sheetId = '1wwP-3RjsNA8t6CetYyCmQtCrRSqb11P1myH-aJTbd8A';
const sheetRange = 'Sheet1!A1:A1';
const sheetRangeOil = 'Sheet1!B1:B3';

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
    // at midnight CheckOilTimes()
    if (hours == 0 && minutes == 0 && seconds == 0) {
        CheckOilTimes();
    }

    timer.innerHTML = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
}

function updateButtonPressTime() {
    let currentTime = new Date().toISOString();
    console.log( gapi.client);
    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: sheetRange,
        valueInputOption: 'RAW',
        resource: {
            values: [[currentTime]]
        }
    }).then(response => {
        updateTime = new Date(currentTime);
        lastPressTime.innerHTML = `Last press time: ${updateTime.toLocaleString("en-US", { timeZone: "America/Chicago" })}`;
    }, error => {
        console.error(error.result.error.message);
    });
}

function updateOilTime() {
    let sheetpos = oilCount+1
    let currentTime = new Date().toISOString();
    console.log( gapi.client);
    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Sheet1!B1:B'+sheetpos,
        valueInputOption: 'RAW',
        resource: {
            values: [[currentTime]]
        }
    }).then(response => {
        updateTime = new Date(currentTime);
        oilCountElement.innerHTML = `Ellis has had his oil: ${oilCount} Times`;
    }, error => {
        console.error(error.result.error.message);
    });
    oilCount++;
}

function CheckOilTimes() {
    oilCount = 0;
    console.log('Getting last button press time...');
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: sheetRangeOil,
    }).then(response => {
        let result = response.result;
        if (result.values && result.values.length > 0) {
            // for each of the 3 values check if the date stored is todays date.  if it is add one to the oil given counter
            for (let i = 1; i < 4; i++) {
                let oilTime = new Date(result.values[1][i]);
                let currentTime = new Date();
                if (oilTime.getDate() == currentTime.getDate() && oilTime.getMonth() == currentTime.getMonth() && oilTime.getFullYear() == currentTime.getFullYear()) {
                    oilCount++;
                }
            }
            oilCountElement.innerHTML = 'Ellis has had his oil: ' + oilCount + ' Times';
        } else {
            oilCountElement.innerHTML = 'No data found.';
        }
    }, error => {
        console.error(error.result.error.message);
    });
}


function getLastButtonPressTime()
{
    console.log('Getting last button press time...');
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: sheetRange,
    }).then(response => {
        let result = response.result;
        if (result.values && result.values.length > 0) {
            updateTime = new Date(result.values[0][0]);
            lastPressTime.innerHTML = `Last feed time: ${updateTime.toLocaleString("en-US", { timeZone: "America/Chicago" })}`;
            setInterval(updateTimer, 1000);
        } else {
            timer.innerHTML = 'No data found.';
        }
    }, error => {
        console.error(error.result.error.message);
    });
}


function initClient() {
    console.log('Initializing client...');
        gapi.client.init({
            apiKey: apiKey,
            client_id: '664462795185-8rf7aaqt8dsuu93oieiflh75qf0ftqbm.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/spreadsheets',
            plugin_name: 'EllisFeed',
            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        }).then(() => {
            console.log('Client initialized.');
            getLastButtonPressTime();
            CheckOilTimes();
        }).catch(error => {
            console.error(error);
        });
}
function handleSignInClick(event) {
    pressButton.style.visibility = 'visible';
    pressButtonOil.style.visibility = 'visible';
    signinbutton.style.visibility = 'hidden';
    gapi.auth2.getAuthInstance().signIn();
    // make pressButton and pressButtonoil visible

  }

gapi.load('client', initClient);
