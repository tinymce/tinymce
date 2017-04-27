/**
 * InitContentBody.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.init.InitContentBody',
  [
    'global!document',
    'global!window',
    'tinymce.core.caret.CaretContainerInput',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.Selection',
    'tinymce.core.dom.Serializer',
    'tinymce.core.EditorUpload',
    'tinymce.core.ErrorReporter',
    'tinymce.core.ForceBlocks',
    'tinymce.core.Formatter',
    'tinymce.core.html.DomParser',
    'tinymce.core.html.Node',
    'tinymce.core.html.Schema',
    'tinymce.core.keyboard.KeyboardOverrides',
    'tinymce.core.NodeChange',
    'tinymce.core.SelectionOverrides',
    'tinymce.core.UndoManager',
    'tinymce.core.util.Delay',
    'tinymce.core.util.Quirks',
    'tinymce.core.util.Tools'
  ],
  function (
    document, window, CaretContainerInput, DOMUtils, Selection, Serializer, EditorUpload, ErrorReporter, ForceBlocks, Formatter, DomParser, Node, Schema, KeyboardOverrides,
    NodeChange, SelectionOverrides, UndoManager, Delay, Quirks, Tools
  ) {
    var DOM = DOMUtils.DOM;

    var createParser = function (editor) {
      var parser = new DomParser(editor.settings, editor.schema);

      // Convert src and href into data-mce-src, data-mce-href and data-mce-style
      parser.addAttributeFilter('src,href,style,tabindex', function (nodes, name) {
        var i = nodes.length, node, dom = editor.dom, value, internalName;

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

            if (name === "style") {
              value = dom.serializeStyle(dom.parseStyle(value), node.name);

              if (!value.length) {
                value = null;
              }

              node.attr(internalName, value);
              node.attr(name, value);
            } else if (name === "tabindex") {
              node.attr(internalName, value);
              node.attr(name, null);
            } else {
              node.attr(internalName, editor.convertURL(value, name, node.name));
            }
          }
        }
      });

      // Keep scripts from executing
      parser.addNodeFilter('script', function (nodes) {
        var i = nodes.length, node, type;

        while (i--) {
          node = nodes[i];
          type = node.attr('type') || 'no/type';
          if (type.indexOf('mce-') !== 0) {
            node.attr('type', 'mce-' + type);
          }
        }
      });

      parser.addNodeFilter('#cdata', function (nodes) {
        var i = nodes.length, node;

        while (i--) {
          node = nodes[i];
          node.type = 8;
          node.name = '#comment';
          node.value = '[CDATA[' + node.value + ']]';
        }
      });

      parser.addNodeFilter('p,h1,h2,h3,h4,h5,h6,div', function (nodes) {
        var i = nodes.length, node, nonEmptyElements = editor.schema.getNonEmptyElements();

        while (i--) {
          node = nodes[i];

          if (node.isEmpty(nonEmptyElements) && node.getAll('br').length === 0) {
            node.append(new Node('br', 1)).shortEnded = true;
          }
        }
      });

      return parser;
    };

    var autoFocus = function (editor) {
      if (editor.settings.auto_focus) {
        Delay.setEditorTimeout(editor, function () {
          var focusEditor;

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

    var initEditor = function (editor) {
      editor.bindPendingEventDelegates();
      editor.initialized = true;
      editor.fire('init');
      editor.focus(true);
      editor.nodeChanged({ initial: true });
      editor.execCallback('init_instance_callback', editor);
      autoFocus(editor);
    };

    var initContentBody = function (editor, skipWrite) {
      var settings = editor.settings, targetElm = editor.getElement(), doc = editor.getDoc(), body, contentCssText;

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
          var bodyEl = this.getBody();

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

      editor.editorUpload = new EditorUpload(editor);
      editor.schema = new Schema(settings);
      editor.dom = new DOMUtils(doc, {
        keep_values: true,
        url_converter: editor.convertURL,
        url_converter_scope: editor,
        hex_colors: settings.force_hex_style_colors,
        class_filter: settings.class_filter,
        update_styles: true,
        root_element: editor.inline ? editor.getBody() : null,
        collect: settings.content_editable,
        schema: editor.schema,
        onSetAttrib: function (e) {
          editor.fire('SetAttrib', e);
        }
      });

      editor.parser = createParser(editor);
      editor.serializer = new Serializer(settings, editor);
      editor.selection = new Selection(editor.dom, editor.getWin(), editor.serializer, editor);
      editor.formatter = new Formatter(editor);
      editor.undoManager = new UndoManager(editor);
      editor._nodeChangeDispatcher = new NodeChange(editor);
      editor._selectionOverrides = new SelectionOverrides(editor);

      CaretContainerInput.setup(editor);
      KeyboardOverrides.setup(editor);
      ForceBlocks.setup(editor);

      editor.fire('PreInit');

      if (!settings.browser_spellcheck && !settings.gecko_spellcheck) {
        doc.body.spellcheck = false; // Gecko
        DOM.setAttrib(body, "spellcheck", "false");
      }

      editor.quirks = new Quirks(editor);
      editor.fire('PostRender');

      if (settings.directionality) {
        body.dir = settings.directionality;
      }

      if (settings.nowrap) {
        body.style.whiteSpace = "nowrap";
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

      // Remove empty contents
      if (settings.padd_empty_editor) {
        editor.on('PostProcess', function (e) {
          e.content = e.content.replace(/^(<p[^>]*>(&nbsp;|&#160;|\s|\u00a0|<br \/>|)<\/p>[\r\n]*|<br \/>[\r\n]*)$/, '');
        });
      }

      editor.load({ initial: true, format: 'html' });
      editor.startContent = editor.getContent({ format: 'raw' });

      editor.on('compositionstart compositionend', function (e) {
        editor.composing = e.type === 'compositionstart';
      });

      // Add editor specific CSS styles
      if (editor.contentStyles.length > 0) {
        contentCssText = '';

        Tools.each(editor.contentStyles, function (style) {
          contentCssText += style + "\r\n";
        });

        editor.dom.addStyle(contentCssText);
      }

      editor.dom.styleSheetLoader.loadAll(
        editor.contentCSS,
        function (_) {
          initEditor(editor);
        },
        function (urls) {
          initEditor(editor);
          ErrorReporter.contentCssError(editor, urls);
        }
      );
    };

    return {
      initContentBody: initContentBody
    };
  }
);
