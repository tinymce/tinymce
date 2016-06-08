asynctest('browser/core/ActionsTest', [
	'ephox.mcagar.api.TinyLoader',
	'tinymce/inlight/core/Actions',
	'ephox.agar.api.Pipeline'
], function (TinyLoader, Actions, Pipeline) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		Pipeline.async({}, [

		], onSuccess, onFailure);
	}, {
		inline: true
	}, success, failure);
});
