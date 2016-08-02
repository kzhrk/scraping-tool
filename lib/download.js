const fs = require('fs');
const mime = require('mime');
const request = require('request');
const moment = require('moment');

module.exports = (imgData, dir)=>{
  // let dir = moment().format('YYYYMMDD-HHmmssSSSS');

  imgData.forEach((digit)=>{
    request.head(digit, (err, res, body)=>{
      let ext;
      let filename = /^.*\/(.*)\.(.*)$/g.exec(digit)[1];
<<<<<<< 9ca8906d08b44f2b6399bebf0c2382bc1eacabd7
      let dir = moment().format('YYYYMMDD-HHmmss');
=======
>>>>>>> fixed windows bug

      if ( /jpeg/.test(mime.lookup(digit)) ) {
        ext = '.jpg';
      }
      else if ( /gif/.test(mime.lookup(digit)) ) {
        ext = '.gif';
      }
      else if ( /png/.test(mime.lookup(digit)) ) {
        ext = '.png'
      }

      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      request(digit).pipe(fs.createWriteStream(dir + '/' + filename + ext));
    });
  });
}
