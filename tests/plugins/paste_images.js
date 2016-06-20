ModuleLoader.require([
	"tinymce/pasteplugin/Clipboard",
	"tinymce/Env",
	"tinymce/util/Delay",
	"tinymce/util/Promise"
], function(Clipboard, Env, Delay, Promise) {
	var base64ImgSrc = [
		'R0lGODdhZABkAHcAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQECgAAACwAAAAAZABkAIEAAAD78jY/',
		'P3SsMjIC/4SPqcvtD6OctNqLs968+w+G4kiW5ommR8C27gvHrxrK9g3TIM7f+tcL5n4doZFFLB6F',
		'Sc6SCRFIp9SqVTp6BiPXbjer5XG95Ck47IuWy2e0bLz2tt3DR5w8p7vgd2tej6TW5ycCGMM3aFZo',
		'OCOYqFjDuOf4KPAHiPh4qZeZuEnXOfjpFto3ilZ6dxqWGreq1br2+hTLtigZaFcJuYOb67DLC+Qb',
		'UIt3i2sshyzZtEFc7JwBLT1NXI2drb3N3e39DR4uPk5ebn6Onq6+zu488A4fLz9P335Aj58fb2+g',
		'71/P759AePwADBxY8KDAhAr9MWyY7yFEgPYmRgxokWK7jEYa2XGcJ/HjgJAfSXI0mRGlRZUTWUJ0',
		'2RCmQpkHaSLEKPKdzYU4c+78VzCo0KFEixo9ijSp0qVMmzp9CjWq1KlUq1q9eqEAADs='
	].join('');

	if (!Env.fileApi) {
		return;
	}

	module("tinymce.plugins.Paste - Images", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				disable_nodechange: true,
				skin: false,
				entities: 'raw',
				indent: false,
				automatic_uploads: false,
				plugins: "paste",
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		},

		teardown: function() {
			delete editor.settings.paste_data_images;
			delete editor.settings.images_dataimg_filter;
			editor.editorUpload.destroy();
		}
	});

	var base64ToBlob = function (base64, type) {
		var buff = atob(base64);
		var bytes = new Uint8Array(buff.length);

		for (var i = 0; i < bytes.length; i++) {
			bytes[i] = buff.charCodeAt(i);
		}

		return new Blob([bytes], {type: type});
	};

	var noop = function () {
	};

	var mockEvent = function (type) {
		var event, transferName;

		event = {
			type: type,
			preventDefault: noop
		};

		transferName = type === 'drop' ? 'dataTransfer' : 'clipboardData';
		event[transferName] = {
			files: [
				base64ToBlob(base64ImgSrc, 'image/gif')
			]
		};

		return event;
	};

	var setupContent = function () {
		editor.setContent('<p>a</p>');
		Utils.setSelection('p', 0);
		return editor.selection.getRng();
	};

	var waitForSelector = function (selector) {
		return new Promise(function (resolve, reject) {
			var check = function (time, count) {
				var result = editor.dom.select(selector);

				if (result.length > 0) {
					resolve(result);
				} else {
					if (count === 0) {
						reject();
					} else {
						Delay.setTimeout(function () {
							check(time, count--);
						}, time);
					}
				}
			};

			check(10, 100);
		});
	};

	var fail = function () {
		ok(false, 'Failed to get image due to timeout.');
		QUnit.start();
	};

	asyncTest('dropImages', function() {
		var rng, event, clipboard = new Clipboard(editor);

		editor.settings.paste_data_images = true;
		rng = setupContent();

		event = mockEvent('drop');
		clipboard.pasteImageData(event, rng);

		waitForSelector('img').then(function () {
			equal(editor.getContent(), '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" />a</p>');
			strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);

			QUnit.start();
		}, fail);
	});

	asyncTest('pasteImages', function() {
		var rng, event, clipboard = new Clipboard(editor);

		editor.settings.paste_data_images = true;
		rng = setupContent();

		event = mockEvent('paste');
		clipboard.pasteImageData(event, rng);

		waitForSelector('img').then(function () {
			equal(editor.getContent(), '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" />a</p>');
			strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);

			QUnit.start();
		}, fail);
	});

	asyncTest('dropImages - images_dataimg_filter', function() {
		var rng, event, clipboard = new Clipboard(editor);

		editor.settings.paste_data_images = true;
		editor.settings.images_dataimg_filter = function (img) {
			strictEqual(img.src, 'data:image/gif;base64,' + base64ImgSrc);
			return false;
		};
		rng = setupContent();

		event = mockEvent('drop');
		clipboard.pasteImageData(event, rng);

		waitForSelector('img').then(function () {
			equal(editor.getContent(), '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" />a</p>');
			strictEqual(editor.dom.select('img')[0].src.indexOf('data:'), 0);

			QUnit.start();
		}, fail);
	});

	asyncTest('pasteImages - images_dataimg_filter', function() {
		var rng, event, clipboard = new Clipboard(editor);

		editor.settings.paste_data_images = true;
		editor.settings.images_dataimg_filter = function (img) {
			strictEqual(img.src, 'data:image/gif;base64,' + base64ImgSrc);
			return false;
		};
		rng = setupContent();

		event = mockEvent('paste');
		clipboard.pasteImageData(event, rng);

		waitForSelector('img').then(function () {
			equal(editor.getContent(), '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" />a</p>');
			strictEqual(editor.dom.select('img')[0].src.indexOf('data:'), 0);

			QUnit.start();
		}, fail);
	});
});
