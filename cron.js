const cron = require('node-cron');
const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

app = express(); // initialize the app

// databse
let db = [];

// read csv file
const parsed = [];
fs.createReadStream('Site_Bittenahalli_raw_data.csv')
  .pipe(csv())
  .on('data', row => {
    parsed.push(row);
    //    console.log(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

// stream data every 2 minutes.
let count = 1;
cron.schedule('*/10 * * * * *', function() {
  if (parsed.length && count < parsed.length) count += 1;
  // pick a row and push to db
  console.log(parsed[parsed.length - count]);
  db.push(parsed[parsed.length - count]);
});

app.get('/', function(req, res) {
  if (db.length > 0) {
    // res.send(
    //   'Parameter 1 ' + db[db.length - 1]['Parameter1'] + 'of row ' + db.length,
    // );
    res.set('Access-Control-Allow-Origin', '*');
    res.json(db);
  } else {
    res.send('Loading ... ');
  }
});

app.listen(9000, function() {
  console.log('running on port 9000');
});

// module.exports = {
//   db: db,
// };
