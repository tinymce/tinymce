/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	var excludedEmbedAttrs = tinymce.makeMap('id,width,height,type'), Node = tinymce.html.Node, mediaTypes = [
		// Type, clsid:s, mime types, codebase
		["Flash", "d27cdb6e-ae6d-11cf-96b8-444553540000", "application/x-shockwave-flash", "http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"],
		["ShockWave", "166b1bca-3f9c-11cf-8075-444553540000", "application/x-director", "http://download.macromedia.com/pub/shockwave/cabs/director/sw.cab#version=8,5,1,0"],
		["WindowsMedia", "6bf52a52-394a-11d3-b153-00c04f79faa6,22d6f312-b0f6-11d0-94ab-0080c74c7e95,05589fa1-c356-11ce-bf01-00aa0055595a", "application/x-mplayer2", "http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701"],
		["QuickTime", "02bf25d5-8c17-4b23-bc80-d3488abddc6b", "video/quicktime", "http://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0"],
		["RealMedia", "cfcdaa03-8be4-11cf-b84b-0020afbbccfa", "audio/x-pn-realaudio-plugin", "http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"],
		["Java", "8AD9C840-044E-11D1-B3E9-00805F499D93", "application/x-java-applet", "http://java.sun.com/products/plugin/autodl/jinstall-1_5_0-windows-i586.cab#Version=1,5,0,0"],
		["Silverlight", "dfeaf541-f3e1-4c24-acac-99c30715084a", "application/x-silverlight-2"]
	];

	tinymce.create('tinymce.plugins.MediaPlugin', {
		init : function(ed, url) {
			var self = this, lookup = {}, i, y, item;

			self.editor = ed;
			self.url = url;

			// Parse media types into a lookup table
			for (i = 0; i < mediaTypes.length; i++) {
				item = {
					type : mediaTypes[i][0],
					clsids : tinymce.explode(mediaTypes[i][1]),
					mimes : tinymce.explode(mediaTypes[i][2]),
					codebase : mediaTypes[i][3]
				};

				for (y = 0; y < item.clsids.length; y++)
					lookup['clsid:' + item.clsids[y]] = item;

				for (y = 0; y < item.mimes.length; y++)
					lookup[item.mimes[y]] = item;

				lookup['mceItem' + mediaTypes[i][0]] = item;
			}

			self.lookup = lookup;

			ed.onPreInit.add(function() {
				// Allow video elements
				ed.schema.addValidElements('object[*],param[name|value],embed[*],video[*],source[*]');

				// Convert video elements to image placeholder
				ed.parser.addNodeFilter('object,embed,video', function(nodes) {
					var i = nodes.length;

					while (i--)
						self.objectToImg(nodes[i]);
				});

				// Convert image placeholders to video elements
				ed.serializer.addNodeFilter('img', function(nodes) {
					var i = nodes.length, node;

					while (i--) {
						node = nodes[i];
						if (node.attr('class').indexOf('mceItemMedia') !== -1)
							self.imgToObject(node);
					}
				});
			});

			ed.onInit.add(function() {
				// Load the media specific CSS file
				if (ed.settings.content_css !== false)
					ed.dom.loadCSS(url + "/css/content.css");

				// Display "media" instead of "img" in element path
				if (ed.theme && ed.theme.onResolveName) {
					ed.theme.onResolveName.add(function(theme, path_object) {
						if (path_object.name === 'img' && ed.dom.hasClass(path_object.node, 'mceItemMedia'))
							path_object.name = 'media';
					});
				}

				// Add contect menu if it's loaded
				if (ed && ed.plugins.contextmenu) {
					ed.plugins.contextmenu.onContextMenu.add(function(plugin, menu, element) {
						if (element.nodeName === 'IMG' && element.className.indexOf('mceItemMedia') !== -1)
							menu.add({title : 'media.edit', icon : 'media', cmd : 'mceMedia'});
					});
				}
			});

			// Register commands
			ed.addCommand('mceMedia', function() {
				ed.windowManager.open({
					file : url + '/media.htm',
					width : 430 + parseInt(ed.getLang('media.delta_width', 0)),
					height : 470 + parseInt(ed.getLang('media.delta_height', 0)),
					inline : 1
				}, {
					plugin_url : url
				});
			});

			// Register buttons
			ed.addButton('media', {title : 'media.desc', cmd : 'mceMedia'});

			// Update media selection status
			ed.onNodeChange.add(function(ed, cm, node) {
				cm.setActive('media', node.nodeName == 'IMG' && ed.dom.hasClass(node, 'mceItemMedia'));
			});
		},

		getInfo : function() {
			return {
				longname : 'Media',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/media',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},

		imgToObject : function(node) {
			var replacement, embed, name, value, data, param, typeItem, i, classes, item;

			data = tinymce.util.JSON.parse(node.attr('data-mce-data'));

			// Find type by checking the classes
			classes = tinymce.explode(node.attr('class'), ' ');
			for (i = 0; i < classes.length; i++) {
				typeItem = this.lookup[classes[i]];
				if (typeItem)
					break;
			}

			// Create new object element
			replacement = new Node('object', 1);
			replacement.attr({
				id : node.attr('id'),
				width: node.attr('width'),
				height: node.attr('height'),
				style : node.attr('style')
			});

			// Add params
			for (name in data.params) {
				param = new Node('param', 1);
				param.shortEnded = true;
				value = data.params[name];

				if (name === 'src' && typeItem.type === 'WindowsMedia')
					name = 'url';

				param.attr({name: name, value: value});
				replacement.append(param);
			}

			// Setup add type and classid if strict is disabled
			if (this.editor.getParam('media_strict', true)) {
				replacement.attr({
					data: data.params.src,
					type: typeItem.mimes[0]
				});
			} else {
				replacement.attr({
					classid: "clsid:" + typeItem.clsids[0],
					codebase: typeItem.codebase
				});

				embed = new Node('embed', 1);
				embed.attr({
					id: node.attr('id'),
					width: node.attr('width'),
					height: node.attr('height'),
					style : node.attr('style'),
					type: typeItem.mimes[0]
				});

				for (name in data.params)
					embed.attr(name, data.params[name]);

				replacement.append(embed);
			}

			node.replace(replacement);
		},

		objectToImg : function(node) {
			var object, embed, video, img, name, id, width, height, style, i,
				param, params, data, type, lookup = this.lookup;

			// If node isn't in document
			if (!node.parent)
				return;

			// Setup data objects
			data = {
				video : {},
				params : {}
			};

			// Setup new image object
			img = new Node('img', 1);
			img.attr({
				src : this.url + '/img/trans.gif'
			});

			// Video element
			name = node.name;
			if (name === 'video') {
				video = node;
				object = node.getAll('object')[0];
				embed = node.getAll('embed')[0];
				width = video.attr('width');
				height = video.attr('height');
				id = video.attr('id');

				// Get all video attributes
				for (name in video.attributes.map)
					data.video[name] = video.attributes.map[name];
			}

			// Object element
			if (node.name === 'object') {
				object = node;
				embed = node.getAll('embed')[0];
			}

			// Embed element
			if (node.name === 'embed')
				embed = node;

			if (object) {
				// Get width/height
				width = width || object.attr('width');
				height = height || object.attr('height');
				style = style || object.attr('style');
				id = id || object.attr('id');

				// Get all object params
				params = object.getAll("param");
				for (i = 0; i < params.length; i++) {
					param = params[i];
					name = param.attr('name');

					if (!excludedEmbedAttrs[name])
						data.params[name] = param.attr('value');
				}

				data.params.src = object.attr('data');
			}

			if (embed) {
				// Get width/height
				width = width || embed.attr('width');
				height = height || embed.attr('height');
				style = style || embed.attr('style');
				id = id || embed.attr('id');

				// Get all embed attributes
				for (name in embed.attributes.map) {
					if (!excludedEmbedAttrs[name] && !data.params[name])
						data.params[name] = embed.attributes.map[name];
				}
			}

			// Use src not movie
			if (data.params.movie) {
				data.params.src = data.params.movie;
				delete data.params.movie;
			}

			// Convert the URL to relative/absolute depending on configuration
			data.params.src = this.editor.convertURL(data.params.src, 'src', 'object');

			// Get media type based on clsid or mime type
			if (object)
				type = (lookup[(object.attr('clsid') || '').toLowerCase()] || lookup[(object.attr('type') || '').toLowerCase()] || {}).type;

			if (embed && !type)
				type = (lookup[(embed.attr('type') || '').toLowerCase()] || {}).type;

			// Set width/height of placeholder
			img.attr({
				id : id,
				'class' : 'mceItemMedia mceItem' + (type || 'Flash'),
				style : style,
				width : width || "100",
				height : height || "100",
				"data-mce-data" : tinymce.util.JSON.serialize(data).replace(/"/g, "'") // Replace quotes to reduce HTML size since they get encoded
			});

			// Replace the video/object/embed element with a placeholder image containing the data
			node.replace(img);
		}
	});

	// Register plugin
	tinymce.PluginManager.add('media', tinymce.plugins.MediaPlugin);
})();