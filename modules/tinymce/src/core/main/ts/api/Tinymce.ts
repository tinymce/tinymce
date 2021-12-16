/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { RangeLikeObject } from '../selection/RangeTypes';
import { UndoManager as UndoManagerType } from '../undo/UndoManagerTypes';
import AddOnManager from './AddOnManager';
import Annotator from './Annotator';
import BookmarkManager from './dom/BookmarkManager';
import ControlSelection from './dom/ControlSelection';
import DOMUtils, { DOMUtilsSettings } from './dom/DOMUtils';
import EventUtils, { EventUtilsConstructor } from './dom/EventUtils';
import RangeUtils from './dom/RangeUtils';
import ScriptLoader, { ScriptLoaderConstructor } from './dom/ScriptLoader';
import EditorSelection from './dom/Selection';
import DomSerializer, { DomSerializerSettings } from './dom/Serializer';
import StyleSheetLoader, { StyleSheetLoaderSettings } from './dom/StyleSheetLoader';
import TextSeeker from './dom/TextSeeker';
import DomTreeWalker, { DomTreeWalkerConstructor } from './dom/TreeWalker';
import Editor, { EditorConstructor } from './Editor';
import EditorCommands, { EditorCommandsConstructor } from './EditorCommands';
import EditorManager from './EditorManager';
import EditorObservable from './EditorObservable';
import Env from './Env';
import FakeClipboard from './FakeClipboard';
import FocusManager from './FocusManager';
import Formatter from './Formatter';
import Rect from './geom/Rect';
import DomParser, { DomParserSettings } from './html/DomParser';
import Entities from './html/Entities';
import AstNode, { AstNodeConstructor } from './html/Node';
import SaxParser, { SaxParserSettings } from './html/SaxParser';
import Schema, { SchemaSettings } from './html/Schema';
import HtmlSerializer, { HtmlSerializerSettings } from './html/Serializer';
import Styles, { StylesSettings } from './html/Styles';
import Writer, { WriterSettings } from './html/Writer';
import IconManager from './IconManager';
import NotificationManager from './NotificationManager';
import PluginManager from './PluginManager';
import Resource from './Resource';
import Shortcuts, { ShortcutsConstructor } from './Shortcuts';
import ThemeManager from './ThemeManager';
import UndoManager from './UndoManager';
import Delay from './util/Delay';
import EventDispatcher, { EventDispatcherConstructor } from './util/EventDispatcher';
import I18n from './util/I18n';
import ImageUploader from './util/ImageUploader';
import LocalStorage from './util/LocalStorage';
import Observable from './util/Observable';
import Tools from './util/Tools';
import URI, { URIConstructor } from './util/URI';
import VK from './util/VK';
import XHR from './util/XHR';
import WindowManager from './WindowManager';

interface DOMUtilsNamespace {
  (doc: Document, settings: Partial<DOMUtilsSettings>): DOMUtils;

  DOM: DOMUtils;
  nodeIndex: (node: Node, normalized?: boolean) => number;
}

interface RangeUtilsNamespace {
  (dom: DOMUtils): RangeUtils;

  compareRanges: (rng1: RangeLikeObject, rng2: RangeLikeObject) => boolean;
  getCaretRangeFromPoint: (clientX: number, clientY: number, doc: Document) => Range;
  getSelectedNode: (range: Range) => Node;
  getNode: (container: Node, offset: number) => Node;
}

interface AddOnManagerNamespace {
  <T>(): AddOnManager<T>;

  language: string | undefined;
  languageLoad: boolean;
  baseURL: string;
  PluginManager: PluginManager;
  ThemeManager: ThemeManager;
}

interface BookmarkManagerNamespace {
  (selection: EditorSelection): BookmarkManager;

  isBookmarkNode: (node: Node) => boolean;
}

interface SaxParserNamespace {
  (settings?: SaxParserSettings, schema?: Schema): SaxParser;

  findEndTag: (schema: Schema, html: string, startIndex: number) => number;
}

interface TinyMCE extends EditorManager {

  geom: {
    Rect: Rect;
  };

  util: {
    Delay: Delay;
    Tools: Tools;
    VK: VK;
    URI: URIConstructor;
    EventDispatcher: EventDispatcherConstructor<any>;
    Observable: Observable<any>;
    I18n: I18n;
    XHR: XHR;
    LocalStorage: Storage;
    ImageUploader: ImageUploader;
  };

  dom: {
    EventUtils: EventUtilsConstructor;
    TreeWalker: DomTreeWalkerConstructor;
    TextSeeker: (dom: DOMUtils, isBlockBoundary?: (node: Node) => boolean) => TextSeeker;
    DOMUtils: DOMUtilsNamespace;
    ScriptLoader: ScriptLoaderConstructor;
    RangeUtils: RangeUtilsNamespace;
    Serializer: (settings: DomSerializerSettings, editor?: Editor) => DomSerializer;
    ControlSelection: (selection: EditorSelection, editor: Editor) => ControlSelection;
    BookmarkManager: BookmarkManagerNamespace;
    Selection: (dom: DOMUtils, win: Window, serializer: DomSerializer, editor: Editor) => EditorSelection;
    StyleSheetLoader: (documentOrShadowRoot: Document | ShadowRoot, settings: StyleSheetLoaderSettings) => StyleSheetLoader;
    Event: EventUtils;
  };

  html: {
    Styles: (settings?: StylesSettings, schema?: Schema) => Styles;
    Entities: Entities;
    Node: AstNodeConstructor;
    Schema: (settings?: SchemaSettings) => Schema;
    SaxParser: SaxParserNamespace;
    DomParser: (settings?: DomParserSettings, schema?: Schema) => DomParser;
    Writer: (settings?: WriterSettings) => Writer;
    Serializer: (settings?: HtmlSerializerSettings, schema?: Schema) => HtmlSerializer;
  };

  AddOnManager: AddOnManagerNamespace;
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
  ScriptLoader: ScriptLoader;
  PluginManager: PluginManager;
  ThemeManager: ThemeManager;
  IconManager: IconManager;
  Resource: Resource;
  FakeClipboard: FakeClipboard;

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
  walk: Tools['walk'];
  resolve: Tools['resolve'];
  explode: Tools['explode'];
  _addCacheSuffix: Tools['_addCacheSuffix'];
}

/**
 * @include ../../../../../tools/docs/tinymce.js
 */

/**
 * @include ../../../../../tools/docs/tinymce.Event.js
 */

/**
 * @include ../../../../../tools/docs/tinymce.editor.ui.Ui.js
 */

const publicApi = {
  geom: {
    Rect
  },

  util: {
    Delay,
    Tools,
    VK,
    URI,
    EventDispatcher,
    Observable,
    I18n,
    XHR,
    LocalStorage,
    ImageUploader
  },

  dom: {
    EventUtils,
    TreeWalker: DomTreeWalker,
    TextSeeker,
    DOMUtils,
    ScriptLoader,
    RangeUtils,
    Serializer: DomSerializer,
    StyleSheetLoader,
    ControlSelection,
    BookmarkManager,
    Selection: EditorSelection,
    Event: EventUtils.Event
  },

  html: {
    Styles,
    Entities,
    Node: AstNode,
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
  PluginManager,
  ThemeManager,
  IconManager,
  Resource,
  FakeClipboard,

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
  walk: Tools.walk,
  resolve: Tools.resolve,
  explode: Tools.explode,
  _addCacheSuffix: Tools._addCacheSuffix
};

const tinymce: TinyMCE = Tools.extend(EditorManager, publicApi);

export {
  TinyMCE,
  tinymce
};
