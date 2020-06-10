const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), downloadFolder);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
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
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth, downloadFolder){ //, updateRPi) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    q: "mimeType = 'application/vnd.google-apps.folder'",
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}

function downloadFolder(auth){
  // const drive = google.drive({version: 'v3', auth});
  // var fileId = '1PlbSalAN7X3CMtwCA5IcOrB_kS4nx_TR';
  // var dest = fs.createWriteStream('/audio2');
  // drive.files.get({fileId: fileId, alt: 'media'}, {responseType: 'stream'},
  //   function(err, res){
  //       res.data
  //       .on('end', () => {
  //           console.log('Done');
  //       })
  //       .on('error', err => {
  //           console.log('Error', err);
  //       })
  //       .pipe(dest);
  //   }
  // );

//   var gotData = function downloadFiles(fileId, destination, callback) {
//     let content = fs.readFileSync('./GEARS/authorization/client_secret.json');
//     Auth(JSON.parse(content), (auth) => {
//         const returnData = [];
//         const drive = google.drive({ version: 'v3', auth });
//
//         // const file = fs.createWriteStream(destination); // destination is path to a file
//         const file = fs.createWriteStream('/audio');
//
//         drive.files.get(
//         {fileId: fileId, alt: 'media',},
//         {responseType: 'stream'}, (err,  res ) => {
//             if (err) {
//                 returnData.push(["ERR"]);
//                 returnData.push("" + err);
//             } else {
//                 res.data.pipe(file);
//                 returnData.push("Downloaded");
//             }
//             callback(returnData);
//         });
//     });
// };
//
// module.exports = gotData;


var drive = google.drive('v3');

// ["Examples"-NODE.JS tab](https://developers.google.com/drive/v3/web/manage-downloads)
var fileId = '1PlbSalAN7X3CMtwCA5IcOrB_kS4nx_TR' // Safeway (OBFUSCATED)
var dest = fs.createWriteStream('/audio')
drive.files.get({
  // auth: oauth2Client,
  fileId: fileId,
  //alt: 'media'
})
    .on('end', function () {
      console.log('Done');
    })
    .on('error', function (err) {
      console.log('Error during download', err);
    })
    .pipe(dest);
}
//   const drive = google.drive({version: 'v3', auth});
//   var fileId = '1PlbSalAN7X3CMtwCA5IcOrB_kS4nx_TR';
//   var dest = fs.createWriteStream('/audio');
//
//   drive.files.get({fileId: fileId, alt: 'media'}, {responseType: 'stream'},
// function(err, res){
//    res.data
//    .on('end', () => {
//       console.log('Done');
//    })
//    .on('error', err => {
//       console.log('Error', err);
//    })
//    .pipe(dest);
// })


// function listFiles(auth) {
//   var service = google.drive('v3');
//   var folderid = "PlbSalAN7X3CMtwCA5IcOrB_kS4nx_TR";
//   service.files.list({
//     auth: auth,
//     q: "mimeType = 'application/vnd.google-apps.folder'",
//     fields: "files(id, name)"
//   }, function(err, response) {
//     if (err) {
//       console.log('The API returned an error: ' + err);
//       return;
//     }
//     response.files.forEach(function(e){
//       if (e.name.includes('doc')) {
//         var dlfile = fs.createWriteStream(e.name + ".txt");
//         service.files.export({
//           auth: auth,
//           fileId: e.id,
//           mimeType: 'text/plain'
//         }).on('end', function() {
//           console.log("Done.");
//         }).on('error', function(err) {
//           console.error(err);
//           return process.exit();
//         }).pipe(dlfile);
//       }
//     })
//   })
// }
// }
// function findFolder(auth){
//   var pageToken = null;
// // Using the NPM module 'async'
// async.doWhilst(function (callback) {
//   drive.files.list({
//     q: "'audio' in parents",
//     fields: 'nextPageToken, files(id, name)',
//     spaces: 'drive',
//     pageToken: pageToken
//   }, function (err, res) {
//     if (err) {
//       // Handle error
//       console.error(err);
//       callback(err)
//     } else {
//       res.files.forEach(function (file) {
//         console.log('Found file: ', file.name, file.id);
//       });
//       pageToken = res.nextPageToken;
//       callback();
//     }
//   });
// }, function () {
//   return !!pageToken;
// }, function (err) {
//   if (err) {
//     // Handle error
//     console.error(err);
//   } else {
//     // All pages fetched
//   }
// })
// }



// function updateRPi(){
//   const drive = google.drive({version: 'v3', auth});
//
// }

// function downloadFile(auth) {
//   const drive = google.drive({version: 'v3', auth});
//   var fileId = '1w0UIviSD1fFdSTetzb7rG5qMXERYM1z';
//   var dest = fs.createWriteStream("./test");
//
//  // example code here
//  drive.files.get({fileId: fileId, alt: 'media'}, {responseType: 'stream'},
//  function(err, res){
//     res.data
//     .on('end', () => {
//        console.log('Done');
//     })
//     .on('error', err => {
//        console.log('Error', err);
//     })
//     .pipe(dest);
//  })
// }
