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
		var win = editor.windowManager.getWindows()[0];
		return win ? win.find('filepicker')[0] : null;
	};

	var keydownOnCtrl = function (pickerCtrl, keyCode) {
		return new Promise(function (resolve) {
			pickerCtrl.fire('keydown', {target: pickerCtrl.getEl('inp'), keyCode: keyCode});
			resolve(pickerCtrl);
		});
	};

	var downOnMenu = function () {
		return keydownOnCtrl(getFilePickerCtrl().menu, VK.DOWN);
	};

	var enterOnMenu = function () {
		return keydownOnCtrl(getFilePickerCtrl().menu, VK.ENTER);
	};

	var downOnPicker = function () {
		return keydownOnCtrl(getFilePickerCtrl(), VK.DOWN);
	};

	var enterOnPicker = function () {
		return keydownOnCtrl(getFilePickerCtrl(), VK.ENTER);
	};

	var setContent = function (content) {
		return function () {
			return new Promise(function (resolve) {
				editor.setContent(content);
				resolve(true);
			});
		};
	};

	var execCommand = function (cmd) {
		return function () {
			return new Promise(function (resolve) {
				editor.execCommand(cmd);
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

	var waitForMenu = waitFor(
		function () {
			var pickerCtrl = getFilePickerCtrl();
			return pickerCtrl && pickerCtrl.menu;
		},
		100,
		1000
	);

	var setCaret = function (selector, index) {
		return function () {
			return new Promise(function (resolve) {
				Utils.setSelection(selector, index);
				resolve(true);
			});
		};
	};

	var assertValue = function (expectedValue) {
		return function () {
			return new Promise(function (resolve) {
				var pickerCtrl = getFilePickerCtrl();
				equal(pickerCtrl.value(), expectedValue, 'Should have the correct file picker value');
				resolve(pickerCtrl);
			});
		};
	};

	var setPickerValue = function (value) {
		return function () {
			return new Promise(function (resolve) {
				var pickerCtrl = getFilePickerCtrl();
				pickerCtrl.value(value);
				resolve(pickerCtrl);
			});
		};
	};

	var waitForStatusChange = waitFor(
		function () {
			var pickerCtrl = getFilePickerCtrl();
			var msg = pickerCtrl.statusMessage();
			return msg && msg.length > 0;
		},
		100,
		1000
	);

	var assertStatus = function (level, message) {
		return function () {
			return new Promise(function (resolve) {
				var pickerCtrl = getFilePickerCtrl();
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
		sequence([
			setContent(''),
			execCommand('mceLink'),
			downOnPicker,
			waitForMenu,
			enterOnMenu,
			assertValue('#top'),
			enterOnPicker,
			assertContent('<p><a href="#top">&lt;top&gt;</a></p>')
		]).then(function () {
			QUnit.start();
		});
	});

	asyncTest('pick second anchor <bottom>', function() {
		sequence([
			setContent(''),
			execCommand('mceLink'),
			downOnPicker,
			waitForMenu,
			downOnMenu,
			enterOnMenu,
			assertValue('#bottom'),
			enterOnPicker,
			assertContent('<p><a href="#bottom">&lt;bottom&gt;</a></p>')
		]).then(function () {
			QUnit.start();
		});
	});

	asyncTest('pick first header', function() {
		sequence([
			setContent('<p>x</p><h1 id="h1">header</h1>'),
			setCaret('p', 0),
			execCommand('mceLink'),
			downOnPicker,
			waitForMenu,
			enterOnMenu,
			assertValue('#h1'),
			enterOnPicker,
			assertContent('<p><a href="#h1">header</a>x</p><h1 id="h1">header</h1>')
		]).then(function () {
			QUnit.start();
		});
	});

	asyncTest('filepicker_validator_handler', function() {
		sequence([
			setContent('<p>abc</p>'),
			setCaret('p', 0),
			execCommand('mceLink'),
			setPickerValue('http://www.site.com'),
			waitForStatusChange,
			assertStatus('ok', 'Valid message'),
			enterOnPicker
		]).then(function () {
			QUnit.start();
		});
	});
});
