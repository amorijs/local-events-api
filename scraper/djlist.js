'use strict';
const request = require('request');
const cheerio = require('cheerio');

const getEvents = url => {
  return new Promise((resolve, reject) => {
    request(url, (error, response, html) => {
      if (error) reject(new Error(`Could not get events: ${err.message}`));

      const $ = cheerio.load(html);
      const eventPromises = [];

      $('.rows')
        .children('li')
        .each((i, eventItem) => eventPromises.push(parseEvent(eventItem)));

      Promise.all(eventPromises)
        .then(data => resolve(data))
        .catch(e => console.log(e));
    });
  });
};

const parseEvent = eventElement => {
  return new Promise((resolve, reject) => {
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

    furtherDetailsPromise
      .then(details => resolve({ name, location, date, details }))
      .catch(e => reject(e));
  });
};

const parseDate = dateElement => {
  const $ = cheerio.load(dateElement);
  let dateString = '';

  $(dateElement)
    .children()
    .each((i, elem) => (dateString += $(elem).text() + ' '));

  return new Date(dateString + '2017');
};

const getEventPageData = url => {
  return new Promise((resolve, reject) => {
    request(url, (error, response, html) => {
      if (error) reject(new Error(`Could not scrape event page: ${err.message}`));
      const $ = cheerio.load(html);
      resolve($('.info-extra').text());
    });
  });
};

const parseUrl = onClickString => {
  const startIndex = onClickString.indexOf("'");
  const endIndex = onClickString.indexOf("'", startIndex + 1);
  return onClickString.slice(startIndex + 1, endIndex);
};

const sortByDate = data => data.sort((a, b) => new Date(a.date) - new Date(b.date));

const updateCache = () =>
  getEvents('http://thedjlist.com/events/los-angeles-us/')
    .then(data => sortByDate(data))
    .then(sortedData => (cache = sortedData))
    .then(() => console.log('Successfully updated cache!'))
    .catch(e => console.log(e));

let cache = [];
const getData = () => cache;

updateCache();
setInterval(updateCache, 60 * 1000 * 10);

module.exports = { getData };
