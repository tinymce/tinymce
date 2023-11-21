import { Arr, Obj, Strings, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import * as Pattern from '../textpatterns/core/Pattern';
import * as PatternTypes from '../textpatterns/core/PatternTypes';
import DOMUtils from './dom/DOMUtils';
import Editor from './Editor';
import { EditorOptions, ForceHexColor } from './OptionTypes';
import I18n from './util/I18n';
import Tools from './util/Tools';

const deviceDetection = PlatformDetection.detect().deviceType;
const isTouch = deviceDetection.isTouch();
const DOM = DOMUtils.DOM;

const getHash = (value: string): Record<string, string> => {
  const items = value.indexOf('=') > 0 ? value.split(/[;,](?![^=;,]*(?:[;,]|$))/) : value.split(',');
  return Arr.foldl(items, (output, item) => {
    const arr = item.split('=');
    const key = arr[0];
    const val = arr.length > 1 ? arr[1] : key;
    output[Strings.trim(key)] = Strings.trim(val);
    return output;
  }, {} as Record<string, string>);
};

const isRegExp = (x: unknown): x is RegExp => Type.is(x, RegExp);

const option = <K extends keyof EditorOptions>(name: K) => (editor: Editor) =>
  editor.options.get(name);

const stringOrObjectProcessor = (value: unknown) =>
  Type.isString(value) || Type.isObject(value);

const bodyOptionProcessor = (editor: Editor, defaultValue: string = '') => (value: unknown) => {
  const valid = Type.isString(value);
  if (valid) {
    if (value.indexOf('=') !== -1) {
      const bodyObj = getHash(value);
      return { value: Obj.get(bodyObj, editor.id).getOr(defaultValue), valid };
    } else {
      return { value, valid };
    }
  } else {
    return { valid: false as const, message: 'Must be a string.' };
  }
};

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('id', {
    processor: 'string',
    default: editor.id
  });

  registerOption('selector', {
    processor: 'string'
  });

  registerOption('target', {
    processor: 'object'
  });

  registerOption('suffix', {
    processor: 'string'
  });

  registerOption('cache_suffix', {
    processor: 'string'
  });

  registerOption('base_url', {
    processor: 'string'
  });

  registerOption('referrer_policy', {
    processor: 'string',
    default: ''
  });

  registerOption('language_load', {
    processor: 'boolean',
    default: true
  });

  registerOption('inline', {
    processor: 'boolean',
    default: false
  });

  registerOption('iframe_attrs', {
    processor: 'object',
    default: {}
  });

  registerOption('doctype', {
    processor: 'string',
    default: '<!DOCTYPE html>'
  });

  registerOption('document_base_url', {
    processor: 'string',
    default: editor.documentBaseUrl
  });

  registerOption('body_id', {
    processor: bodyOptionProcessor(editor, 'tinymce'),
    default: 'tinymce'
  });

  registerOption('body_class', {
    processor: bodyOptionProcessor(editor),
    default: ''
  });

  registerOption('content_security_policy', {
    processor: 'string',
    default: ''
  });

  registerOption('br_in_pre', {
    processor: 'boolean',
    default: true
  });

  registerOption('forced_root_block', {
    processor: (value) => {
      const valid = Type.isString(value) && Strings.isNotEmpty(value);
      if (valid) {
        return { value, valid };
      } else {
        return { valid: false, message: 'Must be a non-empty string.' };
      }
    },
    default: 'p'
  });

  registerOption('forced_root_block_attrs', {
    processor: 'object',
    default: {}
  });

  registerOption('newline_behavior', {
    processor: (value) => {
      const valid = Arr.contains([ 'block', 'linebreak', 'invert', 'default' ], value);
      return valid ? { value, valid } : { valid: false, message: 'Must be one of: block, linebreak, invert or default.' };
    },
    default: 'default'
  });

  registerOption('br_newline_selector', {
    processor: 'string',
    default: '.mce-toc h2,figcaption,caption'
  });

  registerOption('no_newline_selector', {
    processor: 'string',
    default: ''
  });

  registerOption('keep_styles', {
    processor: 'boolean',
    default: true
  });

  registerOption('end_container_on_empty_block', {
    processor: (value) => {
      if (Type.isBoolean(value)) {
        return { valid: true, value };
      } else if (Type.isString(value)) {
        return { valid: true, value };
      } else {
        return { valid: false, message: 'Must be boolean or a string' };
      }
    },
    default: 'blockquote'
  });

  registerOption('font_size_style_values', {
    processor: 'string',
    default: 'xx-small,x-small,small,medium,large,x-large,xx-large'
  });

  registerOption('font_size_legacy_values', {
    processor: 'string',
    // See: http://www.w3.org/TR/CSS2/fonts.html#propdef-font-size
    default: 'xx-small,small,medium,large,x-large,xx-large,300%'
  });

  registerOption('font_size_classes', {
    processor: 'string',
    default: ''
  });

  registerOption('automatic_uploads', {
    processor: 'boolean',
    default: true
  });

  registerOption('images_reuse_filename', {
    processor: 'boolean',
    default: false
  });

  registerOption('images_replace_blob_uris', {
    processor: 'boolean',
    default: true
  });

  registerOption('icons', {
    processor: 'string',
    default: ''
  });

  registerOption('icons_url', {
    processor: 'string',
    default: ''
  });

  registerOption('images_upload_url', {
    processor: 'string',
    default: ''
  });

  registerOption('images_upload_base_path', {
    processor: 'string',
    default: ''
  });

  registerOption('images_upload_credentials', {
    processor: 'boolean',
    default: false
  });

  registerOption('images_upload_handler', {
    processor: 'function'
  });

  registerOption('language', {
    processor: 'string',
    default: 'en'
  });

  registerOption('language_url', {
    processor: 'string',
    default: ''
  });

  registerOption('entity_encoding', {
    processor: 'string',
    default: 'named'
  });

  registerOption('indent', {
    processor: 'boolean',
    default: true
  });

  registerOption('indent_before', {
    processor: 'string',
    default: 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,th,ul,ol,li,dl,dt,dd,area,table,thead,' +
      'tfoot,tbody,tr,section,details,summary,article,hgroup,aside,figure,figcaption,option,optgroup,datalist'
  });

  registerOption('indent_after', {
    processor: 'string',
    default: 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,th,ul,ol,li,dl,dt,dd,area,table,thead,' +
      'tfoot,tbody,tr,section,details,summary,article,hgroup,aside,figure,figcaption,option,optgroup,datalist'
  });

  registerOption('indent_use_margin', {
    processor: 'boolean',
    default: false
  });

  registerOption('indentation', {
    processor: 'string',
    default: '40px'
  });

  registerOption('content_css', {
    processor: (value) => {
      const valid = value === false || Type.isString(value) || Type.isArrayOf(value, Type.isString);

      if (valid) {
        if (Type.isString(value)) {
          return { value: Arr.map(value.split(','), Strings.trim), valid };
        } else if (Type.isArray(value)) {
          return { value, valid };
        } else if (value === false) {
          return { value: [], valid };
        } else {
          return { value, valid };
        }
      } else {
        return { valid: false, message: 'Must be false, a string or an array of strings.' };
      }
    },
    default: isInline(editor) ? [] : [ 'default' ]
  });

  registerOption('content_style', {
    processor: 'string'
  });

  registerOption('content_css_cors', {
    processor: 'boolean',
    default: false
  });

  registerOption('font_css', {
    processor: (value) => {
      const valid = Type.isString(value) || Type.isArrayOf(value, Type.isString);

      if (valid) {
        const newValue = Type.isArray(value) ? value : Arr.map(value.split(','), Strings.trim);
        return { value: newValue, valid };
      } else {
        return { valid: false, message: 'Must be a string or an array of strings.' };
      }
    },
    default: []
  });

  registerOption('inline_boundaries', {
    processor: 'boolean',
    default: true
  });

  registerOption('inline_boundaries_selector', {
    processor: 'string',
    default: 'a[href],code,span.mce-annotation'
  });

  registerOption('object_resizing', {
    processor: (value) => {
      const valid = Type.isBoolean(value) || Type.isString(value);
      if (valid) {
        if (value === false || deviceDetection.isiPhone() || deviceDetection.isiPad()) {
          return { value: '', valid };
        } else {
          return { value: value === true ? 'table,img,figure.image,div,video,iframe' : value, valid };
        }
      } else {
        return { valid: false, message: 'Must be boolean or a string' };
      }
    },
    // No nice way to do object resizing on touch devices at this stage
    default: !isTouch
  });

  registerOption('resize_img_proportional', {
    processor: 'boolean',
    default: true
  });

  registerOption('event_root', {
    processor: 'object'
  });

  registerOption('service_message', {
    processor: 'string'
  });

  registerOption('theme', {
    processor: (value) => value === false || Type.isString(value) || Type.isFunction(value),
    default: 'silver'
  });

  registerOption('theme_url', {
    processor: 'string'
  });

  registerOption('formats', {
    processor: 'object'
  });

  registerOption('format_empty_lines', {
    processor: 'boolean',
    default: false
  });

  registerOption('format_noneditable_selector', {
    processor: 'string',
    default: ''
  });

  registerOption('preview_styles', {
    processor: (value) => {
      const valid = value === false || Type.isString(value);
      if (valid) {
        return { value: value === false ? '' : value, valid };
      } else {
        return { valid: false, message: 'Must be false or a string' };
      }
    },
    default: 'font-family font-size font-weight font-style text-decoration text-transform color background-color border border-radius outline text-shadow'
  });

  registerOption('custom_ui_selector', {
    processor: 'string',
    default: ''
  });

  registerOption('hidden_input', {
    processor: 'boolean',
    default: true
  });

  registerOption('submit_patch', {
    processor: 'boolean',
    default: true
  });

  registerOption('encoding', {
    processor: 'string'
  });

  registerOption('add_form_submit_trigger', {
    processor: 'boolean',
    default: true
  });

  registerOption('add_unload_trigger', {
    processor: 'boolean',
    default: true
  });

  registerOption('custom_undo_redo_levels', {
    processor: 'number',
    default: 0
  });

  registerOption('disable_nodechange', {
    processor: 'boolean',
    default: false
  });

  registerOption('readonly', {
    processor: 'boolean',
    default: false
  });

  registerOption('editable_root', {
    processor: 'boolean',
    default: true
  });

  registerOption('plugins', {
    processor: 'string[]',
    default: []
  });

  registerOption('external_plugins', {
    processor: 'object'
  });

  registerOption('forced_plugins', {
    processor: 'string[]'
  });

  registerOption('model', {
    processor: 'string',
    default: editor.hasPlugin('rtc') ? 'plugin' : 'dom'
  });

  registerOption('model_url', {
    processor: 'string'
  });

  registerOption('block_unsupported_drop', {
    processor: 'boolean',
    default: true
  });

  registerOption('visual', {
    processor: 'boolean',
    default: true
  });

  registerOption('visual_table_class', {
    processor: 'string',
    default: 'mce-item-table'
  });

  registerOption('visual_anchor_class', {
    processor: 'string',
    default: 'mce-item-anchor'
  });

  registerOption('iframe_aria_text', {
    processor: 'string',
    default: 'Rich Text Area. Press ALT-0 for help.'
  });

  registerOption('setup', {
    processor: 'function'
  });

  registerOption('init_instance_callback', {
    processor: 'function'
  });

  registerOption('url_converter', {
    processor: 'function',
    // Note: Don't bind here, as the binding is handled via the `url_converter_scope`
    // eslint-disable-next-line @typescript-eslint/unbound-method
    default: editor.convertURL
  });

  registerOption('url_converter_scope', {
    processor: 'object',
    default: editor
  });

  registerOption('urlconverter_callback', {
    processor: 'function'
  });

  registerOption('allow_conditional_comments', {
    processor: 'boolean',
    default: false
  });

  registerOption('allow_html_data_urls', {
    processor: 'boolean',
    default: false
  });

  registerOption('allow_svg_data_urls', {
    processor: 'boolean'
  });

  registerOption('allow_html_in_named_anchor', {
    processor: 'boolean',
    default: false
  });

  registerOption('allow_script_urls', {
    processor: 'boolean',
    default: false
  });

  registerOption('allow_unsafe_link_target', {
    processor: 'boolean',
    default: false
  });

  registerOption('convert_fonts_to_spans', {
    processor: 'boolean',
    default: true,
    deprecated: true
  });

  registerOption('fix_list_elements', {
    processor: 'boolean',
    default: false
  });

  registerOption('preserve_cdata', {
    processor: 'boolean',
    default: false
  });

  registerOption('remove_trailing_brs', {
    processor: 'boolean',
    default: true
  });

  registerOption('pad_empty_with_br', {
    processor: 'boolean',
    default: false,
  });

  registerOption('inline_styles', {
    processor: 'boolean',
    default: true,
    deprecated: true
  });

  registerOption('element_format', {
    processor: 'string',
    default: 'html'
  });

  registerOption('entities', {
    processor: 'string'
  });

  registerOption('schema', {
    processor: 'string',
    default: 'html5'
  });

  registerOption('convert_urls', {
    processor: 'boolean',
    default: true
  });

  registerOption('relative_urls', {
    processor: 'boolean',
    default: true
  });

  registerOption('remove_script_host', {
    processor: 'boolean',
    default: true
  });

  registerOption('custom_elements', {
    processor: 'string'
  });

  registerOption('extended_valid_elements', {
    processor: 'string'
  });

  registerOption('invalid_elements', {
    processor: 'string'
  });

  registerOption('invalid_styles', {
    processor: stringOrObjectProcessor
  });

  registerOption('valid_children', {
    processor: 'string'
  });

  registerOption('valid_classes', {
    processor: stringOrObjectProcessor
  });

  registerOption('valid_elements', {
    processor: 'string'
  });

  registerOption('valid_styles', {
    processor: stringOrObjectProcessor
  });

  registerOption('verify_html', {
    processor: 'boolean',
    default: true
  });

  registerOption('auto_focus', {
    processor: (value) => Type.isString(value) || value === true
  });

  registerOption('browser_spellcheck', {
    processor: 'boolean',
    default: false
  });

  registerOption('protect', {
    processor: 'array'
  });

  registerOption('images_file_types', {
    processor: 'string',
    default: 'jpeg,jpg,jpe,jfi,jif,jfif,png,gif,bmp,webp'
  });

  registerOption('deprecation_warnings', {
    processor: 'boolean',
    default: true
  });

  registerOption('a11y_advanced_options', {
    processor: 'boolean',
    default: false
  });

  registerOption('api_key', {
    processor: 'string'
  });

  registerOption('paste_block_drop', {
    processor: 'boolean',
    default: false
  });

  registerOption('paste_data_images', {
    processor: 'boolean',
    default: true
  });

  registerOption('paste_preprocess', {
    processor: 'function'
  });

  registerOption('paste_postprocess', {
    processor: 'function'
  });

  registerOption('paste_webkit_styles', {
    processor: 'string',
    default: 'none'
  });

  registerOption('paste_remove_styles_if_webkit', {
    processor: 'boolean',
    default: true
  });

  registerOption('paste_merge_formats', {
    processor: 'boolean',
    default: true
  });

  registerOption('smart_paste', {
    processor: 'boolean',
    default: true
  });

  registerOption('paste_as_text', {
    processor: 'boolean',
    default: false
  });

  registerOption('paste_tab_spaces', {
    processor: 'number',
    default: 4
  });

  registerOption('text_patterns', {
    processor: (value) => {
      if (Type.isArrayOf(value, Type.isObject) || value === false) {
        const patterns = value === false ? [] : value;
        return { value: Pattern.fromRawPatterns(patterns), valid: true };
      } else {
        return { valid: false, message: 'Must be an array of objects or false.' };
      }
    },
    default: [
      { start: '*', end: '*', format: 'italic' },
      { start: '**', end: '**', format: 'bold' },
      { start: '#', format: 'h1' },
      { start: '##', format: 'h2' },
      { start: '###', format: 'h3' },
      { start: '####', format: 'h4' },
      { start: '#####', format: 'h5' },
      { start: '######', format: 'h6' },
      { start: '1. ', cmd: 'InsertOrderedList' },
      { start: '* ', cmd: 'InsertUnorderedList' },
      { start: '- ', cmd: 'InsertUnorderedList' }
    ]
  });

  registerOption('text_patterns_lookup', {
    processor: (value) => {
      if (Type.isFunction(value)) {
        return {
          value: Pattern.fromRawPatternsLookup(value as PatternTypes.RawDynamicPatternsLookup),
          valid: true,
        };
      } else {
        return { valid: false, message: 'Must be a single function' };
      }
    },
    default: (_ctx: PatternTypes.DynamicPatternContext): PatternTypes.Pattern[] => [ ]
  });

  registerOption('noneditable_class', {
    processor: 'string',
    default: 'mceNonEditable'
  });

  registerOption('editable_class', {
    processor: 'string',
    default: 'mceEditable'
  });

  registerOption('noneditable_regexp', {
    processor: (value) => {
      if (Type.isArrayOf(value, isRegExp)) {
        return { value, valid: true };
      } else if (isRegExp(value)) {
        return { value: [ value ], valid: true };
      } else {
        return { valid: false, message: 'Must be a RegExp or an array of RegExp.' };
      }
    },
    default: []
  });

  registerOption('table_tab_navigation', {
    processor: 'boolean',
    default: true
  });

  registerOption('highlight_on_focus', {
    processor: 'boolean',
    default: false
  });

  registerOption('xss_sanitization', {
    processor: 'boolean',
    default: true
  });

  registerOption('details_initial_state', {
    processor: (value) => {
      const valid = Arr.contains([ 'inherited', 'collapsed', 'expanded' ], value);
      return valid ? { value, valid } : { valid: false, message: 'Must be one of: inherited, collapsed, or expanded.' };
    },
    default: 'inherited'
  });

  registerOption('details_serialized_state', {
    processor: (value) => {
      const valid = Arr.contains([ 'inherited', 'collapsed', 'expanded' ], value);
      return valid ? { value, valid } : { valid: false, message: 'Must be one of: inherited, collapsed, or expanded.' };
    },
    default: 'inherited'
  });

  registerOption('init_content_sync', {
    processor: 'boolean',
    default: false
  });

  registerOption('newdocument_content', {
    processor: 'string',
    default: ''
  });

  registerOption('force_hex_color', {
    processor: (value) => {
      const options: ForceHexColor[] = [ 'always', 'rgb_only', 'off' ];
      const valid = Arr.contains(options, value);
      return valid ? { value, valid } : { valid: false, message: `Must be one of: ${options.join(', ')}.` };
    },
    default: 'off',
  });

  registerOption('sandbox_iframes', {
    processor: 'boolean',
    default: false
  });

  registerOption('convert_unsafe_embeds', {
    processor: 'boolean',
    default: false
  });

  // These options must be registered later in the init sequence due to their default values
  editor.on('ScriptsLoaded', () => {
    registerOption('directionality', {
      processor: 'string',
      default: I18n.isRtl() ? 'rtl' : undefined
    });

    registerOption('placeholder', {
      processor: 'string',
      // Fallback to the original elements placeholder if not set in the settings
      default: DOM.getAttrib(editor.getElement(), 'placeholder')
    });
  });
};

const getIframeAttrs = option('iframe_attrs');
const getDocType = option('doctype');
const getDocumentBaseUrl = option('document_base_url');
const getBodyId = option('body_id');
const getBodyClass = option('body_class');
const getContentSecurityPolicy = option('content_security_policy');
const shouldPutBrInPre = option('br_in_pre');
const getForcedRootBlock = option('forced_root_block');
const getForcedRootBlockAttrs = option('forced_root_block_attrs');
const getNewlineBehavior = option('newline_behavior');
const getBrNewLineSelector = option('br_newline_selector');
const getNoNewLineSelector = option('no_newline_selector');
const shouldKeepStyles = option('keep_styles');
const shouldEndContainerOnEmptyBlock = option('end_container_on_empty_block');
const isAutomaticUploadsEnabled = option('automatic_uploads');
const shouldReuseFileName = option('images_reuse_filename');
const shouldReplaceBlobUris = option('images_replace_blob_uris');
const getIconPackName = option('icons');
const getIconsUrl = option('icons_url');
const getImageUploadUrl = option('images_upload_url');
const getImageUploadBasePath = option('images_upload_base_path');
const getImagesUploadCredentials = option('images_upload_credentials');
const getImagesUploadHandler = option('images_upload_handler');
const shouldUseContentCssCors = option('content_css_cors');
const getReferrerPolicy = option('referrer_policy');
const getLanguageCode = option('language');
const getLanguageUrl = option('language_url');
const shouldIndentUseMargin = option('indent_use_margin');
const getIndentation = option('indentation');
const getContentCss = option('content_css');
const getContentStyle = option('content_style');
const getFontCss = option('font_css');
const getDirectionality = option('directionality');
const getInlineBoundarySelector = option('inline_boundaries_selector');
const getObjectResizing = option('object_resizing');
const getResizeImgProportional = option('resize_img_proportional');
const getPlaceholder = option('placeholder');
const getEventRoot = option('event_root');
const getServiceMessage = option('service_message');
const getTheme = option('theme');
const getThemeUrl = option('theme_url');
const getModel = option('model');
const getModelUrl = option('model_url');
const isInlineBoundariesEnabled = option('inline_boundaries');
const getFormats = option('formats');
const getPreviewStyles = option('preview_styles');
const canFormatEmptyLines = option('format_empty_lines');
const getFormatNoneditableSelector = option('format_noneditable_selector');
const getCustomUiSelector = option('custom_ui_selector');
const isInline = option('inline');
const hasHiddenInput = option('hidden_input');
const shouldPatchSubmit = option('submit_patch');
const shouldAddFormSubmitTrigger = option('add_form_submit_trigger');
const shouldAddUnloadTrigger = option('add_unload_trigger');
const getCustomUndoRedoLevels = option('custom_undo_redo_levels');
const shouldDisableNodeChange = option('disable_nodechange');
const isReadOnly = option('readonly');
const hasEditableRoot = option('editable_root');
const hasContentCssCors = option('content_css_cors');
const getPlugins = option('plugins');
const getExternalPlugins = option('external_plugins');
const shouldBlockUnsupportedDrop = option('block_unsupported_drop');
const isVisualAidsEnabled = option('visual');
const getVisualAidsTableClass = option('visual_table_class');
const getVisualAidsAnchorClass = option('visual_anchor_class');
const getIframeAriaText = option('iframe_aria_text');
const getSetupCallback = option('setup');
const getInitInstanceCallback = option('init_instance_callback');
const getUrlConverterCallback = option('urlconverter_callback');
const getAutoFocus = option('auto_focus');
const shouldBrowserSpellcheck = option('browser_spellcheck');
const getProtect = option('protect');
const shouldPasteBlockDrop = option('paste_block_drop');
const shouldPasteDataImages = option('paste_data_images');
const getPastePreProcess = option('paste_preprocess');
const getPastePostProcess = option('paste_postprocess');
const getNewDocumentContent = option('newdocument_content');
const getPasteWebkitStyles = option('paste_webkit_styles');
const shouldPasteRemoveWebKitStyles = option('paste_remove_styles_if_webkit');
const shouldPasteMergeFormats = option('paste_merge_formats');
const isSmartPasteEnabled = option('smart_paste');
const isPasteAsTextEnabled = option('paste_as_text');
const getPasteTabSpaces = option('paste_tab_spaces');
const shouldAllowHtmlDataUrls = option('allow_html_data_urls');
const getTextPatterns = option('text_patterns');
const getTextPatternsLookup = option('text_patterns_lookup');
const getNonEditableClass = option('noneditable_class');
const getEditableClass = option('editable_class');
const getNonEditableRegExps = option('noneditable_regexp');
const shouldPreserveCData = option('preserve_cdata');
const shouldHighlightOnFocus = option('highlight_on_focus');
const shouldSanitizeXss = option('xss_sanitization');
const shouldUseDocumentWrite = option('init_content_sync');
const hasTextPatternsLookup = (editor: Editor): boolean => editor.options.isSet('text_patterns_lookup');
const getFontStyleValues = (editor: Editor): string[] => Tools.explode(editor.options.get('font_size_style_values'));
const getFontSizeClasses = (editor: Editor): string[] => Tools.explode(editor.options.get('font_size_classes'));
const isEncodingXml = (editor: Editor): boolean => editor.options.get('encoding') === 'xml';
const getAllowedImageFileTypes = (editor: Editor): string[] => Tools.explode(editor.options.get('images_file_types'));
const hasTableTabNavigation = option('table_tab_navigation');
const getDetailsInitialState = option('details_initial_state');
const getDetailsSerializedState = option('details_serialized_state');
const shouldForceHexColor = option('force_hex_color');
const shouldSandboxIframes = option('sandbox_iframes');
const shouldConvertUnsafeEmbeds = option('convert_unsafe_embeds');

export {
  register,

  getIframeAttrs,
  getDocType,
  getDocumentBaseUrl,
  getBodyId,
  getBodyClass,
  getContentSecurityPolicy,
  shouldPutBrInPre,
  getForcedRootBlock,
  getForcedRootBlockAttrs,
  getNewlineBehavior,
  getBrNewLineSelector,
  getNoNewLineSelector,
  shouldKeepStyles,
  shouldEndContainerOnEmptyBlock,
  getFontStyleValues,
  getFontSizeClasses,
  getIconPackName,
  getIconsUrl,
  isAutomaticUploadsEnabled,
  shouldReuseFileName,
  shouldReplaceBlobUris,
  getImageUploadUrl,
  getImageUploadBasePath,
  getImagesUploadCredentials,
  getImagesUploadHandler,
  shouldUseContentCssCors,
  getReferrerPolicy,
  getLanguageCode,
  getLanguageUrl,
  shouldIndentUseMargin,
  getIndentation,
  getContentCss,
  getContentStyle,
  getDirectionality,
  getInlineBoundarySelector,
  getObjectResizing,
  getResizeImgProportional,
  getPlaceholder,
  getEventRoot,
  getServiceMessage,
  getTheme,
  getModel,
  isInlineBoundariesEnabled,
  getFormats,
  getPreviewStyles,
  canFormatEmptyLines,
  getFormatNoneditableSelector,
  getCustomUiSelector,
  getThemeUrl,
  getModelUrl,
  isInline,
  hasHiddenInput,
  shouldPatchSubmit,
  isEncodingXml,
  shouldAddFormSubmitTrigger,
  shouldAddUnloadTrigger,
  getCustomUndoRedoLevels,
  shouldDisableNodeChange,
  isReadOnly,
  hasEditableRoot,
  hasContentCssCors,
  getPlugins,
  getExternalPlugins,
  shouldBlockUnsupportedDrop,
  isVisualAidsEnabled,
  getVisualAidsTableClass,
  getFontCss,
  getVisualAidsAnchorClass,
  getSetupCallback,
  getInitInstanceCallback,
  getUrlConverterCallback,
  getIframeAriaText,
  getAutoFocus,
  shouldBrowserSpellcheck,
  getProtect,
  shouldPasteBlockDrop,
  shouldPasteDataImages,
  getPastePreProcess,
  getPastePostProcess,
  getNewDocumentContent,
  getPasteWebkitStyles,
  shouldPasteRemoveWebKitStyles,
  shouldPasteMergeFormats,
  isSmartPasteEnabled,
  isPasteAsTextEnabled,
  getPasteTabSpaces,
  shouldAllowHtmlDataUrls,
  getAllowedImageFileTypes,
  getTextPatterns,
  getTextPatternsLookup,
  hasTextPatternsLookup,
  getNonEditableClass,
  getNonEditableRegExps,
  getEditableClass,
  hasTableTabNavigation,
  shouldPreserveCData,
  shouldHighlightOnFocus,
  shouldSanitizeXss,
  getDetailsInitialState,
  getDetailsSerializedState,
  shouldUseDocumentWrite,
  shouldForceHexColor,
  shouldSandboxIframes,
  shouldConvertUnsafeEmbeds
};
