const http = require('http');
const express = require('express');
const fs = require('fs');
const mongojs = require('mongojs');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');


const db = mongojs('mongodb://127.0.0.1/recruiting');
const port = process.env.PORT || 5433;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(express.static('./public'));
app.use(morgan('combined'));
app.use(helmet());

const files = [
  { name: 'Java Frameworks', file: 'java-fws.csv' },
  { name: 'JavaScript Frameworks', file: 'js-libs.csv' },
  { name: 'Programming Languages', file: 'program-languages.csv' },
  { name: 'QA Tools', file:'qa-tools.csv' },
  { name: 'Automation Tools', file:'auto-tools.csv' },
];

app.get('/data', (req, res) => {
  const response = files.map(f => ({
    name: f.name, options: fs.readFileSync(`${process.cwd()}/public/${f.file}`).toString().split('\r').map(i => i.trim())
  }));
  res.json(response);
});

app.post('/save', (req, res) => {
  try {
    db.answers.insert(req.body.map(i => ({...i, added: new Date()} )) , (err, doc) => {
      if (err) return res.status(500).end('grrrr');
      return res.json({ ok: true });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).end('grrr wrong format');
  }
});


app.get('/download', (req, res) => {
  db.answers.find({}, {} , (err, docs) => {
    if (err) return res.status(500).end(err.toString());
    let str = 'email,key,title,years,lastYear,added\r\n';
    docs.forEach((i) => {
      str+=`${i.email},${i.key},${i.title},${i.years},${i.lastYear},${i.added}\r\n`;
    });

    res.setHeader('Content-disposition', 'attachment; filename=download.csv');
    res.set('Content-Type', 'text/csv');
    return res.end(str);
  });
});

const server = http.createServer(app);

server.listen(port, () => console.info(`running on *:${port}`));
