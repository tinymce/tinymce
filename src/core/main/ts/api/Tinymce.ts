/**
 * Tinymce.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { AddOnManager } from './AddOnManager';
import Annotator from './Annotator';
import { Editor } from './Editor';
import EditorCommands from './EditorCommands';
import EditorManager from './EditorManager';
import EditorObservable from './EditorObservable';
import Env from './Env';
import Shortcuts from './Shortcuts';
import UndoManager from './UndoManager';
import FocusManager from './FocusManager';
import Formatter from './Formatter';
import NotificationManager from './NotificationManager';
import WindowManager from './WindowManager';
import BookmarkManager from './dom/BookmarkManager';
import RangeUtils from './dom/RangeUtils';
import DomSerializer from './dom/Serializer';
import ControlSelection from './dom/ControlSelection';
import DOMUtils from './dom/DOMUtils';
import DomQuery from './dom/DomQuery';
import EventUtils from './dom/EventUtils';
import ScriptLoader from './dom/ScriptLoader';
import { Selection } from './dom/Selection';
import Sizzle from './dom/Sizzle';
import TreeWalker from './dom/TreeWalker';
import Rect from './geom/Rect';
import DomParser from './html/DomParser';
import Entities from './html/Entities';
import Node from './html/Node';
import SaxParser from './html/SaxParser';
import Schema from './html/Schema';
import HtmlSerializer from './html/Serializer';
import { Styles } from './html/Styles';
import Writer from './html/Writer';
import Factory from './ui/Factory';
import Class from './util/Class';
import Color from './util/Color';
import Delay from './util/Delay';
import EventDispatcher from './util/EventDispatcher';
import I18n from './util/I18n';
import JSON from './util/JSON';
import JSONP from './util/JSONP';
import JSONRequest from './util/JSONRequest';
import LocalStorage from './util/LocalStorage';
import Observable from './util/Observable';
import Promise from './util/Promise';
import Tools from './util/Tools';
import URI from './util/URI';
import VK from './util/VK';
import XHR from './util/XHR';

let tinymce = EditorManager;

/**
 * @include ../../../../../../tools/docs/tinymce.js
 */
const publicApi = {
  geom: {
    Rect
  },

  util: {
    Promise,
    Delay,
    Tools,
    VK,
    URI,
    Class,
    EventDispatcher,
    Observable,
    I18n,
    XHR,
    JSON,
    JSONRequest,
    JSONP,
    LocalStorage,
    Color
  },

  dom: {
    EventUtils,
    Sizzle,
    DomQuery,
    TreeWalker,
    DOMUtils,
    ScriptLoader,
    RangeUtils,
    Serializer: DomSerializer,
    ControlSelection,
    BookmarkManager,
    Selection,
    Event: EventUtils.Event
  },

  html: {
    Styles,
    Entities,
    Node,
    Schema,
    SaxParser,
    DomParser,
    Writer,
    Serializer: HtmlSerializer
  },

  ui: {
    Factory
  },

  Env,
  AddOnManager,
  Annotator,
  Formatter,
  UndoManager,
  EditorCommands,
  WindowManager,
  NotificationManager,
  EditorObservable,
  Shortcuts,
  Editor,
  FocusManager,
  EditorManager,

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

export default tinymce;