(function() {
	module("tinymce.ui.Control");

	test("Initial states", function() {
		var ctrl;

		ctrl = new tinymce.ui.Control({});

		// Check initial states
		equal(ctrl.disabled(), false);
		equal(ctrl.active(), false);
		equal(ctrl.visible(), true);
		equal(ctrl.text(), undefined);
		equal(ctrl.name(), undefined);
		equal(ctrl.title(), undefined);
		equal(ctrl.parent(), undefined);
		deepEqual(ctrl.settings, {});
	});

	test("Settings", function() {
		var ctrl = new tinymce.ui.Control({
			disabled: true,
			active: true,
			visible: true,
			text: 'Text',
			title: 'Title',
			name: 'Name'
		});

		// Check settings states
		equal(ctrl.disabled(), true);
		equal(ctrl.active(), true);
		equal(ctrl.visible(), true);
		equal(ctrl.text(), "Text");
		equal(ctrl.name(), "Name");
		equal(ctrl.title(), "Title");
		equal(ctrl.parent(), undefined);
		deepEqual(ctrl.settings, {
			disabled: true,
			active: true,
			visible: true,
			text: 'Text',
			title: 'Title',
			name: 'Name'
		});
	});

	test("Properties", function() {
		var ctrl, cont;

		cont = new tinymce.ui.Container({
			target: null
		});
		ctrl = new tinymce.ui.Control({});

		// Set all states
		ctrl = ctrl.
			disabled(true).
			active(true).
			visible(true).
			text("Text").
			title("Title").
			name("Name").parent(cont);

		// Check states
		equal(ctrl.disabled(), true);
		equal(ctrl.active(), true);
		equal(ctrl.visible(), true);
		equal(ctrl.text(), "Text");
		equal(ctrl.name(), "Name");
		equal(ctrl.title(), "Title");
		equal(ctrl.parent(), cont);
		deepEqual(ctrl.settings, {});
	});

	test("Chained methods", function() {
		var ctrl = new tinymce.ui.Control({
			target: null
		});

		// Set all states
		ctrl = ctrl.
			on('click', function() {}).
			off().
			renderTo(document.getElementById('view')).
			remove();

		// Check so that the chain worked
		ok(ctrl instanceof tinymce.ui.Control);
	});

	test("Events", function() {
		var ctrl = new tinymce.ui.Control({
			onMyEvent: function() {
				count++;
			},
			callbacks: {
				handler1: function() {
					count++;
				}
			}
		}), count;

		ctrl.on('MyEvent', function(args) {
			equal(ctrl, args.control);
			equal(ctrl, this);
			equal(args.myKey, 'myVal');
		});

		ctrl.fire('MyEvent', {myKey: 'myVal'});

		function countAndBreak() {
			count++;
			return false;
		}

		// Bind two events
		ctrl.on('MyEvent2', countAndBreak);
		ctrl.on('MyEvent2', countAndBreak);

		// Check if only one of them was called
		count = 0;
		ctrl.fire('MyEvent2', {myKey: 'myVal'});
		equal(count, 1);

		// Fire unbound event
		ctrl.fire('MyEvent3', {myKey: 'myVal'});

		// Unbind all
		ctrl.off();
		count = 0;
		ctrl.fire('MyEvent2', {myKey: 'myVal'});
		equal(count, 0, 'Unbind all');

		// Unbind by name
		ctrl.on('MyEvent1', countAndBreak);
		ctrl.on('MyEvent2', countAndBreak);
		ctrl.off('MyEvent2');
		count = 0;
		ctrl.fire('MyEvent1', {myKey: 'myVal'});
		ctrl.fire('MyEvent2', {myKey: 'myVal'});
		equal(count, 1);

		// Unbind by name callback
		ctrl.on('MyEvent1', countAndBreak);
		ctrl.on('MyEvent1', function() {count++;});
		ctrl.off('MyEvent1', countAndBreak);
		count = 0;
		ctrl.fire('MyEvent1', {myKey: 'myVal'});
		equal(count, 1);

		// Bind by named handler
		ctrl.off();
		ctrl.on('MyEvent', 'handler1');
		count = 0;
		ctrl.fire('MyEvent', {myKey: 'myVal'});
		equal(count, 1);
	});

	test("hasClass,addClass,removeClass", function() {
		var ctrl = new tinymce.ui.Control({classes: 'class1 class2 class3'});

		equal(ctrl.classes, 'mce-class1 mce-class2 mce-class3');
		ok(ctrl.classes.contains('class1'));
		ok(ctrl.classes.contains('class2'));
		ok(ctrl.classes.contains('class3'));
		ok(!ctrl.classes.contains('class4'));

		ctrl.classes.add('class4');
		equal(ctrl.classes, 'mce-class1 mce-class2 mce-class3 mce-class4');
		ok(ctrl.classes.contains('class1'));
		ok(ctrl.classes.contains('class2'));
		ok(ctrl.classes.contains('class3'));
		ok(ctrl.classes.contains('class4'));

		ctrl.classes.remove('class4');
		equal(ctrl.classes, 'mce-class1 mce-class2 mce-class3');
		ok(ctrl.classes.contains('class1'));
		ok(ctrl.classes.contains('class2'));
		ok(ctrl.classes.contains('class3'));
		ok(!ctrl.classes.contains('class4'));

		ctrl.classes.remove('class3').remove('class2');
		equal(ctrl.classes, 'mce-class1');
		ok(ctrl.classes.contains('class1'));
		ok(!ctrl.classes.contains('class2'));
		ok(!ctrl.classes.contains('class3'));

		ctrl.classes.remove('class3').remove('class1');
		equal(ctrl.classes, '');
		ok(!ctrl.classes.contains('class1'));
		ok(!ctrl.classes.contains('class2'));
		ok(!ctrl.classes.contains('class3'));
	});

	test("encode", function() {
		tinymce.i18n.add('en', {'old': '"new"'});
		equal(new tinymce.ui.Control({}).encode('<>"&'), '&#60;&#62;&#34;&#38;');
		equal(new tinymce.ui.Control({}).encode('old'), '&#34;new&#34;');
		equal(new tinymce.ui.Control({}).encode('old', false), 'old');
	});

	test("translate", function() {
		tinymce.i18n.add('en', {'old': 'new'});
		equal(new tinymce.ui.Control({}).translate('old'), 'new');
		equal(new tinymce.ui.Control({}).translate('old2'), 'old2');
	});
})();
