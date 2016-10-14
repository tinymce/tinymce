module("tinymce.plugins.Wordcount", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			skin: false,
			wordcount_target_id: 'current-count',
			plugins: 'wordcount',
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

test("Blank document has 0 words", function() {
	expect(1);

	editor.setContent('');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 0);
});

test("Simple word count", function() {
	expect(1);

	editor.setContent('<p>My sentence is this.</p>');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 4);
});

test("Does not count dashes", function() {
	expect(1);

	editor.setContent('<p>Something -- ok</p>');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 2);
});

test("Does not count asterisks, non-word characters", function() {
	expect(1);

	editor.setContent('<p>* something\n\u00b7 something else</p>');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 3);
});

test("Does count numbers", function() {
	expect(1);

	editor.setContent('<p>Something 123 ok</p>');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 3);
});

test("Does not count htmlentities", function() {
	expect(1);

	editor.setContent('<p>It&rsquo;s my life &ndash; &#8211; &#x2013; don\'t you forget.</p>');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 6);
});

test("Counts hyphenated words as two words", function() {
	expect(1);

	editor.setContent('<p>Hello some-word here.</p>');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 4);
});

test("Counts words between blocks as two words", function() {
	expect(1);

	editor.setContent('<p>Hello</p><p>world</p>');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 2);
});
