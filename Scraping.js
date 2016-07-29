const fs = require('fs');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const request = require('request');
const jschardet = require('jschardet');

const $ = cheerio;

/** Class scraping a website */
module.exports = class Scraping {

  /**
   * #description
   *
   * @param {string} url - the website's url
   */
  constructor(url) {
    this.wating = ()=> {
      return new Promise((resolve)=>{
        if (typeof this.body !== 'undefined') resolve();

        request({
          uri: url,
          encoding: null
        }, (err, res, body)=>{

          if (err) throw('ERROR>>>' + err);
          if (res.statusCode !== 200) throw('ERROR>>>Responce Code:' + res.statusCode);

          // detect encoding
          let encoding = jschardet.detect(body).encoding;

          // convert charset and set name variable
          this.body = iconv.encode( iconv.decode(body, encoding), 'utf8').toString();
          this.$body = $(this.body);
          resolve();
        });
      });
    };
  }


  /**
   * Check selectors in a website
   *
   * @param {array} selectors - The jQuery selectors
   * @return Promise
   */
  checkSelectors (selectors) {

    return this.wating().then(()=>{
      let countSelectors = [];

      selectors.forEach((selector)=>{
        countSelectors.push( this.$body.find(selector).length );
      });

      let result = countSelectors.reduce((pre, cur)=>{
        if (pre === cur) {
          return pre;
        }
        else {
          return false;
        }
      }, countSelectors[0]);

      if (result !== false) {
        return true;
      }
      else {
        return false;
      }
    });
  }


  /**
   * @return {string}
   */
  getAttr (selector, attr) {
    return this.wating().then(()=>{
      let $doms = this.$body.find(selector);
      let result = [];

      $doms.each((i, el)=>{
        result.push( cheerio(el).attr(attr) );
      });

      return result;
    });
  }


  /**
   * @return {string}
   */
  getText (selector) {
    return this.wating().then(()=>{
      let $doms = this.$body.find(selector);
      let result = [];

      $doms.each((i, el)=>{
        result.push( cheerio(el).text() );
      });

      return result;
    });
  }


  /**
   * @return {string}
   */
  getHtml (selector) {
    return this.wating().then(()=>{
      let $doms = this.$body.find(selector);
      let result = [];

      $doms.each((i, el)=>{
        result.push(cheerio(el).html());
      });

      return result;
    });
  }
}

// let scraping = new Scraping('http://blog.kzhrk.com/');
// scraping.getText('h2').then((data)=>{
//   console.log(data);
// });


// let scraping = new Scraping('http://www.lixil.co.jp/lineup/livingroom_bedroom/wall/default.htm');
// scraping.checkSelectors(['.section .box-txt', '.section .box-img']).then((result)=>{
//   debugger
//   console.log(result);
// })

// Scraping.getHtml('http://www.lixil.co.jp/lineup/livingroom_bedroom/wall/default.htm', {
//   'title'      : '.box-txt h3.h4',
//   'description': '.box-txt .txt-14',
//   'url'        : '.box-img a[href]',
//   'imgPath'    : '.box-img > a > img'
// });

// module.export = Scraping;
