(function() {
	var panel;

	module("tinymce.ui.Selector", {
		setupModule: function() {
			panel = tinymce.ui.Factory.create({
				type: 'panel',
				items: [
					{type: 'button', name: 'button1', text: 'button1', classes: 'class1', disabled: true},
					{type: 'button', name: 'button2', classes: 'class1 class2'},
					{type: 'button', name: 'button3', classes: 'class2 class1 class3'},

					{type: 'buttongroup', name: 'buttongroup1', items: [
						{type: 'button', name: 'button4'},
						{type: 'button', name: 'button5'},
						{type: 'button', name: 'button6'}
					]},

					{type: 'buttongroup', name: 'buttongroup2', items: [
						{type: 'button', name: 'button7'},
						{type: 'button', name: 'button8'},
						{type: 'button', name: 'button9'}
					]},

					{type: 'toolbar', name: 'toolbar1', items: [
						{type: 'buttongroup', name: 'buttongroup3', items: [
							{type: 'button', name: 'button10', disabled: true},
							{type: 'button', name: 'button11'},
							{type: 'button', name: 'button12', classes: 'class4'}
						]}
					]}
				]
			}).renderTo(document.getElementById('view'));
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
		}
	});

	test("Basic", function() {
		var matches;

		matches = panel.find('button');
		equal(matches.length, 12);
		equal(matches[0].type, 'button');

		equal(panel.find('Button').length, 12);
		equal(panel.find('buttongroup').length, 3);
		equal(panel.find('buttongroup button').length, 9);
		equal(panel.find('toolbar buttongroup button').length, 3);
		equal(panel.find('button#button1').length, 1);
		equal(panel.find('buttongroup#buttongroup1 button#button4').length, 1);
		equal(panel.find('button,button,buttongroup button').length, 12, 'Check unique');
	});

	test("Classes", function() {
		equal(panel.find('button.class1').length, 3);
		equal(panel.find('button.class1.class2').length, 2);
		equal(panel.find('button.class2.class1').length, 2);
		equal(panel.find('button.classX').length, 0);
		equal(panel.find('button.class1, button.class2').length, 3);
	});

	test("Psuedo:not", function() {
		equal(panel.find('button:not(.class1)').length, 9);
		equal(panel.find('button:not(buttongroup button)').length, 3);
		equal(panel.find('button:not(toolbar button)').length, 9);
		equal(panel.find('button:not(toolbar buttongroup button)').length, 9);
		equal(panel.find('button:not(panel button)').length, 0);
		equal(panel.find('button:not(.class1)').length, 9);
		equal(panel.find('button:not(.class3, .class4)').length, 10);
	});

	test("Psuedo:odd/even/first/last", function() {
		var matches;

		matches = panel.find('button:first');

		equal(matches.length, 4);
		ok(matches[0].name() == 'button1');
		ok(matches[3].name() == 'button10');

		matches = panel.find('button:last');

		equal(matches.length, 3);
		ok(matches[0].name() == 'button6');
		ok(matches[1].name() == 'button9');

		matches = panel.find('button:odd');

		equal(matches.length, 4);
		ok(matches[0].name() == 'button2');
		ok(matches[1].name() == 'button5');

		matches = panel.find('button:even');

		equal(matches.length, 8);
		ok(matches[0].name() == 'button1');
		ok(matches[1].name() == 'button3');
	});

	test("Psuedo:disabled", function() {
		equal(panel.find('button:disabled').length, 2);
	});

	test("Attribute value", function() {
		equal(panel.find('button[name]').length, 12);
		equal(panel.find('button[name=button1]').length, 1);
		equal(panel.find('button[name^=button1]').length, 4);
		equal(panel.find('button[name$=1]').length, 2);
		equal(panel.find('button[name*=utt]').length, 12);
		equal(panel.find('button[name!=button1]').length, 11);
	});

	test("Direct descendant", function() {
		equal(panel.find('> button').length, 3);
		equal(panel.find('toolbar > buttongroup').length, 1);
		equal(panel.find('toolbar > button').length, 0);
	});

	test("Parents", function() {
		equal(panel.find("#button10")[0].parents("toolbar,buttongroup").length, 2);
		equal(panel.find("#button10")[0].parents("panel").length, 1);
	});
})();

