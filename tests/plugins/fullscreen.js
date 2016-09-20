module("tinymce.plugins.Fullscreen", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			plugins: "fullscreen link",
			add_unload_trigger: false,
			skin: false,
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

test('Fullscreen class on html and body tag', function() {
  var bodyTag = document.body;
  var htmlTag = document.documentElement;

  equal(tinymce.DOM.hasClass(bodyTag, "mce-fullscreen"), false, 'Body tag does not have "mce-fullscreen" class before fullscreen command');
  equal(tinymce.DOM.hasClass(htmlTag, "mce-fullscreen"), false, 'Html tag does not have "mce-fullscreen" class before fullscreen command');

  editor.execCommand('mceFullScreen');

  equal(tinymce.DOM.hasClass(bodyTag, "mce-fullscreen"), true, '"mce-fullscreen" class on body tag after fullscreen command');
  equal(tinymce.DOM.hasClass(htmlTag, "mce-fullscreen"), true, '"mce-fullscreen" class on html tag after fullscreen command');

  editor.execCommand('mceLink', true);

  var windows = editor.windowManager.getWindows();
  var linkWindow = windows[0];

  equal(typeof linkWindow, 'object', 'Link window is an object');

  linkWindow.close();

  equal(windows.length, 0, 'No windows exist');

  equal(tinymce.DOM.hasClass(bodyTag, "mce-fullscreen"), true, 'No class on body tag before fullscreen');
  equal(tinymce.DOM.hasClass(htmlTag, "mce-fullscreen"), true, 'No class on html tag before fullscreen');
});
