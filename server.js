import express from 'express';
import djList from './scraper/djlist';

const app = express();
const PORT = 9090;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/events', (req, res) => {
  const cache = djList.getCache();
  res.status(200).send(cache);
});

app.get('/events/:location', (req, res) => {
  const cache = djList.getCache(req.params.location);
  res.status(200).send(cache);
});

app.listen(PORT, () => console.log(`RUNNING ON PORT ${PORT}`));
