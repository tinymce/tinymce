ModuleLoader.require(["tinymce/util/Promise"], function(Promise) {
	module("tinymce.util.Promise");

	asyncTest('Promise resolve', function() {
		new Promise(function(resolve) {
			resolve("123");
		}).then(function(result) {
			equal("123", result);
			QUnit.start();
		});
	});

	asyncTest('Promise reject', function() {
		new Promise(function(resolve, reject) {
			reject("123");
		}).then(function() {
		}, function(result) {
			equal("123", result);
			QUnit.start();
		});
	});

	asyncTest('Promise reject', function() {
		var promises = [
			new Promise(function(resolve) {
				resolve("123");
			}),

			new Promise(function(resolve) {
				resolve("456");
			})
		];

		Promise.all(promises).then(function(results) {
			equal("123", results[0]);
			equal("456", results[1]);
			QUnit.start();
		});
	});
});
