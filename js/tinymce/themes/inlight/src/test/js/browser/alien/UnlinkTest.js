asynctest('browser/alien/UnlinkTest', [
	'ephox.mcagar.api.TinyLoader',
	'tinymce/inlight/alien/Unlink',
	'ephox.agar.api.Pipeline'
], function (TinyLoader, Unlink, Pipeline) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		Pipeline.async({}, [

		], onSuccess, onFailure);
	}, {
		inline: true
	}, success, failure);
});
