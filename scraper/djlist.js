'use strict';
import rp from 'request-promise';
import cheerio from 'cheerio';

let cache = [];

const updateCache = function() {
  console.log('Updating djlist cache...');

  getEvents('http://thedjlist.com/events/los-angeles-us/')
    .then(data => sortByDate(data))
    .then(sortedData => (cache = sortedData))
    .then(() => console.log('Successfully updated djlist cache.'))
    .catch(err => console.log(`Could not update djlist cache ${err.message}`));
};

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

const parseUrl = function(onClickString) {
  const startIndex = onClickString.indexOf("'");
  const endIndex = onClickString.indexOf("'", startIndex + 1);
  return onClickString.slice(startIndex + 1, endIndex);
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

const sortByDate = data => data.sort((a, b) => new Date(a.date) - new Date(b.date));

const minutesToMS = minutes => 60 * minutes * 1000;

const getCache = () => cache;

const initializeUpdateInterval = function() {
  updateCache();
  const intervalMS = minutesToMS(10);
  setInterval(updateCache, intervalMS);
};

module.exports = { getCache, initializeUpdateInterval };
