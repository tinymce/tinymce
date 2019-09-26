/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Storage, Window } from '@ephox/dom-globals';
import AddOnManager from './AddOnManager';
import { Theme } from './ThemeManager';
import { Plugin } from './PluginManager';
import Annotator from './Annotator';
import Editor, { EditorConstructor } from './Editor';
import EditorCommands, { EditorCommandsConstructor } from './EditorCommands';
import EditorManager from './EditorManager';
import EditorObservable from './EditorObservable';
import Env from './Env';
import Shortcuts, { ShortcutsConstructor } from './Shortcuts';
import UndoManager from './UndoManager';
import FocusManager from './FocusManager';
import Formatter from './Formatter';
import NotificationManager from './NotificationManager';
import WindowManager from './WindowManager';
import IconManager from './IconManager';
import BookmarkManager from './dom/BookmarkManager';
import RangeUtils from './dom/RangeUtils';
import DomSerializer, { SerializerSettings as DomSerializerSettings } from './dom/Serializer';
import ControlSelection from './dom/ControlSelection';
import DOMUtils from './dom/DOMUtils';
import DomQuery, { DomQueryConstructor } from './dom/DomQuery';
import EventUtils, { EventUtilsConstructor } from './dom/EventUtils';
import ScriptLoader, { ScriptLoaderConstructor } from './dom/ScriptLoader';
import Resource from './Resource';
import Selection from './dom/Selection';
import Sizzle from './dom/Sizzle';
import TreeWalker, { TreeWalkerConstructor } from './dom/TreeWalker';
import Rect from './geom/Rect';
import DomParser, { DomParserSettings } from './html/DomParser';
import Entities from './html/Entities';
import Node from './html/Node';
import SaxParser, { SaxParserSettings } from './html/SaxParser';
import Schema, { SchemaSettings } from './html/Schema';
import HtmlSerializer, { SerializerSettings as HtmlSerializerSettings } from './html/Serializer';
import Styles from './html/Styles';
import Writer, { WriterSettings } from './html/Writer';
import Class from './util/Class';
import Color from './util/Color';
import Delay from './util/Delay';
import EventDispatcher, { EventDispatcherConstructor } from './util/EventDispatcher';
import I18n from './util/I18n';
import JSON from './util/JSON';
import JSONP from './util/JSONP';
import JSONRequest, { JSONRequestConstructor } from './util/JSONRequest';
import LocalStorage from './util/LocalStorage';
import Observable from './util/Observable';
import Promise from './util/Promise';
import Tools from './util/Tools';
import URI, { URIConstructor } from './util/URI';
import VK from './util/VK';
import XHR from './util/XHR';
import { UndoManager as UndoManagerType } from '../undo/UndoManagerTypes';

export interface TinyMCE extends EditorManager {

  geom: {
    Rect: Rect;
  };

  util: {
    Promise: PromiseConstructor;
    Delay: Delay;
    Tools: Tools;
    VK: VK;
    URI: URIConstructor;
    Class: Class;
    EventDispatcher: EventDispatcherConstructor<any>;
    Observable: Observable<any>;
    I18n: I18n;
    XHR: XHR;
    JSON: JSON;
    JSONRequest: JSONRequestConstructor;
    JSONP: JSONP;
    LocalStorage: Storage;
    Color: Color;
  };

  dom: {
    EventUtils: EventUtilsConstructor;
    Sizzle: any;
    DomQuery: DomQueryConstructor;
    TreeWalker: TreeWalkerConstructor;
    DOMUtils: DOMUtils;
    ScriptLoader: ScriptLoaderConstructor;
    RangeUtils: (dom: DOMUtils) => RangeUtils;
    Serializer: (settings: DomSerializerSettings, editor?: Editor) => DomSerializer;
    ControlSelection: (selection: Selection, editor: Editor) => ControlSelection;
    BookmarkManager: (selection: Selection) => BookmarkManager;
    Selection: (dom: DOMUtils, win: Window, serializer, editor: Editor) => Selection;
    Event: EventUtils;
  };

  html: {
    Styles: Styles;
    Entities: Entities;
    Node: Node;
    Schema: (settings?: SchemaSettings) => Schema;
    SaxParser: (settings?: SaxParserSettings, schema?: Schema) => SaxParser;
    DomParser: (settings?: DomParserSettings, schema?: Schema) => DomParser;
    Writer: (settings?: WriterSettings) => Writer;
    Serializer: (settings?: HtmlSerializerSettings, schema?: Schema) => HtmlSerializer;
  };

  AddOnManager: <T>() => AddOnManager<T>;
  Annotator: (editor: Editor) => Annotator;
  Editor: EditorConstructor;
  EditorCommands: EditorCommandsConstructor;
  EditorManager: EditorManager;
  EditorObservable: EditorObservable;
  Env: Env;
  FocusManager: FocusManager;
  Formatter: (editor: Editor) => Formatter;
  NotificationManager: (editor: Editor) => NotificationManager;
  Shortcuts: ShortcutsConstructor;
  UndoManager: (editor: Editor) => UndoManagerType;
  WindowManager: (editor: Editor) => WindowManager;

  // Global instances
  DOM: DOMUtils;
  ScriptLoader: ScriptLoaderConstructor;
  PluginManager: AddOnManager<void | Plugin>;
  ThemeManager: AddOnManager<Theme>;
  IconManager: IconManager;
  Resource: Resource;

  // Global utility functions
  trim: Tools['trim'];
  isArray: Tools['isArray'];
  is: Tools['is'];
  toArray: Tools['toArray'];
  makeMap: Tools['makeMap'];
  each: Tools['each'];
  map: Tools['map'];
  grep: Tools['grep'];
  inArray: Tools['inArray'];
  extend: Tools['extend'];
  create: Tools['create'];
  walk: Tools['walk'];
  createNS: Tools['createNS'];
  resolve: Tools['resolve'];
  explode: Tools['explode'];
  _addCacheSuffix: Tools['_addCacheSuffix'];

  // Legacy browser detection
  isOpera: boolean;
  isWebKit: boolean;
  isIE: boolean;
  isGecko: boolean;
  isMac: boolean;
}

/**
 * @include ../../../../../tools/docs/tinymce.js
 */

/**
 * @include ../../../../../tools/docs/tinymce.CommandEvent.js
 */

/**
 * @include ../../../../../tools/docs/tinymce.ContentEvent.js
 */

/**
 * @include ../../../../../tools/docs/tinymce.Event.js
 */

/**
 * @include ../../../../../tools/docs/tinymce.FocusEvent.js
 */

/**
 * @include ../../../../../tools/docs/tinymce.ProgressStateEvent.js
 */

/**
 * @include ../../../../../tools/docs/tinymce.ResizeEvent.js
 */

/**
 * @include ../../../../../tools/docs/tinymce.editor.ui.Ui.js
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
  IconManager,
  Resource,

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

export const tinymce: TinyMCE = Tools.extend(EditorManager, publicApi);
