define('tinymce.media.core.DataToHtml', [
	'tinymce.media.core.Mime',
	'tinymce.media.core.HtmlToData',
	'tinymce.media.core.UrlPatterns',
	'tinymce.media.core.VideoScript',
	'tinymce.media.core.UpdateHtml',
	'global!tinymce.util.Tools'
], function (Mime, HtmlToData, UrlPatterns, VideoScript, UpdateHtml, Tools) {
	var dataToHtml = function (editor, dataIn) {
		var html = '';
		var data = Tools.extend({}, dataIn);

		if (!data.source1) {
			Tools.extend(data, HtmlToData.htmlToData(editor.settings.media_scripts, data.embed));
			if (!data.source1) {
				return '';
			}
		}

		if (!data.source2) {
			data.source2 = '';
		}

		if (!data.poster) {
			data.poster = '';
		}

		data.source1 = editor.convertURL(data.source1, "source");
		data.source2 = editor.convertURL(data.source2, "source");
		data.source1mime = Mime.guess(data.source1);
		data.source2mime = Mime.guess(data.source2);
		data.poster = editor.convertURL(data.poster, "poster");

		Tools.each(UrlPatterns.urlPatterns, function (pattern) {
			var i;
			var url;

			var match = pattern.regex.exec(data.source1);

			if (match) {
				url = pattern.url;

				for (i = 0; match[i]; i++) {
					/*jshint loopfunc:true*/
					/*eslint no-loop-func:0 */
					url = url.replace('$' + i, function () {
						return match[i];
					});
				}

				data.source1 = url;
				data.type = pattern.type;
				data.allowFullscreen = pattern.allowFullscreen;
				data.width = data.width || pattern.w;
				data.height = data.height || pattern.h;
			}
		});

		if (data.embed) {
			html = UpdateHtml.updateHtml(data.embed, data, true);
		} else {
			var videoScript = VideoScript.getVideoScriptMatch(editor.settings.media_scripts, data.source1);
			if (videoScript) {
				data.type = 'script';
				data.width = videoScript.width;
				data.height = videoScript.height;
			}

			data.width = data.width || 300;
			data.height = data.height || 150;

			Tools.each(data, function (value, key) {
				data[key] = editor.dom.encode(value);
			});

			if (data.type === "iframe") {
				var allowFullscreen = data.allowFullscreen ? ' allowFullscreen="1"' : '';
				html +=
					'<iframe src="' + data.source1 +
					'" width="' + data.width +
					'" height="' + data.height +
					'"' + allowFullscreen + '></iframe>';
			} else if (data.source1mime === "application/x-shockwave-flash") {
				html +=
					'<object data="' + data.source1 +
					'" width="' + data.width +
					'" height="' + data.height +
					'" type="application/x-shockwave-flash">';

				if (data.poster) {
					html += '<img src="' + data.poster + '" width="' + data.width + '" height="' + data.height + '" />';
				}

				html += '</object>';
			} else if (data.source1mime.indexOf('audio') !== -1) {
				if (editor.settings.audio_template_callback) {
					html = editor.settings.audio_template_callback(data);
				} else {
					html += (
						'<audio controls="controls" src="' + data.source1 + '">' +
							(
								data.source2 ?
									'\n<source src="' + data.source2 + '"' +
										(data.source2mime ? ' type="' + data.source2mime + '"' : '') +
									' />\n' : '') +
						'</audio>'
					);
				}
			} else if (data.type === "script") {
				html += '<script src="' + data.source1 + '"></script>';
			} else {
				if (editor.settings.video_template_callback) {
					html = editor.settings.video_template_callback(data);
				} else {
					html = (
						'<video width="' + data.width +
							'" height="' + data.height + '"' +
								(data.poster ? ' poster="' + data.poster + '"' : '') + ' controls="controls">\n' +
							'<source src="' + data.source1 + '"' +
								(data.source1mime ? ' type="' + data.source1mime + '"' : '') + ' />\n' +
							(data.source2 ? '<source src="' + data.source2 + '"' +
								(data.source2mime ? ' type="' + data.source2mime + '"' : '') + ' />\n' : '') +
						'</video>'
					);
				}
			}
		}

		return html;
	};

	return {
		dataToHtml: dataToHtml
	};
});