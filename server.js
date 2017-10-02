import express from 'express';
import { getData } from './scraper/djlist';

const app = express();
const PORT = 9090;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/events', (req, res) => res.status(200).send(getData()));
app.get('/events/:location', (req, res) => res.status(200).send(getData(req.params.location)));

app.listen(PORT, () => console.log(`RUNNING ON PORT ${PORT}`));
