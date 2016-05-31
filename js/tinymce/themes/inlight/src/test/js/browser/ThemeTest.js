asynctest('browser/core/ThemeTest', [
	'ephox.mcagar.api.TinyLoader',
  'tinymce/inlight/Theme',
	'ephox.agar.api.Pipeline'
], function (TinyLoader, Theme, Pipeline) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		Pipeline.async({}, [

		], onSuccess, onFailure);
	}, {
		theme: 'inlight',
		plugins: 'image table link paste contextmenu textpattern',
		insert_toolbar: 'image media table',
		selection_toolbar: 'bold italic | link h1 h2 blockquote',
		inline: true
	}, success, failure);
});
