const http = require('http');
const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.static('./public'));

const files = [
  { name: 'Java Frameworks', file: 'java-fws.csv' },
  { name: 'JavaScript libs', file: 'js-libs.csv' },
  { name: 'Program Languages', file: 'program-languages.csv' },
  { name: 'QA Tools', file:'qa-tools.csv' },
];
app.get('/data', (req, res) => {
  const response = files.map(f => ({
    name: f.name, options: fs.readFileSync(`${process.cwd()}/public/${f.file}`).toString().split('\r').map(i => i.trim())
  }));
  res.json(response);
});


const server = http.createServer(app);

server.listen(5432, () => console.info('running on *:5000'));
