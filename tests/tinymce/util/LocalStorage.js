(function() {
	var LocalStorage = tinymce.util.LocalStorage;

	module("tinymce.util.LocalStorage", {
		setup: function() {
			LocalStorage.clear();
		},

		teardown: function() {
			LocalStorage.clear();
		}
	});

	QUnit.config.reorder = false;

	test('setItem', function() {
		LocalStorage.setItem("a", "1");
		equal(LocalStorage.getItem("a"), "1");
		LocalStorage.setItem("a", "2");
		equal(LocalStorage.getItem("a"), "2");
		LocalStorage.setItem("a", 3);
		equal(LocalStorage.getItem("a"), "3");
		LocalStorage.setItem("a", null);
		equal(LocalStorage.getItem("a"), "null");
		LocalStorage.setItem("a", undefined);
		equal(LocalStorage.getItem("a"), "undefined");
		LocalStorage.setItem("a", new Date(0));
		equal(LocalStorage.getItem("a"), new Date(0).toString());
	});

	test('getItem', function() {
		LocalStorage.setItem("a", "1");
		equal(LocalStorage.getItem("a"), "1");
		LocalStorage.setItem("a", "0");
		equal(LocalStorage.getItem("a"), "0");
		equal(LocalStorage.getItem("b"), null);
	});

	test('removeItem', function() {
		LocalStorage.setItem("a", "1");
		equal(LocalStorage.getItem("a"), "1");
		LocalStorage.removeItem("a");
		equal(LocalStorage.getItem("a"), null);
	});

	test('key', function() {
		LocalStorage.setItem("a", "1");
		equal(LocalStorage.key(0), "a");
		equal(LocalStorage.length, 1);
	});

	test('length', function() {
		equal(LocalStorage.length, 0);
		LocalStorage.setItem("a", "1");
		equal(LocalStorage.length, 1);
	});

	test('clear', function() {
		equal(LocalStorage.length, 0);
		LocalStorage.setItem("a", "1");
		equal(LocalStorage.length, 1);
	});

	test('setItem key and value with commas', function() {
		LocalStorage.setItem("a,1", "1,2");
		LocalStorage.setItem("b,2", "2,3");
		equal(LocalStorage.getItem("a,1"), "1,2");
		equal(LocalStorage.getItem("b,2"), "2,3");
	});

	test('setItem with two large values', function() {
		var data = "";

		for (var i = 0; i < 1024; i++) {
			data += 'x';
		}

		LocalStorage.clear();
		LocalStorage.setItem("a", data + "1");
		LocalStorage.setItem("b", data);
		equal(LocalStorage.getItem("a").length, 1024 + 1);
		equal(LocalStorage.getItem("b").length, 1024);
	});

	test('setItem with two large keys', function() {
		var key = "";

		for (var i = 0; i < 1024; i++) {
			key += 'x';
		}

		LocalStorage.clear();
		LocalStorage.setItem(key + "1", "a");
		LocalStorage.setItem(key + "2", "b");
		equal(LocalStorage.key(0), key + "1");
		equal(LocalStorage.key(1), key + "2");
	});
})();

