import { Arr } from '@ephox/katamari';
import { SugarElement, Width } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

import { UserListItem, UserListValue } from '../ui/UiUtils';

const defaultTableToolbar = 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol';

const defaultCellBorderWidths = Arr.range(5, (i) => {
  const size = `${i + 1}px`;
  return { title: size, value: size };
});

const defaultCellBorderStyles = Arr.map([ 'Solid', 'Dotted', 'Dashed', 'Double', 'Groove', 'Ridge', 'Inset', 'Outset', 'None', 'Hidden' ], (type) => {
  return { title: type, value: type.toLowerCase() };
});

// Note: This is also contained in the core Options.ts file
const defaultWidth = '100%';

const getPixelForcedWidth = (editor: Editor) => {
  // Determine the inner size of the parent block element where the table will be inserted
  const dom = editor.dom;
  const parentBlock = dom.getParent<HTMLElement>(editor.selection.getStart(), dom.isBlock) ?? editor.getBody();
  return Width.getInner(SugarElement.fromDom(parentBlock)) + 'px';
};

// Note: This is also contained in the core Options.ts file
const determineDefaultStyles = (editor: Editor, defaultStyles: Record<string, string>): Record<string, string> => {
  if (isResponsiveForced(editor) || !shouldStyleWithCss(editor)) {
    return defaultStyles;
  } else if (isPixelsForced(editor)) {
    return { ...defaultStyles, width: getPixelForcedWidth(editor) };
  } else {
    return { ...defaultStyles, width: defaultWidth };
  }
};

// Note: This is also contained in the core Options.ts file
const determineDefaultAttributes = (editor: Editor, defaultAttributes: Record<string, string>): Record<string, string> => {
  if (isResponsiveForced(editor) || shouldStyleWithCss(editor)) {
    return defaultAttributes;
  } else if (isPixelsForced(editor)) {
    return { ...defaultAttributes, width: getPixelForcedWidth(editor) };
  } else {
    return { ...defaultAttributes, width: defaultWidth };
  }
};

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('table_border_widths', {
    processor: 'object[]',
    default: defaultCellBorderWidths
  });

  registerOption('table_border_styles', {
    processor: 'object[]',
    default: defaultCellBorderStyles
  });

  registerOption('table_cell_advtab', {
    processor: 'boolean',
    default: true
  });

  registerOption('table_row_advtab', {
    processor: 'boolean',
    default: true
  });

  registerOption('table_advtab', {
    processor: 'boolean',
    default: true
  });

  registerOption('table_appearance_options', {
    processor: 'boolean',
    default: true
  });

  registerOption('table_grid', {
    processor: 'boolean',
    // Table grid relies on hover, which isn't available on touch devices so use the dialog instead
    default: !Env.deviceType.isTouch()
  });

  registerOption('table_cell_class_list', {
    processor: 'object[]',
    default: []
  });

  registerOption('table_row_class_list', {
    processor: 'object[]',
    default: []
  });

  registerOption('table_class_list', {
    processor: 'object[]',
    default: []
  });

  registerOption('table_toolbar', {
    processor: 'string',
    default: defaultTableToolbar
  });

  registerOption('table_background_color_map', {
    processor: 'object[]',
    default: []
  });

  registerOption('table_border_color_map', {
    processor: 'object[]',
    default: []
  });
};

const getTableSizingMode = option('table_sizing_mode');
const getTableBorderWidths = option<UserListItem[]>('table_border_widths');
const getTableBorderStyles = option<UserListValue[]>('table_border_styles');
const hasAdvancedCellTab = option<boolean>('table_cell_advtab');
const hasAdvancedRowTab = option<boolean>('table_row_advtab');
const hasAdvancedTableTab = option<boolean>('table_advtab');
const hasAppearanceOptions = option<boolean>('table_appearance_options');
const hasTableGrid = option<boolean>('table_grid');
const shouldStyleWithCss = option<boolean>('table_style_by_css');
const getCellClassList = option<UserListItem[]>('table_cell_class_list');
const getRowClassList = option<UserListItem[]>('table_row_class_list');
const getTableClassList = option<UserListItem[]>('table_class_list');
const getToolbar = option<string>('table_toolbar');
const getTableBackgroundColorMap = option<UserListValue[]>('table_background_color_map');
const getTableBorderColorMap = option<UserListValue[]>('table_border_color_map');

const isPixelsForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'fixed';

const isResponsiveForced = (editor: Editor): boolean =>
  getTableSizingMode(editor) === 'responsive';

const getDefaultStyles = (editor: Editor): Record<string, string> => {
  // Note: The we don't rely on the default here as we need to dynamically lookup the widths based on the current editor state
  const options = editor.options;
  const defaultStyles = options.get('table_default_styles');
  return options.isSet('table_default_styles') ? defaultStyles : determineDefaultStyles(editor, defaultStyles);
};

const getDefaultAttributes = (editor: Editor): Record<string, string> => {
  // Note: The we don't rely on the default here as we need to dynamically lookup the widths based on the current editor state
  const options = editor.options;
  const defaultAttributes = options.get('table_default_attributes');
  return options.isSet('table_default_attributes') ? defaultAttributes : determineDefaultAttributes(editor, defaultAttributes);
};

export {
  register,
  getDefaultAttributes,
  getDefaultStyles,
  hasAdvancedCellTab,
  hasAdvancedRowTab,
  hasAdvancedTableTab,
  hasAppearanceOptions,
  hasTableGrid,
  shouldStyleWithCss,
  getCellClassList,
  getRowClassList,
  getTableClassList,
  getToolbar,
  getTableBorderWidths,
  getTableBorderStyles,
  getTableBackgroundColorMap,
  getTableBorderColorMap
};
