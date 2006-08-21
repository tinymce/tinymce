/**
 * $Id: editor_plugin_src.js 42 2006-08-08 14:32:24Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

tinyMCE.importPluginLanguagePack('devkit');

var TinyMCE_DevKitPlugin = {
	_logRows : new Array(),
	_logFilter : '\\[(importCSS|execCommand|execInstanceCommand|debug)\\]',
	_logPadding : '',
	_startTime : null,
	_benchMark : false,

	getInfo : function() {
		return {
			longname : 'Development Kit',
			author : 'Moxiecode Systems AB',
			authorurl : 'http://tinymce.moxiecode.com',
			infourl : 'http://tinymce.moxiecode.com/tinymce/docs/plugin_devkit.html',
			version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
		};
	},

	initInstance : function(inst) {
		if (!this._loaded) {
			this._loaded = true;
			this._setup();
		}
	},

	_setup : function() {
		// Register a document reference for more easy access in the FF DOM inspector
		document.___TinyMCE = tinyMCE;

		// Setup devkit by settings
		this._logFilter = tinyMCE.getParam('devkit_log_filter', this._logFilter);
		this._benchMark = tinyMCE.getParam('devkit_bench_mark', false);

		var ifr = document.createElement('iframe');

		ifr.setAttribute("id", "devkit");
		ifr.setAttribute("frameBorder", "0");
		ifr.setAttribute("src", tinyMCE.baseURL + '/plugins/devkit/devkit.htm');

		document.body.appendChild(ifr);

		// Workaround for strange IE reload bug
		if (tinyMCE.isMSIE && !tinyMCE.isOpera)
			document.getElementById('devkit').outerHTML = document.getElementById('devkit').outerHTML;

		tinyMCE.importCSS(document, tinyMCE.baseURL + '/plugins/devkit/css/devkit_ui.css');
	},

	_start : function() {
		this._logPadding += '\u00a0';

		return new Date().getTime();
	},

	_end : function(st) {
		if (this._logPadding.length > 0)
			this._logPadding = this._logPadding.substring(0, this._logPadding.length - 1);

		if (this._benchMark)
			this._log("benchmark", "Execution time: " + (new Date().getTime() - st));
	},

	_log : function(t) {
		var m, a, i, e = document.getElementById('devkit'), win = e ? e.contentWindow : null, now = new Date().getTime();

		if (!this._startTime)
			this._startTime = now;

		m = (this._logPadding.length > 1 ? this._logPadding : '') + '[' + (now - this._startTime) + '] [' + t + '] ';

		a = this._log.arguments;
		for (i=1; i<a.length; i++) {
			if (typeof(a[i]) == 'undefined')
				continue;

			if (i > 1)
				m += ', ';

			m += a[i];
		}

		if (!new RegExp(this._logFilter, 'gi').test(m)) {
			if (this._logPadding.length > 0)
				this._logPadding = this._logPadding.substring(0, this._logPadding.length - 1);

			return;
		}

		if (!win || !win.debug)
			this._logRows[this._logRows.length] = m;
		else
			win.debug(m);
	}
};

// Patch and piggy back functions
tinyMCE.__debug = tinyMCE.debug;
tinyMCE.debug = function() {
	var a, i, m = '', now = new Date().getTime(), start = TinyMCE_DevKitPlugin._startTime;

	if (!start)
		TinyMCE_DevKitPlugin._startTime = start = now;

	a = this.debug.arguments;
	for (i=0; i<a.length; i++) {
		if (typeof(a[i]) == 'undefined')
			continue;

		if (i > 0)
			m += ', ';

		m += a[i];
	}

	TinyMCE_DevKitPlugin._log('debug', m);
};

tinyMCE.__execCommand = tinyMCE.execCommand;
tinyMCE.execCommand = function(command, user_interface, value) {
	var r, st, dk = TinyMCE_DevKitPlugin;

	st = dk._start();
	dk._log('execCommand', command, user_interface, value);
	r = tinyMCE.__execCommand(command, user_interface, value);
	dk._end(st);

	return r;
};

tinyMCE.__execInstanceCommand = tinyMCE.execInstanceCommand;
tinyMCE.execInstanceCommand = function(editor_id, command, user_interface, value, focus) {
	var r, st, dk = TinyMCE_DevKitPlugin;

	st = dk._start();
	dk._log('execInstanceCommand', editor_id, command, user_interface, value);
	r = tinyMCE.__execInstanceCommand(editor_id, command, user_interface, value);
	dk._end(st);

	return r;
};

TinyMCE_Engine.prototype.__handleEvent = TinyMCE_Engine.prototype.handleEvent;
TinyMCE_Engine.prototype.handleEvent = function(e) {
	var r, st, dk = TinyMCE_DevKitPlugin;

	st = dk._start();
	dk._log('handleEvent', e.type);
	r = tinyMCE.__handleEvent(e);
	dk._end(st);

	return r;
};

tinyMCE.__importCSS = tinyMCE.importCSS;
tinyMCE.importCSS = function(doc, css) {
	var r, st, dk = TinyMCE_DevKitPlugin;

	st = dk._start();
	dk._log('importCSS', doc, css);
	r = tinyMCE.__importCSS(doc, css);
	dk._end(st);

	return r;
};

tinyMCE.__triggerNodeChange = tinyMCE.triggerNodeChange;
tinyMCE.triggerNodeChange = function(focus, setup_content) {
	var r, st, dk = TinyMCE_DevKitPlugin;

	st = dk._start();
	dk._log('triggerNodeChange', focus, setup_content);
	r = tinyMCE.__triggerNodeChange(focus, setup_content);
	dk._end(st);

	return r;
};

tinyMCE.__dispatchCallback = tinyMCE.dispatchCallback;
tinyMCE.dispatchCallback = function(i, p, n) {
	var r, st, dk = TinyMCE_DevKitPlugin;

	st = dk._start();
	dk._log('dispatchCallback', i, p, n);
	r = tinyMCE.__dispatchCallback(i, p, n);
	dk._end(st);

	return r;
};

tinyMCE.__executeCallback = tinyMCE.executeCallback;
tinyMCE.executeCallback = function(i, p, n) {
	var r, st, dk = TinyMCE_DevKitPlugin;

	st = dk._start();
	dk._log('executeCallback', i, p, n);
	r = tinyMCE.__executeCallback(i, p, n);
	dk._end(st);

	return r;
};

tinyMCE.__execCommandCallback = tinyMCE.execCommandCallback;
tinyMCE.execCommandCallback = function(i, p, n) {
	var r, st, dk = TinyMCE_DevKitPlugin;

	st = dk._start();
	dk._log('execCommandCallback', i, p, n);
	r = tinyMCE.__execCommandCallback(i, p, n);
	dk._end(st);

	return r;
};

tinyMCE.addPlugin("devkit", TinyMCE_DevKitPlugin);
