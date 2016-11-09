define('tinymce.media.core.Etc', [
], function () {
	var setAttributes = function (attrs, updatedAttrs) {
		var name;
		var i;
		var value;
		var attr;

		for (name in updatedAttrs) {
			value = "" + updatedAttrs[name];

			if (attrs.map[name]) {
				i = attrs.length;
				while (i--) {
					attr = attrs[i];

					if (attr.name === name) {
						if (value) {
							attrs.map[name] = value;
							attr.value = value;
						} else {
							delete attrs.map[name];
							attrs.splice(i, 1);
						}
					}
				}
			} else if (value) {
				attrs.push({
					name: name,
					value: value
				});

				attrs.map[name] = value;
			}
		}
	};

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
		setAttributes: setAttributes,
		getVideoScriptMatch: getVideoScriptMatch
	};
});