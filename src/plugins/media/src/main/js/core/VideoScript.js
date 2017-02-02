define('tinymce.media.core.VideoScript', [
], function () {
	var getVideoScriptMatch = function (prefixes, src) {
		// var prefixes = editor.settings.media_scripts;

		if (prefixes) {
			for (var i = 0; i < prefixes.length; i++) {
				if (src.indexOf(prefixes[i].filter) !== -1) {
					return prefixes[i];
				}
			}
		}
	};

	return {
		getVideoScriptMatch: getVideoScriptMatch
	};
});