'use strict';
const rp = require('request-promise');
const cheerio = require('cheerio');

const getEvents = async function(url) {
  try {
    const html = await rp(url);
    const $ = cheerio.load(html);
    const eventPromises = [];

    $('.rows')
      .children('li')
      .each((i, eventItem) => eventPromises.push(parseEvent(eventItem)));

    return Promise.all(eventPromises);
  } catch (err) {
    throw new Error(`Could not get event at url: ${url}. Error message: ${err.message}`);
  }
};

const parseEvent = function(eventElement) {
  const $ = cheerio.load(eventElement);

  const name = $('.event-name')
    .find('h2')
    .text()
    .trim();

  const location = $('.event-name')
    .find('h3')
    .text()
    .trim();

  const date = parseDate($('.event-date')).toDateString();

  const onclickUrl = $('.event-buttons')
    .find('button')
    .attr('onclick');

  const parsedUrl = parseUrl(onclickUrl);
  const furtherDetailsPromise = getEventPageData(parsedUrl);

  return furtherDetailsPromise.then(details => ({ name, location, date, details }));
};

const parseDate = function(dateElement) {
  const $ = cheerio.load(dateElement);
  let dateString = '';

  $(dateElement)
    .children()
    .each((i, elem) => (dateString += $(elem).text() + ' '));

  return new Date(dateString + '2017');
};

const getEventPageData = async function(url) {
  try {
    const html = await rp(url);
    const $ = cheerio.load(html);
    return $('.info-extra').text();
  } catch (err) {
    throw new Error(`Could not scrape event page: ${err.message}`);
  }
};

const parseUrl = function(onClickString) {
  const startIndex = onClickString.indexOf("'");
  const endIndex = onClickString.indexOf("'", startIndex + 1);
  return onClickString.slice(startIndex + 1, endIndex);
};

const sortByDate = data => data.sort((a, b) => new Date(a.date) - new Date(b.date));

const fetchData = function() {
  return getEvents('http://thedjlist.com/events/los-angeles-us/')
    .then(data => sortByDate(data))
    .catch(e => console.log(e));
};

const updateCache = cache => {
  console.log('Updating djlist cache...');
  fetchData()
    .then(data => (cache = data))
    .then(() => console.log('Successfully updated djlist cache.'))
    .catch(err => console.log(`Could not update djlist cache ${err.message}`));
};

let cache = [];
updateCache(cache);
setInterval(() => updateCache(cache), 60 * 1000 * 10);
const getCache = () => cache;

module.exports = { getCache };
