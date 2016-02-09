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
			}, 0);
		}
	});

	strictEqual(tinymce.get().length, 2);
});

test('overrideDefaults', function() {
	var oldBaseURI, oldBaseUrl, oldSuffix;

	oldBaseURI = tinymce.baseURI;
	oldBaseUrl = tinymce.baseURL;
	oldSuffix = tinymce.suffix;

	tinymce.overrideDefaults({
		test: 42,
		base_url: "http://www.tinymce.com/base/",
		suffix: "x"
	});

	strictEqual(tinymce.baseURI.path, "/base");
	strictEqual(tinymce.baseURL, "http://www.tinymce.com/base");
	strictEqual(tinymce.suffix, "x");
	strictEqual(new tinymce.Editor('ed', {}, tinymce).settings.test, 42);

	tinymce.baseURI = oldBaseURI;
	tinymce.baseURL = oldBaseUrl;
	tinymce.suffix = oldSuffix;
});
