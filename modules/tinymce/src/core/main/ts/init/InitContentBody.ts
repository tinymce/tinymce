import { Arr, Obj, Type } from '@ephox/katamari';
import { Attribute, Insert, Remove, SugarElement, SugarShadowDom } from '@ephox/sugar';

import Annotator from '../api/Annotator';
import DOMUtils from '../api/dom/DOMUtils';
import EditorSelection from '../api/dom/Selection';
import DomSerializer, { DomSerializerSettings } from '../api/dom/Serializer';
import StyleSheetLoader from '../api/dom/StyleSheetLoader';
import Editor from '../api/Editor';
import EditorUpload from '../api/EditorUpload';
import * as Events from '../api/Events';
import Formatter from '../api/Formatter';
import DomParser, { DomParserSettings } from '../api/html/DomParser';
import AstNode from '../api/html/Node';
import Schema, { SchemaSettings } from '../api/html/Schema';
import * as Options from '../api/Options';
import { TinyMCE } from '../api/Tinymce';
import UndoManager from '../api/UndoManager';
import Delay from '../api/util/Delay';
import Tools from '../api/util/Tools';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as Placeholder from '../content/Placeholder';
import * as DeleteCommands from '../delete/DeleteCommands';
import * as NodeType from '../dom/NodeType';
import * as TouchEvents from '../events/TouchEvents';
import * as ForceBlocks from '../ForceBlocks';
import * as NonEditableFilter from '../html/NonEditableFilter';
import * as KeyboardOverrides from '../keyboard/KeyboardOverrides';
import { NodeChange } from '../NodeChange';
import * as Paste from '../paste/Paste';
import * as Rtc from '../Rtc';
import * as DetailsElement from '../selection/DetailsElement';
import * as MultiClickSelection from '../selection/MultiClickSelection';
import { hasAnyRanges } from '../selection/SelectionUtils';
import SelectionOverrides from '../SelectionOverrides';
import * as TextPattern from '../textpatterns/TextPatterns';
import Quirks from '../util/Quirks';
import * as ContentCss from './ContentCss';

declare const escape: any;
declare let tinymce: TinyMCE;

const DOM = DOMUtils.DOM;

const appendStyle = (editor: Editor, text: string) => {
  const body = SugarElement.fromDom(editor.getBody());
  const container = SugarShadowDom.getStyleContainer(SugarShadowDom.getRootNode(body));

  const style = SugarElement.fromTag('style');
  Attribute.set(style, 'type', 'text/css');
  Insert.append(style, SugarElement.fromText(text));
  Insert.append(container, style);

  editor.on('remove', () => {
    Remove.remove(style);
  });
};

const getRootName = (editor: Editor): string | undefined =>
  editor.inline ? editor.getElement().nodeName.toLowerCase() : undefined;

const removeUndefined = <T>(obj: T): T => Obj.filter(obj as Record<string, unknown>, (v) => Type.isUndefined(v) === false) as T;

const mkParserSettings = (editor: Editor): DomParserSettings => {
  const getOption = editor.options.get;
  const blobCache = editor.editorUpload.blobCache;

  return removeUndefined<DomParserSettings>({
    allow_conditional_comments: getOption('allow_conditional_comments'),
    allow_html_data_urls: getOption('allow_html_data_urls'),
    allow_svg_data_urls: getOption('allow_svg_data_urls'),
    allow_html_in_named_anchor: getOption('allow_html_in_named_anchor'),
    allow_script_urls: getOption('allow_script_urls'),
    allow_unsafe_link_target: getOption('allow_unsafe_link_target'),
    convert_unsafe_embeds: getOption('convert_unsafe_embeds'),
    convert_fonts_to_spans: getOption('convert_fonts_to_spans'),
    fix_list_elements: getOption('fix_list_elements'),
    font_size_legacy_values: getOption('font_size_legacy_values'),
    forced_root_block: getOption('forced_root_block'),
    forced_root_block_attrs: getOption('forced_root_block_attrs'),
    preserve_cdata: getOption('preserve_cdata'),
    inline_styles: getOption('inline_styles'),
    root_name: getRootName(editor),
    sandbox_iframes: getOption('sandbox_iframes'),
    sanitize: getOption('xss_sanitization'),
    validate: true,
    blob_cache: blobCache,
    document: editor.getDoc()
  });
};

const mkSchemaSettings = (editor: Editor): SchemaSettings => {
  const getOption = editor.options.get;

  return removeUndefined<DomSerializerSettings>({
    custom_elements: getOption('custom_elements'),
    extended_valid_elements: getOption('extended_valid_elements'),
    invalid_elements: getOption('invalid_elements'),
    invalid_styles: getOption('invalid_styles'),
    schema: getOption('schema'),
    valid_children: getOption('valid_children'),
    valid_classes: getOption('valid_classes'),
    valid_elements: getOption('valid_elements'),
    valid_styles: getOption('valid_styles'),
    verify_html: getOption('verify_html'),
    padd_empty_block_inline_children: getOption('format_empty_lines')
  });
};

const mkSerializerSettings = (editor: Editor): DomSerializerSettings => {
  const getOption = editor.options.get;

  return {
    ...mkParserSettings(editor),
    ...mkSchemaSettings(editor),
    ...removeUndefined<DomSerializerSettings>({
      // SerializerSettings
      remove_trailing_brs: getOption('remove_trailing_brs'),
      pad_empty_with_br: getOption('pad_empty_with_br'),
      url_converter: getOption('url_converter'),
      url_converter_scope: getOption('url_converter_scope'),

      // Writer settings
      element_format: getOption('element_format'),
      entities: getOption('entities'),
      entity_encoding: getOption('entity_encoding'),
      indent: getOption('indent'),
      indent_after: getOption('indent_after'),
      indent_before: getOption('indent_before')
    })
  };
};

const createParser = (editor: Editor): DomParser => {
  const parser = DomParser(mkParserSettings(editor), editor.schema);

  // Convert src and href into data-mce-src, data-mce-href and data-mce-style
  parser.addAttributeFilter('src,href,style,tabindex', (nodes, name) => {
    const dom = editor.dom;
    const internalName = 'data-mce-' + name;

    let i = nodes.length;
    while (i--) {
      const node = nodes[i];
      let value: string | null | undefined = node.attr(name);

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
  parser.addNodeFilter('script', (nodes: AstNode[]) => {
    let i = nodes.length;

    while (i--) {
      const node = nodes[i];
      const type = node.attr('type') || 'no/type';
      if (type.indexOf('mce-') !== 0) {
        node.attr('type', 'mce-' + type);
      }
    }
  });

  if (Options.shouldPreserveCData(editor)) {
    parser.addNodeFilter('#cdata', (nodes: AstNode[]) => {
      let i = nodes.length;

      while (i--) {
        const node = nodes[i];
        node.type = 8;
        node.name = '#comment';
        node.value = '[CDATA[' + editor.dom.encode(node.value ?? '') + ']]';
      }
    });
  }

  parser.addNodeFilter('p,h1,h2,h3,h4,h5,h6,div', (nodes: AstNode[]) => {
    let i = nodes.length;
    const nonEmptyElements = editor.schema.getNonEmptyElements();

    while (i--) {
      const node = nodes[i];

      if (node.isEmpty(nonEmptyElements) && node.getAll('br').length === 0) {
        node.append(new AstNode('br', 1));
      }
    }
  });

  return parser;
};

const autoFocus = (editor: Editor) => {
  const autoFocus = Options.getAutoFocus(editor);
  if (autoFocus) {
    Delay.setEditorTimeout(editor, () => {
      let focusEditor: Editor | null;

      if (autoFocus === true) {
        focusEditor = editor;
      } else {
        focusEditor = editor.editorManager.get(autoFocus);
      }

      if (focusEditor && !focusEditor.destroyed) {
        focusEditor.focus();
        focusEditor.selection.scrollIntoView();
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
      editor.selection.setRng(caretPos.toRange());
    });
  }
};

const initEditor = (editor: Editor) => {
  editor.bindPendingEventDelegates();
  editor.initialized = true;
  Events.fireInit(editor);
  editor.focus(true);
  moveSelectionToFirstCaretPosition(editor);
  editor.nodeChanged({ initial: true });
  const initInstanceCallback = Options.getInitInstanceCallback(editor);
  if (Type.isFunction(initInstanceCallback)) {
    initInstanceCallback.call(editor, editor);
  }
  autoFocus(editor);
};

const getStyleSheetLoader = (editor: Editor): StyleSheetLoader =>
  editor.inline ? editor.ui.styleSheetLoader : editor.dom.styleSheetLoader;

const makeStylesheetLoadingPromises = (editor: Editor, css: string[], framedFonts: string[]): Promise<unknown>[] => {
  const { pass: bundledCss, fail: normalCss } = Arr.partition(css, (name) => tinymce.Resource.has(ContentCss.toContentSkinResourceName(name)));
  const bundledPromises = bundledCss.map((url) => {
    const css = tinymce.Resource.get(ContentCss.toContentSkinResourceName(url));
    if (Type.isString(css)) {
      return Promise.resolve(getStyleSheetLoader(editor).loadRawCss(url, css));
    }
    return Promise.resolve();
  });
  const promises = [ ...bundledPromises,
    getStyleSheetLoader(editor).loadAll(normalCss),
  ];

  if (editor.inline) {
    return promises;
  } else {
    return promises.concat([
      editor.ui.styleSheetLoader.loadAll(framedFonts)
    ]);
  }
};

const loadContentCss = (editor: Editor) => {
  const styleSheetLoader = getStyleSheetLoader(editor);
  const fontCss = Options.getFontCss(editor);
  const css = editor.contentCSS;

  const removeCss = () => {
    styleSheetLoader.unloadAll(css);

    if (!editor.inline) {
      editor.ui.styleSheetLoader.unloadAll(fontCss);
    }
  };

  const loaded = () => {
    if (editor.removed) {
      removeCss();
    } else {
      editor.on('remove', removeCss);
    }
  };

  // Add editor specific CSS styles
  if (editor.contentStyles.length > 0) {
    let contentCssText = '';

    Tools.each(editor.contentStyles, (style) => {
      contentCssText += style + '\r\n';
    });

    editor.dom.addStyle(contentCssText);
  }

  // Load all stylesheets
  const allStylesheets = Promise.all(makeStylesheetLoadingPromises(editor, css, fontCss)).then(loaded).catch(loaded);

  // Append specified content CSS last
  const contentStyle = Options.getContentStyle(editor);
  if (contentStyle) {
    appendStyle(editor, contentStyle);
  }

  return allStylesheets;
};

const preInit = (editor: Editor) => {
  const doc = editor.getDoc(), body = editor.getBody();

  Events.firePreInit(editor);

  if (!Options.shouldBrowserSpellcheck(editor)) {
    doc.body.spellcheck = false; // Gecko
    DOM.setAttrib(body, 'spellcheck', 'false');
  }

  editor.quirks = Quirks(editor);

  Events.firePostRender(editor);

  const directionality = Options.getDirectionality(editor);
  if (directionality !== undefined) {
    body.dir = directionality;
  }

  const protect = Options.getProtect(editor);
  if (protect) {
    editor.on('BeforeSetContent', (e) => {
      Tools.each(protect, (pattern) => {
        e.content = e.content.replace(pattern, (str) => {
          return '<!--mce:protected ' + escape(str) + '-->';
        });
      });
    });
  }

  editor.on('SetContent', () => {
    editor.addVisual(editor.getBody());
  });

  editor.on('compositionstart compositionend', (e) => {
    editor.composing = e.type === 'compositionstart';
  });
};

const loadInitialContent = (editor: Editor) => {
  if (!Rtc.isRtc(editor)) {
    editor.load({ initial: true, format: 'html' });
  }

  editor.startContent = editor.getContent({ format: 'raw' });
};

const initEditorWithInitialContent = (editor: Editor) => {
  if (editor.removed !== true) {
    loadInitialContent(editor);
    initEditor(editor);
  }
};

const startProgress = (editor: Editor) => {
  let canceled = false;
  const progressTimeout = setTimeout(() => {
    if (!canceled) {
      editor.setProgressState(true);
    }
  }, 500);
  return () => {
    clearTimeout(progressTimeout);
    canceled = true;
    editor.setProgressState(false);
  };
};

const contentBodyLoaded = (editor: Editor): void => {
  const targetElm = editor.getElement();
  let doc = editor.getDoc();

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
  editor.readonly = Options.isReadOnly(editor);
  editor._editableRoot = Options.hasEditableRoot(editor);

  if (!editor.readonly && editor.hasEditableRoot()) {
    if (editor.inline && DOM.getStyle(body, 'position', true) === 'static') {
      body.style.position = 'relative';
    }

    body.contentEditable = 'true';
  }

  (body as any).disabled = false;

  editor.editorUpload = EditorUpload(editor);
  editor.schema = Schema(mkSchemaSettings(editor));
  editor.dom = DOMUtils(doc, {
    keep_values: true,
    // Note: Don't bind here, as the binding is handled via the `url_converter_scope`
    // eslint-disable-next-line @typescript-eslint/unbound-method
    url_converter: editor.convertURL,
    url_converter_scope: editor,
    update_styles: true,
    root_element: editor.inline ? editor.getBody() : null,
    collect: editor.inline,
    schema: editor.schema,
    contentCssCors: Options.shouldUseContentCssCors(editor),
    referrerPolicy: Options.getReferrerPolicy(editor),
    onSetAttrib: (e) => {
      editor.dispatch('SetAttrib', e);
    },
    force_hex_color: Options.shouldForceHexColor(editor),
  });

  editor.parser = createParser(editor);
  editor.serializer = DomSerializer(mkSerializerSettings(editor), editor);
  editor.selection = EditorSelection(editor.dom, editor.getWin(), editor.serializer, editor);
  editor.annotator = Annotator(editor);
  editor.formatter = Formatter(editor);
  editor.undoManager = UndoManager(editor);
  editor._nodeChangeDispatcher = new NodeChange(editor);
  editor._selectionOverrides = SelectionOverrides(editor);

  TouchEvents.setup(editor);
  DetailsElement.setup(editor);
  NonEditableFilter.setup(editor);

  if (!Rtc.isRtc(editor)) {
    MultiClickSelection.setup(editor);
    TextPattern.setup(editor);
  }

  const caret = KeyboardOverrides.setup(editor);
  DeleteCommands.setup(editor, caret);
  ForceBlocks.setup(editor);
  Placeholder.setup(editor);
  Paste.setup(editor);

  const setupRtcThunk = Rtc.setup(editor);

  preInit(editor);

  setupRtcThunk.fold(() => {
    const cancelProgress = startProgress(editor);
    loadContentCss(editor).then(() => {
      initEditorWithInitialContent(editor);
      cancelProgress();
    });
  }, (setupRtc) => {
    editor.setProgressState(true);

    loadContentCss(editor).then(() => {
      setupRtc().then((_rtcMode) => {
        editor.setProgressState(false);
        initEditorWithInitialContent(editor);
        Rtc.bindEvents(editor);
      }, (err) => {
        editor.notificationManager.open({ type: 'error', text: String(err) });
        initEditorWithInitialContent(editor);
        Rtc.bindEvents(editor);
      });
    });
  });
};

export {
  contentBodyLoaded
};
