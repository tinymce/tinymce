(function() {
	var menuCtrl;

	module("tinymce.plugins.ImportCSS", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				skin: false,
				plugins: 'importcss',
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		},

		teardown: function() {
			if (menuCtrl) {
				menuCtrl.remove();
				menuCtrl = null;
			}

			editor.contentCSS = [];
			delete editor.settings.importcss_file_filter;
			delete editor.settings.importcss_merge_classes;
			delete editor.settings.importcss_append;
			delete editor.settings.importcss_selector_filter;
			delete editor.settings.importcss_groups;
			delete editor.settings.importcss_exclusive;
			delete editor.settings.importcss_selector_converter;
		}
	});

	function fireFormatsMenuEvent(styleSheets, items) {
		menuCtrl = tinymce.ui.Factory.create('menu', {
			items: items
		}).renderTo(document.getElementById('view'));

		return editor.fire('renderFormatsMenu', {
			control: menuCtrl,
			doc: {
				styleSheets: styleSheets
			}
		});
	}

	function getMenuItemFormat(item) {
		return editor.formatter.get(item.settings.format)[0];
	}

	test("Import content_css files", function() {
		editor.contentCSS.push("test1.css");
		editor.contentCSS.push("test2.css");

		var evt = fireFormatsMenuEvent([
			{
				href: 'test1.css',
				cssRules: [
					{selectorText: '.a'},
					{selectorText: 'p.b'},
					{selectorText: 'img.c'}
				]
			},

			{href: 'test2.css', cssRules: [{selectorText: '.d'}]},
			{href: 'test3.css',	cssRules: [{selectorText: '.e'}]}
		]);

		equal(evt.control.items().length, 4);

		equal(evt.control.items()[0].text(), 'a');
		equal(getMenuItemFormat(evt.control.items()[0]).classes, 'a');

		equal(evt.control.items()[1].text(), 'p.b');
		equal(getMenuItemFormat(evt.control.items()[1]).block, 'p');
		equal(getMenuItemFormat(evt.control.items()[1]).classes, 'b');

		equal(evt.control.items()[2].text(), 'img.c');
		equal(getMenuItemFormat(evt.control.items()[2]).selector, 'img');
		equal(getMenuItemFormat(evt.control.items()[2]).classes, 'c');

		equal(evt.control.items()[3].text(), 'd');
	});

	test("Import custom importcss_merge_classes: false", function() {
		editor.contentCSS.push("test.css");
		editor.settings.importcss_merge_classes = false;

		var evt = fireFormatsMenuEvent([
			{href: 'test.css', cssRules: [{selectorText: '.a'}]}
		]);

		equal(evt.control.items().length, 1);
		deepEqual(getMenuItemFormat(evt.control.items()[0]).attributes, {"class": "a"});
	});

	test("Import custom importcss_append: true", function() {
		editor.contentCSS.push("test.css");
		editor.settings.importcss_append = true;

		var evt = fireFormatsMenuEvent([
			{href: 'test.css', cssRules: [{selectorText: '.b'}]}
		], {text: 'a'});

		equal(evt.control.items().length, 2);
		equal(evt.control.items()[0].text(), 'a');
		equal(evt.control.items()[1].text(), 'b');
	});

	test("Import custom importcss_selector_filter (string)", function() {
		editor.contentCSS.push("test1.css");
		editor.settings.importcss_selector_filter = ".a";

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [
				{selectorText: '.a'},
				{selectorText: '.b'}
			]}
		]);

		equal(evt.control.items().length, 1);
		equal(evt.control.items()[0].text(), 'a');
	});

	test("Import custom importcss_selector_filter (function)", function() {
		editor.contentCSS.push("test1.css");
		editor.settings.importcss_selector_filter = function(selector) {
			return selector === ".a";
		};

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [
				{selectorText: '.a'},
				{selectorText: '.b'}
			]}
		]);

		equal(evt.control.items().length, 1);
		equal(evt.control.items()[0].text(), 'a');
	});

	test("Import custom importcss_selector_filter (regexp)", function() {
		editor.contentCSS.push("test1.css");
		editor.settings.importcss_selector_filter = /a/;

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [
				{selectorText: '.a'},
				{selectorText: '.b'}
			]}
		]);

		equal(evt.control.items().length, 1);
		equal(evt.control.items()[0].text(), 'a');
	});

	test("Import custom importcss_groups", function() {
		editor.contentCSS.push("test1.css");
		editor.settings.importcss_groups = [
			{title: 'g1', filter: /a/},
			{title: 'g2', filter: /b/},
			{title: 'g3'}
		];

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [
				{selectorText: '.a'},
				{selectorText: '.b'},
				{selectorText: '.c'}
			]}
		]);

		equal(evt.control.items().length, 3);
		equal(evt.control.items()[0].text(), 'g1');
		equal(evt.control.items()[0].settings.menu[0].text, 'a');
		equal(evt.control.items()[1].text(), 'g2');
		equal(evt.control.items()[1].settings.menu[0].text, 'b');
		equal(evt.control.items()[2].text(), 'g3');
		equal(evt.control.items()[2].settings.menu[0].text, 'c');
	});

	test("Import custom importcss_file_filter (string)", function() {
		editor.contentCSS.push("test1.css");
		editor.settings.importcss_file_filter = "test2.css";

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [{selectorText: '.a'}]},
			{href: 'test2.css', cssRules: [{selectorText: '.b'}]}
		]);

		equal(evt.control.items().length, 1);
		equal(evt.control.items()[0].text(), 'b');
	});

	test("Import custom importcss_file_filter (function)", function() {
		editor.contentCSS.push("test1.css");
		editor.settings.importcss_file_filter = function(href) {
			return href === "test2.css";
		};

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [{selectorText: '.a'}]},
			{href: 'test2.css', cssRules: [{selectorText: '.b'}]}
		]);

		equal(evt.control.items().length, 1);
		equal(evt.control.items()[0].text(), 'b');
	});

	test("Import custom importcss_file_filter (regexp)", function() {
		editor.contentCSS.push("test1.css");
		editor.settings.importcss_file_filter = /test2\.css/;

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [{selectorText: '.a'}]},
			{href: 'test2.css', cssRules: [{selectorText: '.b'}]}
		]);

		equal(evt.control.items().length, 1);
		equal(evt.control.items()[0].text(), 'b');
	});

	test("Import custom importcss_selector_converter", function() {
		editor.settings.importcss_groups = [
			{title: 'g1', filter: /\.a/, custom: 'A'},
			{title: 'g2', filter: /\.b/, custom: 'B'},
			{title: 'g3', custom: 'C'}
		];

		editor.contentCSS.push("test1.css");
		editor.settings.importcss_selector_converter = function (selector, group) {
			return {
				title: selector + group.custom,
				inline: 'span'
			};
		};

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [
				{selectorText: '.a'},
				{selectorText: '.b'},
				{selectorText: '.c'}
			]}
		]);

		var items = evt.control.items();
		equal(items.length, 3);
		equal(items[0].text(), 'g1');
		equal(items[0].settings.menu[0].text, '.aA');
		equal(items[1].text(), 'g2');
		equal(items[1].settings.menu[0].text, '.bB');
		equal(items[2].text(), 'g3');
		equal(items[2].settings.menu[0].text, '.cC');
	});

	test("Import custom group selector_converter", function() {
		var constant = function (format) {
			return function () {
				return format;
			};
		};

		var formatA = {
			title: 'my format a',
			selector: 'p'
		};

		var formatB = {
			title: 'my format b',
			selector: 'h1'
		};

		editor.settings.importcss_groups = [
			{title: 'g1', filter: /\.a/, selector_converter: constant(formatA)},
			{title: 'g2', filter: /\.b/, selector_converter: constant(formatB)},
			{title: 'g3', custom: 'C'}
		];

		editor.contentCSS.push("test1.css");

		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [
				{selectorText: '.a'},
				{selectorText: '.b'},
				{selectorText: '.c'}
			]}
		]);

		var items = evt.control.items();
		equal(items.length, 3);
		equal(items[0].text(), 'g1');
		equal(items[0].settings.menu[0].text, 'my format a');
		equal(items[1].text(), 'g2');
		equal(items[1].settings.menu[0].text, 'my format b');
		equal(items[2].text(), 'g3');
		equal(items[2].settings.menu[0].text, 'c');
	});

	test("Import custom importcss_exclusive: true", function() {
		editor.settings.importcss_exclusive = true;
		editor.settings.importcss_groups = [
			{title: 'g1'},
			{title: 'g2'}
		];

		editor.contentCSS.push("test1.css");
		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [
				{selectorText: '.a'},
				{selectorText: '.b'},
				{selectorText: '.c'}
			]}
		]);

		var items = evt.control.items();
		equal(items.length, 1);
		equal(items[0].text(), 'g1');
		equal(items[0].settings.menu[0].text, 'a');
		equal(items[0].settings.menu[1].text, 'b');
	});

	test("Import custom importcss_exclusive: false", function() {
		editor.settings.importcss_exclusive = false;
		editor.settings.importcss_groups = [
			{title: 'g1'},
			{title: 'g2'}
		];

		editor.contentCSS.push("test1.css");
		var evt = fireFormatsMenuEvent([
			{href: 'test1.css', cssRules: [
				{selectorText: '.a'},
				{selectorText: '.b'},
				{selectorText: '.c'}
			]}
		]);

		var items = evt.control.items();
		equal(items.length, 2);
		equal(items[0].text(), 'g1');
		equal(items[0].settings.menu[0].text, 'a');
		equal(items[0].settings.menu[1].text, 'b');
		equal(items[1].text(), 'g2');
		equal(items[1].settings.menu[0].text, 'a');
		equal(items[1].settings.menu[1].text, 'b');
	});
})();
