define('tinymce.media.core.HtmlToData', [
	'global!tinymce.util.Tools',
	'global!tinymce.html.SaxParser',
	'global!tinymce.html.Schema',
	'tinymce.media.core.VideoScript'
], function (Tools, SaxParser, Schema, VideoScript) {
	var htmlToData = function (prefixes, html) {
		var data = {};

		new SaxParser({
			validate: false,
			allow_conditional_comments: true,
			special: 'script,noscript',
			start: function (name, attrs) {
				if (!data.source1 && name === "param") {
					data.source1 = attrs.map.movie;
				}

				var embed = attrs.map['data-ephox-embed-iri'];

				if (embed) {
					data.type = 'ephox-embed-iri';
					data.source1 = embed;
				}

				if (name === "iframe" || name === "object" || name === "embed" || name === "video" || name === "audio") {
					if (!data.type) {
						data.type = name;
					}

					data = Tools.extend(attrs.map, data);
				}

				if (name === "script") {
					var videoScript = VideoScript.getVideoScriptMatch(prefixes, attrs.map.src);
					if (!videoScript) {
						return;
					}

					data = {
						type: "script",
						source1: attrs.map.src,
						width: videoScript.width,
						height: videoScript.height
					};
				}

				if (name === "source") {
					if (!data.source1) {
						data.source1 = attrs.map.src;
					} else if (!data.source2) {
						data.source2 = attrs.map.src;
					}
				}

				if (name === "img" && !data.poster) {
					data.poster = attrs.map.src;
				}
			}
		}).parse(html);

		data.source1 = data.source1 || data.src || data.data;
		data.source2 = data.source2 || '';
		data.poster = data.poster || '';

		if (data.type === 'ephox-embed-iri') {
			return Tools.extend({}, {
				type: data.type,
				source1: data.source1,
				source2: '',
				poster: '',
				width: data.width,
				height: data.height
			});
		}

		return data;
	};

	return {
		htmlToData: htmlToData
	};
});