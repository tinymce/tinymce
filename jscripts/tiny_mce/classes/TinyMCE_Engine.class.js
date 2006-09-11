/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

/**
 * Core engine class for TinyMCE, a instance of this class is available as a global called tinyMCE.
 *
 * @constructor
 */
function TinyMCE_Engine() {
	this.majorVersion = "2";
	this.minorVersion = "0.7";
	this.releaseDate = "2006-xx-xx";

	this.instances = new Array();
	this.switchClassCache = new Array();
	this.windowArgs = new Array();
	this.loadedFiles = new Array();
	this.pendingFiles = new Array();
	this.loadingIndex = 0;
	this.configs = new Array();
	this.currentConfig = 0;
	this.eventHandlers = new Array();
	this.log = new Array();

	// Browser check
	var ua = navigator.userAgent;
	this.isMSIE = (navigator.appName == "Microsoft Internet Explorer");
	this.isMSIE5 = this.isMSIE && (ua.indexOf('MSIE 5') != -1);
	this.isMSIE5_0 = this.isMSIE && (ua.indexOf('MSIE 5.0') != -1);
	this.isMSIE7 = this.isMSIE && (ua.indexOf('MSIE 7') != -1);
	this.isGecko = ua.indexOf('Gecko') != -1;
	this.isSafari = ua.indexOf('Safari') != -1;
	this.isOpera = ua.indexOf('Opera') != -1;
	this.isMac = ua.indexOf('Mac') != -1;
	this.isNS7 = ua.indexOf('Netscape/7') != -1;
	this.isNS71 = ua.indexOf('Netscape/7.1') != -1;
	this.dialogCounter = 0;
	this.plugins = new Array();
	this.themes = new Array();
	this.menus = new Array();
	this.loadedPlugins = new Array();
	this.buttonMap = new Array();
	this.isLoaded = false;

	// Fake MSIE on Opera and if Opera fakes IE, Gecko or Safari cancel those
	if (this.isOpera) {
		this.isMSIE = true;
		this.isGecko = false;
		this.isSafari =  false;
	}

	this.isIE = this.isMSIE;

	// TinyMCE editor id instance counter
	this.idCounter = 0;
};

TinyMCE_Engine.prototype = {
	/**
	 * Initializes TinyMCE with the specific configuration settings. This method
	 * may be called multiple times when multiple instances with diffrent settings is to be created.
	 *
	 * @param {Array} Name/Value array of initialization settings.
	 */
	init : function(settings) {
		var theme, nl, baseHREF = "";

		// IE 5.0x is no longer supported since 5.5, 6.0 and 7.0 now exists. We can't support old browsers forever, sorry.
		if (this.isMSIE5_0)
			return;

		this.settings = settings;

		// Check if valid browser has execcommand support
		if (typeof(document.execCommand) == 'undefined')
			return;

		// Get script base path
		if (!tinyMCE.baseURL) {
			var elements = document.getElementsByTagName('script');

			// If base element found, add that infront of baseURL
			nl = document.getElementsByTagName('base');
			for (var i=0; i<nl.length; i++) {
				if (nl[i].href)
					baseHREF = nl[i].href;
			}

			for (var i=0; i<elements.length; i++) {
				if (elements[i].src && (elements[i].src.indexOf("tiny_mce.js") != -1 || elements[i].src.indexOf("tiny_mce_dev.js") != -1 || elements[i].src.indexOf("tiny_mce_src.js") != -1 || elements[i].src.indexOf("tiny_mce_gzip") != -1)) {
					var src = elements[i].src;

					tinyMCE.srcMode = (src.indexOf('_src') != -1 || src.indexOf('_dev') != -1) ? '_src' : '';
					tinyMCE.gzipMode = src.indexOf('_gzip') != -1;
					src = src.substring(0, src.lastIndexOf('/'));

					if (settings.exec_mode == "src" || settings.exec_mode == "normal")
						tinyMCE.srcMode = settings.exec_mode == "src" ? '_src' : '';

					// Force it absolute if page has a base href
					if (baseHREF != "" && src.indexOf('://') == -1)
						tinyMCE.baseURL = baseHREF + src;
					else
						tinyMCE.baseURL = src;

					break;
				}
			}
		}

		// Get document base path
		this.documentBasePath = document.location.href;
		if (this.documentBasePath.indexOf('?') != -1)
			this.documentBasePath = this.documentBasePath.substring(0, this.documentBasePath.indexOf('?'));
		this.documentURL = this.documentBasePath;
		this.documentBasePath = this.documentBasePath.substring(0, this.documentBasePath.lastIndexOf('/'));

		// If not HTTP absolute
		if (tinyMCE.baseURL.indexOf('://') == -1 && tinyMCE.baseURL.charAt(0) != '/') {
			// If site absolute
			tinyMCE.baseURL = this.documentBasePath + "/" + tinyMCE.baseURL;
		}

		// Set default values on settings
		this._def("mode", "none");
		this._def("theme", "advanced");
		this._def("plugins", "", true);
		this._def("language", "en");
		this._def("docs_language", this.settings['language']);
		this._def("elements", "");
		this._def("textarea_trigger", "mce_editable");
		this._def("editor_selector", "");
		this._def("editor_deselector", "mceNoEditor");
		this._def("valid_elements", "+a[id|style|rel|rev|charset|hreflang|dir|lang|tabindex|accesskey|type|name|href|target|title|class|onfocus|onblur|onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],-strong/-b[class|style],-em/-i[class|style],-strike[class|style],-u[class|style],#p[id|style|dir|class|align],-ol[class|style],-ul[class|style],-li[class|style],br,img[id|dir|lang|longdesc|usemap|style|class|src|onmouseover|onmouseout|border|alt=|title|hspace|vspace|width|height|align],-sub[style|class],-sup[style|class],-blockquote[dir|style],-table[border=0|cellspacing|cellpadding|width|height|class|align|summary|style|dir|id|lang|bgcolor|background|bordercolor],-tr[id|lang|dir|class|rowspan|width|height|align|valign|style|bgcolor|background|bordercolor],tbody[id|class],thead[id|class],tfoot[id|class],#td[id|lang|dir|class|colspan|rowspan|width|height|align|valign|style|bgcolor|background|bordercolor|scope],-th[id|lang|dir|class|colspan|rowspan|width|height|align|valign|style|scope],caption[id|lang|dir|class|style],-div[id|dir|class|align|style],-span[style|class|align],-pre[class|align|style],address[class|align|style],-h1[id|style|dir|class|align],-h2[id|style|dir|class|align],-h3[id|style|dir|class|align],-h4[id|style|dir|class|align],-h5[id|style|dir|class|align],-h6[id|style|dir|class|align],hr[class|style],-font[face|size|style|id|class|dir|color],dd[id|class|title|style|dir|lang],dl[id|class|title|style|dir|lang],dt[id|class|title|style|dir|lang]");
		this._def("extended_valid_elements", "");
		this._def("invalid_elements", "");
		this._def("encoding", "");
		this._def("urlconverter_callback", tinyMCE.getParam("urlconvertor_callback", "TinyMCE_Engine.prototype.convertURL"));
		this._def("save_callback", "");
		this._def("debug", false);
		this._def("force_br_newlines", false);
		this._def("force_p_newlines", true);
		this._def("add_form_submit_trigger", true);
		this._def("relative_urls", true);
		this._def("remove_script_host", true);
		this._def("focus_alert", true);
		this._def("document_base_url", this.documentURL);
		this._def("visual", true);
		this._def("visual_table_class", "mceVisualAid");
		this._def("setupcontent_callback", "");
		this._def("fix_content_duplication", true);
		this._def("custom_undo_redo", true);
		this._def("custom_undo_redo_levels", -1);
		this._def("custom_undo_redo_keyboard_shortcuts", true);
		this._def("custom_undo_redo_restore_selection", true);
		this._def("verify_html", true);
		this._def("apply_source_formatting", false);
		this._def("directionality", "ltr");
		this._def("cleanup_on_startup", false);
		this._def("inline_styles", false);
		this._def("convert_newlines_to_brs", false);
		this._def("auto_reset_designmode", true);
		this._def("entities", "39,#39,160,nbsp,161,iexcl,162,cent,163,pound,164,curren,165,yen,166,brvbar,167,sect,168,uml,169,copy,170,ordf,171,laquo,172,not,173,shy,174,reg,175,macr,176,deg,177,plusmn,178,sup2,179,sup3,180,acute,181,micro,182,para,183,middot,184,cedil,185,sup1,186,ordm,187,raquo,188,frac14,189,frac12,190,frac34,191,iquest,192,Agrave,193,Aacute,194,Acirc,195,Atilde,196,Auml,197,Aring,198,AElig,199,Ccedil,200,Egrave,201,Eacute,202,Ecirc,203,Euml,204,Igrave,205,Iacute,206,Icirc,207,Iuml,208,ETH,209,Ntilde,210,Ograve,211,Oacute,212,Ocirc,213,Otilde,214,Ouml,215,times,216,Oslash,217,Ugrave,218,Uacute,219,Ucirc,220,Uuml,221,Yacute,222,THORN,223,szlig,224,agrave,225,aacute,226,acirc,227,atilde,228,auml,229,aring,230,aelig,231,ccedil,232,egrave,233,eacute,234,ecirc,235,euml,236,igrave,237,iacute,238,icirc,239,iuml,240,eth,241,ntilde,242,ograve,243,oacute,244,ocirc,245,otilde,246,ouml,247,divide,248,oslash,249,ugrave,250,uacute,251,ucirc,252,uuml,253,yacute,254,thorn,255,yuml,402,fnof,913,Alpha,914,Beta,915,Gamma,916,Delta,917,Epsilon,918,Zeta,919,Eta,920,Theta,921,Iota,922,Kappa,923,Lambda,924,Mu,925,Nu,926,Xi,927,Omicron,928,Pi,929,Rho,931,Sigma,932,Tau,933,Upsilon,934,Phi,935,Chi,936,Psi,937,Omega,945,alpha,946,beta,947,gamma,948,delta,949,epsilon,950,zeta,951,eta,952,theta,953,iota,954,kappa,955,lambda,956,mu,957,nu,958,xi,959,omicron,960,pi,961,rho,962,sigmaf,963,sigma,964,tau,965,upsilon,966,phi,967,chi,968,psi,969,omega,977,thetasym,978,upsih,982,piv,8226,bull,8230,hellip,8242,prime,8243,Prime,8254,oline,8260,frasl,8472,weierp,8465,image,8476,real,8482,trade,8501,alefsym,8592,larr,8593,uarr,8594,rarr,8595,darr,8596,harr,8629,crarr,8656,lArr,8657,uArr,8658,rArr,8659,dArr,8660,hArr,8704,forall,8706,part,8707,exist,8709,empty,8711,nabla,8712,isin,8713,notin,8715,ni,8719,prod,8721,sum,8722,minus,8727,lowast,8730,radic,8733,prop,8734,infin,8736,ang,8743,and,8744,or,8745,cap,8746,cup,8747,int,8756,there4,8764,sim,8773,cong,8776,asymp,8800,ne,8801,equiv,8804,le,8805,ge,8834,sub,8835,sup,8836,nsub,8838,sube,8839,supe,8853,oplus,8855,otimes,8869,perp,8901,sdot,8968,lceil,8969,rceil,8970,lfloor,8971,rfloor,9001,lang,9002,rang,9674,loz,9824,spades,9827,clubs,9829,hearts,9830,diams,34,quot,38,amp,60,lt,62,gt,338,OElig,339,oelig,352,Scaron,353,scaron,376,Yuml,710,circ,732,tilde,8194,ensp,8195,emsp,8201,thinsp,8204,zwnj,8205,zwj,8206,lrm,8207,rlm,8211,ndash,8212,mdash,8216,lsquo,8217,rsquo,8218,sbquo,8220,ldquo,8221,rdquo,8222,bdquo,8224,dagger,8225,Dagger,8240,permil,8249,lsaquo,8250,rsaquo,8364,euro", true);
		this._def("entity_encoding", "named");
		this._def("cleanup_callback", "");
		this._def("add_unload_trigger", true);
		this._def("ask", false);
		this._def("nowrap", false);
		this._def("auto_resize", false);
		this._def("auto_focus", false);
		this._def("cleanup", true);
		this._def("remove_linebreaks", true);
		this._def("button_tile_map", false);
		this._def("submit_patch", true);
		this._def("browsers", "msie,safari,gecko,opera", true);
		this._def("dialog_type", "window");
		this._def("accessibility_warnings", true);
		this._def("accessibility_focus", true);
		this._def("merge_styles_invalid_parents", "");
		this._def("force_hex_style_colors", true);
		this._def("trim_span_elements", true);
		this._def("convert_fonts_to_spans", false);
		this._def("doctype", '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">');
		this._def("font_size_classes", '');
		this._def("font_size_style_values", 'xx-small,x-small,small,medium,large,x-large,xx-large', true);
		this._def("event_elements", 'a,img', true);
		this._def("convert_urls", true);
		this._def("table_inline_editing", false);
		this._def("object_resizing", true);
		this._def("custom_shortcuts", true);
		this._def("convert_on_click", false);
		this._def("content_css", '');
		this._def("fix_list_elements", false);
		this._def("fix_table_elements", false);
		this._def("strict_loading_mode", document.contentType == 'application/xhtml+xml');
		this._def("hidden_tab_class", '');
		this._def("display_tab_class", '');

		// Force strict loading mode to false on non Gecko browsers
		if (this.isMSIE && !this.isOpera)
			this.settings.strict_loading_mode = false;

		// Browser check IE
		if (this.isMSIE && this.settings['browsers'].indexOf('msie') == -1)
			return;

		// Browser check Gecko
		if (this.isGecko && this.settings['browsers'].indexOf('gecko') == -1)
			return;

		// Browser check Safari
		if (this.isSafari && this.settings['browsers'].indexOf('safari') == -1)
			return;

		// Browser check Opera
		if (this.isOpera && this.settings['browsers'].indexOf('opera') == -1)
			return;

		// If not super absolute make it so
		baseHREF = tinyMCE.settings['document_base_url'];
		var h = document.location.href;
		var p = h.indexOf('://');
		if (p > 0 && document.location.protocol != "file:") {
			p = h.indexOf('/', p + 3);
			h = h.substring(0, p);

			if (baseHREF.indexOf('://') == -1)
				baseHREF = h + baseHREF;

			tinyMCE.settings['document_base_url'] = baseHREF;
			tinyMCE.settings['document_base_prefix'] = h;
		}

		// Trim away query part
		if (baseHREF.indexOf('?') != -1)
			baseHREF = baseHREF.substring(0, baseHREF.indexOf('?'));

		this.settings['base_href'] = baseHREF.substring(0, baseHREF.lastIndexOf('/')) + "/";

		theme = this.settings['theme'];
		this.inlineStrict = 'A|BR|SPAN|BDO|MAP|OBJECT|IMG|TT|I|B|BIG|SMALL|EM|STRONG|DFN|CODE|Q|SAMP|KBD|VAR|CITE|ABBR|ACRONYM|SUB|SUP|#text|#comment';
		this.inlineTransitional = 'A|BR|SPAN|BDO|OBJECT|APPLET|IMG|MAP|IFRAME|TT|I|B|U|S|STRIKE|BIG|SMALL|FONT|BASEFONT|EM|STRONG|DFN|CODE|Q|SAMP|KBD|VAR|CITE|ABBR|ACRONYM|SUB|SUP|INPUT|SELECT|TEXTAREA|LABEL|BUTTON|#text|#comment';
		this.blockElms = 'H[1-6]|P|DIV|ADDRESS|PRE|FORM|TABLE|LI|OL|UL|TD|BLOCKQUOTE|CENTER|DL|DT|DD|DIR|FIELDSET|FORM|NOSCRIPT|NOFRAMES|MENU|ISINDEX|SAMP';
		this.blockRegExp = new RegExp("^(" + this.blockElms + ")$", "i");
		this.posKeyCodes = new Array(13,45,36,35,33,34,37,38,39,40);
		this.uniqueURL = 'javascript:TINYMCE_UNIQUEURL();'; // Make unique URL non real URL
		this.uniqueTag = '<div id="mceTMPElement" style="display: none">TMP</div>';
		this.callbacks = new Array('onInit', 'getInfo', 'getEditorTemplate', 'setupContent', 'onChange', 'onPageLoad', 'handleNodeChange', 'initInstance', 'execCommand', 'getControlHTML', 'handleEvent', 'cleanup');

		// Theme url
		this.settings['theme_href'] = tinyMCE.baseURL + "/themes/" + theme;

		if (!tinyMCE.isMSIE)
			this.settings['force_br_newlines'] = false;

		if (tinyMCE.getParam("popups_css", false)) {
			var cssPath = tinyMCE.getParam("popups_css", "");

			// Is relative
			if (cssPath.indexOf('://') == -1 && cssPath.charAt(0) != '/')
				this.settings['popups_css'] = this.documentBasePath + "/" + cssPath;
			else
				this.settings['popups_css'] = cssPath;
		} else
			this.settings['popups_css'] = tinyMCE.baseURL + "/themes/" + theme + "/css/editor_popup.css";

		if (tinyMCE.getParam("editor_css", false)) {
			var cssPath = tinyMCE.getParam("editor_css", "");

			// Is relative
			if (cssPath.indexOf('://') == -1 && cssPath.charAt(0) != '/')
				this.settings['editor_css'] = this.documentBasePath + "/" + cssPath;
			else
				this.settings['editor_css'] = cssPath;
		} else
			this.settings['editor_css'] = tinyMCE.baseURL + "/themes/" + theme + "/css/editor_ui.css";

		if (tinyMCE.settings['debug']) {
			var msg = "Debug: \n";

			msg += "baseURL: " + this.baseURL + "\n";
			msg += "documentBasePath: " + this.documentBasePath + "\n";
			msg += "content_css: " + this.settings['content_css'] + "\n";
			msg += "popups_css: " + this.settings['popups_css'] + "\n";
			msg += "editor_css: " + this.settings['editor_css'] + "\n";

			alert(msg);
		}

		// Only do this once
		if (this.configs.length == 0) {
			if (typeof(TinyMCECompressed) == "undefined") {
				tinyMCE.addEvent(window, "DOMContentLoaded", TinyMCE_Engine.prototype.onLoad);

				if (tinyMCE.isMSIE && !tinyMCE.isOpera) {
					if (document.body)
						tinyMCE.addEvent(document.body, "readystatechange", TinyMCE_Engine.prototype.onLoad);
					else
						tinyMCE.addEvent(document, "readystatechange", TinyMCE_Engine.prototype.onLoad);
				}

				tinyMCE.addEvent(window, "load", TinyMCE_Engine.prototype.onLoad);
				tinyMCE._addUnloadEvents();
			}
		}

		this.loadScript(tinyMCE.baseURL + '/themes/' + this.settings['theme'] + '/editor_template' + tinyMCE.srcMode + '.js');
		this.loadScript(tinyMCE.baseURL + '/langs/' + this.settings['language'] +  '.js');
		this.loadCSS(this.settings['editor_css']);

		// Add plugins
		var p = tinyMCE.getParam('plugins', '', true, ',');
		if (p.length > 0) {
			for (var i=0; i<p.length; i++) {
				if (p[i].charAt(0) != '-')
					this.loadScript(tinyMCE.baseURL + '/plugins/' + p[i] + '/editor_plugin' + tinyMCE.srcMode + '.js');
			}
		}

		// Setup entities
		if (tinyMCE.getParam('entity_encoding') == 'named') {
			settings['cleanup_entities'] = new Array();
			var entities = tinyMCE.getParam('entities', '', true, ',');
			for (var i=0; i<entities.length; i+=2)
				settings['cleanup_entities']['c' + entities[i]] = entities[i+1];
		}

		// Save away this config
		settings['index'] = this.configs.length;
		this.configs[this.configs.length] = settings;

		// Start loading first one in chain
		this.loadNextScript();
	},

	/**
	 * Adds unload event handles to execute triggerSave.
	 *
	 * @private
	 */
	_addUnloadEvents : function() {
		if (tinyMCE.isMSIE) {
			if (tinyMCE.settings['add_unload_trigger']) {
				tinyMCE.addEvent(window, "unload", TinyMCE_Engine.prototype.unloadHandler);
				tinyMCE.addEvent(window.document, "beforeunload", TinyMCE_Engine.prototype.unloadHandler);
			}
		} else {
			if (tinyMCE.settings['add_unload_trigger'])
				tinyMCE.addEvent(window, "unload", function () {tinyMCE.triggerSave(true, true);});
		}
	},

	/**
	 * Assigns a default value for a specific config parameter.
	 *
	 * @param {string} key Settings key to add default value to.
	 * @param {object} def_val Default value to assign if the settings option isn't defined.
	 * @param {boolean} t Trim all white space, if true all whitespace will be removed from option value.
	 * @private
	 */
	_def : function(key, def_val, t) {
		var v = tinyMCE.getParam(key, def_val);

		v = t ? v.replace(/\s+/g, "") : v;

		this.settings[key] = v;
	},

	/**
	 * Returns true/false if the specified plugin is loaded or not.
	 *
	 * @param {string} n Plugin name to look for.
	 * @return true/false if the specified plugin is loaded or not.
	 * @type boolean
	 */
	hasPlugin : function(n) {
		return typeof(this.plugins[n]) != "undefined" && this.plugins[n] != null;
	},

	/**
	 * Adds the specified plugin to the list of loaded plugins, this will also setup the baseURL
	 * property of the plugin.
	 *
	 * @param {string} Plugin name/id.
	 * @param {TinyMCE_Plugin} p Plugin instance to add.
	 */
	addPlugin : function(n, p) {
		var op = this.plugins[n];

		// Use the previous plugin object base URL used when loading external plugins
		p.baseURL = op ? op.baseURL : tinyMCE.baseURL + "/plugins/" + n;
		this.plugins[n] = p;

		this.loadNextScript();
	},

	/**
	 * Sets the baseURL of the specified plugin, this is useful if the plugin is loaded from
	 * a external location.
	 *
	 * @param {string} n Plugin name/id to set base URL on. This have to be added before.
	 * @param {string} u Base URL of plugin, this string should be the URL prefix for the plugin without a trailing slash.
	 */
	setPluginBaseURL : function(n, u) {
		var op = this.plugins[n];

		if (op)
			op.baseURL = u;
		else
			this.plugins[n] = {baseURL : u};
	},

	/**
	 * Load plugin from external URL.
	 *
	 * @param {string} n Plugin name for example \"emotions\".
	 * @param {string} u URL of plugin directory to load.
	 */
	loadPlugin : function(n, u) {
		u = u.indexOf('.js') != -1 ? u.substring(0, u.lastIndexOf('/')) : u;
		u = u.charAt(u.length-1) == '/' ? u.substring(0, u.length-1) : u;
		this.plugins[n] = {baseURL : u};
		this.loadScript(u + "/editor_plugin" + (tinyMCE.srcMode ? '_src' : '') + ".js");
	},

	/**
	 * Returns true/false if the specified theme is loaded or not.
	 *
	 * @param {string} n Theme name/id to check for.
	 * @return true/false if the specified theme is loaded or not.
	 * @type boolean
	 */
	hasTheme : function(n) {
		return typeof(this.themes[n]) != "undefined" && this.themes[n] != null;
	},

	/**
	 * Adds the specified theme in to the list of loaded themes.
	 *
	 * @param {string} n Theme name/id to add the object reference to.
	 * @param {TinyMCE_Theme} t Theme instance to add to the loaded list.
	 */
	addTheme : function(n, t) {
		this.themes[n] = t;

		this.loadNextScript();
	},

	/**
	 * Adds a floating menu instance to TinyMCE.
	 *
	 * @param {string} n TinyMCE menu id.
	 * @param {TinyMCE_Menu} m TinyMCE menu instance.
	 */
	addMenu : function(n, m) {
		this.menus[n] = m;
	},

	/**
	 * Checks if the specified menu by name is added to TinyMCE.
	 *
	 * @param {string} n TinyMCE menu id.
	 * @return true/false if it exists or not.
	 * @type boolean
	 */
	hasMenu : function(n) {
		return typeof(this.plugins[n]) != "undefined" && this.plugins[n] != null;
	},

	/**
	 * Loads the specified script by writing the a script tag to the current page.
	 * This will also check if the file has been loaded before. This function should only be used
	 * when the page is loading.
	 *
	 * @param {string} url Script URL to load.
	 */
	loadScript : function(url) {
		var i;

		for (i=0; i<this.loadedFiles.length; i++) {
			if (this.loadedFiles[i] == url)
				return;
		}

		if (tinyMCE.settings.strict_loading_mode)
			this.pendingFiles[this.pendingFiles.length] = url;
		else
			document.write('<sc'+'ript language="javascript" type="text/javascript" src="' + url + '"></script>');

		this.loadedFiles[this.loadedFiles.length] = url;
	},

	/**
	 * Loads the next script in chain.
	 */
	loadNextScript : function() {
		var d = document, se;

		if (!tinyMCE.settings.strict_loading_mode)
			return;

		if (this.loadingIndex < this.pendingFiles.length) {
			se = d.createElementNS('http://www.w3.org/1999/xhtml', 'script');
			se.setAttribute('language', 'javascript');
			se.setAttribute('type', 'text/javascript');
			se.setAttribute('src', this.pendingFiles[this.loadingIndex++]);

			d.getElementsByTagName("head")[0].appendChild(se);
		} else
			this.loadingIndex = -1; // Done with loading
	},

	/**
	 * Loads the specified CSS by writing the a link tag to the current page.
	 * This will also check if the file has been loaded before. This function should only be used
	 * when the page is loading.
	 *
	 * @param {string} url CSS file URL to load or comma separated list of files.
	 */
	loadCSS : function(url) {
		var ar = url.replace(/\s+/, '').split(',');
		var lflen = 0, csslen = 0;
		var skip = false;
		var x = 0, i = 0, nl, le;

		for (x = 0,csslen = ar.length; x<csslen; x++) {
			if (ar[x] != null && ar[x] != 'null' && ar[x].length > 0) {
				/* Make sure it doesn't exist. */
				for (i=0, lflen=this.loadedFiles.length; i<lflen; i++) {
					if (this.loadedFiles[i] == ar[x]) {
						skip = true;
						break;
					}
				}

				if (!skip) {
					if (tinyMCE.settings.strict_loading_mode) {
						nl = document.getElementsByTagName("head");

						le = document.createElement('link');
						le.setAttribute('href', ar[x]);
						le.setAttribute('rel', 'stylesheet');
						le.setAttribute('type', 'text/css');

						nl[0].appendChild(le);			
					} else
						document.write('<link href="' + ar[x] + '" rel="stylesheet" type="text/css" />');

					this.loadedFiles[this.loadedFiles.length] = ar[x];
				}
			}
		}
	},

	/**
	 * Imports a CSS file into a allready loaded document. This will add a link element
	 * to the head element of the document.
	 *
	 * @param {DOMDocument} doc DOM Document to load CSS into.
	 * @param {string} css CSS File URL to load or comma separated list of files.
	 */
	importCSS : function(doc, css) {
		var css_ary = css.replace(/\s+/, '').split(',');
		var csslen, elm, headArr, x, css_file;

		for (x = 0, csslen = css_ary.length; x<csslen; x++) {
			css_file = css_ary[x];

			if (css_file != null && css_file != 'null' && css_file.length > 0) {
				// Is relative, make absolute
				if (css_file.indexOf('://') == -1 && css_file.charAt(0) != '/')
					css_file = this.documentBasePath + "/" + css_file;

				if (typeof(doc.createStyleSheet) == "undefined") {
					elm = doc.createElement("link");

					elm.rel = "stylesheet";
					elm.href = css_file;

					if ((headArr = doc.getElementsByTagName("head")) != null && headArr.length > 0)
						headArr[0].appendChild(elm);
				} else
					doc.createStyleSheet(css_file);
			}
		}
	},

	/**
	 * Displays a confirm dialog when a user clicks/focus a textarea that is to be converted into
	 * a TinyMCE instance.
	 *
	 * @param {DOMEvent} e DOM event instance.
	 * @param {Array} settings Name/Value array of initialization settings.
	 */
	confirmAdd : function(e, settings) {
		var elm = tinyMCE.isMSIE ? event.srcElement : e.target;
		var elementId = elm.name ? elm.name : elm.id;

		tinyMCE.settings = settings;

		if (tinyMCE.settings['convert_on_click'] || (!elm.getAttribute('mce_noask') && confirm(tinyMCELang['lang_edit_confirm'])))
			tinyMCE.addMCEControl(elm, elementId);

		elm.setAttribute('mce_noask', 'true');
	},

	/**
	 * Moves the contents from the hidden textarea to the editor that gets inserted.
	 *
	 * @param {string} form_element_name Form element name to move contents from.
	 * @deprecated
	 */
	updateContent : function(form_element_name) {
		// Find MCE instance linked to given form element and copy it's value
		var formElement = document.getElementById(form_element_name);
		for (var n in tinyMCE.instances) {
			var inst = tinyMCE.instances[n];
			if (!tinyMCE.isInstance(inst))
				continue;

			inst.switchSettings();

			if (inst.formElement == formElement) {
				var doc = inst.getDoc();
		
				tinyMCE._setHTML(doc, inst.formElement.value);

				if (!tinyMCE.isMSIE)
					doc.body.innerHTML = tinyMCE._cleanupHTML(inst, doc, this.settings, doc.body, inst.visualAid);
			}
		}
	},

	/**
	 * Adds a TinyMCE editor control instance to a specific form element.
	 *
	 * @param {HTMLElement} replace_element HTML element object to replace.
	 * @param {string} form_element_name HTML form element name,
	 * @param {DOMDocument} target_document Target document that holds the element.
	 */
	addMCEControl : function(replace_element, form_element_name, target_document) {
		var id = "mce_editor_" + tinyMCE.idCounter++;
		var inst = new TinyMCE_Control(tinyMCE.settings);

		inst.editorId = id;
		this.instances[id] = inst;

		inst._onAdd(replace_element, form_element_name, target_document);
	},

	/**
	 * Removes the specified instance from TinyMCE Engine.
	 *
	 * @param {MCEControl} ti Target instance to remove from TinyMCE.
	 * @return Removed MCEControl instance.
	 * @type MCEControl
	 */
	removeInstance : function(ti) {
		var t = new Array(), n, i;

		for (n in tinyMCE.instances) {
			i = tinyMCE.instances[n];

			if (tinyMCE.isInstance(i) && ti != i)
					t[n] = i;
		}

		tinyMCE.instances = t;

		return ti;
	},

	/**
	 * Removes a TinyMCE editor control instance by id.
	 *
	 * @param {string} editor_id Id of editor instance to remove.
	 */
	removeMCEControl : function(editor_id) {
		var inst = tinyMCE.getInstanceById(editor_id), h, re, ot, tn;

		if (inst) {
			inst.switchSettings();

			editor_id = inst.editorId;
			h = tinyMCE.getContent(editor_id);

			this.removeInstance(inst);

			tinyMCE.selectedElement = null;
			tinyMCE.selectedInstance = null;

			// Remove element
			re = document.getElementById(editor_id + "_parent");
			ot = inst.oldTargetElement;
			tn = ot.nodeName.toLowerCase();

			if (tn == "textarea" || tn == "input") {
				re.parentNode.removeChild(re);
				ot.style.display = "inline";
				ot.value = h;
			} else {
				ot.innerHTML = h;
				ot.style.display = 'block';
				re.parentNode.insertBefore(ot, re);
				re.parentNode.removeChild(re);
			}
		}
	},

	/**
	 * Moves the contents from a TinyMCE editor control instance to the hidden textarea
	 * that got replaced with TinyMCE. This is executed automaticly on for example form submit.
	 *
	 * @param {boolean} skip_cleanup Optional Skip cleanup, simply move the contents as fast as possible.
	 * @param {boolean} skip_callback Optional Skip callback, don't call the save_callback function.
	 */
	triggerSave : function(skip_cleanup, skip_callback) {
		var inst, n;

		// Default to false
		if (typeof(skip_cleanup) == "undefined")
			skip_cleanup = false;

		// Default to false
		if (typeof(skip_callback) == "undefined")
			skip_callback = false;

		// Cleanup and set all form fields
		for (n in tinyMCE.instances) {
			inst = tinyMCE.instances[n];

			if (!tinyMCE.isInstance(inst))
				continue;

			inst.triggerSave(skip_cleanup, skip_callback);
		}
	},

	/**
	 * Resets a forms TinyMCE instances based on form index.
	 *
	 * @param {int} form_index Form index to reset.
	 */
	resetForm : function(form_index) {
		var i, inst, n, formObj = document.forms[form_index];

		for (n in tinyMCE.instances) {
			inst = tinyMCE.instances[n];

			if (!tinyMCE.isInstance(inst))
				continue;

			inst.switchSettings();

			for (i=0; i<formObj.elements.length; i++) {
				if (inst.formTargetElementId == formObj.elements[i].name)
					inst.getBody().innerHTML = inst.startContent;
			}
		}
	},

	/**
	 * Executes a command on a specific editor instance by id.
	 *
	 * @param {string} editor_id TinyMCE editor control instance id to perform comman on.
	 * @param {string} command Command name to execute, for example mceLink or Bold.
	 * @param {boolean} user_interface True/false state if a UI (dialog) should be presented or not.
	 * @param {object} value Optional command value, this can be anything.
	 * @param {boolean} focus True/false if the editor instance should be focused first.
	 */
	execInstanceCommand : function(editor_id, command, user_interface, value, focus) {
		var inst = tinyMCE.getInstanceById(editor_id), r;

		if (inst) {
			r = inst.selection.getRng();

			if (typeof(focus) == "undefined")
				focus = true;

			// IE bug lost focus on images in absolute divs Bug #1534575
			if (focus && (!r || !r.item))
				inst.contentWindow.focus();

			// Reset design mode if lost
			inst.autoResetDesignMode();

			this.selectedElement = inst.getFocusElement();
			inst.select();
			tinyMCE.execCommand(command, user_interface, value);

			// Cancel event so it doesn't call onbeforeonunlaod
			if (tinyMCE.isMSIE && window.event != null)
				tinyMCE.cancelEvent(window.event);
		}
	},

	/**
	 * Executes a command on the selected or last selected TinyMCE editor control instance. This function also handles
	 * some non instance specific commands like mceAddControl, mceRemoveControl, mceHelp or mceFocus.
	 *
	 * @param {string} command Command name to execute, for example mceLink or Bold.
	 * @param {boolean} user_interface True/false state if a UI (dialog) should be presented or not.
	 * @param {object} value Optional command value, this can be anything.
	 */
	execCommand : function(command, user_interface, value) {
		// Default input
		user_interface = user_interface ? user_interface : false;
		value = value ? value : null;

		if (tinyMCE.selectedInstance)
			tinyMCE.selectedInstance.switchSettings();

		switch (command) {
			case 'mceFocus':
				var inst = tinyMCE.getInstanceById(value);
				if (inst)
					inst.contentWindow.focus();
			return;

			case "mceAddControl":
			case "mceAddEditor":
				tinyMCE.addMCEControl(tinyMCE._getElementById(value), value);
				return;

			case "mceAddFrameControl":
				tinyMCE.addMCEControl(tinyMCE._getElementById(value['element'], value['document']), value['element'], value['document']);
				return;

			case "mceRemoveControl":
			case "mceRemoveEditor":
				tinyMCE.removeMCEControl(value);
				return;

			case "mceResetDesignMode":
				// Resets the designmode state of the editors in Gecko
				if (!tinyMCE.isMSIE) {
					for (var n in tinyMCE.instances) {
						if (!tinyMCE.isInstance(tinyMCE.instances[n]))
							continue;

						try {
							tinyMCE.instances[n].getDoc().designMode = "on";
						} catch (e) {
							// Ignore any errors
						}
					}
				}

				return;
		}

		if (this.selectedInstance) {
			this.selectedInstance.execCommand(command, user_interface, value);
		} else if (tinyMCE.settings['focus_alert'])
			alert(tinyMCELang['lang_focus_alert']);
	},

	/**
	 * Creates a iframe editor container for the specified element.
	 *
	 * @param {HTMLElement} replace_element Element to replace with iframe element.
	 * @param {DOMDocument} doc Optional document to use with iframe replacement.
	 * @param {DOMWindow} win Optional window to use with iframe replacement.
	 * @private
	 */
	_createIFrame : function(replace_element, doc, win) {
		var iframe, id = replace_element.getAttribute("id");
		var aw, ah;

		if (typeof(doc) == "undefined")
			doc = document;

		if (typeof(win) == "undefined")
			win = window;

		iframe = doc.createElement("iframe");

		aw = "" + tinyMCE.settings['area_width'];
		ah = "" + tinyMCE.settings['area_height'];

		if (aw.indexOf('%') == -1) {
			aw = parseInt(aw);
			aw = aw < 0 ? 300 : aw;
			aw = aw + "px";
		}

		if (ah.indexOf('%') == -1) {
			ah = parseInt(ah);
			ah = ah < 0 ? 240 : ah;
			ah = ah + "px";
		}

		iframe.setAttribute("id", id);
		iframe.setAttribute("class", "mceEditorIframe");
		iframe.setAttribute("border", "0");
		iframe.setAttribute("frameBorder", "0");
		iframe.setAttribute("marginWidth", "0");
		iframe.setAttribute("marginHeight", "0");
		iframe.setAttribute("leftMargin", "0");
		iframe.setAttribute("topMargin", "0");
		iframe.setAttribute("width", aw);
		iframe.setAttribute("height", ah);
		iframe.setAttribute("allowtransparency", "true");
		iframe.className = 'mceEditorIframe';

		if (tinyMCE.settings["auto_resize"])
			iframe.setAttribute("scrolling", "no");

		// Must have a src element in MSIE HTTPs breaks aswell as absoute URLs
		if (tinyMCE.isMSIE && !tinyMCE.isOpera)
			iframe.setAttribute("src", this.settings['default_document']);

		iframe.style.width = aw;
		iframe.style.height = ah;

		// Ugly hack for Gecko problem in strict mode
		if (tinyMCE.settings.strict_loading_mode)
			iframe.style.marginBottom = '-5px';

		// MSIE 5.0 issue
		if (tinyMCE.isMSIE && !tinyMCE.isOpera)
			replace_element.outerHTML = iframe.outerHTML;
		else
			replace_element.parentNode.replaceChild(iframe, replace_element);

		if (tinyMCE.isMSIE && !tinyMCE.isOpera)
			return win.frames[id];
		else
			return iframe;
	},

	/**
	 * Setups the contents of TinyMCE editor instance and fills it with contents.
	 *
	 * @param {string} editor_id TinyMCE editor instance control id to fill.
	 */
	setupContent : function(editor_id) {
		var inst = tinyMCE.instances[editor_id];
		var doc = inst.getDoc();
		var head = doc.getElementsByTagName('head').item(0);
		var content = inst.startContent;

		// HTML values get XML encoded in strict mode
		if (tinyMCE.settings.strict_loading_mode) {
			content = content.replace(/&lt;/g, '<');
			content = content.replace(/&gt;/g, '>');
			content = content.replace(/&quot;/g, '"');
			content = content.replace(/&amp;/g, '&');
		}

		inst.switchSettings();

		// Not loaded correctly hit it again, Mozilla bug #997860
		if (!tinyMCE.isMSIE && tinyMCE.getParam("setupcontent_reload", false) && doc.title != "blank_page") {
			// This part will remove the designMode status
			// Failes first time in Firefox 1.5b2 on Mac
			try {doc.location.href = tinyMCE.baseURL + "/blank.htm";} catch (ex) {}
			window.setTimeout("tinyMCE.setupContent('" + editor_id + "');", 1000);
			return;
		}

		if (!head) {
			window.setTimeout("tinyMCE.setupContent('" + editor_id + "');", 10);
			return;
		}

		// Import theme specific content CSS the user specific
		tinyMCE.importCSS(inst.getDoc(), tinyMCE.baseURL + "/themes/" + inst.settings['theme'] + "/css/editor_content.css");
		tinyMCE.importCSS(inst.getDoc(), inst.settings['content_css']);
		tinyMCE.dispatchCallback(inst, 'init_instance_callback', 'initInstance', inst);

		// Setup keyboard shortcuts
		if (tinyMCE.getParam('custom_undo_redo_keyboard_shortcuts')) {
			inst.addShortcut('ctrl', 'z', 'lang_undo_desc', 'Undo');
			inst.addShortcut('ctrl', 'y', 'lang_redo_desc', 'Redo');
		}

		// Add default shortcuts for gecko
		if (tinyMCE.isGecko) {
			inst.addShortcut('ctrl', 'b', 'lang_bold_desc', 'Bold');
			inst.addShortcut('ctrl', 'i', 'lang_italic_desc', 'Italic');
			inst.addShortcut('ctrl', 'u', 'lang_underline_desc', 'Underline');
		}

		// Setup span styles
		if (tinyMCE.getParam("convert_fonts_to_spans"))
			inst.getBody().setAttribute('id', 'mceSpanFonts');

		if (tinyMCE.settings['nowrap'])
			doc.body.style.whiteSpace = "nowrap";

		doc.body.dir = this.settings['directionality'];
		doc.editorId = editor_id;

		// Add on document element in Mozilla
		if (!tinyMCE.isMSIE)
			doc.documentElement.editorId = editor_id;

		inst.setBaseHREF(tinyMCE.settings['base_href']);

		// Replace new line characters to BRs
		if (tinyMCE.settings['convert_newlines_to_brs']) {
			content = tinyMCE.regexpReplace(content, "\r\n", "<br />", "gi");
			content = tinyMCE.regexpReplace(content, "\r", "<br />", "gi");
			content = tinyMCE.regexpReplace(content, "\n", "<br />", "gi");
		}

		// Open closed anchors
	//	content = content.replace(new RegExp('<a(.*?)/>', 'gi'), '<a$1></a>');

		// Call custom cleanup code
		content = tinyMCE.storeAwayURLs(content);
		content = tinyMCE._customCleanup(inst, "insert_to_editor", content);

		if (tinyMCE.isMSIE) {
			// Ugly!!!
			window.setInterval('try{tinyMCE.getCSSClasses(tinyMCE.instances["' + editor_id + '"].getDoc(), "' + editor_id + '");}catch(e){}', 500);

			if (tinyMCE.settings["force_br_newlines"])
				doc.styleSheets[0].addRule("p", "margin: 0;");

			var body = inst.getBody();
			body.editorId = editor_id;
		}

		content = tinyMCE.cleanupHTMLCode(content);

		// Fix for bug #958637
		if (!tinyMCE.isMSIE) {
			var contentElement = inst.getDoc().createElement("body");
			var doc = inst.getDoc();

			contentElement.innerHTML = content;

			// Remove weridness!
			if (tinyMCE.isGecko && tinyMCE.settings['remove_lt_gt'])
				content = content.replace(new RegExp('&lt;&gt;', 'g'), "");

			if (tinyMCE.settings['cleanup_on_startup'])
				tinyMCE.setInnerHTML(inst.getBody(), tinyMCE._cleanupHTML(inst, doc, this.settings, contentElement));
			else {
				// Convert all strong/em to b/i
				content = tinyMCE.regexpReplace(content, "<strong", "<b", "gi");
				content = tinyMCE.regexpReplace(content, "<em(/?)>", "<i$1>", "gi");
				content = tinyMCE.regexpReplace(content, "<em ", "<i ", "gi");
				content = tinyMCE.regexpReplace(content, "</strong>", "</b>", "gi");
				content = tinyMCE.regexpReplace(content, "</em>", "</i>", "gi");
				tinyMCE.setInnerHTML(inst.getBody(), content);
			}

			tinyMCE.convertAllRelativeURLs(inst.getBody());
		} else {
			if (tinyMCE.settings['cleanup_on_startup']) {
				tinyMCE._setHTML(inst.getDoc(), content);

				// Produces permission denied error in MSIE 5.5
				eval('try {tinyMCE.setInnerHTML(inst.getBody(), tinyMCE._cleanupHTML(inst, inst.contentDocument, this.settings, inst.getBody()));} catch(e) {}');
			} else
				tinyMCE._setHTML(inst.getDoc(), content);
		}

		// Fix for bug #957681
		//inst.getDoc().designMode = inst.getDoc().designMode;

		// Setup element references
		var parentElm = inst.targetDoc.getElementById(inst.editorId + '_parent');
		inst.formElement = tinyMCE.isGecko ? parentElm.previousSibling : parentElm.nextSibling;

		tinyMCE.handleVisualAid(inst.getBody(), true, tinyMCE.settings['visual'], inst);
		tinyMCE.dispatchCallback(inst, 'setupcontent_callback', 'setupContent', editor_id, inst.getBody(), inst.getDoc());

		// Re-add design mode on mozilla
		if (!tinyMCE.isMSIE)
			tinyMCE.addEventHandlers(inst);

		// Add blur handler
		if (tinyMCE.isMSIE) {
			tinyMCE.addEvent(inst.getBody(), "blur", TinyMCE_Engine.prototype._eventPatch);
			tinyMCE.addEvent(inst.getBody(), "beforedeactivate", TinyMCE_Engine.prototype._eventPatch); // Bug #1439953

			// Workaround for drag drop/copy paste base href bug
			if (!tinyMCE.isOpera) {
				tinyMCE.addEvent(doc.body, "mousemove", TinyMCE_Engine.prototype.onMouseMove);
				tinyMCE.addEvent(doc.body, "beforepaste", TinyMCE_Engine.prototype._eventPatch);
				tinyMCE.addEvent(doc.body, "drop", TinyMCE_Engine.prototype._eventPatch);
			}
		}

		// Trigger node change, this call locks buttons for tables and so forth
		inst.select();
		tinyMCE.selectedElement = inst.contentWindow.document.body;

		// Call custom DOM cleanup
		tinyMCE._customCleanup(inst, "insert_to_editor_dom", inst.getBody());
		tinyMCE._customCleanup(inst, "setup_content_dom", inst.getBody());
		tinyMCE._setEventsEnabled(inst.getBody(), false);
		tinyMCE.cleanupAnchors(inst.getDoc());

		if (tinyMCE.getParam("convert_fonts_to_spans"))
			tinyMCE.convertSpansToFonts(inst.getDoc());

		inst.startContent = tinyMCE.trim(inst.getBody().innerHTML);
		inst.undoRedo.add({ content : inst.startContent });

		// Cleanup any mess left from storyAwayURLs
		if (tinyMCE.isGecko) {
			// Remove mce_src from textnodes and comments
			tinyMCE.selectNodes(inst.getBody(), function(n) {
				if (n.nodeType == 3 || n.nodeType == 8)
					n.nodeValue = n.nodeValue.replace(new RegExp('\\s(mce_src|mce_href)=\"[^\"]*\"', 'gi'), "");

				return false;
			});
		}

		// Cleanup any mess left from storyAwayURLs
		tinyMCE._removeInternal(inst.getBody());

		inst.select();
		tinyMCE.triggerNodeChange(false, true);
	},

	/**
	 * Stores away the src and href attribute values in separate mce_src and mce_href attributes.
	 * This is needed since both MSIE and Gecko messes with these attributes. The old
	 * src and href will be intact, this simply adds them to a separate attribute.
	 *
	 * @param {string} s HTML string to replace src and href attributes in.
	 * @return HTML string with replaced src and href attributes.
	 * @type string
	 */
	storeAwayURLs : function(s) {
		// Remove all mce_src, mce_href and replace them with new ones
	//	s = s.replace(new RegExp('mce_src\\s*=\\s*\"[^ >\"]*\"', 'gi'), '');
	//	s = s.replace(new RegExp('mce_href\\s*=\\s*\"[^ >\"]*\"', 'gi'), '');

		if (!s.match(/(mce_src|mce_href)/gi, s)) {
			s = s.replace(new RegExp('src\\s*=\\s*\"([^ >\"]*)\"', 'gi'), 'src="$1" mce_src="$1"');
			s = s.replace(new RegExp('href\\s*=\\s*\"([^ >\"]*)\"', 'gi'), 'href="$1" mce_href="$1"');
		}

		return s;
	},

	/**
	 * Removes any internal content inserted by regexps.
	 *
	 * @param {DOMNode} n Node to remove internal content from.
	 */
	_removeInternal : function(n) {
		if (tinyMCE.isGecko) {
			// Remove mce_src from textnodes and comments
			tinyMCE.selectNodes(n, function(n) {
				if (n.nodeType == 3 || n.nodeType == 8)
					n.nodeValue = n.nodeValue.replace(new RegExp('\\s(mce_src|mce_href)=\"[^\"]*\"', 'gi'), "");

				return false;
			});
		}
	},

	/**
	 * Removes/disables TinyMCE built in form elements such as select boxes for font sizes etc.
	 * These are disabled when the user submits a form so they don't get picked up by the backend script
	 * that intercepts the contents.
	 *
	 * @param {HTMLElement} form_obj Form object to loop through for TinyMCE specific form elements.
	 */
	removeTinyMCEFormElements : function(form_obj) {
		// Check if form is valid
		if (typeof(form_obj) == "undefined" || form_obj == null)
			return;

		// If not a form, find the form
		if (form_obj.nodeName != "FORM") {
			if (form_obj.form)
				form_obj = form_obj.form;
			else
				form_obj = tinyMCE.getParentElement(form_obj, "form");
		}

		// Still nothing
		if (form_obj == null)
			return;

		// Disable all UI form elements that TinyMCE created
		for (var i=0; i<form_obj.elements.length; i++) {
			var elementId = form_obj.elements[i].name ? form_obj.elements[i].name : form_obj.elements[i].id;

			if (elementId.indexOf('mce_editor_') == 0)
				form_obj.elements[i].disabled = true;
		}
	},

	/**
	 * Event handler function that gets executed each time a event occurs in a TinyMCE editor control instance.
	 * Todo: Fix the return statements so they return true or false.
	 *
	 * @param {DOMEvent} e DOM event object reference.
	 * @return true - if the event is to be chained, false - if the event chain is to be canceled.
	 * @type boolean
	 */
	handleEvent : function(e) {
		var inst = tinyMCE.selectedInstance;

		// Remove odd, error
		if (typeof(tinyMCE) == "undefined")
			return true;

		//tinyMCE.debug(e.type + " " + e.target.nodeName + " " + (e.relatedTarget ? e.relatedTarget.nodeName : ""));

		if (tinyMCE.executeCallback(tinyMCE.selectedInstance, 'handle_event_callback', 'handleEvent', e))
			return false;

		switch (e.type) {
			case "beforedeactivate": // Was added due to bug #1439953
			case "blur":
				if (tinyMCE.selectedInstance)
					tinyMCE.selectedInstance.execCommand('mceEndTyping');

				tinyMCE.hideMenus();

				return;

			// Workaround for drag drop/copy paste base href bug
			case "drop":
			case "beforepaste":
				if (tinyMCE.selectedInstance)
					tinyMCE.selectedInstance.setBaseHREF(null);

				// Fixes odd MSIE bug where drag/droping elements in a iframe with height 100% breaks
				// This logic forces the width/height to be in pixels while the user is drag/dropping
				if (tinyMCE.isMSIE && !tinyMCE.isOpera) {
					var ife = tinyMCE.selectedInstance.iframeElement;

					/*if (ife.style.width.indexOf('%') != -1) {
						ife._oldWidth = ife.width.height;
						ife.style.width = ife.clientWidth;
					}*/

					if (ife.style.height.indexOf('%') != -1) {
						ife._oldHeight = ife.style.height;
						ife.style.height = ife.clientHeight;
					}
				}

				window.setTimeout("tinyMCE.selectedInstance.setBaseHREF(tinyMCE.settings['base_href']);tinyMCE._resetIframeHeight();", 1);
				return;

			case "submit":
				tinyMCE.removeTinyMCEFormElements(tinyMCE.isMSIE ? window.event.srcElement : e.target);
				tinyMCE.triggerSave();
				tinyMCE.isNotDirty = true;
				return;

			case "reset":
				var formObj = tinyMCE.isMSIE ? window.event.srcElement : e.target;

				for (var i=0; i<document.forms.length; i++) {
					if (document.forms[i] == formObj)
						window.setTimeout('tinyMCE.resetForm(' + i + ');', 10);
				}

				return;

			case "keypress":
				if (inst && inst.handleShortcut(e))
					return false;

				if (e.target.editorId) {
					tinyMCE.instances[e.target.editorId].select();
				} else {
					if (e.target.ownerDocument.editorId)
						tinyMCE.instances[e.target.ownerDocument.editorId].select();
				}

				if (tinyMCE.selectedInstance)
					tinyMCE.selectedInstance.switchSettings();

				// Insert P element
				if ((tinyMCE.isGecko || tinyMCE.isOpera || tinyMCE.isSafari) && tinyMCE.settings['force_p_newlines'] && e.keyCode == 13 && !e.shiftKey) {
					// Insert P element instead of BR
					if (TinyMCE_ForceParagraphs._insertPara(tinyMCE.selectedInstance, e)) {
						// Cancel event
						tinyMCE.execCommand("mceAddUndoLevel");
						return tinyMCE.cancelEvent(e);
					}
				}

				// Handle backspace
				if ((tinyMCE.isGecko && !tinyMCE.isSafari) && tinyMCE.settings['force_p_newlines'] && (e.keyCode == 8 || e.keyCode == 46) && !e.shiftKey) {
					// Insert P element instead of BR
					if (TinyMCE_ForceParagraphs._handleBackSpace(tinyMCE.selectedInstance, e.type)) {
						// Cancel event
						tinyMCE.execCommand("mceAddUndoLevel");
						return tinyMCE.cancelEvent(e);
					}
				}

				// Return key pressed
				if (tinyMCE.isMSIE && tinyMCE.settings['force_br_newlines'] && e.keyCode == 13) {
					if (e.target.editorId)
						tinyMCE.instances[e.target.editorId].select();

					if (tinyMCE.selectedInstance) {
						var sel = tinyMCE.selectedInstance.getDoc().selection;
						var rng = sel.createRange();

						if (tinyMCE.getParentElement(rng.parentElement(), "li") != null)
							return false;

						// Cancel event
						e.returnValue = false;
						e.cancelBubble = true;

						// Insert BR element
						rng.pasteHTML("<br />");
						rng.collapse(false);
						rng.select();

						tinyMCE.execCommand("mceAddUndoLevel");
						tinyMCE.triggerNodeChange(false);
						return false;
					}
				}

				// Backspace or delete
				if (e.keyCode == 8 || e.keyCode == 46) {
					tinyMCE.selectedElement = e.target;
					tinyMCE.linkElement = tinyMCE.getParentElement(e.target, "a");
					tinyMCE.imgElement = tinyMCE.getParentElement(e.target, "img");
					tinyMCE.triggerNodeChange(false);
				}

				return false;
			break;

			case "keyup":
			case "keydown":
				tinyMCE.hideMenus();
				tinyMCE.hasMouseMoved = false;

				if (inst && inst.handleShortcut(e))
					return false;

				if (e.target.editorId)
					tinyMCE.instances[e.target.editorId].select();
				else
					return;

				if (tinyMCE.selectedInstance)
					tinyMCE.selectedInstance.switchSettings();

				var inst = tinyMCE.selectedInstance;

				// Handle backspace
				if (tinyMCE.isGecko && tinyMCE.settings['force_p_newlines'] && (e.keyCode == 8 || e.keyCode == 46) && !e.shiftKey) {
					// Insert P element instead of BR
					if (TinyMCE_ForceParagraphs._handleBackSpace(tinyMCE.selectedInstance, e.type)) {
						// Cancel event
						tinyMCE.execCommand("mceAddUndoLevel");
						e.preventDefault();
						return false;
					}
				}

				tinyMCE.selectedElement = null;
				tinyMCE.selectedNode = null;
				var elm = tinyMCE.selectedInstance.getFocusElement();
				tinyMCE.linkElement = tinyMCE.getParentElement(elm, "a");
				tinyMCE.imgElement = tinyMCE.getParentElement(elm, "img");
				tinyMCE.selectedElement = elm;

				// Update visualaids on tabs
				if (tinyMCE.isGecko && e.type == "keyup" && e.keyCode == 9)
					tinyMCE.handleVisualAid(tinyMCE.selectedInstance.getBody(), true, tinyMCE.settings['visual'], tinyMCE.selectedInstance);

				// Fix empty elements on return/enter, check where enter occured
				if (tinyMCE.isMSIE && e.type == "keydown" && e.keyCode == 13)
					tinyMCE.enterKeyElement = tinyMCE.selectedInstance.getFocusElement();

				// Fix empty elements on return/enter
				if (tinyMCE.isMSIE && e.type == "keyup" && e.keyCode == 13) {
					var elm = tinyMCE.enterKeyElement;
					if (elm) {
						var re = new RegExp('^HR|IMG|BR$','g'); // Skip these
						var dre = new RegExp('^H[1-6]$','g'); // Add double on these

						if (!elm.hasChildNodes() && !re.test(elm.nodeName)) {
							if (dre.test(elm.nodeName))
								elm.innerHTML = "&nbsp;&nbsp;";
							else
								elm.innerHTML = "&nbsp;";
						}
					}
				}

				// Check if it's a position key
				var keys = tinyMCE.posKeyCodes;
				var posKey = false;
				for (var i=0; i<keys.length; i++) {
					if (keys[i] == e.keyCode) {
						posKey = true;
						break;
					}
				}

				// MSIE custom key handling
				if (tinyMCE.isMSIE && tinyMCE.settings['custom_undo_redo']) {
					var keys = new Array(8,46); // Backspace,Delete

					for (var i=0; i<keys.length; i++) {
						if (keys[i] == e.keyCode) {
							if (e.type == "keyup")
								tinyMCE.triggerNodeChange(false);
						}
					}
				}

				// If Ctrl key
				if (e.keyCode == 17)
					return true;

				// Handle Undo/Redo when typing content

				// Start typing (non position key)
				if (!posKey && e.type == "keyup")
					tinyMCE.execCommand("mceStartTyping");

				// Store undo bookmark
				if (e.type == "keydown" && (posKey || e.ctrlKey) && inst)
					inst.undoBookmark = inst.selection.getBookmark();

				// End typing (position key) or some Ctrl event
				if (e.type == "keyup" && (posKey || e.ctrlKey))
					tinyMCE.execCommand("mceEndTyping");

				if (posKey && e.type == "keyup")
					tinyMCE.triggerNodeChange(false);

				if (tinyMCE.isMSIE && e.ctrlKey)
					window.setTimeout('tinyMCE.triggerNodeChange(false);', 1);
			break;

			case "mousedown":
			case "mouseup":
			case "click":
			case "focus":
				tinyMCE.hideMenus();

				if (tinyMCE.selectedInstance) {
					tinyMCE.selectedInstance.switchSettings();
					tinyMCE.selectedInstance.isFocused = true;
				}

				// Check instance event trigged on
				var targetBody = tinyMCE.getParentElement(e.target, "body");
				for (var instanceName in tinyMCE.instances) {
					if (!tinyMCE.isInstance(tinyMCE.instances[instanceName]))
						continue;

					var inst = tinyMCE.instances[instanceName];

					// Reset design mode if lost (on everything just in case)
					inst.autoResetDesignMode();

					if (inst.getBody() == targetBody) {
						inst.select();
						tinyMCE.selectedElement = e.target;
						tinyMCE.linkElement = tinyMCE.getParentElement(tinyMCE.selectedElement, "a");
						tinyMCE.imgElement = tinyMCE.getParentElement(tinyMCE.selectedElement, "img");
						break;
					}
				}

				// Add first bookmark location
				if (!tinyMCE.selectedInstance.undoRedo.undoLevels[0].bookmark)
					tinyMCE.selectedInstance.undoRedo.undoLevels[0].bookmark = tinyMCE.selectedInstance.selection.getBookmark();

				// Reset selected node
				if (e.type != "focus")
					tinyMCE.selectedNode = null;

				tinyMCE.triggerNodeChange(false);
				tinyMCE.execCommand("mceEndTyping");

				if (e.type == "mouseup")
					tinyMCE.execCommand("mceAddUndoLevel");

				// Just in case
				if (!tinyMCE.selectedInstance && e.target.editorId)
					tinyMCE.instances[e.target.editorId].select();

				return false;
			break;
		}
	},

	/**
	 * Returns the HTML code for a normal button control.
	 *
	 * @param {string} id Button control id, this will be the suffix for the element id, the prefix is the editor id.
	 * @param {string} lang Language variable key name to insert as the title/alt of the button image.
	 * @param {string} img Image URL to insert, {$themeurl} and {$pluginurl} will be replaced.
	 * @param {string} cmd Command to execute when the user clicks the button.
	 * @param {string} ui Optional user interface boolean for command.
	 * @param {string} val Optional value for command.
	 * @return HTML code for a normal button based in input information.
	 * @type string
	 */
	getButtonHTML : function(id, lang, img, cmd, ui, val) {
		var h = '', m, x;

		cmd = 'tinyMCE.execInstanceCommand(\'{$editor_id}\',\'' + cmd + '\'';

		if (typeof(ui) != "undefined" && ui != null)
			cmd += ',' + ui;

		if (typeof(val) != "undefined" && val != null)
			cmd += ",'" + val + "'";

		cmd += ');';

		// Use tilemaps when enabled and found and never in MSIE since it loads the tile each time from cache if cahce is disabled
		if (tinyMCE.getParam('button_tile_map') && (!tinyMCE.isMSIE || tinyMCE.isOpera) && (m = this.buttonMap[id]) != null && (tinyMCE.getParam("language") == "en" || img.indexOf('$lang') == -1)) {
			// Tiled button
			x = 0 - (m * 20) == 0 ? '0' : 0 - (m * 20);
			h += '<a id="{$editor_id}_' + id + '" href="javascript:' + cmd + '" onclick="' + cmd + 'return false;" onmousedown="return false;" class="mceTiledButton mceButtonNormal" target="_self">';
			h += '<img src="{$themeurl}/images/spacer.gif" style="background-position: ' + x + 'px 0" title="{$' + lang + '}" />';
			h += '</a>';
		} else {
			// Normal button
			h += '<a id="{$editor_id}_' + id + '" href="javascript:' + cmd + '" onclick="' + cmd + 'return false;" onmousedown="return false;" class="mceButtonNormal" target="_self">';
			h += '<img src="' + img + '" title="{$' + lang + '}" />';
			h += '</a>';
		}

		return h;
	},

	/**
	 * Returns the HTML code for a normal button control.
	 *
	 * @param {string} id Button control id, this will be the suffix for the element id, the prefix is the editor id.
	 * @param {string} lang Language variable key name to insert as the title/alt of the button image.
	 * @param {string} img Image URL to insert, {$themeurl} and {$pluginurl} will be replaced.
	 * @param {string} mcmd Command to execute when the user clicks the menu arrow button.
	 * @param {string} cmd Command to execute when the user clicks the main button.
	 * @param {string} ui Optional user interface boolean for command.
	 * @param {string} val Optional value for command.
	 * @return HTML code for a normal button based in input information.
	 * @type string
	 */
	getMenuButtonHTML : function(id, lang, img, mcmd, cmd, ui, val) {
		var h = '', m, x;

		mcmd = 'tinyMCE.execInstanceCommand(\'{$editor_id}\',\'' + mcmd + '\');';
		cmd = 'tinyMCE.execInstanceCommand(\'{$editor_id}\',\'' + cmd + '\'';

		if (typeof(ui) != "undefined" && ui != null)
			cmd += ',' + ui;

		if (typeof(val) != "undefined" && val != null)
			cmd += ",'" + val + "'";

		cmd += ');';

		// Use tilemaps when enabled and found and never in MSIE since it loads the tile each time from cache if cahce is disabled
		if (tinyMCE.getParam('button_tile_map') && (!tinyMCE.isMSIE || tinyMCE.isOpera) && (m = tinyMCE.buttonMap[id]) != null && (tinyMCE.getParam("language") == "en" || img.indexOf('$lang') == -1)) {
			x = 0 - (m * 20) == 0 ? '0' : 0 - (m * 20);

			if (tinyMCE.isMSIE && !tinyMCE.isOpera)
				h += '<span id="{$editor_id}_' + id + '" class="mceMenuButton" onmouseover="tinyMCE._menuButtonEvent(\'over\',this);" onmouseout="tinyMCE._menuButtonEvent(\'out\',this);">';
			else
				h += '<span id="{$editor_id}_' + id + '" class="mceMenuButton">';

			h += '<a href="javascript:' + cmd + '" onclick="' + cmd + 'return false;" onmousedown="return false;" class="mceTiledButton mceMenuButtonNormal" target="_self">';
			h += '<img src="{$themeurl}/images/spacer.gif" style="width: 20px; height: 20px; background-position: ' + x + 'px 0" title="{$' + lang + '}" /></a>';
			h += '<a href="javascript:' + mcmd + '" onclick="' + mcmd + 'return false;" onmousedown="return false;"><img src="{$themeurl}/images/button_menu.gif" title="{$' + lang + '}" class="mceMenuButton" />';
			h += '</a></span>';
		} else {
			if (tinyMCE.isMSIE && !tinyMCE.isOpera)
				h += '<span id="{$editor_id}_' + id + '" class="mceMenuButton" onmouseover="tinyMCE._menuButtonEvent(\'over\',this);" onmouseout="tinyMCE._menuButtonEvent(\'out\',this);">';
			else
				h += '<span id="{$editor_id}_' + id + '" class="mceMenuButton">';

			h += '<a href="javascript:' + cmd + '" onclick="' + cmd + 'return false;" onmousedown="return false;" class="mceMenuButtonNormal" target="_self">';
			h += '<img src="' + img + '" title="{$' + lang + '}" /></a>';
			h += '<a href="javascript:' + mcmd + '" onclick="' + mcmd + 'return false;" onmousedown="return false;"><img src="{$themeurl}/images/button_menu.gif" title="{$' + lang + '}" class="mceMenuButton" />';
			h += '</a></span>';
		}

		return h;
	},

	/**
	 * Switched classes on menu elements in MSIE.
	 *
	 * @param {string} e Event name	out, over.
	 * @param {HTMLElement} o HTML element to set class on.
	 */
	_menuButtonEvent : function(e, o) {
		if (o.className == 'mceMenuButtonFocus')
			return;

		if (e == 'over')
			o.className = o.className + ' mceMenuHover';
		else
			o.className = o.className.replace(/\s.*$/, '');
	},

	/**
	 * Adds a list of buttons available in the tiled button image used by the button_tile_map option.
	 *
	 * @param {string} m Comma separated list of buttons that are available in tiled image.
	 */
	addButtonMap : function(m) {
		var i, a = m.replace(/\s+/, '').split(',');

		for (i=0; i<a.length; i++)
			this.buttonMap[a[i]] = i;
	},

	/**
	 * Piggyback onsubmit event handler function, this will remove/hide the TinyMCE specific form elements
	 * call triggerSave to fill the textarea with the correct contents then call the old piggy backed event handler.
	 */
	submitPatch : function() {
		tinyMCE.removeTinyMCEFormElements(this);
		tinyMCE.triggerSave();
		tinyMCE.isNotDirty = true;
		this.mceOldSubmit();
	},

	/**
	 * Gets executed when the page loads or get intitialized. This function will then convert all textareas/divs that
	 * is to be converted into TinyMCE editor controls.
	 *
	 * @return true - if the event is to be chained, false - if the event chain is to be canceled.
	 * @type boolean
	 */
	onLoad : function() {
		// Wait for everything to be loaded first
		if (tinyMCE.settings.strict_loading_mode && this.loadingIndex != -1) {
			window.setTimeout('tinyMCE.onLoad();', 1);
			return;
		}

		if (tinyMCE.isMSIE && !tinyMCE.isOpera && window.event.type == "readystatechange" && document.readyState != "complete")
			return true;

		if (tinyMCE.isLoaded)
			return true;

		tinyMCE.isLoaded = true;

		tinyMCE.dispatchCallback(null, 'onpageload', 'onPageLoad');

		for (var c=0; c<tinyMCE.configs.length; c++) {
			tinyMCE.settings = tinyMCE.configs[c];

			var selector = tinyMCE.getParam("editor_selector");
			var deselector = tinyMCE.getParam("editor_deselector");
			var elementRefAr = new Array();

			// Add submit triggers
			if (document.forms && tinyMCE.settings['add_form_submit_trigger'] && !tinyMCE.submitTriggers) {
				for (var i=0; i<document.forms.length; i++) {
					var form = document.forms[i];

					tinyMCE.addEvent(form, "submit", TinyMCE_Engine.prototype.handleEvent);
					tinyMCE.addEvent(form, "reset", TinyMCE_Engine.prototype.handleEvent);
					tinyMCE.submitTriggers = true; // Do it only once

					// Patch the form.submit function
					if (tinyMCE.settings['submit_patch']) {
						try {
							form.mceOldSubmit = form.submit;
							form.submit = TinyMCE_Engine.prototype.submitPatch;
						} catch (e) {
							// Do nothing
						}
					}
				}
			}

			// Add editor instances based on mode
			var mode = tinyMCE.settings['mode'];
			switch (mode) {
				case "exact":
					var elements = tinyMCE.getParam('elements', '', true, ',');

					for (var i=0; i<elements.length; i++) {
						var element = tinyMCE._getElementById(elements[i]);
						var trigger = element ? element.getAttribute(tinyMCE.settings['textarea_trigger']) : "";

						if (new RegExp('\\b' + deselector + '\\b').test(tinyMCE.getAttrib(element, "class")))
							continue;

						if (trigger == "false")
							continue;

						if ((tinyMCE.settings['ask'] || tinyMCE.settings['convert_on_click']) && element) {
							elementRefAr[elementRefAr.length] = element;
							continue;
						}

						if (element)
							tinyMCE.addMCEControl(element, elements[i]);
						else if (tinyMCE.settings['debug'])
							alert("Error: Could not find element by id or name: " + elements[i]);
					}
				break;

				case "specific_textareas":
				case "textareas":
					var nodeList = document.getElementsByTagName("textarea");

					for (var i=0; i<nodeList.length; i++) {
						var elm = nodeList.item(i);
						var trigger = elm.getAttribute(tinyMCE.settings['textarea_trigger']);

						if (selector != '' && !new RegExp('\\b' + selector + '\\b').test(tinyMCE.getAttrib(elm, "class")))
							continue;

						if (selector != '')
							trigger = selector != "" ? "true" : "";

						if (new RegExp('\\b' + deselector + '\\b').test(tinyMCE.getAttrib(elm, "class")))
							continue;

						if ((mode == "specific_textareas" && trigger == "true") || (mode == "textareas" && trigger != "false"))
							elementRefAr[elementRefAr.length] = elm;
					}
				break;
			}

			for (var i=0; i<elementRefAr.length; i++) {
				var element = elementRefAr[i];
				var elementId = element.name ? element.name : element.id;

				if (tinyMCE.settings['ask'] || tinyMCE.settings['convert_on_click']) {
					// Focus breaks in Mozilla
					if (tinyMCE.isGecko) {
						var settings = tinyMCE.settings;

						tinyMCE.addEvent(element, "focus", function (e) {window.setTimeout(function() {TinyMCE_Engine.prototype.confirmAdd(e, settings);}, 10);});

						if (element.nodeName != "TEXTAREA" && element.nodeName != "INPUT")
							tinyMCE.addEvent(element, "click", function (e) {window.setTimeout(function() {TinyMCE_Engine.prototype.confirmAdd(e, settings);}, 10);});
						// tinyMCE.addEvent(element, "mouseover", function (e) {window.setTimeout(function() {TinyMCE_Engine.prototype.confirmAdd(e, settings);}, 10);});
					} else {
						var settings = tinyMCE.settings;

						tinyMCE.addEvent(element, "focus", function () { TinyMCE_Engine.prototype.confirmAdd(null, settings); });
						tinyMCE.addEvent(element, "click", function () { TinyMCE_Engine.prototype.confirmAdd(null, settings); });
						// tinyMCE.addEvent(element, "mouseenter", function () { TinyMCE_Engine.prototype.confirmAdd(null, settings); });
					}
				} else
					tinyMCE.addMCEControl(element, elementId);
			}

			// Handle auto focus
			if (tinyMCE.settings['auto_focus']) {
				window.setTimeout(function () {
					var inst = tinyMCE.getInstanceById(tinyMCE.settings['auto_focus']);
					inst.selection.selectNode(inst.getBody(), true, true);
					inst.contentWindow.focus();
				}, 10);
			}

			tinyMCE.dispatchCallback(null, 'oninit', 'onInit');
		}
	},

	/**
	 * Returns true/false if a specific object is a TinyMCE_Control instance or not.
	 *
	 * @param {object} o Object to check.
	 * @return true/false if it's a control or not.
	 * @type boolean
	 */
	isInstance : function(o) {
		return o != null && typeof(o) == "object" && o.isTinyMCE_Control;
	},

	/**
	 * Returns a specific configuration setting or the default value if it wasn't found.
	 *
	 * @param {string} name Configuration setting to get.
	 * @param {string} default_value Default value to return if it wasn't found.
	 * @param {boolean} strip_whitespace Optional remove all whitespace.
	 * @param {string} split_chr Split char/regex/string.
	 * @return Number, string or other object based in parameter and default_value.
	 * @type object
	 */
	getParam : function(name, default_value, strip_whitespace, split_chr) {
		var value = (typeof(this.settings[name]) == "undefined") ? default_value : this.settings[name];

		// Fix bool values
		if (value == "true" || value == "false")
			return (value == "true");

		if (strip_whitespace)
			value = tinyMCE.regexpReplace(value, "[ \t\r\n]", "");

		if (typeof(split_chr) != "undefined" && split_chr != null) {
			value = value.split(split_chr);
			var outArray = new Array();

			for (var i=0; i<value.length; i++) {
				if (value[i] && value[i] != "")
					outArray[outArray.length] = value[i];
			}

			value = outArray;
		}

		return value;
	},

	/**
	 * Returns a language variable value from the language packs.
	 *
	 * @param {string} name Name of the key to retrive.
	 * @param {string} default_value Optional default value to return if it wasn't found.
	 * @param {boolean} parse_entities Is HTML entities to be resolved or not.
	 * @param {Array} va Optional name/value array of variables to replace in language string.	 
	 * @return Language string value could be a number if it's a relative dimenstion.
	 * @type object
	 */
	getLang : function(name, default_value, parse_entities, va) {
		var v = (typeof(tinyMCELang[name]) == "undefined") ? default_value : tinyMCELang[name], n;

		if (parse_entities)
			v = tinyMCE.entityDecode(v);

		if (va) {
			for (n in va)
				v = this.replaceVar(v, n, va[n]);
		}

		return v;
	},

	/**
	 * HTML entity decode a string, replaces &lt; with <.
	 *
	 * @param {string} s Entity string to decode into normal string.
	 * @return Entity decoded string.
	 * @type string
	 */
	entityDecode : function(s) {
		var e = document.createElement("div");

		e.innerHTML = s;

		return e.firstChild.nodeValue;
	},

	/**
	 * Adds language items to the global language array.
	 *
	 * @param {string} prefix Prefix string to add infront of every array item before adding it.
	 * @param {Array} ar Language item array to add to global language array.
	 */
	addToLang : function(prefix, ar) {
		for (var key in ar) {
			if (typeof(ar[key]) == 'function')
				continue;

			tinyMCELang[(key.indexOf('lang_') == -1 ? 'lang_' : '') + (prefix != '' ? (prefix + "_") : '') + key] = ar[key];
		}

		this.loadNextScript();

	//	for (var key in ar)
	//		tinyMCELang[(key.indexOf('lang_') == -1 ? 'lang_' : '') + (prefix != '' ? (prefix + "_") : '') + key] = "|" + ar[key] + "|";
	},

	/**
	 * Triggers a nodeChange event to every theme and plugin. This will be executed when the cursor moves or
	 * when a command that modifies the editor contents is executed.
	 *
	 * @param {boolean} focus Optional state if the last selected editor instance is to be focused or not.
	 * @param {boolean} setup_content Optional state if it's called from setup content function or not.
	 */
	triggerNodeChange : function(focus, setup_content) {
		if (tinyMCE.selectedInstance) {
			var inst = tinyMCE.selectedInstance;
			var editorId = inst.editorId;
			var elm = (typeof(setup_content) != "undefined" && setup_content) ? tinyMCE.selectedElement : inst.getFocusElement();
			var undoIndex = -1, doc;
			var undoLevels = -1;
			var anySelection = false;
			var selectedText = inst.selection.getSelectedText();

			if (tinyMCE.settings.auto_resize)
				inst.resizeToContent();

			if (setup_content && tinyMCE.isGecko && inst.isHidden())
				elm = inst.getBody();

			inst.switchSettings();

			if (tinyMCE.selectedElement)
				anySelection = (tinyMCE.selectedElement.nodeName.toLowerCase() == "img") || (selectedText && selectedText.length > 0);

			if (tinyMCE.settings['custom_undo_redo']) {
				undoIndex = inst.undoRedo.undoIndex;
				undoLevels = inst.undoRedo.undoLevels.length;
			}

			tinyMCE.dispatchCallback(inst, 'handle_node_change_callback', 'handleNodeChange', editorId, elm, undoIndex, undoLevels, inst.visualAid, anySelection, setup_content);
		}

		if (this.selectedInstance && (typeof(focus) == "undefined" || focus))
			this.selectedInstance.contentWindow.focus();
	},

	/**
	 * Executes the custom cleanup functions on the specified content.
	 *
	 * @param {TinyMCE_Control} inst TinyMCE editor control instance.
	 * @param {string} type Event type to call.
	 * @param {object} content DOM element or string to pass to handlers depending on type.
	 * @return string or DOM element depending on type.
	 * @private
	 */
	_customCleanup : function(inst, type, content) {
		var pl, po, i;

		// Call custom cleanup
		var customCleanup = tinyMCE.settings['cleanup_callback'];
		if (customCleanup != "" && eval("typeof(" + customCleanup + ")") != "undefined")
			content = eval(customCleanup + "(type, content, inst);");

		// Trigger plugin cleanups
		pl = inst.plugins;
		for (i=0; i<pl.length; i++) {
			po = tinyMCE.plugins[pl[i]];

			if (po && po.cleanup)
				content = po.cleanup(type, content, inst);
		}

		return content;
	},

	/**
	 * Sets the HTML contents of the selected editor instance.
	 *
	 * @param {string} h HTML contents to set in the selected instance.
	 * @deprecated
	 */
	setContent : function(h) {
		if (tinyMCE.selectedInstance) {
			tinyMCE.selectedInstance.execCommand('mceSetContent', false, h);
			tinyMCE.selectedInstance.repaint();
		}
	},

	/**
	 * Loads a theme specific language pack.
	 *
	 * @param {string} name Optional name of the theme to load language pack from.
	 */
	importThemeLanguagePack : function(name) {
		if (typeof(name) == "undefined")
			name = tinyMCE.settings['theme'];

		tinyMCE.loadScript(tinyMCE.baseURL + '/themes/' + name + '/langs/' + tinyMCE.settings['language'] + '.js');
	},

	/**
	 * Loads a plugin specific language pack.
	 *
	 * @param {string} name Plugin name/id to load language pack for.
	 */
	importPluginLanguagePack : function(name) {
		var b = tinyMCE.baseURL + '/plugins/' + name;

		if (this.plugins[name])
			b = this.plugins[name].baseURL;

		tinyMCE.loadScript(b + '/langs/' + tinyMCE.settings['language'] +  '.js');
	},

	/**
	 * Replaces language, args and settings variables in a HTML string.
	 *
	 * @param {string} h HTML string to replace language variables in.
	 * @param {Array} as Optional arguments array to take variables from.
	 * @return HTML string with replaced varliables.
	 * @type string
	 */
	applyTemplate : function(h, as) {
		return h.replace(new RegExp('\\{\\$([a-z0-9_]+)\\}', 'gi'), function(m, s) {
			if (s.indexOf('lang_') == 0 && tinyMCELang[s])
				return tinyMCELang[s];

			if (as && as[s])
				return as[s];

			if (tinyMCE.settings[s])
				return tinyMCE.settings[s];

			if (m == 'themeurl')
				return tinyMCE.themeURL;

			return m;
		});
	},

	/**
	 * Replaces a specific variable in the string with a nother string.
	 *
	 * @param {string} h String to search in for the variable.
	 * @param {string} r Variable name to search for.
	 * @param {string} v Value to insert where a variable is found.
	 * @return String with replaced variable.
	 * @type string
	 */
	replaceVar : function(h, r, v) {
		return h.replace(new RegExp('{\\\$' + r + '}', 'g'), v);
	},

	/**
	 * Opens a popup window based in the specified input data. This function
	 * is used for all popup windows in TinyMCE.
	 *
	 * These are the current template keys: file, width, height, close_previous.
	 *
	 * @param {Array} template Popup template data such as with, height etc.
	 * @param {Array} args Popup arguments that is to be passed to the popup such as custom data.
	 */
	openWindow : function(template, args) {
		var html, width, height, x, y, resizable, scrollbars, url;

		args['mce_template_file'] = template['file'];
		args['mce_width'] = template['width'];
		args['mce_height'] = template['height'];
		tinyMCE.windowArgs = args;

		html = template['html'];
		if (!(width = parseInt(template['width'])))
			width = 320;

		if (!(height = parseInt(template['height'])))
			height = 200;

		// Add to height in M$ due to SP2 WHY DON'T YOU GUYS IMPLEMENT innerWidth of windows!!
		if (tinyMCE.isMSIE)
			height += 40;
		else
			height += 20;

		x = parseInt(screen.width / 2.0) - (width / 2.0);
		y = parseInt(screen.height / 2.0) - (height / 2.0);

		resizable = (args && args['resizable']) ? args['resizable'] : "no";
		scrollbars = (args && args['scrollbars']) ? args['scrollbars'] : "no";

		if (template['file'].charAt(0) != '/' && template['file'].indexOf('://') == -1)
			url = tinyMCE.baseURL + "/themes/" + tinyMCE.getParam("theme") + "/" + template['file'];
		else
			url = template['file'];

		// Replace all args as variables in URL
		for (var name in args) {
			if (typeof(args[name]) == 'function')
				continue;

			url = tinyMCE.replaceVar(url, name, escape(args[name]));
		}

		if (html) {
			html = tinyMCE.replaceVar(html, "css", this.settings['popups_css']);
			html = tinyMCE.applyTemplate(html, args);

			var win = window.open("", "mcePopup" + new Date().getTime(), "top=" + y + ",left=" + x + ",scrollbars=" + scrollbars + ",dialog=yes,minimizable=" + resizable + ",modal=yes,width=" + width + ",height=" + height + ",resizable=" + resizable);
			if (win == null) {
				alert(tinyMCELang['lang_popup_blocked']);
				return;
			}

			win.document.write(html);
			win.document.close();
			win.resizeTo(width, height);
			win.focus();
		} else {
			if ((tinyMCE.isMSIE && !tinyMCE.isOpera) && resizable != 'yes' && tinyMCE.settings["dialog_type"] == "modal") {
				height += 10;

				var features = "resizable:" + resizable 
					+ ";scroll:"
					+ scrollbars + ";status:yes;center:yes;help:no;dialogWidth:"
					+ width + "px;dialogHeight:" + height + "px;";

				window.showModalDialog(url, window, features);
			} else {
				var modal = (resizable == "yes") ? "no" : "yes";

				if (tinyMCE.isGecko && tinyMCE.isMac)
					modal = "no";

				if (template['close_previous'] != "no")
					try {tinyMCE.lastWindow.close();} catch (ex) {}

				var win = window.open(url, "mcePopup" + new Date().getTime(), "top=" + y + ",left=" + x + ",scrollbars=" + scrollbars + ",dialog=" + modal + ",minimizable=" + resizable + ",modal=" + modal + ",width=" + width + ",height=" + height + ",resizable=" + resizable);
				if (win == null) {
					alert(tinyMCELang['lang_popup_blocked']);
					return;
				}

				if (template['close_previous'] != "no")
					tinyMCE.lastWindow = win;

				eval('try { win.resizeTo(width, height); } catch(e) { }');

				// Make it bigger if statusbar is forced
				if (tinyMCE.isGecko) {
					if (win.document.defaultView.statusbar.visible)
						win.resizeBy(0, tinyMCE.isMac ? 10 : 24);
				}

				win.focus();
			}
		}
	},

	/**
	 * Closes the specified window. This function is deprecated and should be replaced with
	 * tinyMCEPopup.close();.
	 *
	 * @param {DOMWindow} win Window reference to close.
	 * @deprecated
	 */
	closeWindow : function(win) {
		win.close();
	},

	/**
	 * Returns the visual aid class string, this will add/remove the visual aid class.
	 *
	 * @param {string} class_name Class name value to add/remove visual aid classes from.
	 * @param {boolean} state true/false if the classes should be added or removed.
	 * @return New class value containing the visual aid classes or not.
	 * @type string
	 */
	getVisualAidClass : function(class_name, state) {
		var aidClass = tinyMCE.settings['visual_table_class'];

		if (typeof(state) == "undefined")
			state = tinyMCE.settings['visual'];

		// Split
		var classNames = new Array();
		var ar = class_name.split(' ');
		for (var i=0; i<ar.length; i++) {
			if (ar[i] == aidClass)
				ar[i] = "";

			if (ar[i] != "")
				classNames[classNames.length] = ar[i];
		}

		if (state)
			classNames[classNames.length] = aidClass;

		// Glue
		var className = "";
		for (var i=0; i<classNames.length; i++) {
			if (i > 0)
				className += " ";

			className += classNames[i];
		}

		return className;
	},

	/**
	 * Adds visual aid classes to all elements that need them recursive in the DOM tree.
	 *
	 * @param {HTMLElement} el HTML element to add visual aid classes to.
	 * @param {boolean} deep Should they be added to all children aswell.
	 * @param {boolean} state Should they be added or removed.
	 * @param {TinyMCE_Control} inst TinyMCE editor control instance to add/remove them to/from.
	 */
	handleVisualAid : function(el, deep, state, inst, skip_dispatch) {
		if (!el)
			return;

		if (!skip_dispatch)
			tinyMCE.dispatchCallback(inst, 'handle_visual_aid_callback', 'handleVisualAid', el, deep, state, inst);

		var tableElement = null;

		switch (el.nodeName) {
			case "TABLE":
				var oldW = el.style.width;
				var oldH = el.style.height;
				var bo = tinyMCE.getAttrib(el, "border");

				bo = bo == "" || bo == "0" ? true : false;

				tinyMCE.setAttrib(el, "class", tinyMCE.getVisualAidClass(tinyMCE.getAttrib(el, "class"), state && bo));

				el.style.width = oldW;
				el.style.height = oldH;

				for (var y=0; y<el.rows.length; y++) {
					for (var x=0; x<el.rows[y].cells.length; x++) {
						var cn = tinyMCE.getVisualAidClass(tinyMCE.getAttrib(el.rows[y].cells[x], "class"), state && bo);
						tinyMCE.setAttrib(el.rows[y].cells[x], "class", cn);
					}
				}

				break;

			case "A":
				var anchorName = tinyMCE.getAttrib(el, "name");

				if (anchorName != '' && state) {
					el.title = anchorName;
					el.className = 'mceItemAnchor';
				} else if (anchorName != '' && !state)
					el.className = '';

				break;
		}

		if (deep && el.hasChildNodes()) {
			for (var i=0; i<el.childNodes.length; i++)
				tinyMCE.handleVisualAid(el.childNodes[i], deep, state, inst, true);
		}
	},

	/*
	applyClassesToFonts : function(doc, size) {
		var f = doc.getElementsByTagName("font");
		for (var i=0; i<f.length; i++) {
			var s = tinyMCE.getAttrib(f[i], "size");

			if (s != "")
				tinyMCE.setAttrib(f[i], 'class', "mceItemFont" + s);
		}

		if (typeof(size) != "undefined") {
			var css = "";

			for (var x=0; x<doc.styleSheets.length; x++) {
				for (var i=0; i<doc.styleSheets[x].rules.length; i++) {
					if (doc.styleSheets[x].rules[i].selectorText == '#mceSpanFonts .mceItemFont' + size) {
						css = doc.styleSheets[x].rules[i].style.cssText;
						break;
					}
				}

				if (css != "")
					break;
			}

			if (doc.styleSheets[0].rules[0].selectorText == "FONT")
				doc.styleSheets[0].removeRule(0);

			doc.styleSheets[0].addRule("FONT", css, 0);
		}
	},
	*/

	/**
	 * Fixes a Gecko specific bug where href, src attribute values gets converted incorrectly
	 * when inserted into editor. This function will replace all src, href with mce_tsrc and mce_thref
	 * to keep the values from chaging when they get inserted.
	 *
	 * @param {boolean} m Mode state, true is to replace the src, href attributes to mce_tsrc and mce_thref.
	 * @param {HTMLElement} e HTML element to replace them in. (Will be used if m is 0)
	 * @param {string} h HTML code to replace them in. (Will be used if m is 1)
	 * @return Converted string or the specified HTML value depending on mode.
	 * @type string
	 */
	fixGeckoBaseHREFBug : function(m, e, h) {
		var nl, i, a, n, xsrc, xhref, el;

		if (tinyMCE.isGecko) {
			if (m == 1) {
				h = h.replace(/\ssrc=/gi, " mce_tsrc=");
				h = h.replace(/\shref=/gi, " mce_thref=");

				return h;
			} else {
				// Why bother if there is no src or href broken
				if (!new RegExp('(src|href)=', 'g').test(h))
					return h;

				el = new Array('a','img','select','area','iframe','base','input','script','embed','object','link');

				for (a=0; a<el.length; a++) {
					n = e.getElementsByTagName(el[a]);

					for (i=0; i<n.length; i++) {
						xsrc = tinyMCE.getAttrib(n[i], "mce_tsrc");
						xhref = tinyMCE.getAttrib(n[i], "mce_thref");

						if (xsrc != "") {
							try {
								n[i].src = tinyMCE.convertRelativeToAbsoluteURL(tinyMCE.settings['base_href'], xsrc);
							} catch (e) {
								// Ignore, Firefox cast exception if local file wasn't found
							}

							n[i].removeAttribute("mce_tsrc");
						}

						if (xhref != "") {
							try {
								n[i].href = tinyMCE.convertRelativeToAbsoluteURL(tinyMCE.settings['base_href'], xhref);
							} catch (e) {
								// Ignore, Firefox cast exception if local file wasn't found
							}

							n[i].removeAttribute("mce_thref");
						}
					}
				}

				el = tinyMCE.selectNodes(e, function(n) {
					if (n.nodeType == 3 || n.nodeType == 8) {
						n.nodeValue = n.nodeValue.replace(/\smce_tsrc=/gi, " src=");
						n.nodeValue = n.nodeValue.replace(/\smce_thref=/gi, " href=");
					}

					return false;
				});
			}
		}

		return h;
	},

	/**
	 * Sets the HTML code of a specific document.
	 * Todo: Try to merge/remove this one.
	 *
	 * @param {DOMDocument} doc DOM document to set the HTML code in.
	 * @param {string} html_content HTML contents to set in DOM document.
	 * @private
	 */
	_setHTML : function(doc, html_content) {
		// Force closed anchors open
		//html_content = html_content.replace(new RegExp('<a(.*?)/>', 'gi'), '<a$1></a>');

		html_content = tinyMCE.cleanupHTMLCode(html_content);

		// Try innerHTML if it fails use pasteHTML in MSIE
		try {
			tinyMCE.setInnerHTML(doc.body, html_content);
		} catch (e) {
			if (this.isMSIE)
				doc.body.createTextRange().pasteHTML(html_content);
		}

		// Content duplication bug fix
		if (tinyMCE.isMSIE && tinyMCE.settings['fix_content_duplication']) {
			// Remove P elements in P elements
			var paras = doc.getElementsByTagName("P");
			for (var i=0; i<paras.length; i++) {
				var node = paras[i];
				while ((node = node.parentNode) != null) {
					if (node.nodeName == "P")
						node.outerHTML = node.innerHTML;
				}
			}

			// Content duplication bug fix (Seems to be word crap)
			var html = doc.body.innerHTML;
/*
			if (html.indexOf('="mso') != -1) {
				for (var i=0; i<doc.body.all.length; i++) {
					var el = doc.body.all[i];
					el.removeAttribute("className","",0);
					el.removeAttribute("style","",0);
				}

				html = doc.body.innerHTML;
				html = tinyMCE.regexpReplace(html, "<o:p><\/o:p>", "<br />");
				html = tinyMCE.regexpReplace(html, "<o:p>&nbsp;<\/o:p>", "");
				html = tinyMCE.regexpReplace(html, "<st1:.*?>", "");
				html = tinyMCE.regexpReplace(html, "<p><\/p>", "");
				html = tinyMCE.regexpReplace(html, "<p><\/p>\r\n<p><\/p>", "");
				html = tinyMCE.regexpReplace(html, "<p>&nbsp;<\/p>", "<br />");
				html = tinyMCE.regexpReplace(html, "<p>\s*(<p>\s*)?", "<p>");
				html = tinyMCE.regexpReplace(html, "<\/p>\s*(<\/p>\s*)?", "</p>");
			}*/

			// Always set the htmlText output
			tinyMCE.setInnerHTML(doc.body, html);
		}

		tinyMCE.cleanupAnchors(doc);

		if (tinyMCE.getParam("convert_fonts_to_spans"))
			tinyMCE.convertSpansToFonts(doc);
	},

	/**
	 * Returns the editor instance id of a specific form element.
	 *
	 * @param {string} form_element Form element name to get instance id for.
	 * @return TinyMCE editor instance id or null if it wasn't found.
	 * @type string
	 */
	getEditorId : function(form_element) {
		var inst = this.getInstanceById(form_element);
		if (!inst)
			return null;

		return inst.editorId;
	},

	/**
	 * Returns a TinyMCE editor instance by the specified editor id or null if it wasn't found.
	 *
	 * @param {string} editor_id Editor id to get instance for.
	 * @return TinyMCE editor control instance or null if it wasn't found.
	 * @type TinyMCE_Control
	 */
	getInstanceById : function(editor_id) {
		var inst = this.instances[editor_id];
		if (!inst) {
			for (var n in tinyMCE.instances) {
				var instance = tinyMCE.instances[n];
				if (!tinyMCE.isInstance(instance))
					continue;

				if (instance.formTargetElementId == editor_id) {
					inst = instance;
					break;
				}
			}
		}

		return inst;
	},

	/**
	 * Queries a command value for a specific command on a specific editor instance.
	 *
	 * @param {string} editor_id Editor id to query command value on.
	 * @param {string} command Command to query for.
	 * @return Command value passed from browser.
	 * @type object
	 */
	queryInstanceCommandValue : function(editor_id, command) {
		var inst = tinyMCE.getInstanceById(editor_id);
		if (inst)
			return inst.queryCommandValue(command);

		return false;
	},

	/**
	 * Queries a command state for a specific command on a specific editor instance.
	 *
	 * @param {string} editor_id Editor id to query command state on.
	 * @param {string} command Command to query for.
	 * @return Command state passed from browser.
	 * @type boolean
	 */
	queryInstanceCommandState : function(editor_id, command) {
		var inst = tinyMCE.getInstanceById(editor_id);
		if (inst)
			return inst.queryCommandState(command);

		return null;
	},

	/**
	 * Sets the window argument to be passed to TinyMCE popup.
	 *
	 * @param {string} n Window argument name.
	 * @param {string} v Window argument value.
	 */
	setWindowArg : function(n, v) {
		this.windowArgs[n] = v;
	},

	/**
	 * Returns the window argument to be passed to TinyMCE popup.
	 * Use: tinyMCEPopup.getWindowArg instead.
	 *
	 * @param {string} n Window argument name.
	 * @return Argument value or default value if it wasn't found.
	 * @deprecated
	 */
	getWindowArg : function(n, d) {
		return (typeof(this.windowArgs[n]) == "undefined") ? d : this.windowArgs[n];
	},

	/**
	 * Returns a array of CSS classes that is available in a document.
	 * Todo: Fix this one, it's so ugly. :)
	 *
	 * @param {string} editor_id Editor id to get CSS classes from.
	 * @param {DOMDocument} doc DOM document to get the CSS classes from.
	 * @return Array of CSS classes that is available in a document.
	 * @type Array
	 */
	getCSSClasses : function(editor_id, doc) {
		var output = new Array();

		// Is cached, use that
		if (typeof(tinyMCE.cssClasses) != "undefined")
			return tinyMCE.cssClasses;

		if (typeof(editor_id) == "undefined" && typeof(doc) == "undefined") {
			var instance;

			for (var instanceName in tinyMCE.instances) {
				instance = tinyMCE.instances[instanceName];
				if (!tinyMCE.isInstance(instance))
					continue;

				break;
			}

			doc = instance.getDoc();
		}

		if (typeof(doc) == "undefined") {
			var instance = tinyMCE.getInstanceById(editor_id);
			doc = instance.getDoc();
		}

		if (doc) {
			var styles = doc.styleSheets;

			if (styles && styles.length > 0) {
				for (var x=0; x<styles.length; x++) {
					var csses = null;

					// Just ignore any errors
					eval("try {var csses = tinyMCE.isMSIE ? doc.styleSheets(" + x + ").rules : styles[" + x + "].cssRules;} catch(e) {}");
					if (!csses)
						return new Array();

					for (var i=0; i<csses.length; i++) {
						var selectorText = csses[i].selectorText;

						// Can be multiple rules per selector
						if (selectorText) {
							var rules = selectorText.split(',');
							for (var c=0; c<rules.length; c++) {
								var rule = rules[c];

								// Strip spaces between selectors
								while (rule.indexOf(' ') == 0)
									rule = rule.substring(1);

								// Invalid rule
								if (rule.indexOf(' ') != -1 || rule.indexOf(':') != -1 || rule.indexOf('mceItem') != -1)
									continue;

								if (rule.indexOf(tinyMCE.settings['visual_table_class']) != -1 || rule.indexOf('mceEditable') != -1 || rule.indexOf('mceNonEditable') != -1)
									continue;

								// Is class rule
								if (rule.indexOf('.') != -1) {
									var cssClass = rule.substring(rule.indexOf('.') + 1);
									var addClass = true;

									for (var p=0; p<output.length && addClass; p++) {
										if (output[p] == cssClass)
											addClass = false;
									}

									if (addClass)
										output[output.length] = cssClass;
								}
							}
						}
					}
				}
			}
		}

		// Cache em
		if (output.length > 0)
			tinyMCE.cssClasses = output;

		return output;
	},

	/**
	 * Regexp replaces the contents of a string. Use normal replace instead.
	 *
	 * @param {string} in_str String to replace in.
	 * @param {string} reg_exp Regexp to replace.
	 * @param {string} replace_str String to replace with.
	 * @param {string} in_str Optional regexp options like "gi".
	 * @return Replaced string value.
	 * @type string
	 * @deprecated
	 */
	regexpReplace : function(in_str, reg_exp, replace_str, opts) {
		if (in_str == null)
			return in_str;

		if (typeof(opts) == "undefined")
			opts = 'g';

		var re = new RegExp(reg_exp, opts);
		return in_str.replace(re, replace_str);
	},

	/**
	 * Removes all prefix, suffix whitespace of a string.
	 *
	 * @param {string} s String to replace whitespace in.
	 * @return Replaced string value.
	 * @type string
	 */
	trim : function(s) {
		return s.replace(/^\s*|\s*$/g, "");
	},

	/**
	 * Removes MSIE 5.5 specific event wrapper function form a event string.
	 * This will also remove the event blocker if it's added in front of the event.
	 *
	 * @param {string} s String to replace event data in.
	 * @return Replaced string value.
	 * @type string
	 */
	cleanupEventStr : function(s) {
		s = "" + s;
		s = s.replace('function anonymous()\n{\n', '');
		s = s.replace('\n}', '');
		s = s.replace(/^return true;/gi, ''); // Remove event blocker

		return s;
	},

	/**
	 * Returns the HTML for the specified control this will loop through
	 * the theme and all plugins inorder to find the control. The callback for each
	 * theme and plugin is called getControlHTML.
	 *
	 * @param {string} c Control name/id to get HTML code for.
	 * @return HTML code for the specified control or empty string if it wasn't found.
	 * @type string
	 */
	getControlHTML : function(c) {
		var i, l, n, o, v;

		l = tinyMCE.plugins;
		for (n in l) {
			o = l[n];

			if (o.getControlHTML && (v = o.getControlHTML(c)) != '')
				return tinyMCE.replaceVar(v, "pluginurl", o.baseURL);
		}

		o = tinyMCE.themes[tinyMCE.settings['theme']];
		if (o.getControlHTML && (v = o.getControlHTML(c)) != '')
			return v;

		return '';
	},

	/**
	 * Evaluates the specified function and uses the array of arguments.
	 *
	 * @param {string} f Function reference to execute.
	 * @param {int} idx Index in array to start grabbing arguments from.
	 * @param {Array} a Array of function arguments.
	 * @param {Object} o Optional object reference to call function on.
	 * @return Value returned from the evaluated function.
	 * @type object
	 */
	evalFunc : function(f, idx, a, o) {
		var s = '(', i;

		for (i=idx; i<a.length; i++) {
			s += 'a[' + i + ']';

			if (i < a.length-1)
				s += ',';
		}

		s += ');';

		return o ? eval("o." + f + s) : eval("f" + s);
	},

	/**
	 * Dispatches the specified callback on all options, plugins and themes. This will not
	 * chain them, so all functions callbacks will be executed regardless if the return true/false.
	 *
	 * @param {TinyMCE_Control} i TinyMCE editor control instance to execute callback on.
	 * @param {string} p TinyMCE callback parameter to execute.
	 * @param {string} n Function name to execute.
	 * @return true/false if they where dispatched.
	 */
	dispatchCallback : function(i, p, n) {
		return this.callFunc(i, p, n, 0, this.dispatchCallback.arguments);
	},

	/**
	 * Executes the specified callback on all options, plugins and themes. This will
	 * chain them, so callback chain will be broken if one function returns false.
	 *
	 * @param {TinyMCE_Control} i TinyMCE editor control instance to execute callback on.
	 * @param {string} p TinyMCE callback parameter to execute.
	 * @param {string} n Function name to execute.
	 * @return true/false if a callback was executed.
	 */
	executeCallback : function(i, p, n) {
		return this.callFunc(i, p, n, 1, this.executeCallback.arguments);
	},

	/**
	 * Executes the specified execcommand callback on all options, plugins and themes. This will
	 * chain them, so callback chain will be broken if one function returns true.
	 *
	 * @param {TinyMCE_Control} i TinyMCE editor control instance to execute callback on.
	 * @param {string} p TinyMCE callback parameter to execute.
	 * @param {string} n Function name to execute.
	 * @return true/false if a callback was executed.
	 */
	execCommandCallback : function(i, p, n) {
		return this.callFunc(i, p, n, 2, this.execCommandCallback.arguments);
	},

	/**
	 * Executes callback chain. Callback order: Option, Plugins, Themes.
	 *
	 * @param {TinyMCE_Control} ins TinyMCE editor control instance to execute callback on.
	 * @param {string} p TinyMCE callback parameter name.
	 * @param {string} n Function name to execute.
	 * @param {int} m Execution mode value, 0 = no chain, 1 = event chain, 2 = execcommand chain.
	 * @param {Array} a Array with function arguments.
	 * @return true - if the callback was executed, false if it wasn't.
	 * @type boolean
	 */
	callFunc : function(ins, p, n, m, a) {
		var l, i, on, o, s, v;

		s = m == 2;

		l = tinyMCE.getParam(p, '');

		if (l != '' && (v = tinyMCE.evalFunc(typeof(l) == "function" ? l : eval(l), 3, a)) == s && m > 0)
			return true;

		if (ins != null) {
			for (i=0, l = ins.plugins; i<l.length; i++) {
				o = tinyMCE.plugins[l[i]];

				if (o[n] && (v = tinyMCE.evalFunc(n, 3, a, o)) == s && m > 0)
					return true;
			}
		}

		l = tinyMCE.themes;
		for (on in l) {
			o = l[on];

			if (o[n] && (v = tinyMCE.evalFunc(n, 3, a, o)) == s && m > 0)
				return true;
		}

		return false;
	},

	/**
	 * Encodes the string to raw XML entities. This will only convert the most common ones.
	 * For real entity encoding use the xmlEncode method of the Cleanup class.
	 *
	 * @param {string} s String to encode.
	 * @return XML Encoded string.
	 * @type string
	 */
	xmlEncode : function(s) {
		return s.replace(new RegExp('[<>&"\']', 'g'), function (c, b) {
			switch (c) {
				case '&':
					return '&amp;';

				case '"':
					return '&quot;';

				case '\'':
					return '&#39;'; // &apos; is not working in MSIE

				case '<':
					return '&lt;';

				case '>':
					return '&gt;';
			}

			return c;
		});
	},

	/**
	 * Extends the specified prototype with new methods.
	 *
	 * @param {Object} p Prototype to extend with new methods.
	 * @param {Object} np New prototype to extend the other one with.
	 * @return Extended prototype array.
	 * @type Object
	 */
	extend : function(p, np) {
		var o = {};

		o.parent = p;

		for (n in p)
			o[n] = p[n];

		for (n in np)
			o[n] = np[n];

		return o;
	},

	/**
	 * Hides any visible menu layers.
	 *
	 * @private
	 */
	hideMenus : function() {
		var e = tinyMCE.lastSelectedMenuBtn;

		if (tinyMCE.lastMenu) {
			tinyMCE.lastMenu.hide();
			tinyMCE.lastMenu = null;
		}

		if (e) {
			tinyMCE.switchClass(e, tinyMCE.lastMenuBtnClass);
			tinyMCE.lastSelectedMenuBtn = null;
		}
	}
};

// Global instances
var TinyMCE = TinyMCE_Engine; // Compatiblity with gzip compressors
var tinyMCE = new TinyMCE_Engine();
var tinyMCELang = {};
