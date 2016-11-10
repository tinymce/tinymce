/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0 */

define('tinymce.modern.Demo', [
	'tinymce.modern.Theme',
	'global!tinymce'
], function(Theme, tinymce) {
	var config = {
		theme: "modern",
		plugins: [
			"advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker toc",
			"searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
			"save table contextmenu directionality emoticons template paste textcolor importcss colorpicker textpattern codesample"
		],
		add_unload_trigger: false,
		toolbar: "insertfile undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | " +
			"bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons table codesample",

		setup: function(ed) {
			ed.addSidebar('sidebar1', {
				tooltip: 'My side bar 1',
				icon: 'bold',
				onrender: function (api) {
					var rect = api.element().getBoundingClientRect();
					var panel = tinymce.ui.Factory.create({
						layout: 'flex',
						direction: 'column',
						pack: 'center',
						align: 'center',
						minWidth: rect.width,
						minHeight: rect.height,
						type: 'panel',
						items: [
							{type: 'button', text: 'Hello world!'}, {type: 'button', text: 'Hello world!'}
						]
					});
					panel.renderTo(api.element()).reflow();
					console.log('Render panel 1');
				},
				onshow: function (api) {
					console.log('Show panel 1', api.element());
				},
				onhide: function (api) {
					console.log('Hide panel 1', api.element());
				}
			});

			ed.addSidebar('sidebar2', {
				tooltip: 'My side bar 2',
				icon: 'italic',
				onrender: function (api) {
					console.log('Render panel 2', api.element());
				},
				onshow: function (api) {
					console.log('Show panel 2', api.element());
					api.element().innerHTML = document.body.innerText;
				},
				onhide: function (api) {
					console.log('Hide panel 2', api.element());
				}
			});
		}
	};

	tinymce.init(
		tinymce.extend({}, config, {
			selector: 'textarea.tinymce'
		})
	);

	tinymce.init(
		tinymce.extend({}, config, {
			selector: 'div.tinymce',
			inline: true
		})
	);

	return function () {
	};
});
