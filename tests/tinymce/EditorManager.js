module("tinymce.EditorManager", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			disable_nodechange: true,
			skin: false
		}).then(function(editors) {
			window.editor = editors[0];
			QUnit.start();
		});
	}
});

test('get', function() {
	strictEqual(tinymce.get().length, 1);
	strictEqual(tinymce.get(0), tinymce.activeEditor);
	strictEqual(tinymce.get(1), null);
	strictEqual(tinymce.get("noid"), null);
	strictEqual(tinymce.get(undefined), null);
	strictEqual(tinymce.get()[0], tinymce.activeEditor);
	strictEqual(tinymce.get(tinymce.activeEditor.id), tinymce.activeEditor);
});

test('addI18n/translate', function() {
	tinymce.addI18n('en', {
		'from': 'to'
	});

	equal(tinymce.translate('from'), 'to');
});

test('triggerSave', function() {
	var saveCount = 0;

	window.editor.on('SaveContent', function() {
		saveCount++;
	});

	tinymce.triggerSave();
	equal(saveCount, 1);
});

test('Re-init on same id', function() {
	tinymce.init({selector: "#" + tinymce.activeEditor.id});
	strictEqual(tinymce.get().length, 1);
});

asyncTest('Externally destroyed editor', function() {
	tinymce.remove();

	tinymce.init({
		selector: "textarea",
		init_instance_callback: function(editor1) {
			tinymce.util.Delay.setTimeout(function() {
				// Destroy the editor by setting innerHTML common ajax pattern
				document.getElementById('view').innerHTML = '<textarea id="' + editor1.id + '"></textarea>';

				// Re-init the editor will have the same id
				tinymce.init({
					selector: "textarea",
					init_instance_callback: function(editor2) {
						QUnit.start();

						strictEqual(tinymce.get().length, 1);
						strictEqual(editor1.id, editor2.id);
						ok(editor1.destroyed, "First editor instance should be destroyed");
					}
				});
			}, 0);
		}
	});
});

asyncTest('Init/remove on same id', function() {
	var textArea = document.createElement('textarea');
	document.getElementById('view').appendChild(textArea);

	tinymce.init({
		selector: "#view textarea",
		init_instance_callback: function() {
			tinymce.util.Delay.setTimeout(function() {
				QUnit.start();

				strictEqual(tinymce.get().length, 2);
				strictEqual(tinymce.get(1), tinymce.activeEditor);
				tinymce.remove('#' + tinymce.get(1).id);
				strictEqual(tinymce.get().length, 1);
				strictEqual(tinymce.get(0), tinymce.activeEditor);
				textArea.parentNode.removeChild(textArea);
			}, 0);
		}
	});

	strictEqual(tinymce.get().length, 2);
});

asyncTest('Init editor async with proper editors state', function() {
	var unloadTheme = function(name) {
		var url = tinymce.baseURI.toAbsolute('themes/' + name + '/theme.js');
		tinymce.dom.ScriptLoader.ScriptLoader.remove(url);
		tinymce.ThemeManager.remove(name);
	};

	tinymce.remove();

	var init = function() {
		tinymce.init({
			selector: "textarea",
			init_instance_callback: function() {
				tinymce.util.Delay.setTimeout(function() {
					QUnit.start();
				}, 0);
			}
		});
	};

	unloadTheme("modern");
	strictEqual(tinymce.get().length, 0);

	init();
	strictEqual(tinymce.get().length, 1);

	init();
	strictEqual(tinymce.get().length, 1);
});

test('overrideDefaults', function() {
	var oldBaseURI, oldBaseUrl, oldSuffix;

	oldBaseURI = tinymce.baseURI;
	oldBaseUrl = tinymce.baseURL;
	oldSuffix = tinymce.suffix;

	tinymce.overrideDefaults({
		test: 42,
		base_url: "http://www.tinymce.com/base/",
		suffix: "x",
		external_plugins: {
			"plugina": "//domain/plugina.js",
			"pluginb": "//domain/pluginb.js"
		},
		plugin_base_urls: {
			testplugin: 'http://custom.ephox.com/dir/testplugin'
		}
	});

	strictEqual(tinymce.baseURI.path, "/base");
	strictEqual(tinymce.baseURL, "http://www.tinymce.com/base");
	strictEqual(tinymce.suffix, "x");
	strictEqual(new tinymce.Editor('ed1', {}, tinymce).settings.test, 42);
	strictEqual(tinymce.PluginManager.urls.testplugin, 'http://custom.ephox.com/dir/testplugin');

	deepEqual(new tinymce.Editor('ed2', {
		external_plugins: {
			"plugina": "//domain/plugina2.js",
			"pluginc": "//domain/pluginc.js"
		},
		plugin_base_urls: {
			testplugin: 'http://custom.ephox.com/dir/testplugin'
		}
	}, tinymce).settings.external_plugins, {
		"plugina": "//domain/plugina2.js",
		"pluginb": "//domain/pluginb.js",
		"pluginc": "//domain/pluginc.js"
	});

	deepEqual(new tinymce.Editor('ed3', {}, tinymce).settings.external_plugins, {
		"plugina": "//domain/plugina.js",
		"pluginb": "//domain/pluginb.js"
	});

	tinymce.baseURI = oldBaseURI;
	tinymce.baseURL = oldBaseUrl;
	tinymce.suffix = oldSuffix;

	tinymce.overrideDefaults({});
});

test('Init inline editor on invalid targets', function() {
	var invalidNames;

	invalidNames = (
		'area base basefont br col frame hr img input isindex link meta param embed source wbr track ' +
		'colgroup option tbody tfoot thead tr script noscript style textarea video audio iframe object menu'
	);

	tinymce.remove();

	tinymce.each(invalidNames.split(' '), function (invalidName) {
		var elm = tinymce.DOM.add(document.body, invalidName, {'class': 'targetEditor'}, null);

		tinymce.init({
			selector: invalidName + '.targetEditor',
			inline: true
		});

		strictEqual(tinymce.get().length, 0, 'Should not have created an editor');
		tinymce.DOM.remove(elm);
	});
});
