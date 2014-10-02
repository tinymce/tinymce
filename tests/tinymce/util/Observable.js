module("tinymce.util.Observable");

test("Event bubbling/removed state", function() {
	var lastName, lastState, data = '';

	function Class(parentObj) {
		this.toggleNativeEvent = function(name, state) {
			lastName = name;
			lastState = state;
		};

		this.parent = function() {
			return parentObj;
		};
	}

	tinymce.util.Tools.extend(Class.prototype, tinymce.util.Observable);

	var inst1 = new Class();

	inst1.on('click', function() { data += 'a'; });
	strictEqual(lastName, 'click');
	strictEqual(lastState, true);

	lastName = lastState = null;
	inst1.on('click', function() { data += 'b'; });
	strictEqual(lastName, null);
	strictEqual(lastState, null);

	var inst2 = new Class(inst1);
	inst2.on('click', function() { data += 'c'; });

	inst2.fire('click');
	strictEqual(data, 'cab');

	inst2.on('click', function(e) { e.stopPropagation(); });

	inst2.fire('click');
	strictEqual(data, 'cabc');

	inst1.on('remove', function() { data += 'r'; });
	inst1.removed = true;
	inst1.fire('click');
	inst1.fire('remove');
	strictEqual(data, 'cabcr');
});
