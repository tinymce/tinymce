asynctest('browser/core/MeasureTest', [
	'ephox.mcagar.api.TinyLoader',
  'tinymce/inlight/core/Measure',
	'ephox.agar.api.Pipeline'
], function (TinyLoader, Measure, Pipeline) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		Pipeline.async({}, [

		], onSuccess, onFailure);
	}, {
	}, success, failure);
});
