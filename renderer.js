const $ = require('jquery');
const Scraping = require('./lib/Scraping.js');
const download = require('./lib/download.js');
const json2csv = require('json2csv');
const fs       = require('fs');
const moment   = require('moment');
const iconv    = require('iconv-lite');
const Vue      = require('vue');

const $url = $('#js-url');
const $input = $('.js-selector');
const $submit = $('#js-submit');
const $add = $('#js-clone');

const blockComponent = Vue.extend({
	template: $('#js-template').html(),
	data: function () {
		return {
			newName: '',
			newType: '',
			newSelector: '',
			selectors: []
		}
	},
	methods: {
		add: function () {
			let name = this.newName.trim();
			let type = this.newType.trim();
			let selector = this.newSelector.trim();

			if (name && type && selector) {
				this.selectors.push({
					name: name,
					type: type,
					selector: selector
				});
			}
		},
		delete: function (index) {
			this.selectors.splice(index, 1);
		}
	}	
});

new Vue({
	el: '#app',
	data: {
		blocks: [{
			id: 'block-' + Date.now()
		}]
	},
	methods: {
		duplicate: function () {
			let id = 'block-' + Date.now();

			this.blocks.push({
				id: id
			});
		}
	},
	components: {
		'block-component': blockComponent
	}
});

$submit.on('click', ()=>{
	let store = [];

	$('.block').each((blockIndex, block)=>{
		let $block = $(block);
		let data = {
			url: $block.find('.js-url').val(),
			selectors: []
		};

		$block.find('.js-row').each((rowIndex, row)=>{
			let $row = $(row);

			data.selectors.push({
				name: $row.find('.js-name').text(),
				type: $row.find('.js-type').text(),
				selector: $row.find('.js-selector').text()
			});
		});

		if (data.selectors.length !== 0) {
			store.push(data);
		}
	});

	store.forEach((data)=>{
		let scraping = new Scraping( data.url );

		let groupProp = [];
		let promises  = [];

		data.selectors.forEach((selector)=>{
			let type = selector.type;

			switch (type) {
				case 'text':
					groupProp.push({
						name: selector.name,
						type: selector.type
					});

					promises.push(scraping.getText(selector.selector));
					break;

				case 'link':
					groupProp.push({
						name: selector.name,
						type: selector.type
					});

					promises.push(scraping.getAttr(selector.selector, 'href'));
					break;

				case 'img':
					groupProp.push({
						name: selector.name,
						type: selector.type
					});

					promises.push(scraping.getAttr(selector.selector, 'src'));
					break;
			}


	    let dir = moment().format('YYYYMMDD-HHmmssSSSS');

			Promise.all(promises).then((values)=>{
				let result = [];
				let fields = [];

				groupProp.forEach((prop, typeIndex)=>{
					if (prop.type === 'img') {
						download( values[typeIndex], dir );
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

				let csv = json2csv({
					data: result,
					fields: fields
				});

		    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

		    csv = iconv.encode(csv, 'shift-jis');

				fs.writeFile(dir + '/file.csv', csv);
			});
		});
	});
});
