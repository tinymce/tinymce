/*
	TinyAutoSave plugin for TinyMCE
	Version: 2.0.1
	http://tinyautosave.googlecode.com/

	Copyright (c) 2008-2009 Todd Northrop
	http://www.speednet.biz/
	
	September 18, 2009

	Adds auto-save capability to the TinyMCE text editor to rescue content
	inadvertently lost.

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


// Wrap all code in function to create true private scope and prevent
// pollution of global namespace

(function() {


	//************************************************************************
	// PRIVATE VARIABLES
	
	var version = "2.0.1",
	
		// The name of the plugin, as specified to TinyMCE
		pluginName = "tinyautosave",
	
		// Specifies if localStorage (HTML 5) is available
		useLocalStorage = false,
	
		// Specifies if sessionStorage (HTML 5) is available
		useSessionStorage = false,
	
		// Specifies if UserData (IE client storage) is available
		useUserData = false,
	
		// Translation keys for encoding/decoding cookie values
		cookieEncodeKey = {"%": "%1", "&": "%2", ";": "%3", "=": "%4", "<": "%5"},
		cookieDecodeKey = {"%1": "%", "%2": "&", "%3": ";", "%4": "=", "%5": "<"},
	
		// Internal storage for preloaded images
		preloadImages = [],
	
		// Internal storage of settings for each plugin instance
		instanceSettings = {},
	
		// Unique key used to test if HTML 5 storage methods are available
		testKey = "TinyAutoSave_Test_",
		
		// The HTML element that IE's UserData will be attached to
		userDataElement = null,
		
		// Default settings for each plugin instance
		settingsTemplate = {
			dataKey: "TinyAutoSave",
			cookieFilter: null,
			saveDelegate: null,
			saveFinalDelegate: null,
			restoreDelegate: null,
			disposeDelegate: null,
			restoreImage: "",
			progressImage: "progress.gif",
			intervalSeconds: 60,
			retentionMinutes: 20,
			minSaveLength: 50,
			canRestore: false,
			busy: false,
			timer: null
		};
	
	//************************************************************************
	// TEST STORAGE METHODS
	// Determine best storage method by storing and retrieving test data
	
	try {
		localStorage.setItem(testKey, "OK");
		
		if (localStorage.getItem(testKey) === "OK") {
			localStorage.removeItem(testKey);
			useLocalStorage = true;
		}
	}
	catch (e) {
	
		try {
			sessionStorage.setItem(testKey, "OK");
			
			if (sessionStorage.getItem(testKey) === "OK") {
				sessionStorage.removeItem(testKey);
				useSessionStorage = true;
			}
		}
		catch (e) {
			useUserData = tinymce.isIE;
		}
	}


	//************************************************************************
	// TINYMCE INTEROP
		
	tinymce.PluginManager.requireLangPack(pluginName);
	
	tinymce.create("tinymce.plugins.TinyAutoSavePlugin", {
		/// <summary>
		///		Automatically saves the editor contents periodically and just before leaving the current page.
		///		Allows the user to rescue the contents of the last autosave, in case they did not intend to
		///		navigate away from the current page or the browser window was closed before posting the content.
		/// </summary>
		/// <field name="editor" type="Object" mayBeNull="false">
		///		A reference to the TinyMCE editor instance that contains this TinyAutoSave plugin instance.
		/// </field>
		/// <field name="url" type="String" mayBeNull="false">
		///		The URL of the folder containing the TinyAutoSave plugin. Does not include a trailing slash.
		/// </field>
		/// <field name="key" type="String" mayBeNull="false">
		///		A string value identifying the storage and settings for the plugin, as set by tinyautosave_key.
		/// </field>
		/// <field name="onPreSave" type="String" mayBeNull="false">
		///		Name of a callback function that gets called before each auto-save is performed. The callback
		///		function must return a Boolean value of true if the auto-save is to proceed normally, or false
		///		if the auto-save is to be canceled. The editor instance is the context of the callback
		///		(assigned to 'this').
		/// </field>
		/// <field name="onPostSave" type="String" mayBeNull="false">
		///		Name of a callback function that gets called after each auto-save is performed. Any return value
		///		from the callback function is ignored. The editor instance is the context of the callback
		///		(assigned to 'this').
		/// </field>
		/// <field name="onSaveError" type="String" mayBeNull="false">
		///		Name of a callback function that gets called each time an auto-save fails in an error condition.
		///		The editor instance is the context of the callback (assigned to 'this').
		/// </field>
		/// <field name="onPreRestore" type="String" mayBeNull="false">
		///		Name of a callback function that gets called before a restore request is performed. The callback
		///		function must return a Boolean value of true if the restore is to proceed normally, or false if
		///		the restore is to be canceled. The editor instance is the context of the callback (assigned to
		///		'this').
		/// </field>
		/// <field name="onPostRestore" type="String" mayBeNull="false">
		///		Name of a callback function that gets called after a restore request is performed. Any return
		///		value from the callback function is ignored. The editor instance is the context of the callback
		///		(assigned to 'this').
		/// </field>
		/// <field name="onRestoreError" type="String" mayBeNull="false">
		///		Name of a callback function that gets called each time a restore request fails in an error
		///		condition. The editor instance is the context of the callback (assigned to 'this').
		/// </field>
		/// <field name="progressDisplayTime" type="Number" integer="true" mayBeNull="false">
		///		Number of milliseconds that the progress image is displayed after an auto-save. The default is
		///		1200, which is the equivalent of 1.2 seconds.
		/// </field>
		/// <field name="showSaveProgress" type="Boolean" mayBeNull="false">
		///		Receives the Boolean value specified in the tinyautosave_showsaveprogress configuration option,
		///		or true if none is specified. This is a public read/write property, and the behavior of the
		///		toolbar button throbber/progress can be altered dynamically by changing this property.
		/// </field>
		/// <remarks>
		/// 
		/// CONFIGURATION OPTIONS:
		/// 
		/// tinyautosave_key - (String, default = editor id) A string value used to identify the autosave
		/// storage and settings to use for the plug instance. If tinyautosave_key is not specified, then
		/// the editor's id property is used. If you set the tinyautosave_key for all editors to the same value,
		/// that would create a single autosave storage instance and a single set of autosave settings to use
		/// with all editors. Because each key maintains its own plugin settings, tinyautosave_key can also be
		/// used to apply a different UI or behavior to individual editors. For example, two editors on the same
		/// page could use different progress images, or they could autosave at different intervals.
		/// 
		/// tinyautosave_interval_seconds - (Number, default = 60) The number of seconds between automatic saves.
		/// When the editor is first displayed, an autosave will not occur for at least this amount of time.
		/// 
		/// tinyautosave_minlength - (Number, default = 50) The minimum number of characters that must be in the
		/// editor before an autosave will occur.  The character count includes all non-visible characters,
		/// such as HTML tags.  Although this can be set to 0 (zero), it is not recommended.  Doing so would
		/// open the possibility that if the user accidentally refreshes the page, the empty editor contents
		/// would overwrite the rescue content, effectively defeating the purpose of the plugin.
		/// 
		/// tinyautosave_retention_minutes - (Number, default = 20) The number of minutes since the last autosave
		/// that content will remain in the rescue storage space before it is automatically expired.
		/// 
		/// tinyautosave_oninit - (String, default = null) The name of a function to call immediately after the
		/// TinyAutoSave plugin instance is initialized. Can include dot-notation, e.g., "myObject.myFunction".
		/// The context of the function call (the value of 'this') is the plugin instance. This function is
		/// a good place to set any of the public properties that you want to configure.
		/// 
		/// tinyautosave_showsaveprogress - (Boolean, default = true) When true, the toolbar button will show a
		/// brief animation every time an autosave occurs.
		/// 
		/// COMMANDS:
		/// 
		/// Available TinyMCE commands are:
		/// 	mceTinyAutoSave - Perform an auto-save
		/// 	mceTinyAutoSaveRestore - Restore auto-saved content into the editor
		/// 
		/// PUBLIC PROPERTIES:
		/// 
		/// Available public properties of the TinyAutoSave plugin are:
		/// 	editor (Object)
		/// 	url (String)
		/// 	key (String)
		/// 	onPreSave (String)
		/// 	onPostSave (String)
		/// 	onSaveError (String)
		/// 	onPreRestore (String)
		/// 	onPostRestore (String)
		/// 	onRestoreError (String)
		/// 	progressDisplayTime (Number)
		/// 	showSaveProgress (Boolean)
		/// 
		/// See [field] definitions above for detailed descriptions of the public properties.
		/// 
		/// PUBLIC METHODS:
		/// 
		/// Available public methods of the TinyAutoSave plugin are:
		/// 	init() - [Called by TinyMCE]
		/// 	getInfo() - [Called by TinyMCE]
		/// 	clear() - Clears any auto-saved content currently stored, and "dims" the Restore toolbar button.
		/// 	hasSavedContent() - Returns true if there is auto-save content available to be restored, or false if not.
		/// 	setProgressImage() - Sets the URL of the image that will be displayed every time an auto-save occurs.
		/// 
		/// TECHNOLOGY DISCUSSION:
		/// 
		/// The plugin attempts to use the most advanced features available in the current browser to save
		/// as much content as possible.  There are a total of four different methods used to autosave the
		/// content.  In order of preference, they are:
		/// 
		/// 1. localStorage - A new feature of HTML 5, localStorage can store megabytes of data per domain
		/// on the client computer. Data stored in the localStorage area has no expiration date, so we must
		/// manage expiring the data ourselves.  localStorage is fully supported by IE8, and it is supposed
		/// to be working in Firefox 3 and Safari 3.2, but in reality is is flaky in those browsers.  As
		/// HTML 5 gets wider support, the TinyAutoSave plugin will use it automatically. In Windows Vista,
		/// localStorage is stored in the following folder:
		/// C:\Users\[username]\AppData\Local\Microsoft\Internet Explorer\DOMStore\[tempFolder]
		/// 
		/// 2. sessionStorage - A new feature of HTML 5, sessionStorage works similarly to localStorage,
		/// except it is designed to expire after a certain amount of time.  Because the specification
		/// around expiration date/time is very loosely-described, it is preferrable to use locaStorage and
		/// manage the expiration ourselves.  sessionStorage has similar storage characteristics to
		/// localStorage, although it seems to have better support by Firefox 3 at the moment.  (That will
		/// certainly change as Firefox continues getting better at HTML 5 adoption.)
		/// 
		/// 3. UserData - A very under-exploited feature of Microsoft Internet Explorer, UserData is a
		/// way to store up to 128K of data per "document", or up to 1MB of data per domain, on the client
		/// computer.  The feature is available for IE 5+, which makes it available for every version of IE
		/// supported by TinyMCE.  The content is persistent across browser restarts and expires on the
		/// date/time specified, just like a cookie.  However, the data is not cleared when the user clears
		/// cookies on the browser, which makes it well-suited for rescuing autosaved content.  UserData,
		/// like other Microsoft IE browser technologies, is implemented as a behavior attached to a
		/// specific DOM object, so in this case we attach the behavior to the same DOM element that the
		/// TinyMCE editor instance is attached to.
		/// 
		/// 4. Cookies - When none of the above methods is available, the autosave content is stored in a
		/// cookie.  This limits the total saved content to around 4,000 characters, but we use every bit
		/// of that space as we can.  To maximize space utilization, before saving the content, we remove
		/// all newlines and other control characters less than ASCII code 32, change &nbsp; instances to 
		/// a regular space character, and do some minor compression techniques.  (TO-DO: add more
		/// compressiion techniques.)  Unfortunately, because the data is stored in a cookie, we have to
		/// waste some space encoding certain characters to avoid server warnings about dangerous content
		/// (as well as overcoming some browser bugs in Safari).  Instead of using the built-in escape()
		/// function, we do a proprietary encoding that only encodes the bare minimum characters, and uses
		/// only two bytes per encoded character, rather than 3 bytes like escape() does.  escape() encodes
		/// most non-alpha-numeric characters because it is designed for encoding URLs, not for encoding
		/// cookies.  It is a huge space-waster in cookies, and in this case would have cut the amount
		/// of autosaved content by at least half.
		/// 
		/// </remarks>
		
		
		//************************************************************************
		// PUBLIC PROPERTIES
		
		editor: null,
		url: "",
		key: "",
		onPreSave: null,
		onPostSave: null,
		onSaveError: null,
		onPreRestore: null,
		onPostRestore: null,
		onRestoreError: null,
		showSaveProgress: true,
		progressDisplayTime: 1200,  // Milliseconds
		
		
		//************************************************************************
		// PUBLIC METHODS
		
		init: function (ed, url) {
			/// <summary>
			/// Initialization function called by TinyMCE.
			/// </summary>
		
			var t = this,
				is = tinymce.is,
				resolve = tinymce.resolve,
				s, onInit, f;

			if (useUserData) {
				
				if (!userDataElement) {
					userDataElement = ed.getElement();
				}
				
				userDataElement.style.behavior = "url('#default#userData')";
			}

			t.editor = ed;
			t.id = ed.id;
			t.url = url;
			t.key = ed.getParam(pluginName + "_key", ed.id)
			
			s = newInstanceSettings(t);
			s.restoreImage = url + "/images/restore." + (tinymce.isIE6? "gif" : "png");
			t.setProgressImage(url + "/images/" + settingsTemplate.progressImage);
			
			// Get the auto-save interval from the TinyMCE config.  (i.e., auto-save every 'x' seconds.)
			// Integer value.  If not specified in config, default is 60 seconds; minimum is 1 second.
			// Either 'tinyautosave_interval_seconds' or 'tinyautosave_interval' can be used, but 'tinyautosave_interval_seconds' provides better clarity.
			s.intervalSeconds = Math.max(1, parseInt(ed.getParam(pluginName + "_interval_seconds", null) || ed.getParam(pluginName + "_interval", s.intervalSeconds)));
			
			// Get the rescue content retention time from the TinyMCE config.  (i.e., rescue content available for 'x' minutes after navigating from page.)
			// Integer value.  If not specified in config, default is 20 minutes; minimum is 1 minute.
			// Don't make this too long; users will get weirded out if content from long ago is still hanging around.
			// Either 'tinyautosave_retention_minutes' or 'tinyautosave_retention' can be used, but 'tinyautosave_retention_minutes' provides better clarity.
			s.retentionMinutes = Math.max(1, parseInt(ed.getParam(pluginName + "_retention_minutes", null) || ed.getParam(pluginName + "_retention", s.retentionMinutes)));
			
			// Get the minimum content length from the TinyMCE config.  (i.e., minimum number of characters in the editor before an auto-save can occur.)
			// Integer value.  If not specified in config, default is 50 characters; minimum is 1 character.
			// Prevents situation where user accidentally hits Refresh, then their rescue content is wiped out when the editor auto-saves the blank editor on the refreshed page.  No need to auto-save a few characters.
			// Specified as 'tinyautosave_minlength' in the config.
			s.minSaveLength = Math.max(1, parseInt(ed.getParam(pluginName + "_minlength", s.minSaveLength)));
			
			// Determine if progress animation should occur by reading TinyMCE config.
			// Boolean value.  If not specified in config, default is true, progress animation will be displayed after each auto-save.
			// Specified as 'tinyautosave_showsaveprogress' in the config.
			t.showSaveProgress = ed.getParam(pluginName + "_showsaveprogress", t.showSaveProgress);
			
			s.canRestore = t.hasSavedContent();
			
			// Save action delegates with context
			s.saveDelegate = createDelegate(t, save);
			s.saveFinalDelegate = createDelegate(t, saveFinal);
			s.restoreDelegate = createDelegate(t, restore);
			
			// Register commands
			ed.addCommand("mceTinyAutoSave", s.saveDelegate);
			ed.addCommand("mceTinyAutoSaveRestore", s.restoreDelegate);

			// Register restore button
			ed.addButton(pluginName, {
				title: pluginName + ".restore_content",
				cmd: "mceTinyAutoSaveRestore",
				image: s.restoreImage
			});
			
			// Set save interval
			s.timer = window.setInterval(s.saveDelegate, s.intervalSeconds * 1000);
			
			// Ensures content is autosaved before window closes or navigates to new page
			tinymce.dom.Event.add(window, "unload", s.saveFinalDelegate);

			// Save when editor is removed (may be different than window's onunload event, so we need to do both)
			ed.onRemove.add(s.saveFinalDelegate);
			
			// Set initial state of restore button
			ed.onPostRender.add(function (ed, cm) {
				ed.controlManager.setDisabled(pluginName, !s.canRestore);
			});
			
			// Call tinyautosave_oninit, if specified
			// This config option is a String value specifying the name of a function to call. Can include dot-notation, e.g., "myObject.myFunction".
			// The context of the function call (the value of 'this') is the plugin instance.
			onInit = ed.getParam(pluginName + "_oninit", null);
			
			if (is(onInit, "string")) {
				f = resolve(onInit);
				
				if (is(f, "function")) {
					f.apply(t);
				}
			}
		},
		
		getInfo: function() {
			/// <summary>
			///		Called by TinyMCE, returns standard information about the plugin
			///		to display in the About box.
			/// </summary>

			return {
				longname: "TinyAutoSave",
				author: "Speednet",
				authorurl: "http://www.speednet.biz/",
				infourl: "http://tinyautosave.googlecode.com/",
				version: version
			};
		},

		clear: function () {
			/// <summary>
			///		Removes the autosave content from storage. Disables the 'tinyautosave' toolbar button.
			/// </summary>

			var t = this,
				ed = t.editor,
				s = getInstanceSettings(t);
			
			if (useLocalStorage) {
				localStorage.removeItem(s.dataKey);
			}
			else if (useSessionStorage) {
				sessionStorage.removeItem(s.dataKey);
			}
			else if (useUserData) {
				removeUserData(t);
			}
			else {
				tinymce.util.Cookie.remove(s.dataKey);
			}

			s.canRestore = false;
			ed.controlManager.setDisabled(pluginName, t);
		},
		
		hasSavedContent: function () {
			/// <summary>
			///		Returns true if there is unexpired autosave content available to be restored.
			/// </summary>
			/// <returns type="Boolean"></returns>

			var t = this,
				s = getInstanceSettings(t),
				now = new Date(),
				content, i;
			
			try {
				if (useLocalStorage || useSessionStorage) {
					content = ((useLocalStorage? localStorage.getItem(s.dataKey) : sessionStorage.getItem(s.dataKey)) || "").toString(),
						i = content.indexOf(",");
					
					if ((i > 8) && (i < content.length - 1)) {
						
						if ((new Date(content.slice(0, i))) > now) {
							return true;
						}
						
						// Remove expired content
						if (useLocalStorage) {
							localStorage.removeItem(s.dataKey);
						}
						else {
							sessionStorage.removeItem(s.dataKey);
						}
					}
					
					return false;
				}
				else if (useUserData) {
					return ((getUserData(t) || "").length > 0);
				}
				
				return ((tinymce.util.Cookie.get(s.dataKey) || "").length > 0);
			}
			catch (e) {
				return false;
			}
		},
		
		setProgressImage: function (url) {
			/// <summary>
			///		Sets the progress image/throbber to a specified URL. The progress image
			///		temporarily replaces the image on the TinyAutoSave toolbar button every
			///		time an auto-save occurs. The default value is
			///		"[tinymce]/plugins/tinyautosave/images/progress.gif". Can be set any time
			///		after the plugin initializes. The progress image is normally an animated GIF,
			///		but it can be any image type. Because the image will be displayed on a toolbar
			///		button, so the recommended size is 20 x 20 (using a centered 16 x 16 image).
			/// </summary>
			/// <param name="url" type="String" optional="false" mayBeNull="false">
			///		The URL of the image that will be displayed on the restore toolbar button
			///		every time an auto-save occurs.
			/// </param>
			
			if (tinymce.is(url, "string")) {
				preloadImage(getInstanceSettings(this).progressImage = url);
			}
		}
	});
	

	//************************************************************************
	// PRIVATE FUNCTIONS
	
	function dispose() {
		/// <summary>
		///		Called just before the current page unloads. Cleans up memory, releases
		///		timers and events.
		/// </summary>
		/// <remarks>
		///		Must be called with context ("this" keyword) set to plugin instance
		/// </remarks>
		
		var t = this,
			s = getInstanceSettings(t);
		
		if (s.timer) {
			window.clearInterval(s.timer);
		}
		
		tinymce.dom.Event.remove(window, "unload", s.saveFinalDelegate);
		t.editor.onRemove.remove(s.saveFinalDelegate);
		removeInstanceSettings(t);
	}

	function saveFinal() {
		/// <summary>
		///		Called just before the current page is unloaded. Performs a final save, then
		///		cleans up memory to prevent leaks.
		/// </summary>
		/// <remarks>
		///		Must be called with context ("this" keyword) set to plugin instance
		/// </remarks>
		
		var s = getInstanceSettings(this);
		
		s.saveDelegate();
		s.disposeDelegate();
	}
	
	function save() {
		/// <summary>
		///		Performs a single, one-time autosave. Checks to be sure there is at least the
		///		specified minimum number of characters in the editor before saving. Briefly
		///		animates the toolbar button. Enables the 'tinyautosave' button to indicate
		///		autosave content is available.
		/// </summary>
		/// <returns type="Boolean">
		///		Returns true if content was saved, or false if not.
		/// </returns>
		/// <remarks>
		///		Must be called with context ("this" keyword) set to plugin instance
		/// </remarks>

		var t = this,
			ed = t.editor,
			s = getInstanceSettings(t),
			is = tinymce.is,
			execCallback = ed.execCallback,
			saved = false,
			now = new Date(),
			content, exp, a, b, cm, img;
		
		if ((ed) && (!s.busy)) {
			s.busy = true;
	
			if (is(t.onPreSave, "string")) {
				if (!execCallback(t.onPreSave)) {
					s.busy = false;
					return false;
				}
			}

			content = ed.getContent();
			
			if (is(content, "string") && (content.length >= s.minSaveLength)) {
				exp = new Date(now.getTime() + (s.retentionMinutes * 60 * 1000));
				
				try {
					if (useLocalStorage) {
						localStorage.setItem(s.dataKey, exp.toString() + "," + encodeStorage(content)); // Uses local time for expiration
					}
					else if (useSessionStorage) {
						sessionStorage.setItem(s.dataKey, exp.toString() + "," + encodeStorage(content)); // Uses local time for expiration
					}
					else if (useUserData) {
						setUserData(t, content, exp);
					}
					else {
						a = s.dataKey + "=";
						b = "; expires=" + exp.toUTCString();
						
						document.cookie = a + encodeCookie(content).slice(0, 4096 - a.length - b.length) + b;
					}
					
					saved = true;
				}
				catch (e) {
					if (is(t.onSaveError, "string")) {
						execCallback(t.onSaveError);
					}
				}
				
				if (saved) {
					cm = ed.controlManager;
					s.canRestore = true;
					cm.setDisabled(pluginName, false);
					
					if (t.showSaveProgress) {
						b = tinymce.DOM.get(cm.get(pluginName).id);
						img = s.restoreImage;
						
						b.firstChild.src = s.progressImage;
						
						window.setTimeout(
							function () {
								b.firstChild.src = img;
							},
							Math.min(t.progressDisplayTime, s.intervalSeconds * 1000 - 100)
						);
					}
	
					if (is(t.onPostSave, "string")) {
						execCallback(t.onPostSave);
					}
				}
			}
			
			s.busy = false;
		}
		
		return saved;
	}
	
	function restore() {
		/// <summary>
		///		Called when the user clicks the 'tinyautosave' button on the toolbar.
		///		Replaces the contents of the editor with the autosaved content. If the editor
		///		contains more than just whitespace, the user is warned and given the option
		///		to abort. The autosaved content remains in storage.
		/// </summary>
		/// <remarks>
		///		Must be called with context ("this" keyword) set to plugin instance
		/// </remarks>

		var t = this,
			ed = t.editor,
			s = getInstanceSettings(t),
			content = null,
			is = tinymce.is,
			execCallback = ed.execCallback,
			i, m;
		
		if ((ed) && (s.canRestore) && (!s.busy)) {
			s.busy = true;
			
			if (is(t.onPreRestore, "string")) {
				if (!execCallback(t.onPreRestore)) {
					s.busy = false;
					return;
				}
			}

			try {
				if (useLocalStorage || useSessionStorage) {
					content = ((useLocalStorage? localStorage.getItem(s.dataKey) : sessionStorage.getItem(s.dataKey)) || "").toString();
					i = content.indexOf(",");
					
					if (i == -1) {
						content = null;
					}
					else {
						content = decodeStorage(content.slice(i + 1, content.length));
					}
				}
				else if (useUserData) {
					content = getUserData(t);
				}
				else {
					m = s.cookieFilter.exec(document.cookie);
					
					if (m) {
						content = decodeCookie(m[1]);
					}
				}
				
				if (!is(content, "string")) {
					ed.windowManager.alert(pluginName + ".no_content");
				}
				else {
					
					// If current contents are empty or whitespace, the confirmation is unnecessary
					if (ed.getContent().replace(/\s|&nbsp;|<\/?p[^>]*>|<br[^>]*>/gi, "").length === 0) {
						ed.setContent(content);
			
						if (is(t.onPostRestore, "string")) {
							execCallback(t.onPostRestore);
						}
					}
					else {
						ed.windowManager.confirm(
							pluginName + ".warning_message",
							function (ok) {
								if (ok) {
									ed.setContent(content);
						
									if (is(t.onPostRestore, "string")) {
										execCallback(t.onPostRestore);
									}
								}
								s.busy = false;
							},
							t
						);
					}
				}
			}
			catch (e) {
				if (is(t.onRestoreError, "string")) {
					execCallback(t.onRestoreError);
				}
			}
			
			s.busy = false;
		}
	}
	
	function setUserData(inst, str, exp) {
		/// <summary>
		///		IE browsers only. Saves a string to the 'UserData' storage area.
		/// </summary>
		/// <param name="inst" type="Object" optional="false" mayBeNull="false">
		///		Plugin instance for which to set the UserData
		/// </param>
		/// <param name="str" type="String" optional="false" mayBeNull="false">
		///		String value to save.
		/// </param>
		/// <param name="exp" type="Date" optional="false" mayBeNull="false">
		///		Date object specifying the expiration date of the content
		/// </param>
		/// <remarks>
		///		Maximum size of the autosave data is 128K for regular Internet Web sites or
		///		512KB for intranet sites. Total size of all data for one domain is 1MB for
		///		Internet sites and 10MB for intranet sites.
		/// </remarks>

		userDataElement.setAttribute(getInstanceSettings(inst).dataKey, str);
		userDataElement.expires = exp.toUTCString();
		userDataElement.save("TinyMCE");
	}

	function getUserData(inst) {
		/// <summary>
		///		IE browsers only. Retrieves a string from the 'UserData' storage area.
		/// </summary>
		/// <param name="inst" type="Object" optional="false" mayBeNull="false">
		///		Plugin instance from which to get the UserData
		/// </param>
		/// <returns type="String"></returns>

		userDataElement.load("TinyMCE");
		return userDataElement.getAttribute(getInstanceSettings(inst).dataKey);
	}
	
	function removeUserData(inst) {
		/// <summary>
		///		IE browsers only. Removes a string from the 'UserData' storage area.
		/// </summary>
		/// <param name="inst" type="Object" optional="false" mayBeNull="false">
		///		Plugin instance from which to remove the UserData
		/// </param>
		
		userDataElement.removeAttribute(getInstanceSettings(inst).dataKey);
	}

	function encodeCookie(str) {
		/// <summary>
		///		Encodes a string value intended for storage in a cookie. Used instead of
		///		escape() to be more space-efficient and to apply some minor compression.
		/// </summary>
		/// <param name="str" type="String" optional="false" mayBeNull="false">
		///		String to encode for cookie storage
		/// </param>
		/// <returns type="String"></returns>
		/// <remarks>
		///		Depends on the existence of the cookieEncodeKey property. Used as a lookup table.
		///		TO DO: Implement additional compression techniques.
		/// </remarks>

		return str.replace(/[\x00-\x1f]+|&nbsp;|&#160;/gi, " ")
			.replace(/(.)\1{5,}|[%&;=<]/g,
				function (c) {
					if (c.length > 1) {
						return ("%0" + c.charAt(0) + c.length.toString() + "%");
					}
					return cookieEncodeKey[c];
				}
			);
	}
	
	function decodeCookie(str) {
		/// <summary>
		///		Decodes a string value that was previously encoded with encodeCookie().
		/// </summary>
		/// <param name="str" type="String" optional="false" mayBeNull="false">
		///		String that was previously encoded with encodeCookie()
		/// </param>
		/// <returns type="String"></returns>
		/// <remarks>
		///		Depends on the existence of the cookieDecodeKey property. Used as a lookup table.
		///		TO DO: Implement additional compression techniques.
		/// </remarks>

		return str.replace(/%[1-5]|%0(.)(\d+)%/g,
			function (c, m, d) {
				var a, i, l;
				
				if (c.length == 2) {
					return cookieDecodeKey[c];
				}
				
				for (a=[], i=0, l=parseInt(d); i<l; i++) {
					a.push(m);
				}
				
				return a.join("");
			});
	}
	
	function encodeStorage(str) {
		/// <summary>
		///		Encodes a string value intended for storage in either localStorage or sessionStorage.
		/// </summary>
		/// <param name="str" type="String" optional="false" mayBeNull="false">
		///		String to encode for localStorage or sessionStorage
		/// </param>
		/// <returns type="String"></returns>
		/// <remarks>
		///		Necessary because a bug in Safari truncates the string at the first comma.
		/// </remarks>

		return str.replace(/,/g, "&#44;");
	}
	
	function decodeStorage(str) {
		/// <summary>
		///		Decodes a string value that was previously encoded with encodeStorage().
		/// </summary>
		/// <param name="str" type="String" optional="false" mayBeNull="false">
		///		String that was previously encoded with encodeStorage()
		/// </param>
		/// <returns type="String"></returns>

		return str.replace(/&#44;/g, ",");
	}
	
	function preloadImage(imageURL) {
		/// <summary>
		///		Preloads an image so it will be instantly displayed the first time it's needed.
		/// </summary>
		
		var i = preloadImages.length;
		
		preloadImages[i] = new Image();
		preloadImages[i].src = imageURL;
	}
	
	function createDelegate(t, method) {
		/// <summary>
		///		Returns a delegate function, used for callbacks. Ensures 'this' refers
		///		to the desired object.
		/// </summary>
		/// <param name="t" type="Object" optional="false" mayBeNull="true">
		///		Object that will be 'this' within the callback function.
		/// </param>
		/// <param name="method" type="Function" optional="false" mayBeNull="false">
		///		Callback function
		/// </param>
		/// <returns type="Function"></returns>
		
		return function () {
			return method.apply(t);
		};
	}

	function newInstanceSettings(inst) {
		/// <summary>
		///		Creates new settings storage for a plugin instance.
		/// </summary>
		/// <param name="inst" type="Object" optional="false" mayBeNull="true">
		///		The plugin instance for which to create the settings storage.
		/// </param>
		/// <returns type="Object"></returns>

		var key = inst.key,
			s = instanceSettings[key];
		
		if (!s) {
			s = instanceSettings[key] = tinymce.extend({}, settingsTemplate, {
				dataKey: settingsTemplate.dataKey + key,
				saveDelegate: createDelegate(inst, save),
				saveFinalDelegate: createDelegate(inst, saveFinal),
				restoreDelegate: createDelegate(inst, restore),
				disposeDelegate: createDelegate(inst, dispose),
				cookieFilter: new RegExp("(?:^|;\\s*)" + settingsTemplate.dataKey + key + "=([^;]*)(?:;|$)", "i")
			});
		}
		
		return s;
	}
	
	function getInstanceSettings(inst) {
		/// <summary>
		///		Retrieves the settings for a plugin instance.
		/// </summary>
		/// <param name="inst" type="Object" optional="false" mayBeNull="true">
		///		The plugin instance for which to retrieve the settings.
		/// </param>
		/// <returns type="Object"></returns>

		return instanceSettings[inst.key];
	}
	
	function removeInstanceSettings(inst) {
		/// <summary>
		///		Deletes the settings for a plugin instance.
		/// </summary>
		/// <param name="inst" type="Object" optional="false" mayBeNull="true">
		///		The plugin instance for which to delete the settings.
		/// </param>

		delete instanceSettings[inst.key];
	}
	

	//************************************************************************
	// REGISTER PLUGIN
	
	tinymce.PluginManager.add(pluginName, tinymce.plugins.TinyAutoSavePlugin);
	
})();

