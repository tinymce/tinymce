// Namespaces
tinymce = {}
tinymce.dom = {}
tinymce.ui = {}
tinymce.util = {}

// Classes
tinymce.AddOnManager = function() {
	/// <summary>This class handles the loading of themes/plugins or other add-ons and their language packs.</summary>
	/// <field name="onAdd" type="tinymce.util.Dispatcher">Fires when a item is added.</field>
}

tinymce.AddOnManager.prototype.get = function(n) {
	/// <summary>Returns the specified add on by the short name.</summary>
	/// <param name="n" type="String">Add-on to look for.</param>
	/// <returns type="">Theme or plugin add-on instance or undefined.</returns>
}

tinymce.AddOnManager.prototype.requireLangPack = function(n) {
	/// <summary>Loads a language pack for the specified add-on.</summary>
	/// <param name="n" type="String">Short name of the add-on.</param>
}

tinymce.AddOnManager.prototype.add = function(id, o) {
	/// <summary>Adds a instance of the add-on by it's short name.</summary>
	/// <param name="id" type="String">Short name/id for the add-on.</param>
	/// <param name="o" type="">Theme or plugin to add.</param>
	/// <returns type="">The same theme or plugin instance that got passed in.</returns>
}

tinymce.AddOnManager.prototype.load = function(n, u, cb, s) {
	/// <summary>Loads an add-on from a specific url.</summary>
	/// <param name="n" type="String">Short name of the add-on that gets loaded.</param>
	/// <param name="u" type="String">URL to the add-on that will get loaded.</param>
	/// <param name="cb" type="function">Optional callback to execute ones the add-on is loaded.</param>
	/// <param name="s" type="Object">Optional scope to execute the callback in.</param>
}

tinymce.Theme = function() {
	/// <summary>TinyMCE theme class.</summary>
}

tinymce.Plugin = function() {
	/// <summary>TinyMCE plugin class.</summary>
}

tinymce.ControlManager = function(ed, s) {
	/// <summary>This class is responsible for managing UI control instances.</summary>
	/// <param name="ed" type="tinymce.Editor">TinyMCE editor instance to add the control to.</param>
	/// <param name="s" type="Object">Optional settings object for the control manager.</param>
}

tinymce.ControlManager.prototype.get = function(id) {
	/// <summary>Returns a control by id or undefined it it wasn't found.</summary>
	/// <param name="id" type="String">Control instance name.</param>
	/// <returns type="tinymce.ui.Control">Control instance or undefined.</returns>
}

tinymce.ControlManager.prototype.setActive = function(id, s) {
	/// <summary>Sets the active state of a control by id.</summary>
	/// <param name="id" type="String">Control id to set state on.</param>
	/// <param name="s" type="Boolean">Active state true/false.</param>
	/// <returns type="tinymce.ui.Control">Control instance that got activated or null if it wasn't found.</returns>
}

tinymce.ControlManager.prototype.setDisabled = function(id, s) {
	/// <summary>Sets the dsiabled state of a control by id.</summary>
	/// <param name="id" type="String">Control id to set state on.</param>
	/// <param name="s" type="Boolean">Active state true/false.</param>
	/// <returns type="tinymce.ui.Control">Control instance that got disabled or null if it wasn't found.</returns>
}

tinymce.ControlManager.prototype.add = function(Control) {
	/// <summary>Adds a control to the control collection inside the manager.</summary>
	/// <param name="Control" type="tinymce.ui.Control">instance to add to collection.</param>
	/// <returns type="tinymce.ui.Control">Control instance that got passed in.</returns>
}

tinymce.ControlManager.prototype.createControl = function(n) {
	/// <summary>Creates a control by name, when a control is created it will automatically add it to the control collection.</summary>
	/// <param name="n" type="String">Control name to create for example "separator".</param>
	/// <returns type="tinymce.ui.Control">Control instance that got created and added.</returns>
}

tinymce.ControlManager.prototype.createDropMenu = function(id, s, cc) {
	/// <summary>Creates a drop menu control instance by id.</summary>
	/// <param name="id" type="String">Unique id for the new dropdown instance. For example "some menu".</param>
	/// <param name="s" type="Object">Optional settings object for the control.</param>
	/// <param name="cc" type="Object">Optional control class to use instead of the default one.</param>
	/// <returns type="tinymce.ui.Control">Control instance that got created and added.</returns>
}

tinymce.ControlManager.prototype.createListBox = function(id, s, cc) {
	/// <summary>Creates a list box control instance by id.</summary>
	/// <param name="id" type="String">Unique id for the new listbox instance. For example "styles".</param>
	/// <param name="s" type="Object">Optional settings object for the control.</param>
	/// <param name="cc" type="Object">Optional control class to use instead of the default one.</param>
	/// <returns type="tinymce.ui.Control">Control instance that got created and added.</returns>
}

tinymce.ControlManager.prototype.createButton = function(id, s, cc) {
	/// <summary>Creates a button control instance by id.</summary>
	/// <param name="id" type="String">Unique id for the new button instance. For example "bold".</param>
	/// <param name="s" type="Object">Optional settings object for the control.</param>
	/// <param name="cc" type="Object">Optional control class to use instead of the default one.</param>
	/// <returns type="tinymce.ui.Control">Control instance that got created and added.</returns>
}

tinymce.ControlManager.prototype.createMenuButton = function(id, s, cc) {
	/// <summary>Creates a menu button control instance by id.</summary>
	/// <param name="id" type="String">Unique id for the new menu button instance. For example "menu1".</param>
	/// <param name="s" type="Object">Optional settings object for the control.</param>
	/// <param name="cc" type="Object">Optional control class to use instead of the default one.</param>
	/// <returns type="tinymce.ui.Control">Control instance that got created and added.</returns>
}

tinymce.ControlManager.prototype.createSplitButton = function(id, s, cc) {
	/// <summary>Creates a split button control instance by id.</summary>
	/// <param name="id" type="String">Unique id for the new split button instance. For example "spellchecker".</param>
	/// <param name="s" type="Object">Optional settings object for the control.</param>
	/// <param name="cc" type="Object">Optional control class to use instead of the default one.</param>
	/// <returns type="tinymce.ui.Control">Control instance that got created and added.</returns>
}

tinymce.ControlManager.prototype.createColorSplitButton = function(id, s, cc) {
	/// <summary>Creates a color split button control instance by id.</summary>
	/// <param name="id" type="String">Unique id for the new color split button instance. For example "forecolor".</param>
	/// <param name="s" type="Object">Optional settings object for the control.</param>
	/// <param name="cc" type="Object">Optional control class to use instead of the default one.</param>
	/// <returns type="tinymce.ui.Control">Control instance that got created and added.</returns>
}

tinymce.ControlManager.prototype.createToolbar = function(id, s, cc) {
	/// <summary>Creates a toolbar container control instance by id.</summary>
	/// <param name="id" type="String">Unique id for the new toolbar container control instance. For example "toolbar1".</param>
	/// <param name="s" type="Object">Optional settings object for the control.</param>
	/// <param name="cc" type="Object">Optional control class to use instead of the default one.</param>
	/// <returns type="tinymce.ui.Control">Control instance that got created and added.</returns>
}

tinymce.ControlManager.prototype.createSeparator = function(cc) {
	/// <summary>Creates a separator control instance.</summary>
	/// <param name="cc" type="Object">Optional control class to use instead of the default one.</param>
	/// <returns type="tinymce.ui.Control">Control instance that got created and added.</returns>
}

tinymce.ControlManager.prototype.setControlType = function(n, c) {
	/// <summary>Overrides a specific control type with a custom class.</summary>
	/// <param name="n" type="string">Name of the control to override for example button or dropmenu.</param>
	/// <param name="c" type="function">Class reference to use instead of the default one.</param>
	/// <returns type="function">Same as the class reference.</returns>
}

tinymce.ControlManager.prototype.destroy = function() {
	/// <summary>Destroy.</summary>
}

tinymce.Editor = function(id, s) {
	/// <summary>This class contains the core logic for a TinyMCE editor.</summary>
	/// <param name="id" type="String">Unique id for the editor.</param>
	/// <param name="s" type="Object">Optional settings string for the editor.</param>
	/// <field name="id" type="String">Editor instance id, normally the same as the div/textarea that was replaced.</field>
	/// <field name="isNotDirty" type="Boolean">State to force the editor to return false on a isDirty call.</field>
	/// <field name="plugins" type="Object">Name/Value object containting plugin instances.</field>
	/// <field name="settings" type="Object">Name/value collection with editor settings.</field>
	/// <field name="documentBaseURI" type="tinymce.util.URI">URI object to document configured for the TinyMCE instance.</field>
	/// <field name="baseURI" type="tinymce.util.URI">URI object to current document that holds the TinyMCE editor instance.</field>
	/// <field name="windowManager" type="tinymce.WindowManager">Window manager reference, use this to open new windows and dialogs.</field>
	/// <field name="theme" type="tinymce.Theme">Reference to the theme instance that was used to generate the UI.</field>
	/// <field name="controlManager" type="tinymce.ControlManager">Control manager instance for the editor. Will enables you to create new UI elements and change their states etc.</field>
	/// <field name="undoManager" type="tinymce.UndoManager">Undo manager instance, responsible for handling undo levels.</field>
	/// <field name="dom" type="tinymce.dom.DOMUtils">DOM instance for the editor.</field>
	/// <field name="serializer" type="tinymce.dom.Serializer">DOM serializer for the editor.</field>
	/// <field name="selection" type="tinymce.dom.Selection">Selection instance for the editor.</field>
	/// <field name="onPreInit" type="tinymce.util.Dispatcher">Fires before the initialization of the editor. Editor instance.</field>
	/// <field name="onBeforeRenderUI" type="tinymce.util.Dispatcher">Fires before the initialization of the editor. Editor instance.</field>
	/// <field name="onPostRender" type="tinymce.util.Dispatcher">Fires after the rendering has completed. Editor instance.</field>
	/// <field name="onInit" type="tinymce.util.Dispatcher">Fires after the initialization of the editor is done. Editor instance.</field>
	/// <field name="onRemove" type="tinymce.util.Dispatcher">Fires when the editor instance is removed from page. Editor instance.</field>
	/// <field name="onActivate" type="tinymce.util.Dispatcher">Fires when the editor is activated. Editor instance.</field>
	/// <field name="onDeactivate" type="tinymce.util.Dispatcher">Fires when the editor is deactivated. Editor instance.</field>
	/// <field name="onClick" type="tinymce.util.Dispatcher">Fires when something in the body of the editor is clicked. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onEvent" type="tinymce.util.Dispatcher">Fires when a registered event is intercepted. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onMouseUp" type="tinymce.util.Dispatcher">Fires when a mouseup event is intercepted inside the editor. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onMouseDown" type="tinymce.util.Dispatcher">Fires when a mousedown event is intercepted inside the editor. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onDblClick" type="tinymce.util.Dispatcher">Fires when a dblclick event is intercepted inside the editor. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onKeyDown" type="tinymce.util.Dispatcher">Fires when a keydown event is intercepted inside the editor. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onKeyUp" type="tinymce.util.Dispatcher">Fires when a keydown event is intercepted inside the editor. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onKeyPress" type="tinymce.util.Dispatcher">Fires when a keypress event is intercepted inside the editor. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onContextMenu" type="tinymce.util.Dispatcher">Fires when a contextmenu event is intercepted inside the editor. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onSubmit" type="tinymce.util.Dispatcher">Fires when a form submit event is intercepted. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onReset" type="tinymce.util.Dispatcher">Fires when a form reset event is intercepted. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onPaste" type="tinymce.util.Dispatcher">Fires when a paste event is intercepted inside the editor. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onPreProcess" type="tinymce.util.Dispatcher">Fires when the Serializer does a preProcess on the contents. Editor instance.PreProcess object.</field>
	/// <field name="onPostProcess" type="tinymce.util.Dispatcher">Fires when the Serializer does a postProcess on the contents. Editor instance.PreProcess object.</field>
	/// <field name="onBeforeSetContent" type="tinymce.util.Dispatcher">Fires before new contents is added to the editor. Using for example setContent. Editor instance.</field>
	/// <field name="onBeforeGetContent" type="tinymce.util.Dispatcher">Fires before contents is extracted from the editor using for example getContent. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onSetContent" type="tinymce.util.Dispatcher">Fires after the contents has been added to the editor using for example onSetContent. Editor instance.</field>
	/// <field name="onGetContent" type="tinymce.util.Dispatcher">Fires after the contents has been extracted from the editor using for example getContent. Editor instance.</field>
	/// <field name="onLoadContent" type="tinymce.util.Dispatcher">Fires when the editor gets loaded with contents for example when the load method is executed. Editor instance.</field>
	/// <field name="onSaveContent" type="tinymce.util.Dispatcher">Fires when the editor contents gets saved for example when the save method is executed. Editor instance.</field>
	/// <field name="onNodeChange" type="tinymce.util.Dispatcher">Fires when the user changes node location using the mouse or keyboard. Editor instance.</field>
	/// <field name="onChange" type="tinymce.util.Dispatcher">Fires when a new undo level is added to the editor. Editor instance.</field>
	/// <field name="onBeforeExecCommand" type="tinymce.util.Dispatcher">Fires before a command gets executed for example "Bold". Editor instance.</field>
	/// <field name="onExecCommand" type="tinymce.util.Dispatcher">Fires after a command is executed for example "Bold". Editor instance.</field>
	/// <field name="onUndo" type="tinymce.util.Dispatcher">Fires when the contents is undo:ed. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onRedo" type="tinymce.util.Dispatcher">Fires when the contents is redo:ed. Editor instance.W3C DOM Event instance.</field>
	/// <field name="onVisualAid" type="tinymce.util.Dispatcher">Fires when visual aids is enabled/disabled. Editor instance.</field>
	/// <field name="onSetProgressState" type="tinymce.util.Dispatcher">Fires when the progress throbber is shown above the editor. Editor instance.</field>
}

tinymce.Editor.prototype.render = function() {
	/// <summary>Renderes the editor/adds it to the page.</summary>
}

tinymce.Editor.prototype.init = function() {
	/// <summary>Initializes the editor this will be called automatically when all plugins/themes and language packs are loaded by the re...</summary>
}

tinymce.Editor.prototype.setupIframe = function() {
	/// <summary>This method get called by the init method ones the iframe is loaded.</summary>
}

tinymce.Editor.prototype.setupContentEditable = function() {
	/// <summary>Sets up the contentEditable mode.</summary>
}

tinymce.Editor.prototype.focus = function(sf) {
	/// <summary>Focuses/activates the editor.</summary>
	/// <param name="sf" type="Boolean">Skip DOM focus. Just set is as the active editor.</param>
}

tinymce.Editor.prototype.execCallback = function(n) {
	/// <summary>Executes a legacy callback.</summary>
	/// <param name="n" type="String">Name of the callback to execute.</param>
	/// <returns type="Object">Return value passed from callback function.</returns>
}

tinymce.Editor.prototype.translate = function(s) {
	/// <summary>Translates the specified string by replacing variables with language pack items it will also check if there is a key mat...</summary>
	/// <param name="s" type="String">String to translate by the language pack data.</param>
	/// <returns type="String">Translated string.</returns>
}

tinymce.Editor.prototype.getLang = function(n, dv) {
	/// <summary>Returns a language pack item by name/key.</summary>
	/// <param name="n" type="String">Name/key to get from the language pack.</param>
	/// <param name="dv" type="String">Optional default value to retrive.</param>
}

tinymce.Editor.prototype.getParam = function(n, dv, ty) {
	/// <summary>Returns a configuration parameter by name.</summary>
	/// <param name="n" type="String">Configruation parameter to retrive.</param>
	/// <param name="dv" type="String">Optional default value to return.</param>
	/// <param name="ty" type="String">Optional type parameter.</param>
	/// <returns type="String">Configuration parameter value or default value.</returns>
}

tinymce.Editor.prototype.nodeChanged = function(o) {
	/// <summary>Distpaches out a onNodeChange event to all observers.</summary>
	/// <param name="o" type="Object">Optional object to pass along for the node changed event.</param>
}

tinymce.Editor.prototype.addButton = function(n, s) {
	/// <summary>Adds a button that later gets created by the ControlManager.</summary>
	/// <param name="n" type="String">Button name to add.</param>
	/// <param name="s" type="Object">Settings object with title, cmd etc.</param>
}

tinymce.Editor.prototype.addCommand = function(n, f, s) {
	/// <summary>Adds a custom command to the editor, you can also override existing commands with this method.</summary>
	/// <param name="n" type="String">Command name to add/override.</param>
	/// <param name="f" type="function">Function to execute when the command occurs.</param>
	/// <param name="s" type="Object">Optional scope to execute the function in.</param>
}

tinymce.Editor.prototype.addQueryStateHandler = function(n, f, s) {
	/// <summary>Adds a custom query state command to the editor, you can also override existing commands with this method.</summary>
	/// <param name="n" type="String">Command name to add/override.</param>
	/// <param name="f" type="function">Function to execute when the command state retrival occurs.</param>
	/// <param name="s" type="Object">Optional scope to execute the function in.</param>
}

tinymce.Editor.prototype.addQueryValueHandler = function(n, f, s) {
	/// <summary>Adds a custom query value command to the editor, you can also override existing commands with this method.</summary>
	/// <param name="n" type="String">Command name to add/override.</param>
	/// <param name="f" type="function">Function to execute when the command value retrival occurs.</param>
	/// <param name="s" type="Object">Optional scope to execute the function in.</param>
}

tinymce.Editor.prototype.addShortcut = function(pa, desc, cmd_func, sc) {
	/// <summary>Adds a keyboard shortcut for some command or function.</summary>
	/// <param name="pa" type="String">Shortcut pattern. Like for example: ctrl+alt+o.</param>
	/// <param name="desc" type="String">Text description for the command.</param>
	/// <param name="cmd_func" type="">Command name string or function to execute when the key is pressed.</param>
	/// <param name="sc" type="Object">Optional scope to execute the function in.</param>
	/// <returns type="Boolean">true/false state if the shortcut was added or not.</returns>
}

tinymce.Editor.prototype.execCommand = function(cmd, ui, val, a) {
	/// <summary>Executes a command on the current instance.</summary>
	/// <param name="cmd" type="String">Command name to execute, for example mceLink or Bold.</param>
	/// <param name="ui" type="Boolean">True/false state if a UI (dialog) should be presented or not.</param>
	/// <param name="val" type="mixed">Optional command value, this can be anything.</param>
	/// <param name="a" type="Object">Optional arguments object.</param>
	/// <returns type="Boolean">True/false if the command was executed or not.</returns>
}

tinymce.Editor.prototype.queryCommandState = function(c) {
	/// <summary>Returns a command specific state, for example if bold is enabled or not.</summary>
	/// <param name="c" type="string">Command to query state from.</param>
	/// <returns type="Boolean">Command specific state, for example if bold is enabled or not.</returns>
}

tinymce.Editor.prototype.queryCommandValue = function(c) {
	/// <summary>Returns a command specific value, for example the current font size.</summary>
	/// <param name="c" type="string">Command to query value from.</param>
	/// <returns type="Object">Command specific value, for example the current font size.</returns>
}

tinymce.Editor.prototype.show = function() {
	/// <summary>Shows the editor and hides any textarea/div that the editor is supposed to replace.</summary>
}

tinymce.Editor.prototype.hide = function() {
	/// <summary>Hides the editor and shows any textarea/div that the editor is supposed to replace.</summary>
}

tinymce.Editor.prototype.isHidden = function() {
	/// <summary>Returns true/false if the editor is hidden or not.</summary>
	/// <returns type="Boolean">True/false if the editor is hidden or not.</returns>
}

tinymce.Editor.prototype.setProgressState = function(b, ti, o) {
	/// <summary>Sets the progress state, this will display a throbber/progess for the editor.</summary>
	/// <param name="b" type="Boolean">Boolean state if the progress should be shown or hidden.</param>
	/// <param name="ti" type="Number" integer="true">Optional time to wait before the progress gets shown.</param>
	/// <param name="o" type="Object">Optional object to pass to the progress observers.</param>
	/// <returns type="Boolean">Same as the input state.</returns>
}

tinymce.Editor.prototype.load = function(o) {
	/// <summary>Loads contents from the textarea or div element that got converted into an editor instance.</summary>
	/// <param name="o" type="Object">Optional content object, this gets passed around through the whole load process.</param>
	/// <returns type="String">HTML string that got set into the editor.</returns>
}

tinymce.Editor.prototype.save = function(o) {
	/// <summary>Saves the contents from a editor out to the textarea or div element that got converted into an editor instance.</summary>
	/// <param name="o" type="Object">Optional content object, this gets passed around through the whole save process.</param>
	/// <returns type="String">HTML string that got set into the textarea/div.</returns>
}

tinymce.Editor.prototype.setContent = function(h, o) {
	/// <summary>Sets the specified content to the editor instance, this will cleanup the content before it gets set using the different ...</summary>
	/// <param name="h" type="String">Content to set to editor, normally HTML contents but can be other formats as well.</param>
	/// <param name="o" type="Object">Optional content object, this gets passed around through the whole set process.</param>
	/// <returns type="String">HTML string that got set into the editor.</returns>
}

tinymce.Editor.prototype.getContent = function(o) {
	/// <summary>Gets the content from the editor instance, this will cleanup the content before it gets returned using the different cle...</summary>
	/// <param name="o" type="Object">Optional content object, this gets passed around through the whole get process.</param>
	/// <returns type="String">Cleaned content string, normally HTML contents.</returns>
}

tinymce.Editor.prototype.isDirty = function() {
	/// <summary>Returns true/false if the editor is dirty or not.</summary>
	/// <returns type="Boolean">True/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.</returns>
}

tinymce.Editor.prototype.getContainer = function() {
	/// <summary>Returns the editors container element.</summary>
	/// <returns type="Element" domElement="true">HTML DOM element for the editor container.</returns>
}

tinymce.Editor.prototype.getContentAreaContainer = function() {
	/// <summary>Returns the editors content area container element.</summary>
	/// <returns type="Element" domElement="true">HTML DOM element for the editor area container.</returns>
}

tinymce.Editor.prototype.getElement = function() {
	/// <summary>Returns the target element/textarea that got replaced with a TinyMCE editor instance.</summary>
	/// <returns type="Element" domElement="true">HTML DOM element for the replaced element.</returns>
}

tinymce.Editor.prototype.getWin = function() {
	/// <summary>Returns the iframes window object.</summary>
	/// <returns type="Window">Iframe DOM window object.</returns>
}

tinymce.Editor.prototype.getDoc = function() {
	/// <summary>Returns the iframes document object.</summary>
	/// <returns type="Document">Iframe DOM document object.</returns>
}

tinymce.Editor.prototype.getBody = function() {
	/// <summary>Returns the iframes body element.</summary>
	/// <returns type="Element" domElement="true">Iframe body element.</returns>
}

tinymce.Editor.prototype.convertURL = function(u, n, Tag) {
	/// <summary>URL converter function this gets executed each time a user adds an img, a or any other element that has a URL in it.</summary>
	/// <param name="u" type="string">URL to convert.</param>
	/// <param name="n" type="string">Attribute name src, href etc.</param>
	/// <param name="Tag" type="">name or HTML DOM element depending on HTML or DOM insert.</param>
	/// <returns type="string">Converted URL string.</returns>
}

tinymce.Editor.prototype.addVisual = function(e) {
	/// <summary>Adds visual aid for tables, anchors etc so they can be more easily edited inside the editor.</summary>
	/// <param name="e" type="Element" domElement="true">Optional root element to loop though to find tables etc that needs the visual aid.</param>
}

tinymce.Editor.prototype.remove = function() {
	/// <summary>Removes the editor from the dom and EditorManager collection.</summary>
}

tinymce.Editor.prototype.destroy = function(s) {
	/// <summary>Destroys the editor instance by removing all events, element references or other resources that could leak memory.</summary>
	/// <param name="s" type="Boolean">Optional state if the destroy is an automatic destroy or user called one.</param>
}

tinymce.EditorManager = function() {
	/// <summary>This class is used to create multiple editor instances and contain them in a collection.</summary>
	/// <field name="editors" type="Object">Collection of editor instances.</field>
	/// <field name="activeEditor" type="tinymce.Editor">Currently active editor instance.</field>
}

tinymce.EditorManager.preInit = function() {
	/// <summary>Preinitializes the EditorManager class.</summary>
}

tinymce.EditorManager.init = function(s) {
	/// <summary>Initializes a set of editors.</summary>
	/// <param name="s" type="Object">Settings object to be passed to each editor instance.</param>
}

tinymce.EditorManager.get = function(id) {
	/// <summary>Returns a editor instance by id.</summary>
	/// <param name="id" type="String">Editor instance id to return.</param>
	/// <returns type="tinymce.Editor">Editor instance to return.</returns>
}

tinymce.EditorManager.getInstanceById = function(id) {
	/// <summary>Returns a editor instance by id.</summary>
	/// <param name="id" type="String">Editor instance id to return.</param>
	/// <returns type="tinymce.Editor">Editor instance to return.</returns>
}

tinymce.EditorManager.add = function(e) {
	/// <summary>Adds an editor instance to the editor collection.</summary>
	/// <param name="e" type="tinymce.Editor">Editor instance to add to the collection.</param>
	/// <returns type="tinymce.Editor">The same instance that got passed in.</returns>
}

tinymce.EditorManager.remove = function(e) {
	/// <summary>Removes a editor instance from the collection.</summary>
	/// <param name="e" type="tinymce.Editor">Editor instance to remove.</param>
	/// <returns type="tinymce.Editor">The editor that got passed in will be return if it was found otherwise null.</returns>
}

tinymce.EditorManager.execCommand = function(c, u, v) {
	/// <summary>Executes a specific command on the currently active editor.</summary>
	/// <param name="c" type="String">Command to perform for example Bold.</param>
	/// <param name="u" type="Boolean">Optional boolean state if a UI should be presented for the command or not.</param>
	/// <param name="v" type="String">Optional value parameter like for example an URL to a link.</param>
	/// <returns type="Boolean">true/false if the command was executed or not.</returns>
}

tinymce.EditorManager.execInstanceCommand = function(id, c, u, v) {
	/// <summary>Executes a command on a specific editor by id.</summary>
	/// <param name="id" type="String">Editor id to perform the command on.</param>
	/// <param name="c" type="String">Command to perform for example Bold.</param>
	/// <param name="u" type="Boolean">Optional boolean state if a UI should be presented for the command or not.</param>
	/// <param name="v" type="String">Optional value parameter like for example an URL to a link.</param>
	/// <returns type="Boolean">true/false if the command was executed or not.</returns>
}

tinymce.EditorManager.triggerSave = function() {
	/// <summary>Calls the save method on all editor instances in the collection.</summary>
}

tinymce.EditorManager.addI18n = function(p, o) {
	/// <summary>Adds a language pack, this gets called by the loaded language files like en.</summary>
	/// <param name="p" type="String">Prefix for the language items. For example en.myplugin</param>
	/// <param name="o" type="Object">Name/Value collection with items to add to the language group.</param>
}

tinymce.UndoManager = function(ed) {
	/// <summary>This class handles the undo/redo history levels for the editor.</summary>
	/// <param name="ed" type="tinymce.Editor">Editor instance to undo/redo in.</param>
}

tinymce.UndoManager.prototype.add = function(l) {
	/// <summary>Adds a new undo level/snapshot to the undo list.</summary>
	/// <param name="l" type="Object">Optional undo level object to add.</param>
	/// <returns type="Object">Undo level that got added or null it a level wasn't needed.</returns>
}

tinymce.UndoManager.prototype.undo = function() {
	/// <summary>Undoes the last action.</summary>
	/// <returns type="Object">Undo level or null if no undo was performed.</returns>
}

tinymce.UndoManager.prototype.redo = function() {
	/// <summary>Redoes the last action.</summary>
	/// <returns type="Object">Redo level or null if no redo was performed.</returns>
}

tinymce.UndoManager.prototype.clear = function() {
	/// <summary>Removes all undo levels.</summary>
}

tinymce.UndoManager.prototype.hasUndo = function() {
	/// <summary>Returns true/false if the undo manager has any undo levels.</summary>
	/// <returns type="Boolean">true/false if the undo manager has any undo levels.</returns>
}

tinymce.UndoManager.prototype.hasRedo = function() {
	/// <summary>Returns true/false if the undo manager has any redo levels.</summary>
	/// <returns type="Boolean">true/false if the undo manager has any redo levels.</returns>
}

tinymce.WindowManager = function(ed) {
	/// <summary>This class handles the creation of native windows and dialogs.</summary>
	/// <param name="ed" type="tinymce.Editor">Editor instance that the windows are bound to.</param>
}

tinymce.WindowManager.prototype.open = function(s, p) {
	/// <summary>Opens a new window.</summary>
	/// <param name="s" type="Object">Optional name/value settings collection contains things like width/height/url etc.</param>
	/// <param name="p" type="Object">Optional parameters/arguments collection can be used by the dialogs to retrive custom parameters.</param>
}

tinymce.WindowManager.prototype.close = function(w) {
	/// <summary>Closes the specified window.</summary>
	/// <param name="w" type="Window">Native window object to close.</param>
}

tinymce.WindowManager.prototype.createInstance = function(cl) {
	/// <summary>Creates a instance of a class.</summary>
	/// <param name="cl" type="String">Class name to create an instance of.</param>
	/// <returns type="Object">Instance of the specified class.</returns>
}

tinymce.WindowManager.prototype.confirm = function(t, cb, s) {
	/// <summary>Creates a confirm dialog.</summary>
	/// <param name="t" type="String">Title for the new confirm dialog.</param>
	/// <param name="cb" type="function">Callback function to be executed after the user has selected ok or cancel.</param>
	/// <param name="s" type="Object">Optional scope to execute the callback in.</param>
}

tinymce.WindowManager.prototype.alert = function(t, cb, s) {
	/// <summary>Creates a alert dialog.</summary>
	/// <param name="t" type="String">Title for the new alert dialog.</param>
	/// <param name="cb" type="function">Callback function to be executed after the user has selected ok.</param>
	/// <param name="s" type="Object">Optional scope to execute the callback in.</param>
}

tinymce.dom.DOMUtils = function(d, s) {
	/// <summary>Utility class for various DOM manipulation and retrival functions.</summary>
	/// <param name="d" type="Document">Document reference to bind the utility class to.</param>
	/// <param name="s" type="settings">Optional settings collection.</param>
}

tinymce.dom.DOMUtils.prototype.getRoot = function() {
	/// <summary>Returns the root node of the document this is normally the body but might be a DIV.</summary>
	/// <returns type="Element" domElement="true">Root element for the utility class.</returns>
}

tinymce.dom.DOMUtils.prototype.getViewPort = function(w) {
	/// <summary>Returns the viewport of the window.</summary>
	/// <param name="w" type="Window">Optional window to get viewport of.</param>
	/// <returns type="Object">Viewport object with fields x, y, w and h.</returns>
}

tinymce.dom.DOMUtils.prototype.getRect = function(e) {
	/// <summary>Returns the rectangle for a specific element.</summary>
	/// <param name="e" type="">Element object or element ID to get rectange from.</param>
	/// <returns type="object">Rectange for specified element object with x, y, w, h fields.</returns>
}

tinymce.dom.DOMUtils.prototype.getSize = function(e) {
	/// <summary>Returns the size dimensions of the specified element.</summary>
	/// <param name="e" type="">Element object or element ID to get rectange from.</param>
	/// <returns type="object">Rectange for specified element object with w, h fields.</returns>
}

tinymce.dom.DOMUtils.prototype.getParent = function(n, f, r) {
	/// <summary>Returns a node by the specified selector function.</summary>
	/// <param name="n" type="">DOM node to search parents on or ID string.</param>
	/// <param name="f" type="function">Selection function to execute on each node or CSS pattern.</param>
	/// <param name="r" type="Node">Optional root element, never go below this point.</param>
	/// <returns type="Node">DOM Node or null if it wasn't found.</returns>
}

tinymce.dom.DOMUtils.prototype.getParents = function(n, f, r) {
	/// <summary>Returns a node list of all parents matching the specified selector function or pattern.</summary>
	/// <param name="n" type="">DOM node to search parents on or ID string.</param>
	/// <param name="f" type="function">Selection function to execute on each node or CSS pattern.</param>
	/// <param name="r" type="Node">Optional root element, never go below this point.</param>
	/// <returns type="Array">Array of nodes or null if it wasn't found.</returns>
}

tinymce.dom.DOMUtils.prototype.get = function(n) {
	/// <summary>Returns the specified element by ID or the input element if it isn't a string.</summary>
	/// <param name="n" type="">Element id to look for or element to just pass though.</param>
	/// <returns type="Element" domElement="true">Element matching the specified id or null if it wasn't found.</returns>
}

tinymce.dom.DOMUtils.prototype.select = function(p, s) {
	/// <summary>Selects specific elements by a CSS level 3 pattern.</summary>
	/// <param name="p" type="String">CSS level 1 pattern to select/find elements by.</param>
	/// <param name="s" type="Object">Optional root element/scope element to search in.</param>
	/// <returns type="Array">Array with all matched elements.</returns>
}

tinymce.dom.DOMUtils.prototype.is = function(n, patt) {
	/// <summary>Returns true/false if the specified element matches the specified css pattern.</summary>
	/// <param name="n" type="">DOM node to match or an array of nodes to match.</param>
	/// <param name="patt" type="String">CSS pattern to match the element agains.</param>
}

tinymce.dom.DOMUtils.prototype.add = function(Element, n, a, h, c) {
	/// <summary>Adds the specified element to another element or elements.</summary>
	/// <param name="Element" type="">id string, DOM node element or array of id's or elements to add to.</param>
	/// <param name="n" type="">Name of new element to add or existing element to add.</param>
	/// <param name="a" type="Object">Optional object collection with arguments to add to the new element(s).</param>
	/// <param name="h" type="String">Optional inner HTML contents to add for each element.</param>
	/// <param name="c" type="Boolean">Optional internal state to indicate if it should create or add.</param>
	/// <returns type="">Element that got created or array with elements if multiple elements where passed.</returns>
}

tinymce.dom.DOMUtils.prototype.create = function(n, a, h) {
	/// <summary>Creates a new element.</summary>
	/// <param name="n" type="String">Name of new element.</param>
	/// <param name="a" type="Object">Optional object name/value collection with element attributes.</param>
	/// <param name="h" type="String">Optional HTML string to set as inner HTML of the element.</param>
	/// <returns type="Element" domElement="true">HTML DOM node element that got created.</returns>
}

tinymce.dom.DOMUtils.prototype.createHTML = function(n, a, h) {
	/// <summary>Create HTML string for element.</summary>
	/// <param name="n" type="String">Name of new element.</param>
	/// <param name="a" type="Object">Optional object name/value collection with element attributes.</param>
	/// <param name="h" type="String">Optional HTML string to set as inner HTML of the element.</param>
	/// <returns type="String">String with new HTML element like for example: <a href="#">test</a>.</returns>
}

tinymce.dom.DOMUtils.prototype.remove = function(n, k) {
	/// <summary>Removes/deletes the specified element(s) from the DOM.</summary>
	/// <param name="n" type="">ID of element or DOM element object or array containing multiple elements/ids.</param>
	/// <param name="k" type="Boolean">Optional state to keep children or not. If set to true all children will be placed at the location of the removed element.</param>
	/// <returns type="">HTML DOM element that got removed or array of elements depending on input.</returns>
}

tinymce.dom.DOMUtils.prototype.setStyle = function(n, na, v) {
	/// <summary>Sets the CSS style value on a HTML element.</summary>
	/// <param name="n" type="">HTML element/Element ID or Array of elements/ids to set CSS style value on.</param>
	/// <param name="na" type="String">Name of the style value to set.</param>
	/// <param name="v" type="String">Value to set on the style.</param>
}

tinymce.dom.DOMUtils.prototype.getStyle = function(n, na, c) {
	/// <summary>Returns the current style or runtime/computed value of a element.</summary>
	/// <param name="n" type="">HTML element or element id string to get style from.</param>
	/// <param name="na" type="String">Style name to return.</param>
	/// <param name="c" type="String">Computed style.</param>
	/// <returns type="String">Current style or computed style value of a element.</returns>
}

tinymce.dom.DOMUtils.prototype.setStyles = function(e, o) {
	/// <summary>Sets multiple styles on the specified element(s).</summary>
	/// <param name="e" type="">DOM element, element id string or array of elements/ids to set styles on.</param>
	/// <param name="o" type="Object">Name/Value collection of style items to add to the element(s).</param>
}

tinymce.dom.DOMUtils.prototype.setAttrib = function(e, n, v) {
	/// <summary>Sets the specified attributes value of a element or elements.</summary>
	/// <param name="e" type="">DOM element, element id string or array of elements/ids to set attribute on.</param>
	/// <param name="n" type="String">Name of attribute to set.</param>
	/// <param name="v" type="String">Value to set on the attribute of this value is falsy like null 0 or '' it will remove the attribute instead.</param>
}

tinymce.dom.DOMUtils.prototype.setAttribs = function(e, o) {
	/// <summary>Sets the specified attributes of a element or elements.</summary>
	/// <param name="e" type="">DOM element, element id string or array of elements/ids to set attributes on.</param>
	/// <param name="o" type="Object">Name/Value collection of attribute items to add to the element(s).</param>
}

tinymce.dom.DOMUtils.prototype.getAttrib = function(e, n, dv) {
	/// <summary>Returns the specified attribute by name.</summary>
	/// <param name="e" type="">Element string id or DOM element to get attribute from.</param>
	/// <param name="n" type="String">Name of attribute to get.</param>
	/// <param name="dv" type="String">Optional default value to return if the attribute didn't exist.</param>
	/// <returns type="String">Attribute value string, default value or null if the attribute wasn't found.</returns>
}

tinymce.dom.DOMUtils.prototype.getPos = function(n, ro) {
	/// <summary>Returns the absolute x, y position of a node.</summary>
	/// <param name="n" type="">HTML element or element id to get x, y position from.</param>
	/// <param name="ro" type="Element" domElement="true">Optional root element to stop calculations at.</param>
	/// <returns type="object">Absolute position of the specified element object with x, y fields.</returns>
}

tinymce.dom.DOMUtils.prototype.parseStyle = function(st) {
	/// <summary>Parses the specified style value into an object collection.</summary>
	/// <param name="st" type="String">Style value to parse for example: border:1px solid red;.</param>
	/// <returns type="Object">Object representation of that style like {border : '1px solid red'}</returns>
}

tinymce.dom.DOMUtils.prototype.serializeStyle = function(o) {
	/// <summary>Serializes the specified style object into a string.</summary>
	/// <param name="o" type="Object">Object to serialize as string for example: {border : '1px solid red'}</param>
	/// <returns type="String">String representation of the style object for example: border: 1px solid red.</returns>
}

tinymce.dom.DOMUtils.prototype.loadCSS = function(u) {
	/// <summary>Imports/loads the specified CSS file into the document bound to the class.</summary>
	/// <param name="u" type="String">URL to CSS file to load.</param>
}

tinymce.dom.DOMUtils.prototype.addClass = function(Element, c) {
	/// <summary>Adds a class to the specified element or elements.</summary>
	/// <param name="Element" type="">ID string or DOM element or array with elements or IDs.</param>
	/// <param name="c" type="String">Class name to add to each element.</param>
	/// <returns type="">String with new class value or array with new class values for all elements.</returns>
}

tinymce.dom.DOMUtils.prototype.removeClass = function(Element, c) {
	/// <summary>Removes a class from the specified element or elements.</summary>
	/// <param name="Element" type="">ID string or DOM element or array with elements or IDs.</param>
	/// <param name="c" type="String">Class name to remove to each element.</param>
	/// <returns type="">String with new class value or array with new class values for all elements.</returns>
}

tinymce.dom.DOMUtils.prototype.hasClass = function(n, c) {
	/// <summary>Returns true if the specified element has the specified class.</summary>
	/// <param name="n" type="">HTML element or element id string to check CSS class on.</param>
	/// <param name="c" type="String">CSS class to check for.</param>
	/// <returns type="Boolean">true/false if the specified element has the specified class.</returns>
}

tinymce.dom.DOMUtils.prototype.show = function(e) {
	/// <summary>Shows the specified element(s) by ID by setting the "display" style.</summary>
	/// <param name="e" type="">ID of DOM element or DOM element or array with elements or IDs to show.</param>
}

tinymce.dom.DOMUtils.prototype.hide = function(e) {
	/// <summary>Hides the specified element(s) by ID by setting the "display" style.</summary>
	/// <param name="e" type="">ID of DOM element or DOM element or array with elements or IDs to hide.</param>
}

tinymce.dom.DOMUtils.prototype.isHidden = function(e) {
	/// <summary>Returns true/false if the element is hidden or not by checking the "display" style.</summary>
	/// <param name="e" type="">Id or element to check display state on.</param>
	/// <returns type="Boolean">true/false if the element is hidden or not.</returns>
}

tinymce.dom.DOMUtils.prototype.uniqueId = function(p) {
	/// <summary>Returns a unique id.</summary>
	/// <param name="p" type="String">Optional prefix to add infront of all ids defaults to "mce_".</param>
	/// <returns type="String">Unique id.</returns>
}

tinymce.dom.DOMUtils.prototype.setHTML = function(e, h) {
	/// <summary>Sets the specified HTML content inside the element or elements.</summary>
	/// <param name="e" type="">DOM element, element id string or array of elements/ids to set HTML inside.</param>
	/// <param name="h" type="String">HTML content to set as inner HTML of the element.</param>
}

tinymce.dom.DOMUtils.prototype.processHTML = function(h) {
	/// <summary>Processes the HTML by replacing strong, em, del in gecko since it doesn't support them properly in a RTE environment.</summary>
	/// <param name="h" type="String">HTML to process.</param>
	/// <returns type="String">Processed HTML code.</returns>
}

tinymce.dom.DOMUtils.prototype.getOuterHTML = function(e) {
	/// <summary>Returns the outer HTML of an element.</summary>
	/// <param name="e" type="">Element ID or element object to get outer HTML from.</param>
	/// <returns type="String">Outer HTML string.</returns>
}

tinymce.dom.DOMUtils.prototype.setOuterHTML = function(e, h, d) {
	/// <summary>Sets the specified outer HTML on a element or elements.</summary>
	/// <param name="e" type="">DOM element, element id string or array of elements/ids to set outer HTML on.</param>
	/// <param name="h" type="Object">HTML code to set as outer value for the element.</param>
	/// <param name="d" type="Document">Optional document scope to use in this process defaults to the document of the DOM class.</param>
}

tinymce.dom.DOMUtils.prototype.decode = function(s) {
	/// <summary>Entity decode a string, resolves any HTML entities like &aring;.</summary>
	/// <param name="s" type="String">String to decode entities on.</param>
	/// <returns type="String">Entity decoded string.</returns>
}

tinymce.dom.DOMUtils.prototype.encode = function(s) {
	/// <summary>Entity encodes a string, encodes the most common entities <>"& into entities.</summary>
	/// <param name="s" type="String">String to encode with entities.</param>
	/// <returns type="String">Entity encoded string.</returns>
}

tinymce.dom.DOMUtils.prototype.insertAfter = function(Element, r) {
	/// <summary>Inserts a element after the reference element.</summary>
	/// <param name="Element" type="Element" domElement="true">to insert after the reference.</param>
	/// <param name="r" type="">Reference element, element id or array of elements to insert after.</param>
	/// <returns type="">Element that got added or an array with elements.</returns>
}

tinymce.dom.DOMUtils.prototype.isBlock = function(n) {
	/// <summary>Returns true/false if the specified element is a block element or not.</summary>
	/// <param name="n" type="Node">Element/Node to check.</param>
	/// <returns type="Boolean">True/False state if the node is a block element or not.</returns>
}

tinymce.dom.DOMUtils.prototype.replace = function(n, o, k) {
	/// <summary>Replaces the specified element or elements with the specified element, the new element will be cloned if multiple inputs...</summary>
	/// <param name="n" type="Element" domElement="true">New element to replace old ones with.</param>
	/// <param name="o" type="">Element DOM node, element id or array of elements or ids to replace.</param>
	/// <param name="k" type="Boolean">Optional keep children state, if set to true child nodes from the old object will be added to new ones.</param>
}

tinymce.dom.DOMUtils.prototype.findCommonAncestor = function(a, b) {
	/// <summary>Find the common ancestor of two elements.</summary>
	/// <param name="a" type="Element" domElement="true">Element to find common ancestor of.</param>
	/// <param name="b" type="Element" domElement="true">Element to find common ancestor of.</param>
	/// <returns type="Element" domElement="true">Common ancestor element of the two input elements.</returns>
}

tinymce.dom.DOMUtils.prototype.toHex = function(s) {
	/// <summary>Parses the specified RGB color value and returns a hex version of that color.</summary>
	/// <param name="s" type="String">RGB string value like rgb(1,2,3)</param>
	/// <returns type="String">Hex version of that RGB value like #FF00FF.</returns>
}

tinymce.dom.DOMUtils.prototype.getClasses = function() {
	/// <summary>Returns a array of all single CSS classes in the document.</summary>
	/// <returns type="Array">Array with class objects each object has a class field might be other fields in the future.</returns>
}

tinymce.dom.DOMUtils.prototype.run = function(Element, f, s) {
	/// <summary>Executes the specified function on the element by id or dom element node or array of elements/id.</summary>
	/// <param name="Element" type="">ID or DOM element object or array with ids or elements.</param>
	/// <param name="f" type="function">Function to execute for each item.</param>
	/// <param name="s" type="Object">Optional scope to execute the function in.</param>
	/// <returns type="">Single object or array with objects depending on multiple input or not.</returns>
}

tinymce.dom.DOMUtils.prototype.getAttribs = function(n) {
	/// <summary>Returns an NodeList with attributes for the element.</summary>
	/// <param name="n" type="">Element node or string id to get attributes from.</param>
	/// <returns type="NodeList">NodeList with attributes.</returns>
}

tinymce.dom.DOMUtils.prototype.destroy = function() {
	/// <summary>Destroys all internal references to the DOM to solve IE leak issues.</summary>
}

tinymce.dom.DOMUtils.prototype.createRng = function() {
	/// <summary>Created a new DOM Range object.</summary>
	/// <returns type="DOMRange">DOM Range object.</returns>
}

tinymce.dom.DOMUtils.prototype.split = function(pe, e, re) {
	/// <summary>Splits an element into two new elements and places the specified split element or element between the new ones.</summary>
	/// <param name="pe" type="Element" domElement="true">Parent element to split.</param>
	/// <param name="e" type="Element" domElement="true">Element to split at.</param>
	/// <param name="re" type="Element" domElement="true">Optional replacement element to replace the split element by.</param>
	/// <returns type="Element" domElement="true">Returns the split element or the replacement element if that is specified.</returns>
}

tinymce.dom.DOMUtils.prototype.bind = function(o, n, f, s) {
	/// <summary>Adds an event handler to the specified object.</summary>
	/// <param name="o" type="">Object or element id string to add event handler to or an array of elements/ids/documents.</param>
	/// <param name="n" type="String">Name of event handler to add for example: click.</param>
	/// <param name="f" type="function">Function to execute when the event occurs.</param>
	/// <param name="s" type="Object">Optional scope to execute the function in.</param>
	/// <returns type="function">Function callback handler the same as the one passed in.</returns>
}

tinymce.dom.DOMUtils.prototype.unbind = function(o, n, f) {
	/// <summary>Removes the specified event handler by name and function from a element or collection of elements.</summary>
	/// <param name="o" type="">Element ID string or HTML element or an array of elements or ids to remove handler from.</param>
	/// <param name="n" type="String">Event handler name like for example: "click"</param>
	/// <param name="f" type="function">Function to remove.</param>
	/// <returns type="">Bool state if true if the handler was removed or an array with states if multiple elements where passed in.</returns>
}

tinymce.dom.Element = function(Element, Optional) {
	/// <summary>Element class, this enables element blocking in IE.</summary>
	/// <param name="Element" type="String">ID to bind/execute methods on.</param>
	/// <param name="Optional" type="Object">settings name/value collection.</param>
}

tinymce.dom.Element.prototype.on = function(n, f, s) {
	/// <summary>Adds a event handler to the element.</summary>
	/// <param name="n" type="String">Event name like for example "click".</param>
	/// <param name="f" type="function">Function to execute on the specified event.</param>
	/// <param name="s" type="Object">Optional scope to execute function on.</param>
	/// <returns type="function">Event handler function the same as the input function.</returns>
}

tinymce.dom.Element.prototype.getXY = function() {
	/// <summary>Returns the absolute X, Y cordinate of the element.</summary>
	/// <returns type="Object">Objext with x, y cordinate fields.</returns>
}

tinymce.dom.Element.prototype.getSize = function() {
	/// <summary>Returns the size of the element by a object with w and h fields.</summary>
	/// <returns type="Object">Object with element size with a w and h field.</returns>
}

tinymce.dom.Element.prototype.moveTo = function(x, y) {
	/// <summary>Moves the element to a specific absolute position.</summary>
	/// <param name="x" type="Number" integer="true">X cordinate of element position.</param>
	/// <param name="y" type="Number" integer="true">Y cordinate of element position.</param>
}

tinymce.dom.Element.prototype.moveBy = function(x, y) {
	/// <summary>Moves the element relative to the current position.</summary>
	/// <param name="x" type="Number" integer="true">Relative X cordinate of element position.</param>
	/// <param name="y" type="Number" integer="true">Relative Y cordinate of element position.</param>
}

tinymce.dom.Element.prototype.resizeTo = function(w, h) {
	/// <summary>Resizes the element to a specific size.</summary>
	/// <param name="w" type="Number" integer="true">New width of element.</param>
	/// <param name="h" type="Numner">New height of element.</param>
}

tinymce.dom.Element.prototype.resizeBy = function(w, h) {
	/// <summary>Resizes the element relative to the current sizeto a specific size.</summary>
	/// <param name="w" type="Number" integer="true">Relative width of element.</param>
	/// <param name="h" type="Numner">Relative height of element.</param>
}

tinymce.dom.Element.prototype.update = function(k) {
	/// <summary>Updates the element blocker in IE6 based on the style information of the element.</summary>
	/// <param name="k" type="String">Optional function key. Used internally.</param>
}

tinymce.dom.EventUtils = function() {
	/// <summary>This class handles DOM events in a cross platform fasion it also keeps track of element and handler references to be abl...</summary>
}

tinymce.dom.EventUtils.prototype.add = function(o, n, f, s) {
	/// <summary>Adds an event handler to the specified object.</summary>
	/// <param name="o" type="">Object or element id string to add event handler to or an array of elements/ids/documents.</param>
	/// <param name="n" type="">Name of event handler to add for example: click.</param>
	/// <param name="f" type="function">Function to execute when the event occurs.</param>
	/// <param name="s" type="Object">Optional scope to execute the function in.</param>
	/// <returns type="function">Function callback handler the same as the one passed in.</returns>
}

tinymce.dom.EventUtils.prototype.remove = function(o, n, f) {
	/// <summary>Removes the specified event handler by name and function from a element or collection of elements.</summary>
	/// <param name="o" type="">Element ID string or HTML element or an array of elements or ids to remove handler from.</param>
	/// <param name="n" type="String">Event handler name like for example: "click"</param>
	/// <param name="f" type="function">Function to remove.</param>
	/// <returns type="">Bool state if true if the handler was removed or an array with states if multiple elements where passed in.</returns>
}

tinymce.dom.EventUtils.prototype.clear = function(o) {
	/// <summary>Clears all events of a specific object.</summary>
	/// <param name="o" type="Object">DOM element or object to remove all events from.</param>
}

tinymce.dom.EventUtils.prototype.cancel = function(e) {
	/// <summary>Cancels an event for both bubbeling and the default browser behavior.</summary>
	/// <param name="e" type="Event">Event object to cancel.</param>
	/// <returns type="Boolean">Always false.</returns>
}

tinymce.dom.EventUtils.prototype.stop = function(e) {
	/// <summary>Stops propogation/bubbeling of an event.</summary>
	/// <param name="e" type="Event">Event to cancel bubbeling on.</param>
	/// <returns type="Boolean">Always false.</returns>
}

tinymce.dom.EventUtils.prototype.prevent = function(e) {
	/// <summary>Prevent default browser behvaior of an event.</summary>
	/// <param name="e" type="Event">Event to prevent default browser behvaior of an event.</param>
	/// <returns type="Boolean">Always false.</returns>
}

tinymce.dom.EventUtils.prototype.destroy = function() {
	/// <summary>Destroys the instance.</summary>
}

tinymce.dom.ScriptLoader = function(s) {
	/// <summary>This class handles asynchronous/synchronous loading of JavaScript files it will execute callbacks when various items get...</summary>
	/// <param name="s" type="Object">Optional settings object for the ScriptLoaded.</param>
}

tinymce.dom.ScriptLoader.prototype.isDone = function(u) {
	/// <summary>Returns true/false if a script has been loaded or not.</summary>
	/// <param name="u" type="String">URL to check for.</param>
}

tinymce.dom.ScriptLoader.prototype.markDone = function(u) {
	/// <summary>Marks a specific script to be loaded.</summary>
	/// <param name="u" type="string">Absolute URL to the script to mark as loaded.</param>
}

tinymce.dom.ScriptLoader.prototype.add = function(u, cb, s, pr) {
	/// <summary>Adds a specific script to the load queue of the script loader.</summary>
	/// <param name="u" type="String">Absolute URL to script to add.</param>
	/// <param name="cb" type="function">Optional callback function to execute ones this script gets loaded.</param>
	/// <param name="s" type="Object">Optional scope to execute callback in.</param>
	/// <param name="pr" type="Boolean">Optional state to add to top or bottom of load queue. Defaults to bottom.</param>
	/// <returns type="object">Load queue object contains, state, url and callback.</returns>
}

tinymce.dom.ScriptLoader.prototype.load = function(u, cb, s) {
	/// <summary>Loads a specific script directly without adding it to the load queue.</summary>
	/// <param name="u" type="String">Absolute URL to script to add.</param>
	/// <param name="cb" type="function">Optional callback function to execute ones this script gets loaded.</param>
	/// <param name="s" type="Object">Optional scope to execute callback in.</param>
}

tinymce.dom.ScriptLoader.prototype.loadQueue = function(cb, s) {
	/// <summary>Starts the loading of the queue.</summary>
	/// <param name="cb" type="function">Optional callback to execute when all queued items are loaded.</param>
	/// <param name="s" type="Object">Optional scope to execute the callback in.</param>
}

tinymce.dom.ScriptLoader.prototype.eval = function(Script) {
	/// <summary>Evaluates the specified string inside the global namespace/window scope.</summary>
	/// <param name="Script" type="string">contents to evaluate.</param>
}

tinymce.dom.ScriptLoader.prototype.loadScripts = function(sc, cb, s) {
	/// <summary>Loads the specified queue of files and executes the callback ones they are loaded.</summary>
	/// <param name="sc" type="Array">Array of queue items to load.</param>
	/// <param name="cb" type="function">Optional callback to execute ones all items are loaded.</param>
	/// <param name="s" type="Object">Optional scope to execute callback in.</param>
}

tinymce.dom.ScriptLoader.loadScript = function(u, cb) {
	/// <summary>Loads the specified script without adding it to any load queue.</summary>
	/// <param name="u" type="string">URL to dynamically load.</param>
	/// <param name="cb" type="function">Callback function to executed on load.</param>
}

tinymce.dom.Selection = function(dom, win, serializer) {
	/// <summary>This class handles text and control selection it's an crossbrowser utility class.</summary>
	/// <param name="dom" type="tinymce.dom.DOMUtils">DOMUtils object reference.</param>
	/// <param name="win" type="Window">Window to bind the selection object to.</param>
	/// <param name="serializer" type="tinymce.dom.Serializer">DOM serialization class to use for getContent.</param>
}

tinymce.dom.Selection.prototype.getContent = function(s) {
	/// <summary>Returns the selected contents using the DOM serializer passed in to this class.</summary>
	/// <param name="s" type="Object">Optional settings class with for example output format text or html.</param>
	/// <returns type="String">Selected contents in for example HTML format.</returns>
}

tinymce.dom.Selection.prototype.setContent = function(h, s) {
	/// <summary>Sets the current selection to the specified content.</summary>
	/// <param name="h" type="String">HTML contents to set could also be other formats depending on settings.</param>
	/// <param name="s" type="Object">Optional settings object with for example data format.</param>
}

tinymce.dom.Selection.prototype.getStart = function() {
	/// <summary>Returns the start element of a selection range.</summary>
	/// <returns type="Element" domElement="true">Start element of selection range.</returns>
}

tinymce.dom.Selection.prototype.getEnd = function() {
	/// <summary>Returns the end element of a selection range.</summary>
	/// <returns type="Element" domElement="true">End element of selection range.</returns>
}

tinymce.dom.Selection.prototype.getBookmark = function(si) {
	/// <summary>Returns a bookmark location for the current selection.</summary>
	/// <param name="si" type="Boolean">Optional state if the bookmark should be simple or not. Default is complex.</param>
	/// <returns type="Object">Bookmark object, use moveToBookmark with this object to restore the selection.</returns>
}

tinymce.dom.Selection.prototype.moveToBookmark = function(bookmark) {
	/// <summary>Restores the selection to the specified bookmark.</summary>
	/// <param name="bookmark" type="Object">Bookmark to restore selection from.</param>
	/// <returns type="Boolean">true/false if it was successful or not.</returns>
}

tinymce.dom.Selection.prototype.select = function(n, c) {
	/// <summary>Selects the specified element.</summary>
	/// <param name="n" type="Element" domElement="true">HMTL DOM element to select.</param>
	/// <param name="c" type="Boolean">Bool state if the contents should be selected or not on non IE browser.</param>
	/// <returns type="Element" domElement="true">Selected element the same element as the one that got passed in.</returns>
}

tinymce.dom.Selection.prototype.isCollapsed = function() {
	/// <summary>Returns true/false if the selection range is collapsed or not.</summary>
	/// <returns type="Boolean">true/false state if the selection range is collapsed or not. Collapsed means if it's a caret or a larger selection.</returns>
}

tinymce.dom.Selection.prototype.collapse = function(b) {
	/// <summary>Collapse the selection to start or end of range.</summary>
	/// <param name="b" type="Boolean">Optional boolean state if to collapse to end or not. Defaults to start.</param>
}

tinymce.dom.Selection.prototype.getSel = function() {
	/// <summary>Returns the browsers internal selection object.</summary>
	/// <returns type="Selection">Internal browser selection object.</returns>
}

tinymce.dom.Selection.prototype.getRng = function(w3c) {
	/// <summary>Returns the browsers internal range object.</summary>
	/// <param name="w3c" type="Boolean">Forces a compatible W3C range on IE.</param>
	/// <returns type="Range">Internal browser range object.</returns>
}

tinymce.dom.Selection.prototype.setRng = function(r) {
	/// <summary>Changes the selection to the specified DOM range.</summary>
	/// <param name="r" type="Range">Range to select.</param>
}

tinymce.dom.Selection.prototype.setNode = function(n) {
	/// <summary>Sets the current selection to the specified DOM element.</summary>
	/// <param name="n" type="Element" domElement="true">Element to set as the contents of the selection.</param>
	/// <returns type="Element" domElement="true">Returns the element that got passed in.</returns>
}

tinymce.dom.Selection.prototype.getNode = function() {
	/// <summary>Returns the currently selected element or the common ancestor element for both start and end of the selection.</summary>
	/// <returns type="Element" domElement="true">Currently selected element or common ancestor element.</returns>
}

tinymce.dom.Serializer = function(s) {
	/// <summary>This class is used to serialize DOM trees into a string.</summary>
	/// <param name="s" type="Object">Optional name/Value collection of settings for the serializer.</param>
}

tinymce.dom.Serializer.prototype.setEntities = function(s) {
	/// <summary>Sets a list of entities to use for the named entity encoded.</summary>
	/// <param name="s" type="String">List of entities in the following format: number,name,....</param>
}

tinymce.dom.Serializer.prototype.setValidChildRules = function(s) {
	/// <summary>Sets the valid child rules.</summary>
	/// <param name="s" type="String">String with valid child rules.</param>
}

tinymce.dom.Serializer.prototype.addValidChildRules = function(s) {
	/// <summary>Adds valid child rules.</summary>
	/// <param name="s" type="String">String with valid child rules to add.</param>
}

tinymce.dom.Serializer.prototype.setRules = function(s) {
	/// <summary>Sets the valid elements rules of the serializer this enables you to specify things like what elements should be outputte...</summary>
	/// <param name="s" type="String">Valid elements rules string.</param>
}

tinymce.dom.Serializer.prototype.addRules = function(s) {
	/// <summary>Adds valid elements rules to the serializer this enables you to specify things like what elements should be outputted an...</summary>
	/// <param name="s" type="String">Valid elements rules string to add.</param>
}

tinymce.dom.Serializer.prototype.findRule = function(n) {
	/// <summary>Finds a rule object by name.</summary>
	/// <param name="n" type="String">Name to look for in rules collection.</param>
	/// <returns type="Object">Rule object found or null if it wasn't found.</returns>
}

tinymce.dom.Serializer.prototype.findAttribRule = function(ru, n) {
	/// <summary>Finds an attribute rule object by name.</summary>
	/// <param name="ru" type="Object">Rule object to search though.</param>
	/// <param name="n" type="String">Name of the rule to retrive.</param>
	/// <returns type="Object">Rule object of the specified attribute.</returns>
}

tinymce.dom.Serializer.prototype.serialize = function(n, o) {
	/// <summary>Serializes the specified node into a HTML string.</summary>
	/// <param name="n" type="Element" domElement="true">Element/Node to serialize.</param>
	/// <param name="o" type="Object">Object to add serialized contents to, this object will also be passed to the event listeners.</param>
	/// <returns type="String">Serialized HTML contents.</returns>
}

tinymce.dom.StringWriter = function(s) {
	/// <summary>This class writes nodes into a string.</summary>
	/// <param name="s" type="Object">Optional settings object.</param>
}

tinymce.dom.StringWriter.prototype.reset = function() {
	/// <summary>Resets the writer so it can be reused the contents of the writer is cleared.</summary>
}

tinymce.dom.StringWriter.prototype.writeStartElement = function(n) {
	/// <summary>Writes the start of an element like for example: <tag.</summary>
	/// <param name="n" type="String">Name of element to write.</param>
}

tinymce.dom.StringWriter.prototype.writeAttribute = function(n, v) {
	/// <summary>Writes an attrubute like for example: myattr="valie"</summary>
	/// <param name="n" type="String">Attribute name to write.</param>
	/// <param name="v" type="String">Attribute value to write.</param>
}

tinymce.dom.StringWriter.prototype.writeEndElement = function() {
	/// <summary>Write the end of a element.</summary>
}

tinymce.dom.StringWriter.prototype.writeFullEndElement = function() {
	/// <summary>Writes the end of a element.</summary>
}

tinymce.dom.StringWriter.prototype.writeText = function(v) {
	/// <summary>Writes a text node value.</summary>
	/// <param name="v" type="String">Value to append as a text node.</param>
}

tinymce.dom.StringWriter.prototype.writeCDATA = function(v) {
	/// <summary>Writes a CDATA section.</summary>
	/// <param name="v" type="String">Value to write in CDATA.</param>
}

tinymce.dom.StringWriter.prototype.writeComment = function(v) {
	/// <summary>Writes a comment.</summary>
	/// <param name="v" type="String">Value of the comment.</param>
}

tinymce.dom.StringWriter.prototype.writeRaw = function(v) {
	/// <summary>String writer specific function.</summary>
	/// <param name="v" type="String">String with raw contents to write.</param>
}

tinymce.dom.StringWriter.prototype.encode = function(s) {
	/// <summary>String writer specific method.</summary>
	/// <param name="s" type="String">String to encode.</param>
	/// <returns type="String">String with entity encoding of the raw elements like <>&".</returns>
}

tinymce.dom.StringWriter.prototype.getContent = function() {
	/// <summary>Returns a string representation of the elements/nodes written.</summary>
	/// <returns type="String">String representation of the written elements/nodes.</returns>
}

tinymce.dom.XMLWriter = function(s) {
	/// <summary>This class writes nodes into a XML document structure.</summary>
	/// <param name="s" type="Object">Optional settings object.</param>
}

tinymce.dom.XMLWriter.prototype.reset = function() {
	/// <summary>Resets the writer so it can be reused the contents of the writer is cleared.</summary>
}

tinymce.dom.XMLWriter.prototype.writeStartElement = function(n) {
	/// <summary>Writes the start of an element like for example: <tag.</summary>
	/// <param name="n" type="String">Name of element to write.</param>
}

tinymce.dom.XMLWriter.prototype.writeAttribute = function(n, v) {
	/// <summary>Writes an attrubute like for example: myattr="valie"</summary>
	/// <param name="n" type="String">Attribute name to write.</param>
	/// <param name="v" type="String">Attribute value to write.</param>
}

tinymce.dom.XMLWriter.prototype.writeEndElement = function() {
	/// <summary>Write the end of a element.</summary>
}

tinymce.dom.XMLWriter.prototype.writeFullEndElement = function() {
	/// <summary>Writes the end of a element.</summary>
}

tinymce.dom.XMLWriter.prototype.writeText = function(v) {
	/// <summary>Writes a text node value.</summary>
	/// <param name="v" type="String">Value to append as a text node.</param>
}

tinymce.dom.XMLWriter.prototype.writeCDATA = function(v) {
	/// <summary>Writes a CDATA section.</summary>
	/// <param name="v" type="String">Value to write in CDATA.</param>
}

tinymce.dom.XMLWriter.prototype.writeComment = function(v) {
	/// <summary>Writes a comment.</summary>
	/// <param name="v" type="String">Value of the comment.</param>
}

tinymce.dom.XMLWriter.prototype.getContent = function() {
	/// <summary>Returns a string representation of the elements/nodes written.</summary>
	/// <returns type="String">String representation of the written elements/nodes.</returns>
}

tinymce.ui.Button = function(id, s) {
	/// <summary>This class is used to create a UI button.</summary>
	/// <param name="id" type="String">Control id for the button.</param>
	/// <param name="s" type="Object">Optional name/value settings object.</param>
}

tinymce.ui.Button.prototype.renderHTML = function() {
	/// <summary>Renders the button as a HTML string.</summary>
	/// <returns type="String">HTML for the button control element.</returns>
}

tinymce.ui.Button.prototype.postRender = function() {
	/// <summary>Post render handler.</summary>
}

tinymce.ui.Button.prototype.setDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.Button.prototype.isDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.Button.prototype.setActive = function() {
	/// <summary></summary>
}

tinymce.ui.Button.prototype.isActive = function() {
	/// <summary></summary>
}

tinymce.ui.Button.prototype.setState = function() {
	/// <summary></summary>
}

tinymce.ui.Button.prototype.isRendered = function() {
	/// <summary></summary>
}

tinymce.ui.Button.prototype.renderTo = function() {
	/// <summary></summary>
}

tinymce.ui.Button.prototype.remove = function() {
	/// <summary></summary>
}

tinymce.ui.Button.prototype.destroy = function() {
	/// <summary></summary>
}

tinymce.ui.ColorSplitButton = function(id, s) {
	/// <summary>This class is used to create UI color split button.</summary>
	/// <param name="id" type="String">Control id for the color split button.</param>
	/// <param name="s" type="Object">Optional name/value settings object.</param>
	/// <field name="settings" type="Object">Settings object.</field>
	/// <field name="value" type="String">Current color value.</field>
	/// <field name="onShowMenu" type="tinymce.util.Dispatcher">Fires when the menu is shown.</field>
	/// <field name="onHideMenu" type="tinymce.util.Dispatcher">Fires when the menu is hidden.</field>
}

tinymce.ui.ColorSplitButton.prototype.showMenu = function() {
	/// <summary>Shows the color menu.</summary>
}

tinymce.ui.ColorSplitButton.prototype.hideMenu = function(e) {
	/// <summary>Hides the color menu.</summary>
	/// <param name="e" type="Event">Optional event object.</param>
}

tinymce.ui.ColorSplitButton.prototype.renderMenu = function() {
	/// <summary>Renders the menu to the DOM.</summary>
}

tinymce.ui.ColorSplitButton.prototype.setColor = function(c) {
	/// <summary>Sets the current color for the control and hides the menu if it should be visible.</summary>
	/// <param name="c" type="String">Color code value in hex for example: #FF00FF</param>
}

tinymce.ui.ColorSplitButton.prototype.postRender = function() {
	/// <summary>Post render event.</summary>
}

tinymce.ui.ColorSplitButton.prototype.destroy = function() {
	/// <summary>Destroys the control.</summary>
}

tinymce.ui.ColorSplitButton.prototype.renderHTML = function() {
	/// <summary></summary>
}

tinymce.ui.ColorSplitButton.prototype.setDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.ColorSplitButton.prototype.isDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.ColorSplitButton.prototype.setActive = function() {
	/// <summary></summary>
}

tinymce.ui.ColorSplitButton.prototype.isActive = function() {
	/// <summary></summary>
}

tinymce.ui.ColorSplitButton.prototype.setState = function() {
	/// <summary></summary>
}

tinymce.ui.ColorSplitButton.prototype.isRendered = function() {
	/// <summary></summary>
}

tinymce.ui.ColorSplitButton.prototype.renderTo = function() {
	/// <summary></summary>
}

tinymce.ui.ColorSplitButton.prototype.remove = function() {
	/// <summary></summary>
}

tinymce.ui.Container = function(id, s) {
	/// <summary>This class is the base class for all container controls like toolbars.</summary>
	/// <param name="id" type="String">Control id to use for the container.</param>
	/// <param name="s" type="Object">Optional name/value settings object.</param>
	/// <field name="controls" type="Array">Array of controls added to the container.</field>
}

tinymce.ui.Container.prototype.add = function(c) {
	/// <summary>Adds a control to the collection of controls for the container.</summary>
	/// <param name="c" type="tinymce.ui.Control">Control instance to add to the container.</param>
	/// <returns type="tinymce.ui.Control">Same control instance that got passed in.</returns>
}

tinymce.ui.Container.prototype.get = function(n) {
	/// <summary>Returns a control by id from the containers collection.</summary>
	/// <param name="n" type="String">Id for the control to retrive.</param>
	/// <returns type="tinymce.ui.Control">Control instance by the specified name or undefined if it wasn't found.</returns>
}

tinymce.ui.Container.prototype.setDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.Container.prototype.isDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.Container.prototype.setActive = function() {
	/// <summary></summary>
}

tinymce.ui.Container.prototype.isActive = function() {
	/// <summary></summary>
}

tinymce.ui.Container.prototype.setState = function() {
	/// <summary></summary>
}

tinymce.ui.Container.prototype.isRendered = function() {
	/// <summary></summary>
}

tinymce.ui.Container.prototype.renderHTML = function() {
	/// <summary></summary>
}

tinymce.ui.Container.prototype.renderTo = function() {
	/// <summary></summary>
}

tinymce.ui.Container.prototype.postRender = function() {
	/// <summary></summary>
}

tinymce.ui.Container.prototype.remove = function() {
	/// <summary></summary>
}

tinymce.ui.Container.prototype.destroy = function() {
	/// <summary></summary>
}

tinymce.ui.Control = function(id, s) {
	/// <summary>This class is the base class for all controls like buttons, toolbars, containers.</summary>
	/// <param name="id" type="String">Control id.</param>
	/// <param name="s" type="Object">Optional name/value settings object.</param>
}

tinymce.ui.Control.prototype.setDisabled = function(s) {
	/// <summary>Sets the disabled state for the control.</summary>
	/// <param name="s" type="Boolean">Boolean state if the control should be disabled or not.</param>
}

tinymce.ui.Control.prototype.isDisabled = function() {
	/// <summary>Returns true/false if the control is disabled or not.</summary>
	/// <returns type="Boolean">true/false if the control is disabled or not.</returns>
}

tinymce.ui.Control.prototype.setActive = function(s) {
	/// <summary>Sets the activated state for the control.</summary>
	/// <param name="s" type="Boolean">Boolean state if the control should be activated or not.</param>
}

tinymce.ui.Control.prototype.isActive = function() {
	/// <summary>Returns true/false if the control is disabled or not.</summary>
	/// <returns type="Boolean">true/false if the control is disabled or not.</returns>
}

tinymce.ui.Control.prototype.setState = function(c, s) {
	/// <summary>Sets the specified class state for the control.</summary>
	/// <param name="c" type="String">Class name to add/remove depending on state.</param>
	/// <param name="s" type="Boolean">True/false state if the class should be removed or added.</param>
}

tinymce.ui.Control.prototype.isRendered = function() {
	/// <summary>Returns true/false if the control has been rendered or not.</summary>
	/// <returns type="Boolean">State if the control has been rendered or not.</returns>
}

tinymce.ui.Control.prototype.renderHTML = function() {
	/// <summary>Renders the control as a HTML string.</summary>
	/// <returns type="String">HTML for the button control element.</returns>
}

tinymce.ui.Control.prototype.renderTo = function(n) {
	/// <summary>Renders the control to the specified container element.</summary>
	/// <param name="n" type="Element" domElement="true">HTML DOM element to add control to.</param>
}

tinymce.ui.Control.prototype.postRender = function() {
	/// <summary>Post render event.</summary>
}

tinymce.ui.Control.prototype.remove = function() {
	/// <summary>Removes the control.</summary>
}

tinymce.ui.Control.prototype.destroy = function() {
	/// <summary>Destroys the control will free any memory by removing event listeners etc.</summary>
}

tinymce.ui.DropMenu = function(id, s) {
	/// <summary>This class is used to create drop menus, a drop menu can be a context menu, or a menu for a list box or a menu bar.</summary>
	/// <param name="id" type="String">Button control id for the button.</param>
	/// <param name="s" type="Object">Optional name/value settings object.</param>
}

tinymce.ui.DropMenu.prototype.createMenu = function(s) {
	/// <summary>Created a new sub menu for the drop menu control.</summary>
	/// <param name="s" type="Object">Optional name/value settings object.</param>
	/// <returns type="tinymce.ui.DropMenu">New drop menu instance.</returns>
}

tinymce.ui.DropMenu.prototype.update = function() {
	/// <summary>Repaints the menu after new items have been added dynamically.</summary>
}

tinymce.ui.DropMenu.prototype.showMenu = function(x, y, px) {
	/// <summary>Displays the menu at the specified cordinate.</summary>
	/// <param name="x" type="Number" integer="true">Horizontal position of the menu.</param>
	/// <param name="y" type="Number" integer="true">Vertical position of the menu.</param>
	/// <param name="px" type="Numner">Optional parent X position used when menus are cascading.</param>
}

tinymce.ui.DropMenu.prototype.hideMenu = function() {
	/// <summary>Hides the displayed menu.</summary>
}

tinymce.ui.DropMenu.prototype.add = function(o) {
	/// <summary>Adds a new menu, menu item or sub classes of them to the drop menu.</summary>
	/// <param name="o" type="tinymce.ui.Control">Menu or menu item to add to the drop menu.</param>
	/// <returns type="tinymce.ui.Control">Same as the input control, the menu or menu item.</returns>
}

tinymce.ui.DropMenu.prototype.collapse = function(d) {
	/// <summary>Collapses the menu, this will hide the menu and all menu items.</summary>
	/// <param name="d" type="Boolean">Optional deep state. If this is set to true all children will be collapsed as well.</param>
}

tinymce.ui.DropMenu.prototype.remove = function(o) {
	/// <summary>Removes a specific sub menu or menu item from the drop menu.</summary>
	/// <param name="o" type="tinymce.ui.Control">Menu item or menu to remove from drop menu.</param>
	/// <returns type="tinymce.ui.Control">Control instance or null if it wasn't found.</returns>
}

tinymce.ui.DropMenu.prototype.destroy = function() {
	/// <summary>Destroys the menu.</summary>
}

tinymce.ui.DropMenu.prototype.renderNode = function() {
	/// <summary>Renders the specified menu node to the dom.</summary>
	/// <returns type="Element" domElement="true">Container element for the drop menu.</returns>
}

tinymce.ui.DropMenu.prototype.expand = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.isCollapsed = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.addSeparator = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.addMenu = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.hasMenus = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.removeAll = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.setSelected = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.isSelected = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.postRender = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.setDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.isDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.setActive = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.isActive = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.setState = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.isRendered = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.renderHTML = function() {
	/// <summary></summary>
}

tinymce.ui.DropMenu.prototype.renderTo = function() {
	/// <summary></summary>
}

tinymce.ui.ListBox = function(id, s) {
	/// <summary>This class is used to create list boxes/select list.</summary>
	/// <param name="id" type="String">Control id for the list box.</param>
	/// <param name="s" type="Object">Optional name/value settings object.</param>
	/// <field name="items" type="Array">Array of ListBox items.</field>
	/// <field name="onChange" type="tinymce.util.Dispatcher">Fires when the selection has been changed.</field>
	/// <field name="onPostRender" type="tinymce.util.Dispatcher">Fires after the element has been rendered to DOM.</field>
	/// <field name="onAdd" type="tinymce.util.Dispatcher">Fires when a new item is added.</field>
	/// <field name="onRenderMenu" type="tinymce.util.Dispatcher">Fires when the menu gets rendered.</field>
}

tinymce.ui.ListBox.prototype.select = function(va) {
	/// <summary>Selects a item/option by value.</summary>
	/// <param name="va" type="">Value to look for inside the list box or a function selector.</param>
}

tinymce.ui.ListBox.prototype.selectByIndex = function(idx) {
	/// <summary>Selects a item/option by index.</summary>
	/// <param name="idx" type="String">Index to select, pass -1 to select menu/title of select box.</param>
}

tinymce.ui.ListBox.prototype.add = function(n, v, o) {
	/// <summary>Adds a option item to the list box.</summary>
	/// <param name="n" type="String">Title for the new option.</param>
	/// <param name="v" type="String">Value for the new option.</param>
	/// <param name="o" type="Object">Optional object with settings like for example class.</param>
}

tinymce.ui.ListBox.prototype.getLength = function(Number) {
	/// <summary>Returns the number of items inside the list box.</summary>
	/// <param name="Number" type="Number" integer="true">of items inside the list box.</param>
}

tinymce.ui.ListBox.prototype.renderHTML = function() {
	/// <summary>Renders the list box as a HTML string.</summary>
	/// <returns type="String">HTML for the list box control element.</returns>
}

tinymce.ui.ListBox.prototype.showMenu = function() {
	/// <summary>Displays the drop menu with all items.</summary>
}

tinymce.ui.ListBox.prototype.hideMenu = function() {
	/// <summary>Hides the drop menu.</summary>
}

tinymce.ui.ListBox.prototype.renderMenu = function() {
	/// <summary>Renders the menu to the DOM.</summary>
}

tinymce.ui.ListBox.prototype.postRender = function() {
	/// <summary>Post render event.</summary>
}

tinymce.ui.ListBox.prototype.destroy = function() {
	/// <summary>Destroys the ListBox i.</summary>
}

tinymce.ui.ListBox.prototype.setDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.ListBox.prototype.isDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.ListBox.prototype.setActive = function() {
	/// <summary></summary>
}

tinymce.ui.ListBox.prototype.isActive = function() {
	/// <summary></summary>
}

tinymce.ui.ListBox.prototype.setState = function() {
	/// <summary></summary>
}

tinymce.ui.ListBox.prototype.isRendered = function() {
	/// <summary></summary>
}

tinymce.ui.ListBox.prototype.renderTo = function() {
	/// <summary></summary>
}

tinymce.ui.ListBox.prototype.remove = function() {
	/// <summary></summary>
}

tinymce.ui.Menu = function(id, s) {
	/// <summary>This class is base class for all menu types like DropMenus etc.</summary>
	/// <param name="id" type="String">Button control id for the button.</param>
	/// <param name="s" type="Object">Optional name/value settings object.</param>
}

tinymce.ui.Menu.prototype.expand = function(d) {
	/// <summary>Expands the menu, this will show them menu and all menu items.</summary>
	/// <param name="d" type="Boolean">Optional deep state. If this is set to true all children will be expanded as well.</param>
}

tinymce.ui.Menu.prototype.collapse = function(d) {
	/// <summary>Collapses the menu, this will hide the menu and all menu items.</summary>
	/// <param name="d" type="Boolean">Optional deep state. If this is set to true all children will be collapsed as well.</param>
}

tinymce.ui.Menu.prototype.isCollapsed = function() {
	/// <summary>Returns true/false if the menu has been collapsed or not.</summary>
	/// <returns type="Boolean">True/false state if the menu has been collapsed or not.</returns>
}

tinymce.ui.Menu.prototype.add = function(o) {
	/// <summary>Adds a new menu, menu item or sub classes of them to the drop menu.</summary>
	/// <param name="o" type="tinymce.ui.Control">Menu or menu item to add to the drop menu.</param>
	/// <returns type="tinymce.ui.Control">Same as the input control, the menu or menu item.</returns>
}

tinymce.ui.Menu.prototype.addSeparator = function() {
	/// <summary>Adds a menu separator between the menu items.</summary>
	/// <returns type="tinymce.ui.MenuItem">Menu item instance for the separator.</returns>
}

tinymce.ui.Menu.prototype.addMenu = function(o) {
	/// <summary>Adds a sub menu to the menu.</summary>
	/// <param name="o" type="Object">Menu control or a object with settings to be created into an control.</param>
	/// <returns type="tinymce.ui.Menu">Menu control instance passed in or created.</returns>
}

tinymce.ui.Menu.prototype.hasMenus = function() {
	/// <summary>Returns true/false if the menu has sub menus or not.</summary>
	/// <returns type="Boolean">True/false state if the menu has sub menues or not.</returns>
}

tinymce.ui.Menu.prototype.remove = function(o) {
	/// <summary>Removes a specific sub menu or menu item from the menu.</summary>
	/// <param name="o" type="tinymce.ui.Control">Menu item or menu to remove from menu.</param>
	/// <returns type="tinymce.ui.Control">Control instance or null if it wasn't found.</returns>
}

tinymce.ui.Menu.prototype.removeAll = function() {
	/// <summary>Removes all menu items and sub menu items from the menu.</summary>
}

tinymce.ui.Menu.prototype.createMenu = function(s) {
	/// <summary>Created a new sub menu for the menu control.</summary>
	/// <param name="s" type="Object">Optional name/value settings object.</param>
	/// <returns type="tinymce.ui.Menu">New drop menu instance.</returns>
}

tinymce.ui.Menu.prototype.setSelected = function() {
	/// <summary></summary>
}

tinymce.ui.Menu.prototype.isSelected = function() {
	/// <summary></summary>
}

tinymce.ui.Menu.prototype.postRender = function() {
	/// <summary></summary>
}

tinymce.ui.Menu.prototype.setDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.Menu.prototype.isDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.Menu.prototype.setActive = function() {
	/// <summary></summary>
}

tinymce.ui.Menu.prototype.isActive = function() {
	/// <summary></summary>
}

tinymce.ui.Menu.prototype.setState = function() {
	/// <summary></summary>
}

tinymce.ui.Menu.prototype.isRendered = function() {
	/// <summary></summary>
}

tinymce.ui.Menu.prototype.renderHTML = function() {
	/// <summary></summary>
}

tinymce.ui.Menu.prototype.renderTo = function() {
	/// <summary></summary>
}

tinymce.ui.Menu.prototype.destroy = function() {
	/// <summary></summary>
}

tinymce.ui.MenuButton = function(id, s) {
	/// <summary>This class is used to create a UI button.</summary>
	/// <param name="id" type="String">Control id for the split button.</param>
	/// <param name="s" type="Object">Optional name/value settings object.</param>
	/// <field name="onRenderMenu" type="tinymce.util.Dispatcher">Fires when the menu is rendered.</field>
}

tinymce.ui.MenuButton.prototype.showMenu = function() {
	/// <summary>Shows the menu.</summary>
}

tinymce.ui.MenuButton.prototype.renderMenu = function() {
	/// <summary>Renders the menu to the DOM.</summary>
}

tinymce.ui.MenuButton.prototype.hideMenu = function(e) {
	/// <summary>Hides the menu.</summary>
	/// <param name="e" type="Event">Optional event object.</param>
}

tinymce.ui.MenuButton.prototype.postRender = function() {
	/// <summary>Post render handler.</summary>
}

tinymce.ui.MenuButton.prototype.setDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.MenuButton.prototype.isDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.MenuButton.prototype.setActive = function() {
	/// <summary></summary>
}

tinymce.ui.MenuButton.prototype.isActive = function() {
	/// <summary></summary>
}

tinymce.ui.MenuButton.prototype.setState = function() {
	/// <summary></summary>
}

tinymce.ui.MenuButton.prototype.isRendered = function() {
	/// <summary></summary>
}

tinymce.ui.MenuButton.prototype.renderHTML = function() {
	/// <summary></summary>
}

tinymce.ui.MenuButton.prototype.renderTo = function() {
	/// <summary></summary>
}

tinymce.ui.MenuButton.prototype.remove = function() {
	/// <summary></summary>
}

tinymce.ui.MenuButton.prototype.destroy = function() {
	/// <summary></summary>
}

tinymce.ui.MenuItem = function(id, s) {
	/// <summary>This class is base class for all menu item types like DropMenus items etc.</summary>
	/// <param name="id" type="String">Button control id for the button.</param>
	/// <param name="s" type="Object">Optional name/value settings object.</param>
}

tinymce.ui.MenuItem.prototype.setSelected = function(s) {
	/// <summary>Sets the selected state for the control.</summary>
	/// <param name="s" type="Boolean">Boolean state if the control should be selected or not.</param>
}

tinymce.ui.MenuItem.prototype.isSelected = function() {
	/// <summary>Returns true/false if the control is selected or not.</summary>
	/// <returns type="Boolean">true/false if the control is selected or not.</returns>
}

tinymce.ui.MenuItem.prototype.postRender = function() {
	/// <summary>Post render handler.</summary>
}

tinymce.ui.MenuItem.prototype.setDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.MenuItem.prototype.isDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.MenuItem.prototype.setActive = function() {
	/// <summary></summary>
}

tinymce.ui.MenuItem.prototype.isActive = function() {
	/// <summary></summary>
}

tinymce.ui.MenuItem.prototype.setState = function() {
	/// <summary></summary>
}

tinymce.ui.MenuItem.prototype.isRendered = function() {
	/// <summary></summary>
}

tinymce.ui.MenuItem.prototype.renderHTML = function() {
	/// <summary></summary>
}

tinymce.ui.MenuItem.prototype.renderTo = function() {
	/// <summary></summary>
}

tinymce.ui.MenuItem.prototype.remove = function() {
	/// <summary></summary>
}

tinymce.ui.MenuItem.prototype.destroy = function() {
	/// <summary></summary>
}

tinymce.ui.NativeListBox = function(id, s) {
	/// <summary>This class is used to create list boxes/select list.</summary>
	/// <param name="id" type="String">Button control id for the button.</param>
	/// <param name="s" type="Object">Optional name/value settings object.</param>
	/// <field name="items" type=""></field>
	/// <field name="onChange" type="tinymce.util.Dispatcher"></field>
	/// <field name="onPostRender" type="tinymce.util.Dispatcher"></field>
	/// <field name="onAdd" type="tinymce.util.Dispatcher"></field>
	/// <field name="onRenderMenu" type="tinymce.util.Dispatcher"></field>
}

tinymce.ui.NativeListBox.prototype.setDisabled = function(s) {
	/// <summary>Sets the disabled state for the control.</summary>
	/// <param name="s" type="Boolean">Boolean state if the control should be disabled or not.</param>
}

tinymce.ui.NativeListBox.prototype.isDisabled = function() {
	/// <summary>Returns true/false if the control is disabled or not.</summary>
	/// <returns type="Boolean">true/false if the control is disabled or not.</returns>
}

tinymce.ui.NativeListBox.prototype.select = function(va) {
	/// <summary>Selects a item/option by value.</summary>
	/// <param name="va" type="">Value to look for inside the list box or a function selector.</param>
}

tinymce.ui.NativeListBox.prototype.selectByIndex = function(idx) {
	/// <summary>Selects a item/option by index.</summary>
	/// <param name="idx" type="String">Index to select, pass -1 to select menu/title of select box.</param>
}

tinymce.ui.NativeListBox.prototype.add = function(n, v, o) {
	/// <summary>Adds a option item to the list box.</summary>
	/// <param name="n" type="String">Title for the new option.</param>
	/// <param name="v" type="String">Value for the new option.</param>
	/// <param name="o" type="Object">Optional object with settings like for example class.</param>
}

tinymce.ui.NativeListBox.prototype.getLength = function() {
	/// <summary>Executes the specified callback function for the menu item.</summary>
}

tinymce.ui.NativeListBox.prototype.renderHTML = function() {
	/// <summary>Renders the list box as a HTML string.</summary>
	/// <returns type="String">HTML for the list box control element.</returns>
}

tinymce.ui.NativeListBox.prototype.postRender = function() {
	/// <summary>Post render handler.</summary>
}

tinymce.ui.NativeListBox.prototype.showMenu = function() {
	/// <summary></summary>
}

tinymce.ui.NativeListBox.prototype.hideMenu = function() {
	/// <summary></summary>
}

tinymce.ui.NativeListBox.prototype.renderMenu = function() {
	/// <summary></summary>
}

tinymce.ui.NativeListBox.prototype.destroy = function() {
	/// <summary></summary>
}

tinymce.ui.NativeListBox.prototype.setActive = function() {
	/// <summary></summary>
}

tinymce.ui.NativeListBox.prototype.isActive = function() {
	/// <summary></summary>
}

tinymce.ui.NativeListBox.prototype.setState = function() {
	/// <summary></summary>
}

tinymce.ui.NativeListBox.prototype.isRendered = function() {
	/// <summary></summary>
}

tinymce.ui.NativeListBox.prototype.renderTo = function() {
	/// <summary></summary>
}

tinymce.ui.NativeListBox.prototype.remove = function() {
	/// <summary></summary>
}

tinymce.ui.Separator = function(id, s) {
	/// <summary>This class is used to create vertical separator between other controls.</summary>
	/// <param name="id" type="String">Control id to use for the Separator.</param>
	/// <param name="s" type="Object">Optional name/value settings object.</param>
}

tinymce.ui.Separator.prototype.renderHTML = function() {
	/// <summary>Renders the separator as a HTML string.</summary>
	/// <returns type="String">HTML for the separator control element.</returns>
}

tinymce.ui.Separator.prototype.setDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.Separator.prototype.isDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.Separator.prototype.setActive = function() {
	/// <summary></summary>
}

tinymce.ui.Separator.prototype.isActive = function() {
	/// <summary></summary>
}

tinymce.ui.Separator.prototype.setState = function() {
	/// <summary></summary>
}

tinymce.ui.Separator.prototype.isRendered = function() {
	/// <summary></summary>
}

tinymce.ui.Separator.prototype.renderTo = function() {
	/// <summary></summary>
}

tinymce.ui.Separator.prototype.postRender = function() {
	/// <summary></summary>
}

tinymce.ui.Separator.prototype.remove = function() {
	/// <summary></summary>
}

tinymce.ui.Separator.prototype.destroy = function() {
	/// <summary></summary>
}

tinymce.ui.SplitButton = function(id, s) {
	/// <summary>This class is used to create a split button.</summary>
	/// <param name="id" type="String">Control id for the split button.</param>
	/// <param name="s" type="Object">Optional name/value settings object.</param>
}

tinymce.ui.SplitButton.prototype.renderHTML = function() {
	/// <summary>Renders the split button as a HTML string.</summary>
	/// <returns type="String">HTML for the split button control element.</returns>
}

tinymce.ui.SplitButton.prototype.postRender = function() {
	/// <summary>Post render handler.</summary>
}

tinymce.ui.SplitButton.prototype.setDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.SplitButton.prototype.isDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.SplitButton.prototype.setActive = function() {
	/// <summary></summary>
}

tinymce.ui.SplitButton.prototype.isActive = function() {
	/// <summary></summary>
}

tinymce.ui.SplitButton.prototype.setState = function() {
	/// <summary></summary>
}

tinymce.ui.SplitButton.prototype.isRendered = function() {
	/// <summary></summary>
}

tinymce.ui.SplitButton.prototype.renderTo = function() {
	/// <summary></summary>
}

tinymce.ui.SplitButton.prototype.remove = function() {
	/// <summary></summary>
}

tinymce.ui.SplitButton.prototype.destroy = function() {
	/// <summary></summary>
}

tinymce.ui.Toolbar = function() {
	/// <summary>This class is used to create toolbars a toolbar is a container for other controls like buttons etc.</summary>
	/// <field name="controls" type=""></field>
}

tinymce.ui.Toolbar.prototype.renderHTML = function() {
	/// <summary>Renders the toolbar as a HTML string.</summary>
	/// <returns type="String">HTML for the toolbar control.</returns>
}

tinymce.ui.Toolbar.prototype.add = function() {
	/// <summary></summary>
}

tinymce.ui.Toolbar.prototype.get = function() {
	/// <summary></summary>
}

tinymce.ui.Toolbar.prototype.setDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.Toolbar.prototype.isDisabled = function() {
	/// <summary></summary>
}

tinymce.ui.Toolbar.prototype.setActive = function() {
	/// <summary></summary>
}

tinymce.ui.Toolbar.prototype.isActive = function() {
	/// <summary></summary>
}

tinymce.ui.Toolbar.prototype.setState = function() {
	/// <summary></summary>
}

tinymce.ui.Toolbar.prototype.isRendered = function() {
	/// <summary></summary>
}

tinymce.ui.Toolbar.prototype.renderTo = function() {
	/// <summary></summary>
}

tinymce.ui.Toolbar.prototype.postRender = function() {
	/// <summary></summary>
}

tinymce.ui.Toolbar.prototype.remove = function() {
	/// <summary></summary>
}

tinymce.ui.Toolbar.prototype.destroy = function() {
	/// <summary></summary>
}

tinymce.util.Cookie = function() {
	/// <summary>This class contains simple cookie manangement functions.</summary>
}

tinymce.util.Cookie.getHash = function(n) {
	/// <summary>Parses the specified query string into an name/value object.</summary>
	/// <param name="n" type="String">String to parse into a n Hashtable object.</param>
	/// <returns type="Object">Name/Value object with items parsed from querystring.</returns>
}

tinymce.util.Cookie.setHash = function(n, v, e, p, d, s) {
	/// <summary>Sets a hashtable name/value object to a cookie.</summary>
	/// <param name="n" type="String">Name of the cookie.</param>
	/// <param name="v" type="Object">Hashtable object to set as cookie.</param>
	/// <param name="e" type="Date">Optional date object for the expiration of the cookie.</param>
	/// <param name="p" type="String">Optional path to restrict the cookie to.</param>
	/// <param name="d" type="String">Optional domain to restrict the cookie to.</param>
	/// <param name="s" type="String">Is the cookie secure or not.</param>
}

tinymce.util.Cookie.get = function(n) {
	/// <summary>Gets the raw data of a cookie by name.</summary>
	/// <param name="n" type="String">Name of cookie to retrive.</param>
	/// <returns type="String">Cookie data string.</returns>
}

tinymce.util.Cookie.set = function(n, v, e, p, d, s) {
	/// <summary>Sets a raw cookie string.</summary>
	/// <param name="n" type="String">Name of the cookie.</param>
	/// <param name="v" type="String">Raw cookie data.</param>
	/// <param name="e" type="Date">Optional date object for the expiration of the cookie.</param>
	/// <param name="p" type="String">Optional path to restrict the cookie to.</param>
	/// <param name="d" type="String">Optional domain to restrict the cookie to.</param>
	/// <param name="s" type="String">Is the cookie secure or not.</param>
}

tinymce.util.Cookie.remove = function(n, p) {
	/// <summary>Removes/deletes a cookie by name.</summary>
	/// <param name="n" type="String">Cookie name to remove/delete.</param>
	/// <param name="p" type="Strong">Optional path to remove the cookie from.</param>
}

tinymce.util.Dispatcher = function(s) {
	/// <summary>This class is used to dispatch event to observers/listeners.</summary>
	/// <param name="s" type="Object">Optional default execution scope for all observer functions.</param>
}

tinymce.util.Dispatcher.prototype.add = function(cb, s) {
	/// <summary>Add an observer function to be executed when a dispatch call is done.</summary>
	/// <param name="cb" type="function">Callback function to execute when a dispatch event occurs.</param>
	/// <param name="s" type="Object">Optional execution scope, defaults to the one specified in the class constructor.</param>
	/// <returns type="function">Returns the same function as the one passed on.</returns>
}

tinymce.util.Dispatcher.prototype.addToTop = function(cb, s) {
	/// <summary>Add an observer function to be executed to the top of the list of observers.</summary>
	/// <param name="cb" type="function">Callback function to execute when a dispatch event occurs.</param>
	/// <param name="s" type="Object">Optional execution scope, defaults to the one specified in the class constructor.</param>
	/// <returns type="function">Returns the same function as the one passed on.</returns>
}

tinymce.util.Dispatcher.prototype.remove = function(cb) {
	/// <summary>Removes an observer function.</summary>
	/// <param name="cb" type="function">Observer function to remove.</param>
	/// <returns type="function">The same function that got passed in or null if it wasn't found.</returns>
}

tinymce.util.Dispatcher.prototype.dispatch = function() {
	/// <summary>Dispatches an event to all observers/listeners.</summary>
	/// <param name="" type="Object">Any number of arguments to dispatch.</param>
	/// <returns type="Object">Last observer functions return value.</returns>
}

tinymce.util.JSON = function() {
	/// <summary>JSON parser and serializer class.</summary>
}

tinymce.util.JSON.serialize = function(o) {
	/// <summary>Serializes the specified object as a JSON string.</summary>
	/// <param name="o" type="Object">Object to serialize as a JSON string.</param>
	/// <returns type="string">JSON string serialized from input.</returns>
}

tinymce.util.JSON.parse = function(s) {
	/// <summary>Unserializes/parses the specified JSON string into a object.</summary>
	/// <param name="s" type="string">JSON String to parse into a JavaScript object.</param>
	/// <returns type="Object">Object from input JSON string or undefined if it failed.</returns>
}

tinymce.util.JSONRequest = function(s) {
	/// <summary>This class enables you to use JSON-RPC to call backend methods.</summary>
	/// <param name="s" type="Object">Optional settings object.</param>
}

tinymce.util.JSONRequest.prototype.send = function(o) {
	/// <summary>Sends a JSON-RPC call.</summary>
	/// <param name="o" type="Object">Call object where there are three field id, method and params this object should also contain callbacks etc.</param>
}

tinymce.util.JSONRequest.sendRPC = function(o) {
	/// <summary>Simple helper function to send a JSON-RPC request without the need to initialize an object.</summary>
	/// <param name="o" type="Object">Call object where there are three field id, method and params this object should also contain callbacks etc.</param>
}

tinymce.util.URI = function(u, s) {
	/// <summary>This class handles parsing, modification and serialization of URI/URL strings.</summary>
	/// <param name="u" type="String">URI string to parse.</param>
	/// <param name="s" type="Object">Optional settings object.</param>
}

tinymce.util.URI.prototype.setPath = function(p) {
	/// <summary>Sets the internal path part of the URI.</summary>
	/// <param name="p" type="string">Path string to set.</param>
}

tinymce.util.URI.prototype.toRelative = function(u) {
	/// <summary>Converts the specified URI into a relative URI based on the current URI instance location.</summary>
	/// <param name="u" type="String">URI to convert into a relative path/URI.</param>
	/// <returns type="String">Relative URI from the point specified in the current URI instance.</returns>
}

tinymce.util.URI.prototype.toAbsolute = function(u, nh) {
	/// <summary>Converts the specified URI into a absolute URI based on the current URI instance location.</summary>
	/// <param name="u" type="String">URI to convert into a relative path/URI.</param>
	/// <param name="nh" type="Boolean">No host and protocol prefix.</param>
	/// <returns type="String">Absolute URI from the point specified in the current URI instance.</returns>
}

tinymce.util.URI.prototype.toRelPath = function(base, path) {
	/// <summary>Converts a absolute path into a relative path.</summary>
	/// <param name="base" type="String">Base point to convert the path from.</param>
	/// <param name="path" type="String">Absolute path to convert into a relative path.</param>
}

tinymce.util.URI.prototype.toAbsPath = function(base, path) {
	/// <summary>Converts a relative path into a absolute path.</summary>
	/// <param name="base" type="String">Base point to convert the path from.</param>
	/// <param name="path" type="String">Relative path to convert into an absolute path.</param>
}

tinymce.util.URI.prototype.getURI = function(nh) {
	/// <summary>Returns the full URI of the internal structure.</summary>
	/// <param name="nh" type="Boolean">Optional no host and protocol part. Defaults to false.</param>
}

tinymce.util.XHR = function() {
	/// <summary>This class enables you to send XMLHTTPRequests cross browser.</summary>
}

tinymce.util.XHR.send = function(o) {
	/// <summary>Sends a XMLHTTPRequest.</summary>
	/// <param name="o" type="Object">Object will target URL, callbacks and other info needed to make the request.</param>
}

tinyMCEPopup = function() {
	/// <summary>TinyMCE popup/dialog helper class.</summary>
}

tinyMCEPopup.init = function() {
	/// <summary>Initializes the popup this will be called automatically.</summary>
}

tinyMCEPopup.getWin = function() {
	/// <summary>Returns the reference to the parent window that opened the dialog.</summary>
	/// <returns type="Window">Reference to the parent window that opened the dialog.</returns>
}

tinyMCEPopup.getWindowArg = function(n, dv) {
	/// <summary>Returns a window argument/parameter by name.</summary>
	/// <param name="n" type="String">Name of the window argument to retrive.</param>
	/// <param name="dv" type="String">Optional default value to return.</param>
	/// <returns type="String">Argument value or default value if it wasn't found.</returns>
}

tinyMCEPopup.getParam = function(n, dv) {
	/// <summary>Returns a editor parameter/config option value.</summary>
	/// <param name="n" type="String">Name of the editor config option to retrive.</param>
	/// <param name="dv" type="String">Optional default value to return.</param>
	/// <returns type="String">Parameter value or default value if it wasn't found.</returns>
}

tinyMCEPopup.getLang = function(n, dv) {
	/// <summary>Returns a language item by key.</summary>
	/// <param name="n" type="String">Language item like mydialog.something.</param>
	/// <param name="dv" type="String">Optional default value to return.</param>
	/// <returns type="String">Language value for the item like "my string" or the default value if it wasn't found.</returns>
}

tinyMCEPopup.execCommand = function(cmd, ui, val, a) {
	/// <summary>Executed a command on editor that opened the dialog/popup.</summary>
	/// <param name="cmd" type="String">Command to execute.</param>
	/// <param name="ui" type="Boolean">Optional boolean value if the UI for the command should be presented or not.</param>
	/// <param name="val" type="Object">Optional value to pass with the comman like an URL.</param>
	/// <param name="a" type="Object">Optional arguments object.</param>
}

tinyMCEPopup.resizeToInnerSize = function() {
	/// <summary>Resizes the dialog to the inner size of the window.</summary>
}

tinyMCEPopup.executeOnLoad = function(s) {
	/// <summary>Will executed the specified string when the page has been loaded.</summary>
	/// <param name="s" type="String">String to evalutate on init.</param>
}

tinyMCEPopup.storeSelection = function() {
	/// <summary>Stores the current editor selection for later restoration.</summary>
}

tinyMCEPopup.restoreSelection = function() {
	/// <summary>Restores any stored selection.</summary>
}

tinyMCEPopup.requireLangPack = function() {
	/// <summary>Loads a specific dialog language pack.</summary>
}

tinyMCEPopup.pickColor = function(e, element_id) {
	/// <summary>Executes a color picker on the specified element id.</summary>
	/// <param name="e" type="DOMEvent">DOM event object.</param>
	/// <param name="element_id" type="string">Element id to be filled with the color value from the picker.</param>
}

tinyMCEPopup.openBrowser = function(element_id, type, option) {
	/// <summary>Opens a filebrowser/imagebrowser this will set the output value from the browser as a value on the specified element.</summary>
	/// <param name="element_id" type="string">Id of the element to set value in.</param>
	/// <param name="type" type="string">Type of browser to open image/file/flash.</param>
	/// <param name="option" type="string">Option name to get the file_broswer_callback function name from.</param>
}

tinyMCEPopup.confirm = function(t, cb, s) {
	/// <summary>Creates a confirm dialog.</summary>
	/// <param name="t" type="String">Title for the new confirm dialog.</param>
	/// <param name="cb" type="function">Callback function to be executed after the user has selected ok or cancel.</param>
	/// <param name="s" type="Object">Optional scope to execute the callback in.</param>
}

tinyMCEPopup.alert = function(t, cb, s) {
	/// <summary>Creates a alert dialog.</summary>
	/// <param name="t" type="String">Title for the new alert dialog.</param>
	/// <param name="cb" type="function">Callback function to be executed after the user has selected ok.</param>
	/// <param name="s" type="Object">Optional scope to execute the callback in.</param>
}

tinyMCEPopup.close = function() {
	/// <summary>Closes the current window.</summary>
}

// Namespaces
tinymce.DOM = new tinymce.dom.DOMUtils();
tinymce.isOpera = new Boolean();
tinymce.isWebKit = new Boolean();
tinymce.isIE = new Boolean();
tinymce.isIE6 = new Boolean();
tinymce.isGecko = new Boolean();
tinymce.isMac = new Boolean();
tinymce.isAir = new Boolean();
tinymce.is = function(o, t) {
	/// <summary>Checks if a object is of a specific type for example an array.</summary>
	/// <param name="o" type="Object">Object to check type of.</param>
	/// <param name="t" type="string">Optional type to check for.</param>
	/// <returns type="Boolean">true/false if the object is of the specified type.</returns>
}

tinymce.each = function(o, cb, s) {
	/// <summary>Performs an iteration of all items in a collection such as an object or array.</summary>
	/// <param name="o" type="Object">Collection to iterate.</param>
	/// <param name="cb" type="function">Callback function to execute for each item.</param>
	/// <param name="s" type="Object">Optional scope to execute the callback in.</param>
}

tinymce.map = function(a, f) {
	/// <summary>Creates a new array by the return value of each iteration function call.</summary>
	/// <param name="a" type="Array">Array of items to iterate.</param>
	/// <param name="f" type="function">Function to call for each item. It's return value will be the new value.</param>
	/// <returns type="Array">Array with new values based on function return values.</returns>
}

tinymce.grep = function(a, f) {
	/// <summary>Filters out items from the input array by calling the specified function for each item.</summary>
	/// <param name="a" type="Array">Array of items to loop though.</param>
	/// <param name="f" type="function">Function to call for each item. Include/exclude depends on it's return value.</param>
	/// <returns type="Array">New array with values imported and filtered based in input.</returns>
}

tinymce.inArray = function(a, v) {
	/// <summary>Returns the index of a value in an array, this method will return -1 if the item wasn't found.</summary>
	/// <param name="a" type="Array">Array/Object to search for value in.</param>
	/// <param name="v" type="Object">Value to check for inside the array.</param>
	/// <returns type="">Index of item inside the array inside an object. Or -1 if it wasn't found.</returns>
}

tinymce.extend = function(o, en) {
	/// <summary>Extends an object with the specified other object(s).</summary>
	/// <param name="o" type="Object">Object to extend with new items.</param>
	/// <param name="en" type="Object">Object(s) to extend the specified object with.</param>
	/// <returns type="Object">o New extended object, same reference as the input object.</returns>
}

tinymce.trim = function(s) {
	/// <summary>Removes whitespace from the beginning and end of a string.</summary>
	/// <param name="s" type="String">String to remove whitespace from.</param>
	/// <returns type="String">New string with removed whitespace.</returns>
}

tinymce.create = function(s, o) {
	/// <summary>Creates a class, subclass or static singleton.</summary>
	/// <param name="s" type="String">Class name, inheritage and prefix.</param>
	/// <param name="o" type="Object">Collection of methods to add to the class.</param>
}

tinymce.walk = function(o, f, n, s) {
	/// <summary>Executed the specified function for each item in a object tree.</summary>
	/// <param name="o" type="Object">Object tree to walk though.</param>
	/// <param name="f" type="function">Function to call for each item.</param>
	/// <param name="n" type="String">Optional name of collection inside the objects to walk for example childNodes.</param>
	/// <param name="s" type="String">Optional scope to execute the function in.</param>
}

tinymce.createNS = function(n, o) {
	/// <summary>Creates a namespace on a specific object.</summary>
	/// <param name="n" type="String">Namespace to create for example a.b.c.d.</param>
	/// <param name="o" type="Object">Optional object to add namespace to, defaults to window.</param>
	/// <returns type="Object">New namespace object the last item in path.</returns>
}

tinymce.resolve = function(n, o) {
	/// <summary>Resolves a string and returns the object from a specific structure.</summary>
	/// <param name="n" type="String">Path to resolve for example a.b.c.d.</param>
	/// <param name="o" type="Object">Optional object to search though, defaults to window.</param>
	/// <returns type="Object">Last object in path or null if it couldn't be resolved.</returns>
}

tinymce.addUnload = function(f, s) {
	/// <summary>Adds an unload handler to the document.</summary>
	/// <param name="f" type="function">Function to execute before the document gets unloaded.</param>
	/// <param name="s" type="Object">Optional scope to execute the function in.</param>
	/// <returns type="function">Returns the specified unload handler function.</returns>
}

tinymce.removeUnload = function(f) {
	/// <summary>Removes the specified function form the unload handler list.</summary>
	/// <param name="f" type="function">Function to remove from unload handler list.</param>
	/// <returns type="function">Removed function name or null if it wasn't found.</returns>
}

tinymce.explode = function(s, d) {
	/// <summary>Splits a string but removes the whitespace before and after each value.</summary>
	/// <param name="s" type="string">String to split.</param>
	/// <param name="d" type="string">Delimiter to split by.</param>
}

tinymce.dom.Event = new tinymce.dom.EventUtils();
tinyMCE = tinymce.EditorManager;
