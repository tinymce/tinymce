/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document, window } from '@ephox/dom-globals';
import { Attr, Element, Insert } from '@ephox/sugar';
import Annotator from '../api/Annotator';
import DOMUtils from '../api/dom/DOMUtils';
import Selection from '../api/dom/Selection';
import DomSerializer from '../api/dom/Serializer';
import Editor from '../api/Editor';
import EditorUpload from '../api/EditorUpload';
import Env from '../api/Env';
import * as Events from '../api/Events';
import Formatter from '../api/Formatter';
import DomParser from '../api/html/DomParser';
import Node from '../api/html/Node';
import Schema from '../api/html/Schema';
import Settings from '../api/Settings';
import UndoManager from '../api/UndoManager';
import Delay from '../api/util/Delay';
import Tools from '../api/util/Tools';
import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as Placeholder from '../content/Placeholder';
import NodeType from '../dom/NodeType';
import TouchEvents from '../events/TouchEvents';
import ForceBlocks from '../ForceBlocks';
import KeyboardOverrides from '../keyboard/KeyboardOverrides';
import { NodeChange } from '../NodeChange';
import * as DetailsElement from '../selection/DetailsElement';
import * as MultiClickSelection from '../selection/MultiClickSelection';
import SelectionBookmark from '../selection/SelectionBookmark';
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

const createParser = function (editor: Editor): DomParser {
  const parser = DomParser(editor.settings, editor.schema);

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
    let i = nodes.length, node, type;

    while (i--) {
      node = nodes[i];
      type = node.attr('type') || 'no/type';
      if (type.indexOf('mce-') !== 0) {
        node.attr('type', 'mce-' + type);
      }
    }
  });

  if (editor.settings.preserve_cdata) {
    parser.addNodeFilter('#cdata', function (nodes: Node[]) {
      let i = nodes.length, node;

      while (i--) {
        node = nodes[i];
        node.type = 8;
        node.name = '#comment';
        node.value = '[CDATA[' + editor.dom.encode(node.value) + ']]';
      }
    });
  }

  parser.addNodeFilter('p,h1,h2,h3,h4,h5,h6,div', function (nodes: Node[]) {
    let i = nodes.length, node;
    const nonEmptyElements = editor.schema.getNonEmptyElements();

    while (i--) {
      node = nodes[i];

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

const initContentBody = function (editor: Editor, skipWrite?: boolean) {
  const settings = editor.settings;
  const targetElm = editor.getElement();
  let doc = editor.getDoc(), body, contentCssText;

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
    editor.on('remove', function () {
      const bodyEl = this.getBody();

      DOM.removeClass(bodyEl, 'mce-content-body');
      DOM.removeClass(bodyEl, 'mce-edit-focus');
      DOM.setAttrib(bodyEl, 'contentEditable', null);
    });

    DOM.addClass(targetElm, 'mce-content-body');
    editor.contentDocument = doc = document;
    editor.contentWindow = window;
    editor.bodyElement = targetElm;
    editor.contentAreaContainer = targetElm;

    // TODO: Fix this
    settings.root_name = targetElm.nodeName.toLowerCase();
  }

  // It will not steal focus while setting contentEditable
  body = editor.getBody();
  body.disabled = true;
  editor.readonly = !!settings.readonly;

  if (!editor.readonly) {
    if (editor.inline && DOM.getStyle(body, 'position', true) === 'static') {
      body.style.position = 'relative';
    }

    body.contentEditable = editor.getParam('content_editable_state', true);
  }

  body.disabled = false;

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
    onSetAttrib (e) {
      editor.fire('SetAttrib', e);
    }
  });

  editor.parser = createParser(editor);
  editor.serializer = DomSerializer(settings, editor);
  editor.selection = Selection(editor.dom, editor.getWin(), editor.serializer, editor);
  editor.annotator = Annotator(editor);
  editor.formatter = Formatter(editor);
  editor.undoManager = UndoManager(editor);
  editor._nodeChangeDispatcher = new NodeChange(editor);
  editor._selectionOverrides = SelectionOverrides(editor);

  TouchEvents.setup(editor);
  DetailsElement.setup(editor);
  MultiClickSelection.setup(editor);
  KeyboardOverrides.setup(editor);
  ForceBlocks.setup(editor);
  Placeholder.setup(editor);

  Events.firePreInit(editor);

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

  editor.load({ initial: true, format: 'html' });
  editor.startContent = editor.getContent({ format: 'raw' }) as string;

  editor.on('compositionstart compositionend', function (e) {
    editor.composing = e.type === 'compositionstart';
  });

  // Add editor specific CSS styles
  if (editor.contentStyles.length > 0) {
    contentCssText = '';

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
    function (urls) {
      initEditor(editor);
    }
  );

  // Append specified content CSS last
  if (settings.content_style) {
    appendStyle(editor, settings.content_style);
  }
};

export default {
  initContentBody
};
