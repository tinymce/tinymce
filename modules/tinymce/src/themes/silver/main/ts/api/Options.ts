import { Arr, Fun, Obj, Optional, Optionals, Type } from '@ephox/katamari';
import { SelectorFind, SugarBody, SugarElement, SugarShadowDom } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Env from 'tinymce/core/api/Env';
import { EditorOptions, ToolbarGroup } from 'tinymce/core/api/OptionTypes';

export type ToolbarGroupOption = ToolbarGroup;

export enum ToolbarMode {
  default = 'wrap',
  floating = 'floating',
  sliding = 'sliding',
  scrolling = 'scrolling'
}

export enum ToolbarLocation {
  auto = 'auto',
  top = 'top',
  bottom = 'bottom'
}

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T | undefined;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const wrapOptional = <T>(fn: (editor: Editor) => T) => (editor: Editor): Optional<NonNullable<T>> =>
  Optional.from(fn(editor));

const register = (editor: Editor): void => {
  const isPhone = Env.deviceType.isPhone();
  const isMobile = Env.deviceType.isTablet() || isPhone;
  const registerOption = editor.options.register;

  const stringOrFalseProcessor = (value: unknown) => Type.isString(value) || value === false;
  const stringOrNumberProcessor = (value: unknown) => Type.isString(value) || Type.isNumber(value);

  registerOption('skin', {
    processor: (value) => Type.isString(value) || value === false,
    default: 'oxide'
  });

  registerOption('skin_url', {
    processor: 'string'
  });

  registerOption('height', {
    processor: stringOrNumberProcessor,
    default: Math.max(editor.getElement().offsetHeight, 400)
  });

  registerOption('width', {
    processor: stringOrNumberProcessor,
    default: DOMUtils.DOM.getStyle(editor.getElement(), 'width')
  });

  registerOption('min_height', {
    processor: 'number',
    default: 100
  });

  registerOption('min_width', {
    processor: 'number'
  });

  registerOption('max_height', {
    processor: 'number'
  });

  registerOption('max_width', {
    processor: 'number'
  });

  registerOption('style_formats', {
    processor: 'object[]'
  });

  registerOption('style_formats_merge', {
    processor: 'boolean',
    default: false
  });

  registerOption('style_formats_autohide', {
    processor: 'boolean',
    default: false
  });

  registerOption('line_height_formats', {
    processor: 'string',
    default: '1 1.1 1.2 1.3 1.4 1.5 2'
  });

  registerOption('font_family_formats', {
    processor: 'string',
    default: 'Andale Mono=andale mono,monospace;' +
      'Arial=arial,helvetica,sans-serif;' +
      'Arial Black=arial black,sans-serif;' +
      'Book Antiqua=book antiqua,palatino,serif;' +
      'Comic Sans MS=comic sans ms,sans-serif;' +
      'Courier New=courier new,courier,monospace;' +
      'Georgia=georgia,palatino,serif;' +
      'Helvetica=helvetica,arial,sans-serif;' +
      'Impact=impact,sans-serif;' +
      'Symbol=symbol;' +
      'Tahoma=tahoma,arial,helvetica,sans-serif;' +
      'Terminal=terminal,monaco,monospace;' +
      'Times New Roman=times new roman,times,serif;' +
      'Trebuchet MS=trebuchet ms,geneva,sans-serif;' +
      'Verdana=verdana,geneva,sans-serif;' +
      'Webdings=webdings;' +
      'Wingdings=wingdings,zapf dingbats'
  });

  registerOption('font_size_formats', {
    processor: 'string',
    default: '8pt 10pt 12pt 14pt 18pt 24pt 36pt'
  });

  registerOption('font_size_input_default_unit', {
    processor: 'string',
    default: 'pt'
  });

  registerOption('block_formats', {
    processor: 'string',
    default: 'Paragraph=p;' +
      'Heading 1=h1;' +
      'Heading 2=h2;' +
      'Heading 3=h3;' +
      'Heading 4=h4;' +
      'Heading 5=h5;' +
      'Heading 6=h6;' +
      'Preformatted=pre'
  });

  registerOption('content_langs', {
    processor: 'object[]'
  });

  registerOption('removed_menuitems', {
    processor: 'string',
    default: ''
  });

  registerOption('menubar', {
    processor: (value) => Type.isString(value) || Type.isBoolean(value),
    // Phones don't have a lot of screen space so disable the menubar
    default: !isPhone
  });

  registerOption('menu', {
    processor: 'object',
    default: {}
  });

  registerOption('toolbar', {
    processor: (value) => {
      if (Type.isBoolean(value) || Type.isString(value) || Type.isArray(value)) {
        return { value, valid: true };
      } else {
        return { valid: false, message: 'Must be a boolean, string or array.' };
      }
    },
    default: true
  });

  // Register the toolbarN variations: toolbar1 -> toolbar9
  Arr.range(9, (num) => {
    registerOption('toolbar' + (num + 1), {
      processor: 'string'
    });
  });

  registerOption('toolbar_mode', {
    processor: 'string',
    // Use the default side-scrolling toolbar for tablets/phones
    default: isMobile ? 'scrolling' : 'floating'
  });

  registerOption('toolbar_groups', {
    processor: 'object',
    default: {}
  });

  registerOption('toolbar_location', {
    processor: 'string',
    default: ToolbarLocation.auto
  });

  registerOption('toolbar_persist', {
    processor: 'boolean',
    default: false
  });

  registerOption('toolbar_sticky', {
    processor: 'boolean',
    default: editor.inline
  });

  registerOption('toolbar_sticky_offset', {
    processor: 'number',
    default: 0
  });

  registerOption('fixed_toolbar_container', {
    processor: 'string',
    default: ''
  });

  registerOption('fixed_toolbar_container_target', {
    processor: 'object'
  });

  registerOption('ui_mode', {
    processor: 'string',
    default: 'combined'
  });

  registerOption('file_picker_callback', {
    processor: 'function'
  });

  registerOption('file_picker_validator_handler', {
    processor: 'function'
  });

  registerOption('file_picker_types', {
    processor: 'string'
  });

  registerOption('typeahead_urls', {
    processor: 'boolean',
    default: true
  });

  registerOption('anchor_top', {
    processor: stringOrFalseProcessor,
    default: '#top'
  });

  registerOption('anchor_bottom', {
    processor: stringOrFalseProcessor,
    default: '#bottom'
  });

  registerOption('draggable_modal', {
    processor: 'boolean',
    default: false
  });

  registerOption('statusbar', {
    processor: 'boolean',
    default: true
  });

  registerOption('elementpath', {
    processor: 'boolean',
    default: true
  });

  registerOption('branding', {
    processor: 'boolean',
    default: true
  });

  registerOption('promotion', {
    processor: 'boolean',
    default: true
  });

  registerOption('resize', {
    processor: (value) => value === 'both' || Type.isBoolean(value),
    // Editor resize doesn't work on touch devices at this stage
    default: !Env.deviceType.isTouch()
  });

  registerOption('sidebar_show', {
    processor: 'string'
  });

  // This option is being registered in the theme instead of the help plugin as it cannot be accessed from the theme when registered there
  registerOption('help_accessibility', {
    processor: 'boolean',
    default: editor.hasPlugin('help')
  });

  registerOption('default_font_stack', {
    processor: 'string[]',
    default: []
  });
};

const isReadOnly = option('readonly');
const getHeightOption = option('height');
const getWidthOption = option('width');
const getMinWidthOption = wrapOptional(option('min_width'));
const getMinHeightOption = wrapOptional(option('min_height'));
const getMaxWidthOption = wrapOptional(option('max_width'));
const getMaxHeightOption = wrapOptional(option('max_height'));
const getUserStyleFormats = wrapOptional(option('style_formats'));
const shouldMergeStyleFormats = option('style_formats_merge');
const shouldAutoHideStyleFormats = option('style_formats_autohide');
const getContentLanguages = option('content_langs');
const getRemovedMenuItems = option('removed_menuitems');
const getToolbarMode = option('toolbar_mode');
const getToolbarGroups = option('toolbar_groups');
const getToolbarLocation = option('toolbar_location');
const fixedContainerSelector = option('fixed_toolbar_container');
const fixedToolbarContainerTarget = option('fixed_toolbar_container_target');
const isToolbarPersist = option('toolbar_persist');
const getStickyToolbarOffset = option('toolbar_sticky_offset');
const getMenubar = option('menubar');
const getToolbar = option('toolbar');
const getFilePickerCallback = option('file_picker_callback');
const getFilePickerValidatorHandler = option('file_picker_validator_handler');
const getFontSizeInputDefaultUnit = option('font_size_input_default_unit');
const getFilePickerTypes = option('file_picker_types');
const useTypeaheadUrls = option('typeahead_urls');
const getAnchorTop = option('anchor_top');
const getAnchorBottom = option('anchor_bottom');
const isDraggableModal = option('draggable_modal');
const useStatusBar = option('statusbar');
const useElementPath = option('elementpath');
const useBranding = option('branding');
const getResize = option('resize');
const getPasteAsText = option('paste_as_text');
const getSidebarShow = option('sidebar_show');
const promotionEnabled = option('promotion');
const useHelpAccessibility = option('help_accessibility');
const getDefaultFontStack = option('default_font_stack');

const isSkinDisabled = (editor: Editor): boolean =>
  editor.options.get('skin') === false;

const isMenubarEnabled = (editor: Editor): boolean =>
  editor.options.get('menubar') !== false;

const getSkinUrl = (editor: Editor): string | undefined => {
  const skinUrl = editor.options.get('skin_url');

  if (isSkinDisabled(editor)) {
    return skinUrl;
  } else {
    if (skinUrl) {
      return editor.documentBaseURI.toAbsolute(skinUrl);
    } else {
      const skin = editor.options.get('skin');
      return EditorManager.baseURL + '/skins/ui/' + skin;
    }
  }
};

const getSkinUrlOption = (editor: Editor): Optional<string> => Optional.from(editor.options.get('skin_url'));

const getLineHeightFormats = (editor: Editor): string[] =>
  editor.options.get('line_height_formats').split(' ');

const isToolbarEnabled = (editor: Editor): boolean => {
  const toolbar = getToolbar(editor);
  const isToolbarString = Type.isString(toolbar);
  const isToolbarObjectArray = Type.isArray(toolbar) && toolbar.length > 0;
  // Toolbar is enabled if its value is true, a string or non-empty object array, but not string array
  return !isMultipleToolbars(editor) && (isToolbarObjectArray || isToolbarString || toolbar === true);
};

// Convert toolbar<n> into toolbars array
const getMultipleToolbarsOption = (editor: Editor): Optional<string[]> => {
  const toolbars = Arr.range(9, (num) => editor.options.get('toolbar' + (num + 1)));
  const toolbarArray = Arr.filter(toolbars, Type.isString);
  return Optionals.someIf(toolbarArray.length > 0, toolbarArray);
};

// Check if multiple toolbars is enabled
// Multiple toolbars is enabled if toolbar value is a string array or if toolbar<n> is present
const isMultipleToolbars = (editor: Editor): boolean => getMultipleToolbarsOption(editor).fold(
  () => {
    const toolbar = getToolbar(editor);
    return Type.isArrayOf(toolbar, Type.isString) && toolbar.length > 0;
  },
  Fun.always
);

const isToolbarLocationBottom = (editor: Editor): boolean =>
  getToolbarLocation(editor) === ToolbarLocation.bottom;

const fixedContainerTarget = (editor: Editor): Optional<SugarElement> => {
  if (!editor.inline) {
    // fixed_toolbar_container(_target) is only available in inline mode
    return Optional.none();
  }

  const selector = fixedContainerSelector(editor) ?? '';
  if (selector.length > 0) {
    // If we have a valid selector
    return SelectorFind.descendant(SugarBody.body(), selector);
  }

  const element = fixedToolbarContainerTarget(editor);
  if (Type.isNonNullable(element)) {
    // If we have a valid target
    return Optional.some(SugarElement.fromDom(element));
  }

  return Optional.none();
};

const useFixedContainer = (editor: Editor): boolean =>
  editor.inline && fixedContainerTarget(editor).isSome();

const getUiContainer = (editor: Editor): SugarElement<HTMLElement | ShadowRoot> => {
  const fixedContainer = fixedContainerTarget(editor);
  return fixedContainer.getOrThunk(() =>
    SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(SugarElement.fromDom(editor.getElement())))
  );
};

const isDistractionFree = (editor: Editor): boolean =>
  editor.inline && !isMenubarEnabled(editor) && !isToolbarEnabled(editor) && !isMultipleToolbars(editor);

const isStickyToolbar = (editor: Editor): boolean => {
  const isStickyToolbar = editor.options.get('toolbar_sticky');
  return (isStickyToolbar || editor.inline) && !useFixedContainer(editor) && !isDistractionFree(editor);
};

const isSplitUiMode = (editor: Editor): boolean =>
  !useFixedContainer(editor) && editor.options.get('ui_mode') === 'split';

const getMenus = (editor: Editor): Record<string, { title: string; items: string }> => {
  const menu = editor.options.get('menu');
  return Obj.map(menu, (menu) => ({ ...menu, items: menu.items }));
};

export {
  register,
  getSkinUrl,
  getSkinUrlOption,
  isReadOnly,
  isSkinDisabled,
  getHeightOption,
  getWidthOption,
  getMinWidthOption,
  getMinHeightOption,
  getMaxWidthOption,
  getMaxHeightOption,
  getUserStyleFormats,
  shouldMergeStyleFormats,
  shouldAutoHideStyleFormats,
  getLineHeightFormats,
  getContentLanguages,
  getRemovedMenuItems,
  isMenubarEnabled,
  isMultipleToolbars,
  isToolbarEnabled,
  isToolbarPersist,
  getMultipleToolbarsOption,
  getUiContainer,
  useFixedContainer,
  isSplitUiMode,
  getToolbarMode,
  isDraggableModal,
  isDistractionFree,
  isStickyToolbar,
  getStickyToolbarOffset,
  getToolbarLocation,
  isToolbarLocationBottom,
  getToolbarGroups,
  getMenus,
  getMenubar,
  getToolbar,
  getFilePickerCallback,
  getFilePickerTypes,
  useTypeaheadUrls,
  getAnchorTop,
  getAnchorBottom,
  getFilePickerValidatorHandler,
  getFontSizeInputDefaultUnit,
  useStatusBar,
  useElementPath,
  promotionEnabled,
  useBranding,
  getResize,
  getPasteAsText,
  getSidebarShow,
  useHelpAccessibility,
  getDefaultFontStack
};
