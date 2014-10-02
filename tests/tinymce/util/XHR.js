if (location.protocol != "file:") {
	module("tinymce.util.XHR");

	asyncTest("Successful request", function() {
		expect(5);

		tinymce.util.XHR.on('beforeSend', function(e) {
			e.xhr.test = 123;
			e.settings.test = 456;
		});

		tinymce.util.XHR.send({
			url: 'tinymce/util/json_rpc_ok.js',
			success: function(data, xhr, input) {
				equal(tinymce.trim(data), '{"result": "Hello JSON-RPC", "error": null, "id": 1}');
				ok(!!xhr.status);
				equal(input.url, 'tinymce/util/json_rpc_ok.js');
				equal(xhr.test, 123);
				equal(input.test, 456);
				start();
			}
		});
	});

	asyncTest("Unsuccessful request", function() {
		expect(3);

		tinymce.util.XHR.send({
			url: 'tinymce/util/404.js',
			error: function(type, xhr, input) {
				equal(type, 'GENERAL');
				ok(!!xhr.status);
				equal(input.url, 'tinymce/util/404.js');
				start();
			}
		});
	});
}
