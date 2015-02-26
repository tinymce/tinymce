(function() {
	var rangePoint;

	module("tinymce.dom.RangePoint", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				skin: false,
				forced_root_block: '',
				entities: 'raw',
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		}
	});

	test("next caret position in text node that exists", function(assert) {
		editor.getBody().innerHTML = '<p>a</p>';

		Utils.setSelection('p', 0);
		rangePoint = editor.selection.getStartRangePoint();
		assert.equal(rangePoint.next(), true);
		assert.equal(rangePoint.getContainer().nodeType, 3);
		assert.equal(rangePoint.getOffset(), 1);
	});

	test("next caret postion in text node that doesn't exist", function(assert) {
		editor.getBody().innerHTML = '<p>a</p>';

		rangePoint = editor.dom.createRangePoint(editor.$('p')[0].firstChild, 1);
		assert.equal(rangePoint.next(), false);
		assert.equal(rangePoint.getContainer().nodeType, 3);
		assert.equal(rangePoint.getOffset(), 1);
	});

	test("next caret position from one inline element to another", function(assert) {
		editor.getBody().innerHTML = '<p><i>a</i><b>b</b></p>';

		Utils.setSelection('i', 1);
		rangePoint = editor.selection.getStartRangePoint();
		assert.equal(rangePoint.next(), true);
		assert.equal(rangePoint.getContainer().nodeType, 3);
		assert.equal(rangePoint.getOffset(), 0);
	});

	test("next caret position from text to after inline block", function(assert) {
		editor.getBody().innerHTML = '<p>a<input></p>';

		Utils.setSelection('p', 1);
		rangePoint = editor.selection.getStartRangePoint();
		assert.equal(rangePoint.next(), true);
		assert.equal(rangePoint.getContainer().nodeName, 'P');
		assert.equal(rangePoint.getOffset(), 2);
	});

	test("next caret position from before inline block to after inline block", function(assert) {
		editor.getBody().innerHTML = '<p><input></p>';

		editor.selection.select(editor.$('input')[0]);
		editor.selection.collapse(true);
		rangePoint = editor.selection.getStartRangePoint();
		assert.equal(rangePoint.next(), true);
		assert.equal(rangePoint.getContainer().nodeName, 'P');
		assert.equal(rangePoint.getOffset(), 1);
	});

	test("next caret position from before inline block to before next inline block", function(assert) {
		editor.getBody().innerHTML = '<p><input><input></p>';

		editor.selection.select(editor.$('input')[0]);
		editor.selection.collapse(true);
		rangePoint = editor.selection.getStartRangePoint();
		assert.equal(rangePoint.next(), true);
		assert.equal(rangePoint.getContainer().nodeName, 'P');
		assert.equal(rangePoint.getOffset(), 1);
	});

	test("next caret position from one block to another", function(assert) {
		editor.getBody().innerHTML = '<p>a</p><p>b</p>';

		Utils.setSelection('p', 1);
		rangePoint = editor.selection.getStartRangePoint();
		assert.equal(rangePoint.next(), true);
		assert.equal(rangePoint.getContainer().data, 'b');
		assert.equal(rangePoint.getOffset(), 0);
	});

	test("next caret position from one block to empty block", function(assert) {
		editor.getBody().innerHTML = '<p>a</p><p><br></p>';

		Utils.setSelection('p', 1);
		rangePoint = editor.selection.getStartRangePoint();
		assert.equal(rangePoint.next(), true);
		assert.equal(rangePoint.getContainer().firstChild.nodeName, 'BR');
		assert.equal(rangePoint.getContainer().nodeName, 'P');
		assert.equal(rangePoint.getOffset(), 0);
	});
})();
