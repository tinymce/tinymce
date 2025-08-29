import type { Bookmark } from '../bookmark/BookmarkTypes';
import type { User, ExpectedUser } from '../lookup/UserLookup';
import type { UndoManager } from '../undo/UndoManagerTypes';

import AddOnManager from './AddOnManager';
import Annotator from './Annotator';
import BookmarkManager from './dom/BookmarkManager';
import ControlSelection from './dom/ControlSelection';
import DOMUtils from './dom/DOMUtils';
import EventUtils from './dom/EventUtils';
import RangeUtils from './dom/RangeUtils';
import ScriptLoader from './dom/ScriptLoader';
import EditorSelection from './dom/Selection';
import DomSerializer, { type DomSerializerSettings } from './dom/Serializer';
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
import Rect, { type GeomRect } from './geom/Rect';
import DomParser, { type DomParserSettings } from './html/DomParser';
import Entities from './html/Entities';
import AstNode from './html/Node';
import Schema, { type SchemaSettings } from './html/Schema';
import HtmlSerializer, { type HtmlSerializerSettings } from './html/Serializer';
import Styles from './html/Styles';
import Writer, { type WriterSettings } from './html/Writer';
import IconManager from './IconManager';
import type { EditorModeApi } from './Mode';
import ModelManager, { type Model } from './ModelManager';
import NotificationManager, { type NotificationApi, type NotificationSpec } from './NotificationManager';
import type { EditorOptions, RawEditorOptions } from './OptionTypes';
import PluginManager, { type Plugin } from './PluginManager';
import Resource from './Resource';
import Shortcuts from './Shortcuts';
import * as TextPatterns from './textpatterns/TextPatterns';
import ThemeManager, { type Theme } from './ThemeManager';
import { tinymce, type TinyMCE } from './Tinymce';
import * as Ui from './ui/Ui';
import Delay from './util/Delay';
import EventDispatcher, { type EditorEvent } from './util/EventDispatcher';
import I18n from './util/I18n';
import Observable from './util/Observable';
import Tools from './util/Tools';
import URI from './util/URI';
import VK from './util/VK';
import WindowManager from './WindowManager';

export default tinymce;
export type {
  TinyMCE,
  GeomRect,
  UndoManager,
  RawEditorOptions,
  EditorOptions,
  EditorEvent,
  EditorModeApi,
  Bookmark,
  NotificationApi,
  NotificationSpec,
  DomParserSettings,
  DomSerializerSettings,
  HtmlSerializerSettings,
  Plugin,
  SchemaSettings,
  Theme,
  Model,
  WriterSettings,
  User,
  ExpectedUser
};
export {
  Rect,
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
  Styles,
  Entities,
  AstNode,
  Schema,
  DomParser,
  Writer,
  HtmlSerializer,
  Delay,
  EventDispatcher,
  I18n,
  Observable,
  Tools,
  URI,
  VK,
  Ui,
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
  WindowManager,
  FakeClipboard,
  Events,
  Formats,
  TextPatterns
};
