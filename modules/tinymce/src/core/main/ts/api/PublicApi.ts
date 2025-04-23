import { Bookmark } from '../bookmark/BookmarkTypes';
import { UndoManager } from '../undo/UndoManagerTypes';
import AddOnManager from './AddOnManager';
import Annotator from './Annotator';
import BookmarkManager from './dom/BookmarkManager';
import ControlSelection from './dom/ControlSelection';
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
import FakeClipboard from './FakeClipboard';
import * as Formats from './fmt/Format';
import FocusManager from './FocusManager';
import Formatter from './Formatter';
import Rect, { GeomRect } from './geom/Rect';
import DomParser, { DomParserSettings } from './html/DomParser';
import Entities from './html/Entities';
import AstNode from './html/Node';
import Schema, { SchemaSettings } from './html/Schema';
import HtmlSerializer, { HtmlSerializerSettings } from './html/Serializer';
import Styles from './html/Styles';
import Writer, { WriterSettings } from './html/Writer';
import IconManager from './IconManager';
import { EditorModeApi } from './Mode';
import ModelManager, { Model } from './ModelManager';
import NotificationManager, { NotificationApi, NotificationSpec } from './NotificationManager';
import { EditorOptions, RawEditorOptions } from './OptionTypes';
import PluginManager, { Plugin } from './PluginManager';
import Resource from './Resource';
import Shortcuts from './Shortcuts';
import * as TextPatterns from './textpatterns/TextPatterns';
import ThemeManager, { Theme } from './ThemeManager';
import { tinymce, TinyMCE } from './Tinymce';
import * as Ui from './ui/Ui';
import Delay from './util/Delay';
import EventDispatcher, { EditorEvent } from './util/EventDispatcher';
import I18n from './util/I18n';
import Observable from './util/Observable';
import Tools from './util/Tools';
import URI from './util/URI';
import VK from './util/VK';
import WindowManager from './WindowManager';

export default tinymce;
export {
  TinyMCE,

  // geom
  Rect,
  GeomRect,

  // dom
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
  DomParser,
  Writer,
  HtmlSerializer,

  // utils
  Delay,
  EventDispatcher,
  I18n,
  Observable,
  Tools,
  URI,
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
  ModelManager,
  UndoManager,
  WindowManager,
  FakeClipboard,

  // other useful types
  RawEditorOptions,
  EditorOptions,
  EditorEvent,
  EditorModeApi,
  Bookmark,
  Events,
  Formats,
  NotificationApi,
  NotificationSpec,
  DomParserSettings,
  DomSerializerSettings,
  HtmlSerializerSettings,
  Plugin,
  SchemaSettings,
  TextPatterns,
  Theme,
  Model,
  WriterSettings
};
