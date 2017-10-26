/**
 * Tinymce.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.api.Tinymce',
  [
    'tinymce.core.AddOnManager',
    'tinymce.core.Editor',
    'tinymce.core.EditorCommands',
    'tinymce.core.EditorManager',
    'tinymce.core.EditorObservable',
    'tinymce.core.Env',
    'tinymce.core.Shortcuts',
    'tinymce.core.UndoManager',
    'tinymce.core.api.FocusManager',
    'tinymce.core.api.Formatter',
    'tinymce.core.api.NotificationManager',
    'tinymce.core.api.WindowManager',
    'tinymce.core.api.dom.RangeUtils',
    'tinymce.core.dom.BookmarkManager',
    'tinymce.core.dom.ControlSelection',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.DomQuery',
    'tinymce.core.dom.EventUtils',
    'tinymce.core.dom.ScriptLoader',
    'tinymce.core.dom.Selection',
    'tinymce.core.dom.Serializer',
    'tinymce.core.dom.Sizzle',
    'tinymce.core.dom.TreeWalker',
    'tinymce.core.geom.Rect',
    'tinymce.core.html.DomParser',
    'tinymce.core.html.Entities',
    'tinymce.core.html.Node',
    'tinymce.core.html.SaxParser',
    'tinymce.core.html.Schema',
    'tinymce.core.html.Serializer',
    'tinymce.core.html.Styles',
    'tinymce.core.html.Writer',
    'tinymce.core.ui.Factory',
    'tinymce.core.util.Class',
    'tinymce.core.util.Color',
    'tinymce.core.util.Delay',
    'tinymce.core.util.EventDispatcher',
    'tinymce.core.util.I18n',
    'tinymce.core.util.JSON',
    'tinymce.core.util.JSONP',
    'tinymce.core.util.JSONRequest',
    'tinymce.core.util.LocalStorage',
    'tinymce.core.util.Observable',
    'tinymce.core.util.Promise',
    'tinymce.core.util.Tools',
    'tinymce.core.util.URI',
    'tinymce.core.util.VK',
    'tinymce.core.util.XHR'
  ],
  function (
    AddOnManager, Editor, EditorCommands, EditorManager, EditorObservable, Env, Shortcuts, UndoManager, FocusManager, Formatter, NotificationManager, WindowManager,
    RangeUtils, BookmarkManager, ControlSelection, DOMUtils, DomQuery, EventUtils, ScriptLoader, Selection, DomSerializer, Sizzle, TreeWalker, Rect, DomParser,
    Entities, Node, SaxParser, Schema, HtmlSerializer, Styles, Writer, Factory, Class, Color, Delay, EventDispatcher, I18n, JSON, JSONP, JSONRequest, LocalStorage,
    Observable, Promise, Tools, URI, VK, XHR
  ) {
    var tinymce = EditorManager;

    /**
     * @include ../../../../../../tools/docs/tinymce.js
     */
    var publicApi = {
      geom: {
        Rect: Rect
      },

      util: {
        Promise: Promise,
        Delay: Delay,
        Tools: Tools,
        VK: VK,
        URI: URI,
        Class: Class,
        EventDispatcher: EventDispatcher,
        Observable: Observable,
        I18n: I18n,
        XHR: XHR,
        JSON: JSON,
        JSONRequest: JSONRequest,
        JSONP: JSONP,
        LocalStorage: LocalStorage,
        Color: Color
      },

      dom: {
        EventUtils: EventUtils,
        Sizzle: Sizzle,
        DomQuery: DomQuery,
        TreeWalker: TreeWalker,
        DOMUtils: DOMUtils,
        ScriptLoader: ScriptLoader,
        RangeUtils: RangeUtils,
        Serializer: DomSerializer,
        ControlSelection: ControlSelection,
        BookmarkManager: BookmarkManager,
        Selection: Selection,
        Event: EventUtils.Event
      },

      html: {
        Styles: Styles,
        Entities: Entities,
        Node: Node,
        Schema: Schema,
        SaxParser: SaxParser,
        DomParser: DomParser,
        Writer: Writer,
        Serializer: HtmlSerializer
      },

      ui: {
        Factory: Factory
      },

      Env: Env,
      AddOnManager: AddOnManager,
      Formatter: Formatter,
      UndoManager: UndoManager,
      EditorCommands: EditorCommands,
      WindowManager: WindowManager,
      NotificationManager: NotificationManager,
      EditorObservable: EditorObservable,
      Shortcuts: Shortcuts,
      Editor: Editor,
      FocusManager: FocusManager,
      EditorManager: EditorManager,

      // Global instances
      DOM: DOMUtils.DOM,
      ScriptLoader: ScriptLoader.ScriptLoader,
      PluginManager: AddOnManager.PluginManager,
      ThemeManager: AddOnManager.ThemeManager,

      // Global utility functions
      trim: Tools.trim,
      isArray: Tools.isArray,
      is: Tools.is,
      toArray: Tools.toArray,
      makeMap: Tools.makeMap,
      each: Tools.each,
      map: Tools.map,
      grep: Tools.grep,
      inArray: Tools.inArray,
      extend: Tools.extend,
      create: Tools.create,
      walk: Tools.walk,
      createNS: Tools.createNS,
      resolve: Tools.resolve,
      explode: Tools.explode,
      _addCacheSuffix: Tools._addCacheSuffix,

      // Legacy browser detection
      isOpera: Env.opera,
      isWebKit: Env.webkit,
      isIE: Env.ie,
      isGecko: Env.gecko,
      isMac: Env.mac
    };

    tinymce = Tools.extend(tinymce, publicApi);

    return tinymce;
  }
);
