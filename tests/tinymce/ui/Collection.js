(function() {
	var panel;

	module("tinymce.ui.Collection", {
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
				],
				target: null
			}).renderTo(document.getElementById('view'));
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
		}
	});

	test("Constructor", function() {
		equal(new tinymce.ui.Collection().length, 0);
		equal(new tinymce.ui.Collection(panel.find('button').toArray()).length, 12);
		equal(new tinymce.ui.Collection(panel.find('button')).length, 12);
		equal(new tinymce.ui.Collection(panel.find('button:first')[0]).length, 1);
		equal(new tinymce.ui.Collection(panel.find('button:first')[0])[0].type, 'button');
	});

	test("add", function() {
		var collection = new tinymce.ui.Collection([panel, panel]);

		equal(collection.add(panel).length, 3);
		equal(collection.add([panel, panel]).length, 5);
	});

	test("set", function() {
		var collection = new tinymce.ui.Collection([panel, panel]);

		equal(collection.set(panel).length, 1);
		equal(collection.set([panel, panel]).length, 2);
	});

	test("filter", function() {
		equal(panel.find('button').filter('*:first').length, 4);
		equal(panel.find('button').filter('buttongroup button').length, 9);
		equal(panel.find('button').filter('*').length, 12);
		equal(panel.find('button').filter('nomatch').length, 0);
		equal(panel.find('button').filter(function(ctrl) {return ctrl.settings.name == "button7";}).length, 1);
	});

	test("slice", function() {
		equal(panel.find('button').slice(1).length, 11);
		equal(panel.find('button').slice(1)[0].name(), 'button2');

		equal(panel.find('button').slice(0, 1).length, 1);
		equal(panel.find('button').slice(0, 1)[0].name(), 'button1');

		equal(panel.find('button').slice(-1).length, 1);
		equal(panel.find('button').slice(-1)[0].name(), 'button12');

		equal(panel.find('button').slice(-2).length, 2);
		equal(panel.find('button').slice(-2)[0].name(), 'button11');

		equal(panel.find('button').slice(-2, -1).length, 1);
		equal(panel.find('button').slice(-2, -1)[0].name(), 'button11');

		equal(panel.find('button').slice(1000).length, 0);
		equal(panel.find('button').slice(-1000).length, 12);
	});

	test("eq", function() {
		equal(panel.find('button').eq(1).length, 1);
		equal(panel.find('button').eq(1)[0].name(), 'button2');

		equal(panel.find('button').eq(-2).length, 1);
		equal(panel.find('button').eq(-2)[0].name(), 'button11');

		equal(panel.find('button').eq(1000).length, 0);
	});

	test("each", function() {
		var count;

		count = 0;
		panel.find('button').each(function() {
			count++;
		});

		equal(count, 12);

		count = 0;
		panel.find('nomatch').each(function() {
			count++;
		});

		equal(count, 0);

		count = 0;
		panel.find('button').each(function(item, index) {
			count += index;
		});

		equal(count, 66);

		count = 0;
		panel.find('button').each(function(item) {
			if (item.type == 'button') {
				count++;
			}
		});

		equal(count, 12);

		count = 0;
		panel.find('button').each(function(item, index) {
			count++;

			if (index == 3) {
				return false;
			}
		});

		equal(count, 4);
	});

	test("toArray", function() {
		equal(panel.find('button').toArray().length, 12);
		equal(panel.find('button').toArray().concat, Array.prototype.concat);
	});

	test("fire/on/off", function() {
		var value;

		value = 0;
		panel.find('button').off();
		panel.find('button#button1,button#button2').on('test', function(args) {
			value += args.value;
		});
		panel.find('button#button1').fire('test', {value: 42});
		equal(value, 42);

		value = 0;
		panel.find('button').off();
		panel.find('button#button1,button#button2').on('test', function(args) {
			value += args.value;
		});
		panel.find('button').fire('test', {value: 42});
		equal(value, 84);

		value = 0;
		panel.find('button').off();
		panel.find('button#button1,button#button2').on('test', function(args) {
			value += args.value;
		});
		panel.find('button#button1').off('test');
		panel.find('button').fire('test', {value: 42});
		equal(value, 42);

		panel.find('button').off();

		value = 0;
		panel.find('button').fire('test', {value: 42});
		equal(value, 0);
	});

	test("show/hide", function() {
		panel.find('button#button1,button#button2').hide();
		equal(panel.find('button:not(:visible)').length, 2);

		panel.find('button#button1').show();
		equal(panel.find('button:not(:visible)').length, 1);

		panel.find('button#button2').show();
	});

	test("text", function() {
		equal(panel.find('button#button1,button#button2').text(), 'button1');
		equal(panel.find('button#button2').text('button2').text(), 'button2');

		equal(panel.find('button#button2,button#button3').text('test').text(), 'test');
		equal(panel.find('button#button3').text(), 'test');
	});

	test("disabled", function() {
		ok(panel.find('button#button1').disabled());
		ok(!panel.find('button#button2').disabled());
		ok(panel.find('button#button2').disabled(true).disabled());

		panel.find('button#button2').disabled(false);
	});

	test("visible", function() {
		ok(panel.find('button#button2').visible());
		ok(!panel.find('button#button2').visible(false).visible());

		panel.find('button#button2').visible(true);
	});

	test("active", function() {
		ok(!panel.find('button#button2').active());
		ok(panel.find('button#button2').active(true).active());

		panel.find('button#button2').active(false);
	});

	test("name", function() {
		equal(panel.find('button#button1').name(), 'button1');
		equal(panel.find('button#button2').name('buttonX').name(), 'buttonX');

		panel.find('button#buttonX').name('button2');
	});

	test("addClass/removeClass/hasClass", function() {
		panel.find('button#button1').addClass('test');
		ok(panel.find('button#button1').hasClass('test'));
		ok(!panel.find('button#button1').hasClass('nomatch'));
		panel.find('button#button1').removeClass('test');
		ok(!panel.find('button#button1').hasClass('test'));
	});

	test("prop", function() {
		ok(panel.find('button#button1').prop('disabled'));
		equal(panel.find('button#button1').prop('name'), 'button1');
		equal(panel.find('button#button1').prop('name', 'buttonX').prop('name'), 'buttonX');
		panel.find('button#buttonX').prop('name', 'button1');
		equal(panel.find('button#button1').prop('missingProperty'), undefined);
	});

	test("exec", function() {
		ok(!panel.find('button#button1').exec('disabled', false).disabled());
		panel.find('button#button1').disabled(true);
	});
})();
