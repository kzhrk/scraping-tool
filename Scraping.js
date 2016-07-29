const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const request = require('request');
const jschardet = require('jschardet');
const urlParse = require('url-parse');

const $ = cheerio;

/** Class scraping a website */
module.exports = class Scraping {

  /**
   * #description
   *
   * @param {string} url - the website's url
   */
  constructor(url) {
    this.url = url;
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
        let attrVal = cheerio(el).attr(attr);

        if (attr === 'src' || attr === 'href') {
          let location = urlParse(this.url);
          let fullPath = location.protocol + '//' + location.hostname;

          if (/^\//.test(attrVal)) {
            attrVal = fullPath + attrVal;
          }
          else {
            if ( /\/$/.test(location.pathname) ) {
              attrVal = path.join(location.protocol + '//' + location.hostname + location.pathname, attrVal); 
            }
            else {
              let pathname = /^(.*\/)(.*)\.(.*)$/g.exec(location.pathname)[1];
              attrVal = location.protocol + '//' + location.hostname + path.join(pathname, attrVal);
            }
          }
        }

        result.push( attrVal );
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

