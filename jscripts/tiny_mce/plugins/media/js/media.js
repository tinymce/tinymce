(function() {
	var url;

	if (url = tinyMCEPopup.getParam("media_external_list_url"))
		document.write('<script language="javascript" type="text/javascript" src="' + tinyMCEPopup.editor.documentBaseURI.toAbsolute(url) + '"></script>');

	function get(id) {
		return document.getElementById(id);
	}

	function getVal(id) {
		var elm = get(id);

		if (elm.nodeName == "SELECT")
			return elm.options[elm.selectedIndex].value;

		if (elm.type == "checkbox")
			return elm.checked;

		return elm.value;
	}

	function setVal(id, value, name) {
		if (typeof(value) != 'undefined') {
			var elm = get(id);

			if (elm.nodeName == "SELECT")
				selectByValue(document.forms[0], id, value);
			else if (elm.type == "checkbox") {
				if (typeof(value) == 'string') {
					value = value.toLowerCase();
					value = (!name && value === 'true') || (name && value === name.toLowerCase());
				}
				elm.checked = !!value;
			} else
				elm.value = value;
		}
	}

	window.Media = {
		init : function() {
			var html, editor;

			this.editor = editor = tinyMCEPopup.editor;

			// Setup file browsers and color pickers
			get('filebrowsercontainer').innerHTML = getBrowserHTML('filebrowser','src','media','media');
			get('qtsrcfilebrowsercontainer').innerHTML = getBrowserHTML('qtsrcfilebrowser','quicktime_qtsrc','media','media');
			get('bgcolor_pickcontainer').innerHTML = getColorPickerHTML('bgcolor_pick','bgcolor');
			get('video_altsource1_filebrowser').innerHTML = getBrowserHTML('filebrowser_altsource1','video_altsource1','media','media');
			get('video_altsource2_filebrowser').innerHTML = getBrowserHTML('filebrowser_altsource2','video_altsource2','media','media');
			get('video_poster_filebrowser').innerHTML = getBrowserHTML('filebrowser_poster','video_poster','media','image');

			html = this.getMediaListHTML('medialist', 'src', 'media', 'media');
			if (html == "")
				get("linklistrow").style.display = 'none';
			else
				get("linklistcontainer").innerHTML = html;

			if (isVisible('filebrowser'))
				get('src').style.width = '230px';

			if (isVisible('filebrowser_altsource1'))
				get('video_altsource1').style.width = '220px';

			if (isVisible('filebrowser_altsource2'))
				get('video_altsource2').style.width = '220px';

			if (isVisible('filebrowser_poster'))
				get('video_poster').style.width = '220px';

			this.data = tinyMCEPopup.getWindowArg('data');
			this.dataToForm();
			this.preview();
		},

		insert : function() {
			var editor = tinyMCEPopup.editor;

			this.formToData();
			editor.execCommand('mceRepaint');
			tinyMCEPopup.restoreSelection();
			editor.selection.setNode(editor.plugins.media.dataToImg(this.data));
			tinyMCEPopup.close();
		},

		preview : function() {
			get('prev').innerHTML = this.editor.plugins.media.dataToHtml(this.data, true);
		},

		moveStates : function(to_form, field) {
			var data = this.data, editor = this.editor, data = this.data,
				mediaPlugin = editor.plugins.media, ext, src, typeInfo, defaultStates, src;

			defaultStates = {
				// QuickTime
				quicktime_autoplay : true,
				quicktime_controller : true,

				// Flash
				flash_play : true,
				flash_loop : true,
				flash_menu : true,

				// WindowsMedia
				windowsmedia_autostart : true,
				windowsmedia_enablecontextmenu : true,
				windowsmedia_invokeurls : true,

				// RealMedia
				realmedia_autogotourl : true,
				realmedia_imagestatus : true
			};

			function parseQueryParams(str) {
				var out = {};

				if (str) {
					tinymce.each(str.split('&'), function(item) {
						var parts = item.split('=');

						out[unescape(parts[0])] = unescape(parts[1]);
					});
				}

				return out;
			};

			function setOptions(type, names) {
				var i, name, formItemName, value, list;

				if (type == data.type || type == 'global') {
					names = tinymce.explode(names);
					for (i = 0; i < names.length; i++) {
						name = names[i];
						formItemName = type == 'global' ? name : type + '_' + name;

						if (type == 'global')
							list = data;
						else if (type == 'video') {
							list = data.video.attrs;

							if (!list && !to_form)
								data.video.attrs = list = {};
						} else
							list = data.params;

						if (list) {
							if (to_form) {
								setVal(formItemName, list[name], type == 'video' ? name : '');
							} else {
								delete list[name];

								value = getVal(formItemName);
								if (type == 'video' && value === true)
									value = name;

								if (defaultStates[formItemName]) {
									if (value !== defaultStates[formItemName]) {
										value = "" + value;
										list[name] = value;
									}
								} else if (value) {
									value = "" + value;
									list[name] = value;
								}
							}
						}
					}
				}
			}

			if (!to_form) {
				data.type = get('media_type').options[get('media_type').selectedIndex].value;
				data.width = getVal('width');
				data.height = getVal('height');

				// Switch type based on extension
				src = getVal('src');
				if (field == 'src') {
					ext = src.replace(/^.*\.([^.]+)$/, '$1');
					if (typeInfo = mediaPlugin.getType(ext))
						data.type = typeInfo.name.toLowerCase();

					setVal('media_type', data.type);
				}

				if (data.type == "video") {
					if (!data.video.sources)
						data.video.sources = [];

					data.video.sources[0] = {src: getVal('src')};
				}
			}

			// Hide all fieldsets and show the one active
			get('video_options').style.display = 'none';
			get('flash_options').style.display = 'none';
			get('quicktime_options').style.display = 'none';
			get('shockwave_options').style.display = 'none';
			get('windowsmedia_options').style.display = 'none';
			get('realmedia_options').style.display = 'none';

			if (get(data.type + '_options'))
				get(data.type + '_options').style.display = 'block';

			setVal('media_type', data.type);

			setOptions('flash', 'play,loop,menu,swliveconnect,quality,scale,salign,wmode,base,flashvars');
			setOptions('quicktime', 'loop,autoplay,cache,controller,correction,enablejavascript,kioskmode,autohref,playeveryframe,targetcache,scale,starttime,endtime,target,qtsrcchokespeed,volume,qtsrc');
			setOptions('shockwave', 'sound,progress,autostart,swliveconnect,swvolume,swstretchstyle,swstretchhalign,swstretchvalign');
			setOptions('windowsmedia', 'autostart,enabled,enablecontextmenu,fullscreen,invokeurls,mute,stretchtofit,windowlessvideo,balance,baseurl,captioningid,currentmarker,currentposition,defaultframe,playcount,rate,uimode,volume');
			setOptions('realmedia', 'autostart,loop,autogotourl,center,imagestatus,maintainaspect,nojava,prefetch,shuffle,console,controls,numloop,scriptcallbacks');
			setOptions('video', 'poster,autoplay,loop,preload,controls');
			setOptions('global', 'id,name,vspace,hspace,bgcolor,align,width,height');

			if (to_form) {
				if (data.type == 'video') {
					if (data.video.sources[0])
						setVal('src', data.video.sources[0].src);

					src = data.video.sources[1];
					if (src)
						setVal('video_altsource1', src.src);

					src = data.video.sources[2];
					if (src)
						setVal('video_altsource2', src.src);
				} else {
					// Check flash vars
					if (data.type == 'flash') {
						tinymce.each(editor.getParam('flash_video_player_flashvars', {url : '$url', poster : '$poster'}), function(value, name) {
							if (value == '$url')
								data.params.src = parseQueryParams(data.params.flashvars)[name] || data.params.src;
						});
					}

					setVal('src', data.params.src);
				}
			} else {
				src = getVal("src");
	
				// YouTube
				if (src.match(/youtube.com(.+)v=([^&]+)/)) {
					data.width = 425;
					data.height = 350;
					data.params.frameborder = '0';
					data.type = 'iframe';
					src = 'http://www.youtube.com/embed/' + src.match(/v=([^&]+)/)[1];
					setVal('src', src);
					setVal('media_type', data.type);
				}

				// Google video
				if (src.match(/video.google.com(.+)docid=([^&]+)/)) {
					data.width = 425;
					data.height = 326;
					data.type = 'flash';
					src = 'http://video.google.com/googleplayer.swf?docId=' + src.match(/docid=([^&]+)/)[1] + '&hl=en';
					setVal('src', src);
					setVal('media_type', data.type);
				}

				if (data.type == 'video') {
					if (!data.video.sources)
						data.video.sources = [];

					data.video.sources[0] = {src : src};

					src = getVal("video_altsource1");
					if (src)
						data.video.sources[1] = {src : src};

					src = getVal("video_altsource2");
					if (src)
						data.video.sources[2] = {src : src};
				} else
					data.params.src = src;

				// Set default size
				setVal('width', data.width || 320);
				setVal('height', data.height || 240);
			}
		},

		dataToForm : function() {
			this.moveStates(true);
		},

		formToData : function(field) {
			if (field == "width" || field == "height")
				this.changeSize(field);

			if (field == 'source') {
				this.moveStates(false, field);
				setVal('source', this.editor.plugins.media.dataToHtml(this.data));
				this.panel = 'source';
			} else {
				if (this.panel == 'source') {
					this.data = this.editor.plugins.media.htmlToData(getVal('source'));
					this.dataToForm();
					this.panel = '';
				}

				this.moveStates(false, field);
				this.preview();
			}
		},

		beforeResize : function() {
			this.width = parseInt(getVal('width') || "320", 10);
			this.height = parseInt(getVal('height') || "240", 10);
		},

		changeSize : function(type) {
			var width, height, scale, size;

			if (get('constrain').checked) {
				width = parseInt(getVal('width') || "320", 10);
				height = parseInt(getVal('height') || "240", 10);

				if (type == 'width') {
					this.height = Math.round((width / this.width) * height);
					setVal('height', this.height);
				} else {
					this.width = Math.round((height / this.height) * width);
					setVal('width', this.width);
				}
			}
		},

		getMediaListHTML : function() {
			if (typeof(tinyMCEMediaList) != "undefined" && tinyMCEMediaList.length > 0) {
				var html = "";

				html += '<select id="linklist" name="linklist" style="width: 250px" onchange="this.form.src.value=this.options[this.selectedIndex].value;Media.formToData(\'src\');">';
				html += '<option value="">---</option>';

				for (var i=0; i<tinyMCEMediaList.length; i++)
					html += '<option value="' + tinyMCEMediaList[i][1] + '">' + tinyMCEMediaList[i][0] + '</option>';

				html += '</select>';

				return html;
			}

			return "";
		}
	};

	tinyMCEPopup.requireLangPack();
	tinyMCEPopup.onInit.add(function() {
		Media.init();
	});
})();