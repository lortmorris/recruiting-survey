const http = require('http');
const express = require('express');
const fs = require('fs');
const mongojs = require('mongojs');
const bodyParser = require('body-parser');


const db = mongojs('mongodb://127.0.0.1/recruiting');
const port = process.env.PORT || 5433;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
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

app.post('/save', (req, res) => {
  console.info('request: ', req.body);
  try {
    db.answers.insert({...req.body, added: new Date() }, (err, doc) => {
      if (err) return res.status(500).end('grrrr');
      return res.json({ ok: true });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).end('grrr wrong format');
  }

});

const server = http.createServer(app);

server.listen(port, () => console.info(`running on *:${port}`));
