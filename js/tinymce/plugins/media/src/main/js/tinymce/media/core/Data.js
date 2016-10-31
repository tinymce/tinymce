define('tinymce.media.core.Data', [
	'global!tinymce',
	'tinymce.media.core.Mime'
], function (tinymce, Mime) {
		var getSource = function (editor) {
			var elm = editor.selection.getNode();

			if (elm.getAttribute('data-mce-object')) {
				return editor.selection.getContent();
			}
		};

		var getVideoScriptMatch = function (editor, src) {
			var prefixes = editor.settings.media_scripts;

			if (prefixes) {
				for (var i = 0; i < prefixes.length; i++) {
					if (src.indexOf(prefixes[i].filter) !== -1) {
						return prefixes[i];
					}
				}
			}
		};

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

						if (attr.name == name) {
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

		var updateHtml = function (html, data, updateAll) {
			var writer = new tinymce.html.Writer();
			var sourceCount = 0;
			var hasImage;


			new tinymce.html.SaxParser({
				validate: false,
				allow_conditional_comments: true,
				special: 'script,noscript',

				comment: function(text) {
					writer.comment(text);
				},

				cdata: function(text) {
					writer.cdata(text);
				},

				text: function(text, raw) {
					writer.text(text, raw);
				},

				start: function(name, attrs, empty) {
					switch (name) {
						case "video":
						case "object":
						case "embed":
						case "img":
						case "iframe":
							setAttributes(attrs, {
								width: data.width,
								height: data.height
							});
							break;
					}

					if (updateAll) {
						switch (name) {
							case "video":
								setAttributes(attrs, {
									poster: data.poster,
									src: ""
								});

								if (data.source2) {
									setAttributes(attrs, {
										src: ""
									});
								}
								break;

							case "iframe":
								setAttributes(attrs, {
									src: data.source1
								});
								break;

							case "source":
								sourceCount++;

								if (sourceCount <= 2) {
									setAttributes(attrs, {
										src: data["source" + sourceCount],
										type: data["source" + sourceCount + "mime"]
									});

									if (!data["source" + sourceCount]) {
										return;
									}
								}
								break;

							case "img":
								if (!data.poster) {
									return;
								}

								hasImage = true;
								break;
						}
					}

					writer.start(name, attrs, empty);
				},

				end: function(name) {
					if (name == "video" && updateAll) {
						for (var index = 1; index <= 2; index++) {
							if (data["source" + index]) {
								var attrs = [];
								attrs.map = {};

								if (sourceCount < index) {
									setAttributes(attrs, {
										src: data["source" + index],
										type: data["source" + index + "mime"]
									});

									writer.start("source", attrs, true);
								}
							}
						}
					}

					if (data.poster && name == "object" && updateAll && !hasImage) {
						var imgAttrs = [];
						imgAttrs.map = {};

						setAttributes(imgAttrs, {
							src: data.poster,
							width: data.width,
							height: data.height
						});

						writer.start("img", imgAttrs, true);
					}

					writer.end(name);
				}
			}, new tinymce.html.Schema({})).parse(html);

			return writer.getContent();
		};

		var htmlToData = function (editor, html) {
			var data = {};

			new tinymce.html.SaxParser({
				validate: false,
				allow_conditional_comments: true,
				special: 'script,noscript',
				start: function(name, attrs) {
					if (!data.source1 && name == "param") {
						data.source1 = attrs.map.movie;
					}

					if (name == "iframe" || name == "object" || name == "embed" || name == "video" || name == "audio") {
						if (!data.type) {
							data.type = name;
						}

						data = tinymce.extend(attrs.map, data);
					}

					if (name == "script") {
						var videoScript = getVideoScriptMatch(editor, attrs.map.src);
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

					if (name == "source") {
						if (!data.source1) {
							data.source1 = attrs.map.src;
						} else if (!data.source2) {
							data.source2 = attrs.map.src;
						}
					}

					if (name == "img" && !data.poster) {
						data.poster = attrs.map.src;
					}
				}
			}).parse(html);

			data.source1 = data.source1 || data.src || data.data;
			data.source2 = data.source2 || '';
			data.poster = data.poster || '';

			return data;
		};

		var dataToHtml = function (editor, data) {
			var html = '';


			if (!data.source1) {
				tinymce.extend(data, htmlToData(editor, data.embed));
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
			// data.flashPlayerUrl = editor.convertURL(url + '/moxieplayer.swf', "movie");

			tinymce.each(urlPatterns, function(pattern) {
				var match;
				var i;
				var url;

				if ((match = pattern.regex.exec(data.source1))) {
					url = pattern.url;

					for (i = 0; match[i]; i++) {
						/*jshint loopfunc:true*/
						/*eslint no-loop-func:0 */
						url = url.replace('$' + i, function() {
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
				html = updateHtml(data.embed, data, true);
			} else {
				var videoScript = getVideoScriptMatch(editor, data.source1);
				if (videoScript) {
					data.type = 'script';
					data.width = videoScript.width;
					data.height = videoScript.height;
				}

				data.width = data.width || 300;
				data.height = data.height || 150;

				tinymce.each(data, function(value, key) {
					data[key] = editor.dom.encode(value);
				});

				if (data.type == "iframe") {
					var allowFullscreen = data.allowFullscreen ? ' allowFullscreen="1"' : '';
					html +=
						'<iframe src="' + data.source1 +
						'" width="' + data.width +
						'" height="' + data.height +
						'"' + allowFullscreen + '></iframe>';
				} else if (data.source1mime == "application/x-shockwave-flash") {
					html +=
						'<object data="' + data.source1 +
						'" width="' + data.width +
						'" height="' + data.height +
						'" type="application/x-shockwave-flash">';

					if (data.poster) {
						html += '<img src="' + data.poster + '" width="' + data.width + '" height="' + data.height + '" />';
					}

					html += '</object>';
				} else if (data.source1mime.indexOf('audio') != -1) {
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
				} else if (data.type == "script") {
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

		var getData = function (element, editor) {
			if (element.getAttribute('data-mce-object')) {
				return htmlToData(editor.serializer.serialize(element, {selection: true}));
			}

			return {};
		};

		var urlPatterns = [
			{
				regex: /youtu\.be\/([\w\-.]+)/,
				type: 'iframe', w: 560, h: 314,
				url: '//www.youtube.com/embed/$1',
				allowFullscreen: true
			},
			{
				regex: /youtube\.com(.+)v=([^&]+)/,
				type: 'iframe', w: 560, h: 314,
				url: '//www.youtube.com/embed/$2',
				allowFullscreen: true},
			{
				regex: /youtube.com\/embed\/([a-z0-9\-_]+(?:\?.+)?)/i,
				type: 'iframe', w: 560, h: 314,
				url: '//www.youtube.com/embed/$1',
				allowFullscreen: true},
			{
				regex: /vimeo\.com\/([0-9]+)/,
				type: 'iframe', w: 425, h: 350,
				url: '//player.vimeo.com/video/$1?title=0&byline=0&portrait=0&color=8dc7dc',
				allowfullscreen: true},
			{
				regex: /vimeo\.com\/(.*)\/([0-9]+)/,
				type: "iframe", w: 425, h: 350,
				url: "//player.vimeo.com/video/$2?title=0&amp;byline=0",
				allowfullscreen: true},
			{
				regex: /maps\.google\.([a-z]{2,3})\/maps\/(.+)msid=(.+)/,
				type: 'iframe', w: 425, h: 350,
				url: '//maps.google.com/maps/ms?msid=$2&output=embed"',
				allowFullscreen: false},
			{
				regex: /dailymotion\.com\/video\/([^_]+)/,
				type: 'iframe', w: 480, h: 270,
				url: '//www.dailymotion.com/embed/video/$1',
				allowFullscreen: true}
		];

		return {
			htmlToData: htmlToData,
			dataToHtml: dataToHtml,
			getSource: getSource,
			getData: getData,
			urlPatterns: urlPatterns,
			updateHtml: updateHtml,
			getVideoScriptMatch: getVideoScriptMatch
		};
});