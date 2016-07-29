const $ = require('jquery');
const Scraping = require('./Scraping.js');

const $url = $('#js-url');
const $input = $('.js-selector');
const $submit = $('#js-submit');
const $webview = $('#js-webview');
const $add = $('#js-clone');

$submit.on('click', ()=>{
	let scraping = new Scraping( $url.val() );

	let selectors = [];
	let promises  = [];

	$('.js-selector').each((i, el)=>{
		selectors.push($(el).val());
	});

	selectors.forEach((selector)=>{
		promises.push( scraping.getText(selector) );
	});

	Promise.all(promises).then((values)=>{
		console.log(values);
	})

});

$webview.on('dom-ready', ()=>{

	$webview.on('did-start-loading', ()=>{
		$webview.get(0).stop();
	});
});

$add.on('click', ()=>{
	$('.js-selector').last().before( $input.clone().val('') );
});

$webview.on('ipc-message', (e)=>{
	if (e.channel === 'selector-message') {
		console.log(e.originalEvent.args[0]);
	}
});
