ModuleLoader.require(["tinymce/data/ObservableObject"], function(ObservableObject) {
	module("tinymce.data.ObservableObject");

	test("Constructor", function(assert) {
		var obj;

		obj = new ObservableObject();
		assert.ok(!obj.has('a'));

		obj = new ObservableObject({a: 1, b: 2});
		assert.strictEqual(obj.get('a'), 1);
		assert.strictEqual(obj.get('b'), 2);
	});

	test("set/get and observe all", function(assert) {
		var obj = new ObservableObject(), events = [];

		obj.on('change', function(e) {
			events.push(e);
		});

		obj.set('a', 'a');
		obj.set('a', 'a2');
		obj.set('a', 'a3');
		obj.set('b', 'b');
		assert.strictEqual(obj.get('a'), 'a3');

		equal(events[0].type, 'change');
		equal(events[0].value, 'a');
		equal(events[1].type, 'change');
		equal(events[1].value, 'a2');
		equal(events[2].type, 'change');
		equal(events[2].value, 'a3');
		equal(events[3].type, 'change');
		equal(events[3].value, 'b');
	});

	test("set/get and observe specific", function(assert) {
		var obj = new ObservableObject(), events = [];

		obj.on('change:a', function(e) {
			events.push(e);
		});

		obj.set('a', 'a');
		obj.set('b', 'b');
		equal(events[0].type, 'change');
		equal(events[0].value, 'a');
		equal(events.length, 1);
	});
});
