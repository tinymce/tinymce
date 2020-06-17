/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document, window } from '@ephox/dom-globals';
import { Obj, Type } from '@ephox/katamari';
import { Attr, Element, Insert } from '@ephox/sugar';
import Annotator from '../api/Annotator';
import DOMUtils from '../api/dom/DOMUtils';
import Selection from '../api/dom/Selection';
import DomSerializer, { SerializerSettings } from '../api/dom/Serializer';
import Editor from '../api/Editor';
import EditorUpload from '../api/EditorUpload';
import Env from '../api/Env';
import * as Events from '../api/Events';
import Formatter from '../api/Formatter';
import DomParser, { DomParserSettings } from '../api/html/DomParser';
import Node from '../api/html/Node';
import Schema from '../api/html/Schema';
import * as Settings from '../api/Settings';
import UndoManager from '../api/UndoManager';
import Delay from '../api/util/Delay';
import Tools from '../api/util/Tools';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as Placeholder from '../content/Placeholder';
import * as NodeType from '../dom/NodeType';
import * as TouchEvents from '../events/TouchEvents';
import * as ForceBlocks from '../ForceBlocks';
import * as KeyboardOverrides from '../keyboard/KeyboardOverrides';
import { NodeChange } from '../NodeChange';
import * as Rtc from '../Rtc';
import * as DetailsElement from '../selection/DetailsElement';
import * as MultiClickSelection from '../selection/MultiClickSelection';
import * as SelectionBookmark from '../selection/SelectionBookmark';
import { hasAnyRanges } from '../selection/SelectionUtils';
import SelectionOverrides from '../SelectionOverrides';
import Quirks from '../util/Quirks';

declare const escape: any;

const DOM = DOMUtils.DOM;

const appendStyle = function (editor: Editor, text: string) {
  const head = Element.fromDom(editor.getDoc().head);
  const tag = Element.fromTag('style');
  Attr.set(tag, 'type', 'text/css');
  Insert.append(tag, Element.fromText(text));
  Insert.append(head, tag);
};

const getRootName = (editor: Editor): string => editor.inline ? editor.getElement().nodeName.toLowerCase() : undefined;

const removeUndefined = <T>(obj: T): T => Obj.filter(obj as Record<string, unknown>, (v) => Type.isUndefined(v) === false) as T;

const mkParserSettings = (editor: Editor): DomParserSettings => {
  const settings = editor.settings;
  const blobCache = editor.editorUpload.blobCache;

  return removeUndefined<DomParserSettings>({
    allow_conditional_comments: settings.allow_conditional_comments,
    allow_html_data_urls: settings.allow_html_data_urls,
    allow_html_in_named_anchor: settings.allow_html_in_named_anchor,
    allow_script_urls: settings.allow_script_urls,
    allow_unsafe_link_target: settings.allow_unsafe_link_target,
    convert_fonts_to_spans: settings.convert_fonts_to_spans,
    fix_list_elements: settings.fix_list_elements,
    font_size_legacy_values: settings.font_size_legacy_values,
    forced_root_block: settings.forced_root_block,
    forced_root_block_attrs: settings.forced_root_block_attrs,
    padd_empty_with_br: settings.padd_empty_with_br,
    preserve_cdata: settings.preserve_cdata,
    remove_trailing_brs: settings.remove_trailing_brs,
    inline_styles: settings.inline_styles,
    root_name: getRootName(editor),
    validate: true,
    blob_cache: blobCache,

    // Deprecated
    images_dataimg_filter: settings.images_dataimg_filter
  });
};

const mkSerializerSettings = (editor: Editor): SerializerSettings => {
  const settings = editor.settings;

  return {
    ...mkParserSettings(editor),
    ...removeUndefined<SerializerSettings>({
      // SerializerSettings
      url_converter: settings.url_converter,
      url_converter_scope: settings.url_converter_scope,

      // Writer settings
      element_format: settings.element_format,
      entities: settings.entities,
      entity_encoding: settings.entity_encoding,
      indent: settings.indent,
      indent_after: settings.indent_after,
      indent_before: settings.indent_before,

      // Schema settings
      block_elements: settings.block_elements,
      boolean_attributes: settings.boolean_attributes,
      custom_elements: settings.custom_elements,
      extended_valid_elements: settings.extended_valid_elements,
      invalid_elements: settings.invalid_elements,
      invalid_styles: settings.invalid_styles,
      move_caret_before_on_enter_elements: settings.move_caret_before_on_enter_elements,
      non_empty_elements: settings.non_empty_elements,
      schema: settings.schema,
      self_closing_elements: settings.self_closing_elements,
      short_ended_elements: settings.short_ended_elements,
      special: settings.special,
      text_block_elements: settings.text_block_elements,
      text_inline_elements: settings.text_inline_elements,
      valid_children: settings.valid_children,
      valid_classes: settings.valid_classes,
      valid_elements: settings.valid_elements,
      valid_styles: settings.valid_styles,
      verify_html: settings.verify_html,
      whitespace_elements: settings.whitespace_elements
    })
  };
};

const createParser = function (editor: Editor): DomParser {
  const parser = DomParser(mkParserSettings(editor), editor.schema);

  // Convert src and href into data-mce-src, data-mce-href and data-mce-style
  parser.addAttributeFilter('src,href,style,tabindex', function (nodes, name) {
    let i = nodes.length, node: Node, value: string;
    const dom = editor.dom;
    const internalName = 'data-mce-' + name;

    while (i--) {
      node = nodes[i];
      value = node.attr(name);

      // Add internal attribute if we need to we don't on a refresh of the document
      if (value && !node.attr(internalName)) {
        // Don't duplicate these since they won't get modified by any browser
        if (value.indexOf('data:') === 0 || value.indexOf('blob:') === 0) {
          continue;
        }

        if (name === 'style') {
          value = dom.serializeStyle(dom.parseStyle(value), node.name);

          if (!value.length) {
            value = null;
          }

          node.attr(internalName, value);
          node.attr(name, value);
        } else if (name === 'tabindex') {
          node.attr(internalName, value);
          node.attr(name, null);
        } else {
          node.attr(internalName, editor.convertURL(value, name, node.name));
        }
      }
    }
  });

  // Keep scripts from executing
  parser.addNodeFilter('script', function (nodes: Node[]) {
    let i = nodes.length;

    while (i--) {
      const node = nodes[i];
      const type = node.attr('type') || 'no/type';
      if (type.indexOf('mce-') !== 0) {
        node.attr('type', 'mce-' + type);
      }
    }
  });

  if (editor.settings.preserve_cdata) {
    parser.addNodeFilter('#cdata', function (nodes: Node[]) {
      let i = nodes.length;

      while (i--) {
        const node = nodes[i];
        node.type = 8;
        node.name = '#comment';
        node.value = '[CDATA[' + editor.dom.encode(node.value) + ']]';
      }
    });
  }

  parser.addNodeFilter('p,h1,h2,h3,h4,h5,h6,div', function (nodes: Node[]) {
    let i = nodes.length;
    const nonEmptyElements = editor.schema.getNonEmptyElements();

    while (i--) {
      const node = nodes[i];

      if (node.isEmpty(nonEmptyElements) && node.getAll('br').length === 0) {
        node.append(new Node('br', 1)).shortEnded = true;
      }
    }
  });

  return parser;
};

const autoFocus = function (editor: Editor) {
  if (editor.settings.auto_focus) {
    Delay.setEditorTimeout(editor, function () {
      let focusEditor;

      if (editor.settings.auto_focus === true) {
        focusEditor = editor;
      } else {
        focusEditor = editor.editorManager.get(editor.settings.auto_focus);
      }

      if (!focusEditor.destroyed) {
        focusEditor.focus();
      }
    }, 100);
  }
};

const moveSelectionToFirstCaretPosition = (editor: Editor) => {
  // If not inline and no useful selection, we want to set selection to the first valid cursor position
  // We don't do this on inline because then it selects the editor container
  // This must run AFTER editor.focus!
  const root = editor.dom.getRoot();
  if (!editor.inline && (!hasAnyRanges(editor) || editor.selection.getStart(true) === root)) {
    CaretFinder.firstPositionIn(root).each((pos: CaretPosition) => {
      const node = pos.getNode();
      // If a table is the first caret pos, then walk down one more level
      const caretPos = NodeType.isTable(node) ? CaretFinder.firstPositionIn(node).getOr(pos) : pos;
      // Don't set the selection on IE, as since it's a single selection model setting the selection will cause
      // it to grab focus, so instead store the selection in the bookmark
      if (Env.browser.isIE()) {
        SelectionBookmark.storeNative(editor, caretPos.toRange());
      } else {
        editor.selection.setRng(caretPos.toRange());
      }
    });
  }
};

const initEditor = function (editor: Editor) {
  editor.bindPendingEventDelegates();
  editor.initialized = true;
  Events.fireInit(editor);
  editor.focus(true);
  moveSelectionToFirstCaretPosition(editor);
  editor.nodeChanged({ initial: true });
  editor.execCallback('init_instance_callback', editor);
  autoFocus(editor);
};

const getStyleSheetLoader = function (editor: Editor) {
  return editor.inline ? DOM.styleSheetLoader : editor.dom.styleSheetLoader;
};

const preInit = (editor: Editor, rtcMode: boolean) => {
  const settings = editor.settings, doc = editor.getDoc(), body = editor.getBody();

  if (!settings.browser_spellcheck && !settings.gecko_spellcheck) {
    doc.body.spellcheck = false; // Gecko
    DOM.setAttrib(body, 'spellcheck', 'false');
  }

  editor.quirks = Quirks(editor);

  Events.firePostRender(editor);

  const directionality = Settings.getDirectionality(editor);
  if (directionality !== undefined) {
    body.dir = directionality;
  }

  if (settings.protect) {
    editor.on('BeforeSetContent', function (e) {
      Tools.each(settings.protect, function (pattern) {
        e.content = e.content.replace(pattern, function (str) {
          return '<!--mce:protected ' + escape(str) + '-->';
        });
      });
    });
  }

  editor.on('SetContent', function () {
    editor.addVisual(editor.getBody());
  });

  // When connected to a server the value on the server should get priority
  if (rtcMode === false) {
    editor.load({ initial: true, format: 'html' });
  }

  editor.startContent = editor.getContent({ format: 'raw' });

  editor.on('compositionstart compositionend', function (e) {
    editor.composing = e.type === 'compositionstart';
  });

  // Add editor specific CSS styles
  if (editor.contentStyles.length > 0) {
    let contentCssText = '';

    Tools.each(editor.contentStyles, function (style) {
      contentCssText += style + '\r\n';
    });

    editor.dom.addStyle(contentCssText);
  }

  getStyleSheetLoader(editor).loadAll(
    editor.contentCSS,
    function (_) {
      initEditor(editor);
    },
    function (_urls) {
      initEditor(editor);
    }
  );

  // Append specified content CSS last
  if (settings.content_style) {
    appendStyle(editor, settings.content_style);
  }
};

const initContentBody = function (editor: Editor, skipWrite?: boolean) {
  const settings = editor.settings;
  const targetElm = editor.getElement();
  let doc = editor.getDoc();

  // Restore visibility on target element
  if (!settings.inline) {
    editor.getElement().style.visibility = editor.orgVisibility;
  }

  // Setup iframe body
  if (!skipWrite && !editor.inline) {
    doc.open();
    doc.write(editor.iframeHTML);
    doc.close();
  }

  if (editor.inline) {
    DOM.addClass(targetElm, 'mce-content-body');
    editor.contentDocument = doc = document;
    editor.contentWindow = window;
    editor.bodyElement = targetElm;
    editor.contentAreaContainer = targetElm;
  }

  // It will not steal focus while setting contentEditable
  const body = editor.getBody();
  // disabled isn't valid on all body elements, so need to cast here
  // TODO: See if we actually need to disable/re-enable here
  (body as any).disabled = true;
  editor.readonly = !!settings.readonly;

  if (!editor.readonly) {
    if (editor.inline && DOM.getStyle(body, 'position', true) === 'static') {
      body.style.position = 'relative';
    }

    body.contentEditable = editor.getParam('content_editable_state', true);
  }

  (body as any).disabled = false;

  editor.editorUpload = EditorUpload(editor);
  editor.schema = Schema(settings);
  editor.dom = DOMUtils(doc, {
    keep_values: true,
    url_converter: editor.convertURL,
    url_converter_scope: editor,
    hex_colors: settings.force_hex_style_colors,
    update_styles: true,
    root_element: editor.inline ? editor.getBody() : null,
    collect: () => editor.inline,
    schema: editor.schema,
    contentCssCors: Settings.shouldUseContentCssCors(editor),
    referrerPolicy: Settings.getReferrerPolicy(editor),
    onSetAttrib(e) {
      editor.fire('SetAttrib', e);
    }
  });

  editor.parser = createParser(editor);
  editor.serializer = DomSerializer(mkSerializerSettings(editor), editor);
  editor.selection = Selection(editor.dom, editor.getWin(), editor.serializer, editor);
  editor.annotator = Annotator(editor);
  editor.formatter = Formatter(editor);
  editor.undoManager = UndoManager(editor);
  editor._nodeChangeDispatcher = new NodeChange(editor);
  editor._selectionOverrides = SelectionOverrides(editor);

  TouchEvents.setup(editor);
  DetailsElement.setup(editor);

  if (!Rtc.isRtc(editor)) {
    MultiClickSelection.setup(editor);
  }

  KeyboardOverrides.setup(editor);
  ForceBlocks.setup(editor);
  Placeholder.setup(editor);

  Events.firePreInit(editor);

  Rtc.setup(editor).fold(() => {
    preInit(editor, false);
  }, (loadingRtc) => {
    editor.setProgressState(true);
    loadingRtc.then((rtcMode) => {
      editor.setProgressState(false);
      preInit(editor, rtcMode);
    });
  });
};

export {
  initContentBody
};
