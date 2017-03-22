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
    'tinymce.core.api.Compat',
    'tinymce.core.util.Color',
    'tinymce.core.ui.Api'
  ],
  function (
    Rect, Promise, Delay, Env, EventUtils, Sizzle, Tools, DomQuery, Styles, TreeWalker, Entities, DOMUtils, ScriptLoader, AddOnManager,
    RangeUtils, Node, Schema, SaxParser, DomParser, Writer, HtmlSerializer, DomSerializer, VK, ControlSelection, BookmarkManager, Selection,
    Formatter, UndoManager, EditorCommands, URI, Class, EventDispatcher, Observable, WindowManager,
    NotificationManager, EditorObservable, Shortcuts, Editor, I18n, FocusManager, EditorManager,
    XHR, JSON, JSONRequest, JSONP, LocalStorage, Compat, Color, Api
  ) {
    var tinymce = EditorManager;

    var expose = function (target, id, ref) {
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

    expose(tinymce, 'geom.Rect', Rect);
    expose(tinymce, 'util.Promise', Promise);
    expose(tinymce, 'util.Delay', Delay);
    expose(tinymce, 'Env', Env);
    expose(tinymce, 'dom.EventUtils', EventUtils);
    expose(tinymce, 'dom.Sizzle', Sizzle);
    expose(tinymce, 'util.Tools', Tools);
    expose(tinymce, 'dom.DomQuery', DomQuery);
    expose(tinymce, 'html.Styles', Styles);
    expose(tinymce, 'dom.TreeWalker', TreeWalker);
    expose(tinymce, 'html.Entities', Entities);
    expose(tinymce, 'dom.DOMUtils', DOMUtils);
    expose(tinymce, 'dom.ScriptLoader', ScriptLoader);
    expose(tinymce, 'AddOnManager', AddOnManager);
    expose(tinymce, 'dom.RangeUtils', RangeUtils);
    expose(tinymce, 'html.Node', Node);
    expose(tinymce, 'html.Schema', Schema);
    expose(tinymce, 'html.SaxParser', SaxParser);
    expose(tinymce, 'html.DomParser', DomParser);
    expose(tinymce, 'html.Writer', Writer);
    expose(tinymce, 'html.Serializer', HtmlSerializer);
    expose(tinymce, 'dom.Serializer', DomSerializer);
    expose(tinymce, 'util.VK', VK);
    expose(tinymce, 'dom.ControlSelection', ControlSelection);
    expose(tinymce, 'dom.BookmarkManager', BookmarkManager);
    expose(tinymce, 'dom.Selection', Selection);
    expose(tinymce, 'Formatter', Formatter);
    expose(tinymce, 'UndoManager', UndoManager);
    expose(tinymce, 'EditorCommands', EditorCommands);
    expose(tinymce, 'util.URI', URI);
    expose(tinymce, 'util.Class', Class);
    expose(tinymce, 'util.EventDispatcher', EventDispatcher);
    expose(tinymce, 'util.Observable', Observable);
    expose(tinymce, 'WindowManager', WindowManager);
    expose(tinymce, 'NotificationManager', NotificationManager);
    expose(tinymce, 'EditorObservable', EditorObservable);
    expose(tinymce, 'Shortcuts', Shortcuts);
    expose(tinymce, 'Editor', Editor);
    expose(tinymce, 'util.I18n', I18n);
    expose(tinymce, 'FocusManager', FocusManager);
    expose(tinymce, 'EditorManager', EditorManager);
    expose(tinymce, 'util.XHR', XHR);
    expose(tinymce, 'util.JSON', JSON);
    expose(tinymce, 'util.JSONRequest', JSONRequest);
    expose(tinymce, 'util.JSONP', JSONP);
    expose(tinymce, 'util.LocalStorage', LocalStorage);
    expose(tinymce, 'Compat', Compat);
    expose(tinymce, 'util.Color', Color);

    Api.appendTo(tinymce);

    Compat.register(tinymce);

    return tinymce;
  }
);
