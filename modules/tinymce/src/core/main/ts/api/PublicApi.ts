/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Bookmark } from '../bookmark/BookmarkTypes';
import { UndoManager } from '../undo/UndoManagerTypes';
import AddOnManager from './AddOnManager';
import Annotator from './Annotator';
import BookmarkManager from './dom/BookmarkManager';
import ControlSelection from './dom/ControlSelection';
import DomQuery from './dom/DomQuery';
import DOMUtils from './dom/DOMUtils';
import EventUtils from './dom/EventUtils';
import RangeUtils from './dom/RangeUtils';
import ScriptLoader from './dom/ScriptLoader';
import EditorSelection from './dom/Selection';
import DomSerializer, { DomSerializerSettings } from './dom/Serializer';
import StyleSheetLoader from './dom/StyleSheetLoader';
import TextSeeker from './dom/TextSeeker';
import DomTreeWalker from './dom/TreeWalker';
import Editor from './Editor';
import EditorCommands from './EditorCommands';
import EditorManager from './EditorManager';
import EditorObservable from './EditorObservable';
import Env from './Env';
import * as Events from './EventTypes';
import * as Formats from './fmt/Format';
import FocusManager from './FocusManager';
import Formatter from './Formatter';
import Rect, { GeomRect } from './geom/Rect';
import DomParser, { DomParserSettings } from './html/DomParser';
import Entities from './html/Entities';
import AstNode from './html/Node';
import SaxParser, { SaxParserSettings } from './html/SaxParser';
import Schema, { SchemaSettings } from './html/Schema';
import HtmlSerializer, { HtmlSerializerSettings } from './html/Serializer';
import Styles from './html/Styles';
import Writer, { WriterSettings } from './html/Writer';
import IconManager from './IconManager';
import { EditorModeApi } from './Mode';
import NotificationManager, { NotificationApi, NotificationSpec } from './NotificationManager';
import PluginManager, { Plugin } from './PluginManager';
import Resource from './Resource';
import { EditorSettings, RawEditorSettings } from './SettingsTypes';
import Shortcuts from './Shortcuts';
import ThemeManager, { Theme } from './ThemeManager';
import { tinymce, TinyMCE } from './Tinymce';
import * as Ui from './ui/Ui';
import Class from './util/Class';
import Color from './util/Color';
import Delay from './util/Delay';
import EventDispatcher, { EditorEvent } from './util/EventDispatcher';
import I18n from './util/I18n';
import JSON from './util/JSON';
import JSONP from './util/JSONP';
import JSONRequest, { JSONRequestArgs, JSONRequestSettings } from './util/JSONRequest';
import Observable from './util/Observable';
import Tools from './util/Tools';
import URI from './util/URI';
import VK from './util/VK';
import XHR, { XHRSettings } from './util/XHR';
import WindowManager from './WindowManager';

export default tinymce;
export {
  TinyMCE,

  // geom
  Rect,
  GeomRect,

  // dom
  DomQuery,
  DomTreeWalker,
  TextSeeker,
  DOMUtils,
  ScriptLoader,
  RangeUtils,
  DomSerializer,
  ControlSelection,
  BookmarkManager,
  EditorSelection,
  StyleSheetLoader,
  EventUtils,

  // html
  Styles,
  Entities,
  AstNode,
  Schema,
  SaxParser,
  DomParser,
  Writer,
  HtmlSerializer,

  // utils
  Class,
  Color,
  Delay,
  EventDispatcher,
  I18n,
  JSONRequest,
  JSON,
  JSONP,
  Observable,
  Tools,
  URI,
  XHR,
  VK,

  // ui
  Ui,

  // Global
  AddOnManager,
  Annotator,
  Env,
  EditorCommands,
  EditorManager,
  EditorObservable,
  Editor,
  FocusManager,
  Formatter,
  IconManager,
  NotificationManager,
  Resource,
  Shortcuts,
  PluginManager,
  ThemeManager,
  UndoManager,
  WindowManager,

  // other useful types
  RawEditorSettings,
  EditorSettings,
  EditorEvent,
  EditorModeApi,
  Bookmark,
  Events,
  Formats,
  JSONRequestSettings,
  JSONRequestArgs,
  NotificationApi,
  NotificationSpec,
  SaxParserSettings,
  DomParserSettings,
  DomSerializerSettings,
  HtmlSerializerSettings,
  Plugin,
  SchemaSettings,
  Theme,
  WriterSettings,
  XHRSettings
};
