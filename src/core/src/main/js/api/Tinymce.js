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
    'tinymce.core.api.Formatter',
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
    'tinymce.core.UndoManager',
    'tinymce.core.EditorCommands',
    'tinymce.core.util.URI',
    'tinymce.core.util.Class',
    'tinymce.core.util.EventDispatcher',
    'tinymce.core.util.Observable',
    'tinymce.core.WindowManager',
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
    'tinymce.core.util.Color',
    'tinymce.core.ui.Api'
  ],
  function (
    Formatter, Rect, Promise, Delay, Env, EventUtils, Sizzle, Tools, DomQuery, Styles, TreeWalker, Entities, DOMUtils, ScriptLoader, AddOnManager,
    RangeUtils, Node, Schema, SaxParser, DomParser, Writer, HtmlSerializer, DomSerializer, VK, ControlSelection, BookmarkManager, Selection,
    UndoManager, EditorCommands, URI, Class, EventDispatcher, Observable, WindowManager,
    NotificationManager, EditorObservable, Shortcuts, Editor, I18n, FocusManager, EditorManager,
    XHR, JSON, JSONRequest, JSONP, LocalStorage, Color, UiApi
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
    UiApi.appendTo(tinymce);

    return tinymce;
  }
);
