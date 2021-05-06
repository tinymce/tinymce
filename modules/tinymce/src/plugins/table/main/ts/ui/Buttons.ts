/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu } from '@ephox/bridge';
import { Arr } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { getCellClassList, getTableBorderStyles, getTableBorderWidths, getTableCellBackgroundColors, getTableCellBorderColors, getTableClassList, getToolbar } from '../api/Settings';
import { Clipboard } from '../core/Clipboard';
import { SelectionTargets, LockedDisable } from '../selection/SelectionTargets';
import { onSetupAttributeToggle, onSetupClassToggle } from './ButtonToggleUtils';
import { verticalAlignValues } from './CellAlignValues';
import { applyColorSetup } from './CustomColorSwatch';

const addButtons = (editor: Editor, selectionTargets: SelectionTargets, clipboard: Clipboard) => {
  editor.ui.registry.addMenuButton('table', {
    tooltip: 'Table',
    icon: 'table',
    fetch: (callback) => callback('inserttable | cell row column | advtablesort | tableprops deletetable')
  });

  const cmd = (command) => () => editor.execCommand(command);

  editor.ui.registry.addButton('tableprops', {
    tooltip: 'Table properties',
    onAction: cmd('mceTableProps'),
    icon: 'table',
    onSetup: selectionTargets.onSetupTable
  });

  editor.ui.registry.addButton('tabledelete', {
    tooltip: 'Delete table',
    onAction: cmd('mceTableDelete'),
    icon: 'table-delete-table',
    onSetup: selectionTargets.onSetupTable
  });

  editor.ui.registry.addButton('tablecellprops', {
    tooltip: 'Cell properties',
    onAction: cmd('mceTableCellProps'),
    icon: 'table-cell-properties',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tablemergecells', {
    tooltip: 'Merge cells',
    onAction: cmd('mceTableMergeCells'),
    icon: 'table-merge-cells',
    onSetup: selectionTargets.onSetupMergeable
  });

  editor.ui.registry.addButton('tablesplitcells', {
    tooltip: 'Split cell',
    onAction: cmd('mceTableSplitCells'),
    icon: 'table-split-cells',
    onSetup: selectionTargets.onSetupUnmergeable
  });

  editor.ui.registry.addButton('tableinsertrowbefore', {
    tooltip: 'Insert row before',
    onAction: cmd('mceTableInsertRowBefore'),
    icon: 'table-insert-row-above',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tableinsertrowafter', {
    tooltip: 'Insert row after',
    onAction: cmd('mceTableInsertRowAfter'),
    icon: 'table-insert-row-after',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tabledeleterow', {
    tooltip: 'Delete row',
    onAction: cmd('mceTableDeleteRow'),
    icon: 'table-delete-row',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tablerowprops', {
    tooltip: 'Row properties',
    onAction: cmd('mceTableRowProps'),
    icon: 'table-row-properties',
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tableinsertcolbefore', {
    tooltip: 'Insert column before',
    onAction: cmd('mceTableInsertColBefore'),
    icon: 'table-insert-column-before',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onFirst)
  });

  editor.ui.registry.addButton('tableinsertcolafter', {
    tooltip: 'Insert column after',
    onAction: cmd('mceTableInsertColAfter'),
    icon: 'table-insert-column-after',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onLast)
  });

  editor.ui.registry.addButton('tabledeletecol', {
    tooltip: 'Delete column',
    onAction: cmd('mceTableDeleteCol'),
    icon: 'table-delete-column',
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  editor.ui.registry.addButton('tablecutrow', {
    tooltip: 'Cut row',
    icon: 'cut-row',
    onAction: cmd('mceTableCutRow'),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tablecopyrow', {
    tooltip: 'Copy row',
    icon: 'duplicate-row',
    onAction: cmd('mceTableCopyRow'),
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addButton('tablepasterowbefore', {
    tooltip: 'Paste row before',
    icon: 'paste-row-before',
    onAction: cmd('mceTablePasteRowBefore'),
    onSetup: selectionTargets.onSetupPasteable(clipboard.getRows)
  });

  editor.ui.registry.addButton('tablepasterowafter', {
    tooltip: 'Paste row after',
    icon: 'paste-row-after',
    onAction: cmd('mceTablePasteRowAfter'),
    onSetup: selectionTargets.onSetupPasteable(clipboard.getRows)
  });

  editor.ui.registry.addButton('tablecutcol', {
    tooltip: 'Cut column',
    icon: 'cut-column',
    onAction: cmd('mceTableCutCol'),
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  editor.ui.registry.addButton('tablecopycol', {
    tooltip: 'Copy column',
    icon: 'duplicate-column',
    onAction: cmd('mceTableCopyCol'),
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  editor.ui.registry.addButton('tablepastecolbefore', {
    tooltip: 'Paste column before',
    icon: 'paste-column-before',
    onAction: cmd('mceTablePasteColBefore'),
    onSetup: selectionTargets.onSetupPasteableColumn(clipboard.getColumns, LockedDisable.onFirst)
  });

  editor.ui.registry.addButton('tablepastecolafter', {
    tooltip: 'Paste column after',
    icon: 'paste-column-after',
    onAction: cmd('mceTablePasteColAfter'),
    onSetup: selectionTargets.onSetupPasteableColumn(clipboard.getColumns, LockedDisable.onLast)
  });

  editor.ui.registry.addButton('tableinsertdialog', {
    tooltip: 'Insert table',
    onAction: cmd('mceInsertTable'),
    icon: 'table'
  });

  editor.ui.registry.addMenuButton('rowclipboardactions', {
    icon: 'cut-row',
    tooltip: 'Row clipboard actions',
    fetch: (callback) => {
      callback([
        'tablecutrow',
        'tablecopyrow',
        'tablecopyrow',
        'tablepasterowafter',
      ]);
    }
  });

  editor.ui.registry.addMenuButton('colclipboardactions', {
    icon: 'cut-column',
    tooltip: 'Column clipboard actions',
    fetch: (callback) => {
      callback([
        'tablecutcolumn',
        'tablecopycolumn',
        'tablepastecolumnbefore',
        'tablepastecolumnafter',
      ]);
    }
  });

  const tableClassList = getTableClassList(editor);

  if (tableClassList.length === 0) {
    // eslint-disable-next-line no-console
    console.error('Missing table class list');
  } else {
    editor.ui.registry.addMenuButton('tableclass', {
      icon: 'table-classes',
      tooltip: 'Table styles',
      fetch: (callback) => {
        callback(Arr.map(tableClassList, (value) => {
          const item: Menu.ToggleMenuItemSpec = {
            text: value.title,
            type: 'togglemenuitem',
            onAction: (_api: Menu.MenuItemInstanceApi) => {
              editor.execCommand('mceTableToggleClass', false, value.value);
            },
            onSetup: onSetupClassToggle(editor, 'tableclass', value.value)
          };

          return item;
        }));
      },
      onSetup: selectionTargets.onSetupTable
    });
  }

  const tableCellClassList = getCellClassList(editor);

  if (tableCellClassList.length !== 0) {
    editor.ui.registry.addMenuButton('tablecellclass', {
      icon: 'table-cell-classes',
      tooltip: 'Cell styles',
      fetch: (callback) => {
        callback(Arr.map(tableCellClassList, (value) => {
          const item: Menu.ToggleMenuItemSpec = {
            text: value.title,
            type: 'togglemenuitem',
            onAction: () => {
              editor.execCommand('mceTableCellToggleClass', false, value.value);
            },
            onSetup: onSetupClassToggle(editor, 'tablecellclass', value.value)
          };

          return item;
        }));
      },
      onSetup: selectionTargets.onSetupCellOrRow
    });
  }

  editor.ui.registry.addMenuButton('tablecellvalign', {
    icon: 'vertical-align',
    tooltip: 'Vertical align',
    fetch: (callback) => {
      callback(Arr.map(verticalAlignValues, (item): Menu.ToggleMenuItemSpec => {
        return {
          text: item.text,
          type: 'togglemenuitem',
          onAction: () => {
            editor.execCommand('mceTableApplyCellStyle', false, {
              'vertical-align': item.value
            });
          },
          onSetup: onSetupAttributeToggle(editor, 'tablecellverticalalign', item.name)
        };
      }));
    },
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addToggleButton('tablecaption', {
    tooltip: 'Table caption',
    onAction: () => {
      editor.execCommand('mceTableToggleCaption');
    },
    icon: 'table-caption',
    onSetup: selectionTargets.onSetupTableWithCaption
  });

  const tableCellBackgroundColors = getTableCellBackgroundColors(editor);
  editor.ui.registry.addMenuButton('tablecellbackgroundcolor', {
    icon: 'cell-background-color',
    tooltip: 'Background color',
    fetch: (callback) => {
      callback([
        {
          type: 'fancymenuitem',
          fancytype: 'colorswatch',
          initData: {
            colors: tableCellBackgroundColors.length > 0 ? tableCellBackgroundColors : undefined,
            ignoreCustomColors: true
          },
          onAction: (data) => {
            applyColorSetup(editor, data.value, (value: string) => {
              editor.execCommand('mceTableApplyCellStyle', false, {
                'background-color': value
              });
            });
          }
        }
      ]);
    },
    onSetup: selectionTargets.onSetupCellOrRow
  });

  const tableCellBorderColors = getTableCellBorderColors(editor);
  editor.ui.registry.addMenuButton('tablecellbordercolor', {
    icon: 'cell-border-color',
    tooltip: 'Border color',
    fetch: (callback) => {
      callback([
        {
          type: 'fancymenuitem',
          fancytype: 'colorswatch',
          initData: {
            colors: tableCellBorderColors.length > 0 ? tableCellBorderColors : undefined,
            ignoreCustomColors: true
          },
          onAction: (data) => {
            applyColorSetup(editor, data.value, (value: string) => {
              editor.execCommand('mceTableApplyCellStyle', false, {
                'border-color': value
              });
            });
          }
        }
      ]);
    },
    onSetup: selectionTargets.onSetupCellOrRow
  });

  const tableCellBorderWidthsList = getTableBorderWidths(editor);
  editor.ui.registry.addMenuButton('tablecellborderwidth', {
    icon: 'border-width',
    tooltip: 'Border width',
    fetch: (callback) => {
      callback(Arr.map(tableCellBorderWidthsList, (item): Menu.ToggleMenuItemSpec => {
        return {
          text: item.title,
          type: 'togglemenuitem',
          onAction: () => {
            editor.execCommand('mceTableApplyCellStyle', false, {
              'border-width': item.value
            });
          },
          onSetup: onSetupAttributeToggle(editor, 'tablecellborderwidth', item.value)
        };
      }));
    },
    onSetup: selectionTargets.onSetupCellOrRow
  });

  const tableCellBorderStylesList = getTableBorderStyles(editor);
  editor.ui.registry.addMenuButton('tablecellborderstyle', {
    icon: 'border-style',
    tooltip: 'Border style',
    fetch: (callback) => {
      callback(Arr.map(tableCellBorderStylesList, (item): Menu.ToggleMenuItemSpec => {
        return {
          text: item.title,
          type: 'togglemenuitem',
          onAction: () => {
            editor.execCommand('mceTableApplyCellStyle', false, {
              'border-style': item.value
            });
          },
          onSetup: onSetupAttributeToggle(editor, 'tablecellborderstyle', item.value)
        };
      }));
    },
    onSetup: selectionTargets.onSetupCellOrRow
  });

  editor.ui.registry.addToggleButton('tablecolheader', {
    tooltip: 'Column header',
    icon: 'table-left-header',
    onAction: cmd('mceTableToggleColumnHeader'),
    onSetup: selectionTargets.onSetupTableHeaders(false)
  });

  editor.ui.registry.addToggleButton('tablerowheader', {
    tooltip: 'Row header',
    icon: 'table-top-header',
    onAction: cmd('mceTableToggleRowHeader'),
    onSetup: selectionTargets.onSetupTableHeaders(true)
  });
};

const addToolbars = (editor: Editor) => {
  const isTable = (table: Node) => editor.dom.is(table, 'table') && editor.getBody().contains(table);

  const toolbar = getToolbar(editor);
  if (toolbar.length > 0) {
    editor.ui.registry.addContextToolbar('table', {
      predicate: isTable,
      items: toolbar,
      scope: 'node',
      position: 'node'
    });
  }
};

export {
  addButtons,
  addToolbars
};
