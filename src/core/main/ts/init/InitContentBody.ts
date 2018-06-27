/**
 * InitContentBody.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Insert, Element, Attr } from '@ephox/sugar';
import EditorUpload from '../api/EditorUpload';
import ForceBlocks from '../ForceBlocks';
import NodeChange from '../NodeChange';
import SelectionOverrides from '../SelectionOverrides';
import UndoManager from '../api/UndoManager';
import Experimental from '../api/Experimental';
import Formatter from '../api/Formatter';
import Serializer from '../api/dom/Serializer';
import DOMUtils from '../api/dom/DOMUtils';
import { Selection } from '../api/dom/Selection';
import DomParser from '../api/html/DomParser';
import Node from '../api/html/Node';
import Schema from '../api/html/Schema';
import KeyboardOverrides from '../keyboard/KeyboardOverrides';
import Delay from '../api/util/Delay';
import Quirks from '../util/Quirks';
import Tools from '../api/util/Tools';
import { Editor } from 'tinymce/core/api/Editor';
import TripleClickSelection from 'tinymce/core/selection/TripleClickSelection';
import * as DetailsElement from '../selection/DetailsElement';
import { document, window } from '@ephox/dom-globals';

declare const escape: any;

const DOM = DOMUtils.DOM;

const appendStyle = function (editor: Editor, text: string) {
  const head = Element.fromDom(editor.getDoc().head);
  const tag = Element.fromTag('style');
  Attr.set(tag, 'type', 'text/css');
  Insert.append(tag, Element.fromText(text));
  Insert.append(head, tag);
};

const createParser = function (editor: Editor) {
  const parser = DomParser(editor.settings, editor.schema);

  // Convert src and href into data-mce-src, data-mce-href and data-mce-style
  parser.addAttributeFilter('src,href,style,tabindex', function (nodes, name) {
    let i = nodes.length, node;
    const dom = editor.dom;
    let value, internalName;

    while (i--) {
      node = nodes[i];
      value = node.attr(name);
      internalName = 'data-mce-' + name;

      // Add internal attribute if we need to we don't on a refresh of the document
      if (!node.attributes.map[internalName]) {
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

  parser.addNodeFilter('#cdata', function (nodes: Node[]) {
    let i = nodes.length, node;

    while (i--) {
      node = nodes[i];
      node.type = 8;
      node.name = '#comment';
      node.value = '[CDATA[' + node.value + ']]';
    }
  });

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

const initEditor = function (editor: Editor) {
  editor.bindPendingEventDelegates();
  editor.initialized = true;
  editor.fire('init');
  editor.focus(true);
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
  if (!skipWrite && !settings.content_editable) {
    doc.open();
    doc.write(editor.iframeHTML);
    doc.close();
  }

  if (settings.content_editable) {
    editor.on('remove', function () {
      const bodyEl = this.getBody();

      DOM.removeClass(bodyEl, 'mce-content-body');
      DOM.removeClass(bodyEl, 'mce-edit-focus');
      DOM.setAttrib(bodyEl, 'contentEditable', null);
    });

    DOM.addClass(targetElm, 'mce-content-body');
    editor.contentDocument = doc = settings.content_document || document;
    editor.contentWindow = settings.content_window || window;
    editor.bodyElement = targetElm;

    // Prevent leak in IE
    settings.content_document = settings.content_window = null;

    // TODO: Fix this
    settings.root_name = targetElm.nodeName.toLowerCase();
  }

  // It will not steal focus while setting contentEditable
  body = editor.getBody();
  body.disabled = true;
  editor.readonly = settings.readonly;

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
    class_filter: settings.class_filter,
    update_styles: true,
    root_element: editor.inline ? editor.getBody() : null,
    collect: settings.content_editable,
    schema: editor.schema,
    onSetAttrib (e) {
      editor.fire('SetAttrib', e);
    }
  });

  editor.parser = createParser(editor);
  editor.serializer = Serializer(settings, editor);
  editor.selection = Selection(editor.dom, editor.getWin(), editor.serializer, editor);
  editor.experimental = Experimental(editor);
  editor.formatter = Formatter(editor);
  editor.undoManager = UndoManager(editor);
  editor._nodeChangeDispatcher = new NodeChange(editor);
  editor._selectionOverrides = SelectionOverrides(editor);

  DetailsElement.setup(editor);
  TripleClickSelection.setup(editor);
  KeyboardOverrides.setup(editor);
  ForceBlocks.setup(editor);

  editor.fire('PreInit');

  if (!settings.browser_spellcheck && !settings.gecko_spellcheck) {
    doc.body.spellcheck = false; // Gecko
    DOM.setAttrib(body, 'spellcheck', 'false');
  }

  editor.quirks = Quirks(editor);
  editor.fire('PostRender');

  if (settings.directionality) {
    body.dir = settings.directionality;
  }

  if (settings.nowrap) {
    body.style.whiteSpace = 'nowrap';
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