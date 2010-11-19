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

	function setVal(id, value) {
		if (typeof(value) != 'undefined') {
			var elm = get(id);

			if (elm.nodeName == "SELECT")
				selectByValue(document.forms[0], id, value);
			else if (elm.type == "checkbox")
				elm.checked = !!value;
			else
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
			get('posterfilebrowsercontainer').innerHTML = getBrowserHTML('filebrowser_poster','video_poster','media','image');

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
			tinyMCEPopup.restoreSelection();
			editor.selection.setNode(editor.plugins.media.dataToImg(this.data));
			tinyMCEPopup.close();
		},

		preview : function() {
			get('prev').innerHTML = this.editor.plugins.media.dataToHtml(this.data, true);
		},

		viewSource : function() {
			setVal('source', this.editor.plugins.media.dataToHtml(this.data));
			this.panel = 'source';
		},

		moveStates : function(to_form, field) {
			var data = this.data, editor = this.editor, data = this.data,
				mediaPlugin = editor.plugins.media, ext, src, typeInfo, defaultStates;

			defaultStates = {
				// QuickTime
				autoplay : true,
				controller : true,

				// Flash
				play : true,
				loop : true,
				menu : true,

				// WindowsMedia
				autostart : true,
				enablecontextmenu : true,
				invokeurls : true,

				// RealMedia
				autogotourl : true,
				imagestatus : true,

				// Video
				preload : true,
				controls : true
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
						else if (type == 'video')
							list = data.video;
						else
							list = data.params;

						if (to_form) {
							setVal(formItemName, list[name]);
						} else {
							delete list[name];

							value = getVal(formItemName);
							if (defaultStates[name]) {
								if (value !== defaultStates[name]) {
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

			if (!to_form) {
				data.params = {};

				data.type = get('media_type').options[get('media_type').selectedIndex].value;
				data.width = getVal('width');
				data.height = getVal('height');

				// Switch type based on extension
				src = getVal('src');
				if (field == 'src' || !data.type) {
					ext = src.replace(/^.*\.([^.]+)$/, '$1');
					if (typeInfo = mediaPlugin.getType(ext))
						data.type = typeInfo.name.toLowerCase();

					setVal('media_type', data.type);
				}

				if (data.type == "video") {
					if (!data.video.sources)
						data.video.sources = [];

					data.video.sources[0] = {src: getVal('src'), type: 'video/mp4'};
				}
			}

			// Hide all fieldsets and show the one active
			get('video_options').style.display = 'none';
			get('flash_options').style.display = 'none';
			get('quicktime_options').style.display = 'none';
			get('shockwave_options').style.display = 'none';
			get('windowsmedia_options').style.display = 'none';
			get('realmedia_options').style.display = 'none';
			get(data.type + '_options').style.display = 'block';
			setVal('media_type', data.type);

			setOptions('flash', 'play,loop,menu,swliveconnect,quality,scale,salign,wmode,base,flashvars');
			setOptions('quicktime', 'loop,autoplay,cache,controller,correction,enablejavascript,kioskmode,autohref,playeveryframe,targetcache,scale,starttime,endtime,target,qtsrcchokespeed,volume,qtsrc');
			setOptions('shockwave', 'sound,progress,autostart,swliveconnect,swvolume,swstretchstyle,swstretchhalign,swstretchvalign');
			setOptions('windowsmedia', 'autostart,enabled,enablecontextmenu,fullscreen,invokeurls,mute,stretchtofit,windowlessvideo,balance,baseurl,captioningid,currentmarker,currentposition,defaultframe,playcount,rate,uimode,volume');
			setOptions('realmedia', 'autostart,loop,autogotourl,center,imagestatus,maintainaspect,nojava,prefetch,shuffle,console,controls,numloop,scriptcallbacks');
			setOptions('video', 'poster,play,loop,preload,controls');
			setOptions('global', 'id,src,name,vspace,hspace,bgcolor,align,width,height');
		},

		dataToForm : function() {
			this.moveStates(true);
		},

		formToData : function(field) {
			if (this.panel == 'source') {
				this.data = this.editor.plugins.media.htmlToData(getVal('source'));
				this.dataToForm();
				this.panel = '';
			}

			this.moveStates(false, field);
			this.preview();
		},

		changeSize : function(type) {
			var width, height, scale, size;

			if (get('constrain').checked) {
				width = parseInt(getVal('width') || "100", 10);
				height = parseInt(getVal('height') || "100", 10);

				if (type == 'width')
					setVal('height', Math.round((width / this.data.width) * width));
				else
					setVal('width', Math.round((height / this.data.height) * height));
			}

			this.formToData();
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