const fs = require('fs');
const { URL } = require('url');
const _ = require('lodash');

const MongoClient = require('mongodb').MongoClient;
// Connection url
const dbUrl = 'mongodb://localhost:27017';
// Database Name
const dbName = 'heartit';

const parseHostname = (hostname) => {
  let again = false;
  let t = hostname;
  const prefixList = _.uniq([
    'm',
    'www',
    'www1',
    'www2',
    'kr',
    'us',
    'uk',
    'jp',
    'au',
    'fr',
    'gb',
    'nl',
    'en',
    'gr',
    'tw',
    'eu',
    'dk',
    'de',
    'cn',
    'cache',
    'shop',
    'shop1',
    'shop2',
    'eshop',
    'item1',
    'item2',
    'item',
    'img',
    'itempage',
    'itempage1',
    'itempage2',
    'itempage3',
    'cdn-images',
    'global',
    'korea',
    'world',
    'static',
    'static1',
    'scontent',
    'dept',
    'store',
    'click',
    'intl',
    'mitem',
    'cafe24',
    'blog',
    'images',
    'img1',
    'img2',
    'img3',
    'img4',
    'img5',
    'img6',
    'img7',
    'int',
  ]);
  const suffixList = _.uniq([
    'it',
    'me',
    'be',
    'kr',
    'jp',
    'au',
    'uk',
    'us',
    'nl',
    'fr',
    'gb',
    'es',
    'gr',
    'tw',
    'tv',
    'de',
    'eu',
    'hn',
    'cn',
    '.nyc',
    'co',
    'net',
    'com',
    'blog',
    'godo',
    'asia',
    'cafe24',
    'img1',
    'img2',
    'img3',
    'img4',
    'img5',
    'img6',
    'img7',
  ]);
  prefixList.forEach(prefix => {
    if (t.startsWith(`${prefix}.`)) {
      isTrimNeeded = true;
      t = t.substring(prefix.length+1);
    }
  });
  suffixList.forEach(suffix => {
    if (t.endsWith(`.${suffix}`)) {
      isTrimNeeded = true;
      t = t.substring(0, t.length - suffix.length - 1);
    }
  })
  if (again) {
    return parseHostname(t);
  }
  return t;
}

// Connect using MongoClient
MongoClient.connect(dbUrl, function(err, client) {
  // Use the admin database for the operation
  const posts = client.db(dbName).collection('posts');
  let hostnameString = '', pathnameString = '', searchString = '';
  let hostnameArray = [];
  let i = 0;
  const date = new Date().getTime();
  // List all the available databases
  posts.find({
    "items": { $exists: true, $elemMatch: { "link": { $exists: true } }}
  }, {
    projection : { "items.link": 1 }
  })
  .toArray((err, elements) => {
    if (elements.length > 0) {
      elements.forEach( element => {
        if (element.items.length > 0) {
          element.items.forEach( item => {
            const linkUrl = new URL(item.link);
            i++;        
            hostnameArray.push(parseHostname(linkUrl.hostname));
            pathnameString += (linkUrl.pathname + '\n');
            searchString += (linkUrl.search + '\n');
          });
        }
      });
    }
    console.log(i);
    hostnameString = _.uniq(hostnameArray).toString();
    fs.writeFile('result/hostname_' + date + '.txt', hostnameString, () => {
      fs.writeFile('result/path_' + date + '.txt', pathnameString, () => {
        fs.writeFile('result/search_' + date + '.txt', searchString, () => {
          client.close();
        });
      });
    });
  });
});