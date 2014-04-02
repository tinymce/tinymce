if (location.protocol != "file:") {
	module("tinymce.util.JSONRequest");

	asyncTest("Successful request - send method", function() {
		expect(1);

		new tinymce.util.JSONRequest({}).send({
			type : 'GET',
			url : 'tinymce/util/json_rpc_ok.js',
			success: function(data) {
				equal(data, 'Hello JSON-RPC');
				start();
			}
		});
	});

	asyncTest("Successful request - sendRPC static method", function() {
		expect(1);

		tinymce.util.JSONRequest.sendRPC({
			type : 'GET',
			url : 'tinymce/util/json_rpc_ok.js',
			success: function(data) {
				equal(data, 'Hello JSON-RPC');
				start();
			}
		});
	});

	asyncTest("Error request - send method", function() {
		expect(1);

		new tinymce.util.JSONRequest({}).send({
			type : 'GET',
			url : 'tinymce/util/json_rpc_error.js',
			error: function(error) {
				equal(error.code, 42);
				start();
			}
		});
	});

	asyncTest("Error request - sendRPC static method", function() {
		expect(1);

		tinymce.util.JSONRequest.sendRPC({
			type : 'GET',
			url : 'tinymce/util/json_rpc_error.js',
			error: function(error) {
				equal(error.code, 42);
				start();
			}
		});
	});
}
