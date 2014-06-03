(function() {
	module("tinymce.plugins.Autolink", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				skin: false,
				plugins: 'autolink',
				autosave_ask_before_unload: false,
				indent: false,
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		}
	});

	function typeUrl(url) {
		editor.setContent('<p>' + url + '</p>');
		Utils.setSelection('p', url.length);
		Utils.type(' ');
		return editor.getContent();
	}

	function typeAnEclipsedURL(url) {
		url = "(" + url;
		editor.setContent('<p>' + url + '</p>');
		Utils.setSelection('p', url.length);
		Utils.type(')');
		return editor.getContent();
	}

	function typeNewlineURL(url) {
		editor.setContent('<p>' + url + '</p>');
		Utils.setSelection('p', url.length);
		Utils.type('\n');
		return editor.getContent();
	}

	if (tinymce.Env.ie) {
		test("Skipped on IE since it has built in logic for autolink", function() {
			ok(true);
		});

		return;
	}

	test("Urls ended with space", function() {
		equal(typeUrl('http://www.tinymce.com'), '<p><a href="http://www.tinymce.com">http://www.tinymce.com</a></p>');
		equal(typeUrl('https://www.tinymce.com'), '<p><a href="https://www.tinymce.com">https://www.tinymce.com</a></p>');
		equal(typeUrl('ssh://www.tinymce.com'), '<p><a href="ssh://www.tinymce.com">ssh://www.tinymce.com</a></p>');
		equal(typeUrl('ftp://www.tinymce.com'), '<p><a href="ftp://www.tinymce.com">ftp://www.tinymce.com</a></p>');
		equal(typeUrl('www.tinymce.com'), '<p><a href="http://www.tinymce.com">www.tinymce.com</a></p>');
		equal(typeUrl('www.tinymce.com.'), '<p><a href="http://www.tinymce.com">www.tinymce.com</a>.</p>');
		equal(typeUrl('user@domain.com'), '<p><a href="mailto:user@domain.com">user@domain.com</a></p>');
		equal(typeUrl('mailto:user@domain.com'), '<p><a href="mailto:user@domain.com">mailto:user@domain.com</a></p>');
		equal(typeUrl('first-last@domain.com'), '<p><a href="mailto:first-last@domain.com">first-last@domain.com</a></p>');
	});

	test("Urls ended with )", function() {
		equal(typeAnEclipsedURL('http://www.tinymce.com'), '<p>(<a href="http://www.tinymce.com">http://www.tinymce.com</a>)</p>');
		equal(typeAnEclipsedURL('https://www.tinymce.com'), '<p>(<a href="https://www.tinymce.com">https://www.tinymce.com</a>)</p>');
		equal(typeAnEclipsedURL('ssh://www.tinymce.com'), '<p>(<a href="ssh://www.tinymce.com">ssh://www.tinymce.com</a>)</p>');
		equal(typeAnEclipsedURL('ftp://www.tinymce.com'), '<p>(<a href="ftp://www.tinymce.com">ftp://www.tinymce.com</a>)</p>');
		equal(typeAnEclipsedURL('www.tinymce.com'), '<p>(<a href="http://www.tinymce.com">www.tinymce.com</a>)</p>');
		equal(typeAnEclipsedURL('www.tinymce.com.'), '<p>(<a href="http://www.tinymce.com">www.tinymce.com</a>.)</p>');
	});

	test("Urls ended with new line", function() {
		equal(typeNewlineURL('http://www.tinymce.com'), '<p><a href="http://www.tinymce.com">http://www.tinymce.com</a></p><p>&nbsp;</p>');
		equal(typeNewlineURL('https://www.tinymce.com'), '<p><a href="https://www.tinymce.com">https://www.tinymce.com</a></p><p>&nbsp;</p>');
		equal(typeNewlineURL('ssh://www.tinymce.com'), '<p><a href="ssh://www.tinymce.com">ssh://www.tinymce.com</a></p><p>&nbsp;</p>');
		equal(typeNewlineURL('ftp://www.tinymce.com'), '<p><a href="ftp://www.tinymce.com">ftp://www.tinymce.com</a></p><p>&nbsp;</p>');
		equal(typeNewlineURL('www.tinymce.com'), '<p><a href="http://www.tinymce.com">www.tinymce.com</a></p><p>&nbsp;</p>');
		equal(typeNewlineURL('www.tinymce.com.'), '<p><a href="http://www.tinymce.com">www.tinymce.com</a>.</p><p>&nbsp;</p>');
	});
})();
