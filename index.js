const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

async function getDailyPrice(date) {
  try {
    const url = `https://cypressmountain.ltibooking.com/products/search?utf8=%E2%9C%93&partner_date=2019-11-26&start_date=${date}&store%5Bcategories%5D%5B%5D=lift-tickets`;
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const a = $(`[href="/purchase-path/product-details/9543?date=${date}"]`);

    const spanText = a.children('span.button__text').text();

    const value = spanText.match(/(\d+\.\d{1,2})/)[0];

    return value;
  } catch (error) {
    console.log(`No data for ${date}`);
    return null;
  }
}

function getWeekDay(date) {
  //Create an array containing each day, starting with Sunday.
  var weekdays = new Array(
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  );
  //Use the getDay() method to get the day.
  var day = date.getDay();
  //Return the element that corresponds to that index.
  return weekdays[day];
}

async function scrape() {
  const today = new Date();
  const results = [];
  for (let index = 0; index < 100; index++) {
    const date = today.addDays(index);
    const formattedDate = date.toISOString().substring(0, 10);
    const price = await getDailyPrice(formattedDate);
    results.push(`${getWeekDay(date)},${formattedDate},${price ? price : '-'}`);
  }
  const csvString = results.join('\n');

  fs.writeFile('results.csv', csvString, err => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
}

scrape();
