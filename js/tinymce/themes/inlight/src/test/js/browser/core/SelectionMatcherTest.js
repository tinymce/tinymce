asynctest('browser/core/SelectionMatcherTest', [
	'ephox.mcagar.api.TinyLoader',
	'tinymce/inlight/core/SelectionMatcher',
	'ephox.agar.api.Pipeline'
], function (TinyLoader, SelectionMatcher, Pipeline) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		Pipeline.async({}, [

		], onSuccess, onFailure);
	}, {
		inline: true
	}, success, failure);
});
