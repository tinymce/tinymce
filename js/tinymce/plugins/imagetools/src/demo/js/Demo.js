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

define("tinymce/imagetoolsplugin/Demo", [
	"tinymce/imagetoolsplugin/Plugin",
	"global!tinymce",
	"global!tinymce.dom.DomQuery",
	"global!console"
], function(Plugin, tinymce, $, console) {
	return function() {
		var imgSrc = '../../../../../../../tests/manual/img/dogleft.jpg';

		$(
			'<textarea class="tinymce">' +
				'<p>' +
					'<img src="' + imgSrc + '" width="160" height="100">' +
					'<img src="' + imgSrc + '" style="width: 160px; height: 100px">' +
					'<img src="' + imgSrc + '" style="width: 20%">' +
					'<img src="' + imgSrc + '">' +
					'<img src="http://moxiecode.cachefly.net/tinymce/v9/images/logo.png">' +
				'</p>' +
			'</textarea>'
		).appendTo('#ephox-ui');

		tinymce.init({
			//imagetools_cors_hosts: ["moxiecode.cachefly.net"],
			//imagetools_proxy: "proxy.php",

			//images_upload_url: 'postAcceptor.php',
			//images_upload_base_path: 'base/path',
			//images_upload_credentials: true,

			selector: "textarea.tinymce",
			theme: "modern",
			plugins: [
				"imagetools"
			],
			add_unload_trigger: false,
			image_caption: true,
			height: 600,
			toolbar1: "undo redo | styleselect | alignleft aligncenter alignright alignjustify | link image | media | emoticons",
			images_upload_handler: function(data, success, failure, openNotification) {
				var notification;

				console.log('blob upload [started]', data.id());

				notification = openNotification();
				notification.progressBar.value(100);

				setTimeout(function() {
					console.log('blob upload [ended]', data.id());
					success(data.id() + '.png');
					notification.close();
				}, 1000);
			}
		});

		function send() {
			tinymce.activeEditor.uploadImages(function() {
				console.log('saving:', tinymce.activeEditor.getContent());
			});
		}

		function upload() {
			console.log('upload [started]');

			tinymce.activeEditor.uploadImages(function(success) {
				console.log('upload [ended]', success);
			});
		}

		function dump() {
			var content = tinymce.activeEditor.getContent();

			$('#view').html(content);
			console.log(content);
		}

		$('<button>send()</button>').appendTo('#ephox-ui').on('click', send);
		$('<button>upload()</button>').appendTo('#ephox-ui').on('click', upload);
		$('<button>dump()</button>').appendTo('#ephox-ui').on('click', dump);
	};
});
