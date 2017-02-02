define('tinymce.core.api.Main', [
	'tinymce.core.geom.Rect',
	'tinymce.core.util.Promise',
	'tinymce.core.util.Delay',
	'tinymce.core.Env',
	'tinymce.core.dom.EventUtils',
	'tinymce.core.dom.Sizzle',
	'tinymce.core.util.Tools',
	'tinymce.core.dom.DomQuery',
	'tinymce.core.html.Styles',
	'tinymce.core.dom.TreeWalker',
	'tinymce.core.html.Entities',
	'tinymce.core.dom.DOMUtils',
	'tinymce.core.dom.ScriptLoader',
	'tinymce.core.AddOnManager',
	'tinymce.core.dom.RangeUtils',
	'tinymce.core.html.Node',
	'tinymce.core.html.Schema',
	'tinymce.core.html.SaxParser',
	'tinymce.core.html.DomParser',
	'tinymce.core.html.Writer',
	'tinymce.core.html.Serializer',
	'tinymce.core.dom.Serializer',
	'tinymce.core.util.VK',
	'tinymce.core.dom.ControlSelection',
	'tinymce.core.dom.BookmarkManager',
	'tinymce.core.dom.Selection',
	'tinymce.core.Formatter',
	'tinymce.core.UndoManager',
	'tinymce.core.EditorCommands',
	'tinymce.core.util.URI',
	'tinymce.core.util.Class',
	'tinymce.core.util.EventDispatcher',
	'tinymce.core.util.Observable',
	'tinymce.core.ui.Selector',
	'tinymce.core.ui.Collection',
	'tinymce.core.ui.ReflowQueue',
	'tinymce.core.ui.Control',
	'tinymce.core.ui.Factory',
	'tinymce.core.ui.KeyboardNavigation',
	'tinymce.core.ui.Container',
	'tinymce.core.ui.DragHelper',
	'tinymce.core.ui.Scrollable',
	'tinymce.core.ui.Panel',
	'tinymce.core.ui.Movable',
	'tinymce.core.ui.Resizable',
	'tinymce.core.ui.FloatPanel',
	'tinymce.core.ui.Window',
	'tinymce.core.ui.MessageBox',
	'tinymce.core.WindowManager',
	'tinymce.core.ui.Tooltip',
	'tinymce.core.ui.Widget',
	'tinymce.core.ui.Progress',
	'tinymce.core.ui.Notification',
	'tinymce.core.NotificationManager',
	'tinymce.core.EditorObservable',
	'tinymce.core.Shortcuts',
	'tinymce.core.Editor',
	'tinymce.core.util.I18n',
	'tinymce.core.FocusManager',
	'tinymce.core.EditorManager',
	'tinymce.core.util.XHR',
	'tinymce.core.util.JSON',
	'tinymce.core.util.JSONRequest',
	'tinymce.core.util.JSONP',
	'tinymce.core.util.LocalStorage',
	'tinymce.core.Compat',
	'tinymce.core.ui.Layout',
	'tinymce.core.ui.AbsoluteLayout',
	'tinymce.core.ui.Button',
	'tinymce.core.ui.ButtonGroup',
	'tinymce.core.ui.Checkbox',
	'tinymce.core.ui.ComboBox',
	'tinymce.core.ui.ColorBox',
	'tinymce.core.ui.PanelButton',
	'tinymce.core.ui.ColorButton',
	'tinymce.core.util.Color',
	'tinymce.core.ui.ColorPicker',
	'tinymce.core.ui.Path',
	'tinymce.core.ui.ElementPath',
	'tinymce.core.ui.FormItem',
	'tinymce.core.ui.Form',
	'tinymce.core.ui.FieldSet',
	'tinymce.core.ui.FilePicker',
	'tinymce.core.ui.FitLayout',
	'tinymce.core.ui.FlexLayout',
	'tinymce.core.ui.FlowLayout',
	'tinymce.core.ui.FormatControls',
	'tinymce.core.ui.GridLayout',
	'tinymce.core.ui.Iframe',
	'tinymce.core.ui.InfoBox',
	'tinymce.core.ui.Label',
	'tinymce.core.ui.Toolbar',
	'tinymce.core.ui.MenuBar',
	'tinymce.core.ui.MenuButton',
	'tinymce.core.ui.MenuItem',
	'tinymce.core.ui.Throbber',
	'tinymce.core.ui.Menu',
	'tinymce.core.ui.ListBox',
	'tinymce.core.ui.Radio',
	'tinymce.core.ui.ResizeHandle',
	'tinymce.core.ui.SelectBox',
	'tinymce.core.ui.Slider',
	'tinymce.core.ui.Spacer',
	'tinymce.core.ui.SplitButton',
	'tinymce.core.ui.StackLayout',
	'tinymce.core.ui.TabPanel',
	'tinymce.core.ui.TextBox'
], function(
	Rect, Promise, Delay, Env, EventUtils, Sizzle, Tools, DomQuery, Styles, TreeWalker, Entities, DOMUtils, ScriptLoader, AddOnManager,
	RangeUtils, Node, Schema, SaxParser, DomParser, Writer, HtmlSerializer, DomSerializer, VK, ControlSelection, BookmarkManager, Selection,
	Formatter, UndoManager, EditorCommands, URI, Class, EventDispatcher, Observable, Selector, Collection, ReflowQueue, Control, Factory,
	KeyboardNavigation, Container, DragHelper, Scrollable, Panel, Movable, Resizable, FloatPanel, Window, MessageBox, WindowManager,
	Tooltip, Widget, Progress, Notification, NotificationManager, EditorObservable, Shortcuts, Editor, I18n, FocusManager, EditorManager,
	XHR, JSON, JSONRequest, JSONP, LocalStorage, Compat, Layout, AbsoluteLayout, Button, ButtonGroup, Checkbox, ComboBox, ColorBox,
	PanelButton, ColorButton, Color, ColorPicker, Path, ElementPath, FormItem, Form, FieldSet, FilePicker, FitLayout, FlexLayout,
	FlowLayout, FormatControls, GridLayout, Iframe, InfoBox, Label, Toolbar, MenuBar, MenuButton, MenuItem, Throbber, Menu,
	ListBox, Radio, ResizeHandle, SelectBox, Slider, Spacer, SplitButton, StackLayout, TabPanel, TextBox
) {
	var target = window;

	var expose = function (id, ref) {
		var i, fragments;

		fragments = id.split(/[.\/]/);
		for (i = 0; i < fragments.length - 1; ++i) {
			if (target[fragments[i]] === undefined) {
				target[fragments[i]] = {};
			}

			target = target[fragments[i]];
		}

		target[fragments[fragments.length - 1]] = ref;
	};

	expose('tinymce.geom.Rect', Rect);
	expose('tinymce.util.Promise', Promise);
	expose('tinymce.util.Delay', Delay);
	expose('tinymce.Env', Env);
	expose('tinymce.dom.EventUtils', EventUtils);
	expose('tinymce.dom.Sizzle', Sizzle);
	expose('tinymce.util.Tools', Tools);
	expose('tinymce.dom.DomQuery', DomQuery);
	expose('tinymce.html.Styles', Styles);
	expose('tinymce.dom.TreeWalker', TreeWalker);
	expose('tinymce.html.Entities', Entities);
	expose('tinymce.dom.DOMUtils', DOMUtils);
	expose('tinymce.dom.ScriptLoader', ScriptLoader);
	expose('tinymce.AddOnManager', AddOnManager);
	expose('tinymce.dom.RangeUtils', RangeUtils);
	expose('tinymce.html.Node', Node);
	expose('tinymce.html.Schema', Schema);
	expose('tinymce.html.SaxParser', SaxParser);
	expose('tinymce.html.DomParser', DomParser);
	expose('tinymce.html.Writer', Writer);
	expose('tinymce.html.Serializer', HtmlSerializer);
	expose('tinymce.dom.Serializer', DomSerializer);
	expose('tinymce.util.VK', VK);
	expose('tinymce.dom.ControlSelection', ControlSelection);
	expose('tinymce.dom.BookmarkManager', BookmarkManager);
	expose('tinymce.dom.Selection', Selection);
	expose('tinymce.Formatter', Formatter);
	expose('tinymce.UndoManager', UndoManager);
	expose('tinymce.EditorCommands', EditorCommands);
	expose('tinymce.util.URI', URI);
	expose('tinymce.util.Class', Class);
	expose('tinymce.util.EventDispatcher', EventDispatcher);
	expose('tinymce.util.Observable', Observable);
	expose('tinymce.ui.Selector', Selector);
	expose('tinymce.ui.Collection', Collection);
	expose('tinymce.ui.ReflowQueue', ReflowQueue);
	expose('tinymce.ui.Control', Control);
	expose('tinymce.ui.Factory', Factory);
	expose('tinymce.ui.KeyboardNavigation', KeyboardNavigation);
	expose('tinymce.ui.Container', Container);
	expose('tinymce.ui.DragHelper', DragHelper);
	expose('tinymce.ui.Scrollable', Scrollable);
	expose('tinymce.ui.Panel', Panel);
	expose('tinymce.ui.Movable', Movable);
	expose('tinymce.ui.Resizable', Resizable);
	expose('tinymce.ui.FloatPanel', FloatPanel);
	expose('tinymce.ui.Window', Window);
	expose('tinymce.ui.MessageBox', MessageBox);
	expose('tinymce.WindowManager', WindowManager);
	expose('tinymce.ui.Tooltip', Tooltip);
	expose('tinymce.ui.Widget', Widget);
	expose('tinymce.ui.Progress', Progress);
	expose('tinymce.ui.Notification', Notification);
	expose('tinymce.NotificationManager', NotificationManager);
	expose('tinymce.EditorObservable', EditorObservable);
	expose('tinymce.Shortcuts', Shortcuts);
	expose('tinymce.Editor', Editor);
	expose('tinymce.util.I18n', I18n);
	expose('tinymce.FocusManager', FocusManager);
	expose('tinymce.EditorManager', EditorManager);
	expose('tinymce.util.XHR', XHR);
	expose('tinymce.util.JSON', JSON);
	expose('tinymce.util.JSONRequest', JSONRequest);
	expose('tinymce.util.JSONP', JSONP);
	expose('tinymce.util.LocalStorage', LocalStorage);
	expose('tinymce.Compat', Compat);
	expose('tinymce.ui.Layout', Layout);
	expose('tinymce.ui.AbsoluteLayout', AbsoluteLayout);
	expose('tinymce.ui.Button', Button);
	expose('tinymce.ui.ButtonGroup', ButtonGroup);
	expose('tinymce.ui.Checkbox', Checkbox);
	expose('tinymce.ui.ComboBox', ComboBox);
	expose('tinymce.ui.ColorBox', ColorBox);
	expose('tinymce.ui.PanelButton', PanelButton);
	expose('tinymce.ui.ColorButton', ColorButton);
	expose('tinymce.util.Color', Color);
	expose('tinymce.ui.ColorPicker', ColorPicker);
	expose('tinymce.ui.Path', Path);
	expose('tinymce.ui.ElementPath', ElementPath);
	expose('tinymce.ui.FormItem', FormItem);
	expose('tinymce.ui.Form', Form);
	expose('tinymce.ui.FieldSet', FieldSet);
	expose('tinymce.ui.FilePicker', FilePicker);
	expose('tinymce.ui.FitLayout', FitLayout);
	expose('tinymce.ui.FlexLayout', FlexLayout);
	expose('tinymce.ui.FlowLayout', FlowLayout);
	expose('tinymce.ui.FormatControls', FormatControls);
	expose('tinymce.ui.GridLayout', GridLayout);
	expose('tinymce.ui.Iframe', Iframe);
	expose('tinymce.ui.InfoBox', InfoBox);
	expose('tinymce.ui.Label', Label);
	expose('tinymce.ui.Toolbar', Toolbar);
	expose('tinymce.ui.MenuBar', MenuBar);
	expose('tinymce.ui.MenuButton', MenuButton);
	expose('tinymce.ui.MenuItem', MenuItem);
	expose('tinymce.ui.Throbber', Throbber);
	expose('tinymce.ui.Menu', Menu);
	expose('tinymce.ui.ListBox', ListBox);
	expose('tinymce.ui.Radio', Radio);
	expose('tinymce.ui.ResizeHandle', ResizeHandle);
	expose('tinymce.ui.SelectBox', SelectBox);
	expose('tinymce.ui.Slider', Slider);
	expose('tinymce.ui.Spacer', Spacer);
	expose('tinymce.ui.SplitButton', SplitButton);
	expose('tinymce.ui.StackLayout', StackLayout);
	expose('tinymce.ui.TabPanel', TabPanel);
	expose('tinymce.ui.TextBox', TextBox);

	return window.tinymce;
});
