ModuleLoader.require([
	"tinymce/util/Delay"
], function(Delay) {
	module("tinymce.util.Delay");

	asyncTest('requestAnimationFrame', function() {
		Delay.requestAnimationFrame(function() {
			ok("requestAnimationFrame was executed.", true);
			QUnit.start();
		});
	});

	asyncTest('setTimeout', function() {
		Delay.setTimeout(function() {
			ok("setTimeout was executed.", true);
			QUnit.start();
		});
	});

	asyncTest('setInterval', function() {
		var count = 0, id;

		id = Delay.setInterval(function() {
			if (count++ == 3) {
				Delay.clearInterval(id);
				ok("setInterval was executed.", true);
				QUnit.start();
			} else if (count > 3) {
				throw new Error("Still executing setInterval.");
			}
		});
	});

	asyncTest('setEditorTimeout', function() {
		var fakeEditor = {};

		Delay.setEditorTimeout(fakeEditor, function() {
			ok("setEditorTimeout was executed.", true);
			QUnit.start();
		});
	});

	test('setEditorTimeout (removed)', function() {
		var fakeEditor = {removed: true};

		Delay.setEditorTimeout(fakeEditor, function() {
			throw new Error("Still executing setEditorTimeout.");
		});

		ok(true, "setEditorTimeout on removed instance.");
	});

	asyncTest('setEditorInterval', function() {
		var count = 0, id, fakeEditor = {};

		id = Delay.setEditorInterval(fakeEditor, function() {
			if (count++ == 3) {
				Delay.clearInterval(id);
				ok("setEditorInterval was executed.", true);
				QUnit.start();
			} else if (count > 3) {
				throw new Error("Still executing setEditorInterval.");
			}
		});
	});

	test('setEditorInterval (removed)', function() {
		var fakeEditor = {removed: true};

		Delay.setEditorInterval(fakeEditor, function() {
			throw new Error("Still executing setEditorInterval.");
		});

		ok(true, "setEditorTimeout on removed instance.");
	});
});
