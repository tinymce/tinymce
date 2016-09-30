ModuleLoader.require([
	'tinymce/util/VK',
	'tinymce/util/Promise'
], function(VK, Promise) {
	module("tinymce.ui.FilePicker", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				disable_nodechange: true,
				skin: false,
				entities: 'raw',
				indent: false,
				plugins: 'link',
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				},
				filepicker_validator_handler: function (query, success) {
					setTimeout(function () {
						var valid = query.url.indexOf('fake') === -1;

						success({
							status: valid ? 'valid' : 'invalid',
							message: valid ? 'Valid message' : 'Invalid message'
						});
					}, 0);
				}
			});
		},

		teardown: function() {
			delete editor.settings.anchor_top;
			delete editor.settings.anchor_bottom;
			delete editor.settings.typeahead_urls;
		}
	});

	var getFilePickerCtrl = function () {
		return editor.windowManager.getWindows()[0].find('filepicker')[0];
	};

	var keydownOnCtrl = function (pickerCtrl, keyCode) {
		return function () {
			return new Promise(function (resolve) {
				pickerCtrl.fire('keydown', {target: pickerCtrl.getEl('inp'), keyCode: keyCode});
				resolve(pickerCtrl);
			});
		};
	};

	var downOnMenu = function (pickerCtrl) {
		return function () {
			return keydownOnCtrl(pickerCtrl.menu, VK.DOWN)();
		};
	};

	var enterOnMenu = function (pickerCtrl) {
		return function () {
			return keydownOnCtrl(pickerCtrl.menu, VK.ENTER)();
		};
	};

	var downOnPicker = function (pickerCtrl) {
		return keydownOnCtrl(pickerCtrl, VK.DOWN);
	};

	var enterOnPicker = function (pickerCtrl) {
		return keydownOnCtrl(pickerCtrl, VK.ENTER);
	};

	var setContent = function (content) {
		return function () {
			return new Promise(function (resolve) {
				editor.setContent(content);
				resolve(true);
			});
		};
	};

	var assertContent = function (exceptedContent) {
		return function () {
			return new Promise(function (resolve) {
				equal(editor.getContent(), exceptedContent, 'Should have the expected content');
				resolve(true);
			});
		};
	};

	var waitFor = function (predicate, poll, timeout) {
		return function () {
			var start = new Date().getTime();

			return new Promise(function (resolve, reject) {
				var check = function () {
					if (predicate()) {
						resolve();
						return;
					}

					if (new Date().getTime() - start > timeout) {
						reject(new Error('Timeout while waiting for predicate'));
						return;
					}

					setTimeout(check, poll);
				};

				check();
			});
		};
	};

	var waitForMenu = function (pickerCtrl) {
		return waitFor(
			function () {
				return !!pickerCtrl.menu;
			},
			100,
			1000
		);
	};

	var setCaret = function (selector, index) {
		return function () {
			return new Promise(function (resolve) {
				Utils.setSelection(selector, index);
				resolve(true);
			});
		};
	};

	var assertValue = function (pickerCtrl, expectedValue) {
		return function () {
			return new Promise(function (resolve) {
				equal(pickerCtrl.value(), expectedValue, 'Should have the correct file picker value');
				resolve(pickerCtrl);
			});
		};
	};

	var setPickerValue = function (pickerCtrl, value) {
		return function () {
			return new Promise(function (resolve) {
				pickerCtrl.value(value);
				resolve(pickerCtrl);
			});
		};
	};

	var waitForStatusChange = function (pickerCtrl) {
		return waitFor(
			function () {
				var msg = pickerCtrl.statusMessage();
				return msg && msg.length > 0;
			},
			100,
			1000
		);
	};

	var assertStatus = function (pickerCtrl, level, message) {
		return function () {
			return new Promise(function (resolve) {
				equal(pickerCtrl.statusLevel(), level);
				equal(pickerCtrl.statusMessage(), message);
				resolve(pickerCtrl);
			});
		};
	};

	var sequence = function (fs) {
		return new Promise(function (resolve) {
			var result = [];

			var next = function () {
				var f = fs.shift();

				if (f) {
					f().then(function (res) {
						result.push(res);
						next();
					});
				} else {
					resolve(result);
				}
			};

			next();
		});
	};

	asyncTest('pick first anchor <top>', function() {
		editor.execCommand('mceLink');

		sequence([
			setContent(''),
			downOnPicker(getFilePickerCtrl()),
			waitForMenu(getFilePickerCtrl()),
			enterOnMenu(getFilePickerCtrl()),
			assertValue(getFilePickerCtrl(), '#top'),
			enterOnPicker(getFilePickerCtrl()),
			assertContent('<p><a href="#top">&lt;top&gt;</a></p>')
		]).then(function () {
			QUnit.start();
		});
	});

	asyncTest('pick second anchor <bottom>', function() {
		editor.execCommand('mceLink');

		sequence([
			setContent(''),
			downOnPicker(getFilePickerCtrl()),
			waitForMenu(getFilePickerCtrl()),
			downOnMenu(getFilePickerCtrl()),
			enterOnMenu(getFilePickerCtrl()),
			assertValue(getFilePickerCtrl(), '#bottom'),
			enterOnPicker(getFilePickerCtrl()),
			assertContent('<p><a href="#bottom">&lt;bottom&gt;</a></p>')
		]).then(function () {
			QUnit.start();
		});
	});

	asyncTest('pick first header', function() {
		editor.execCommand('mceLink');

		sequence([
			setContent('<h1 id="h1">header</h1><p>x</p>'),
			setCaret('p', 0),
			downOnPicker(getFilePickerCtrl()),
			waitForMenu(getFilePickerCtrl()),
			enterOnMenu(getFilePickerCtrl()),
			assertValue(getFilePickerCtrl(), '#h1'),
			enterOnPicker(getFilePickerCtrl()),
			assertContent('<h1 id="h1">header</h1><p><a href="#h1">header</a>x</p>')
		]).then(function () {
			QUnit.start();
		});
	});

	asyncTest('filepicker_validator_handler', function() {
		editor.execCommand('mceLink');

		sequence([
			setPickerValue(getFilePickerCtrl(), 'http://www.site.com'),
			waitForStatusChange(getFilePickerCtrl()),
			assertStatus(getFilePickerCtrl(), 'ok', 'Valid message'),
			enterOnPicker(getFilePickerCtrl())
		]).then(function () {
			QUnit.start();
		});
	});
});
