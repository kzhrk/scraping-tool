const $ = require('jquery');
const Scraping = require('./Scraping.js');
const download = require('./lib/download.js');
const json2csv = require('json2csv');
const fs       = require('fs');
const moment   = require('moment');
const iconv    = require('iconv-lite');

const $url = $('#js-url');
const $input = $('.js-selector');
const $submit = $('#js-submit');
const $add = $('#js-clone');

$submit.on('click', ()=>{
	let scraping = new Scraping( $url.val() );

	let groupProp = [];
	let promises  = [];

	$('.js-group').each((i, el)=>{
		let type = $(el).find('.js-type').val();

		switch (type) {
			case 'text':
				groupProp.push({
					name: $(el).find('.js-name').val(),
					type: 'text'
				});
				
				promises.push( scraping.getText( $(el).find('.js-selector').val() ) );
				break;
			case 'link':
				groupProp.push({
					name: $(el).find('.js-name').val(),
					type: 'link'
				});
				
				promises.push( scraping.getAttr( $(el).find('.js-selector').val(), 'href' ) );
				break;
			case 'img':
				groupProp.push({
					name: $(el).find('.js-name').val(),
					type: 'img'
				});

				promises.push( scraping.getAttr( $(el).find('.js-selector').val(), 'src' ) );
				break;
		}
	});

	Promise.all(promises).then((values)=>{
		let result = [];
		let fields = [];

		groupProp.forEach((prop, typeIndex)=>{
			if (prop.type === 'img') {
				download( values[typeIndex] );
			}
		});

		// create object
		values.forEach((value, valueIndex)=>{
			value.forEach((str, strIndex)=>{
				result[strIndex] = result[strIndex] || {};
				result[strIndex][groupProp[valueIndex].name] = str;

				if (fields.indexOf(groupProp[valueIndex].name) === -1) {
					fields.push(groupProp[valueIndex].name);
				}
			});
		});

    let dir = moment().format();
		let csv = json2csv({
			data: result,
			fields: fields
		});

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    csv = iconv.encode(csv, 'shift-jis');

		fs.writeFile('file.csv', csv);
	});
});

$add.on('click', ()=>{
	$('.js-group').last().before( $('.js-group').last().clone() );
});
