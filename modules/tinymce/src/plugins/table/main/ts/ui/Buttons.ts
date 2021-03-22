import { Dialog, Menu } from '@ephox/bridge';
import { Arr, Fun, Optional, Singleton } from '@ephox/katamari';
/* eslint-disable no-console */
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from 'tinymce/core/api/ui/Ui';
import { getCellClassList, getTableBorderStyles, getTableBorderWidths, getTableCellBackgroundColors, getTableCellBorderColors, getTableClassList, getToolbar } from '../api/Settings';
import { Clipboard } from '../core/Clipboard';
import { SelectionTargets, LockedDisable } from '../selection/SelectionTargets';

type ColorInputCallback = (valueOpt: Optional<string>) => void;

interface ColorSwatchDialogData {
  colorpicker: string;
}

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

  const tableClassList = getTableClassList(editor);

  if (tableClassList.length === 0) {
    console.error('Missing table class list');
  } else {
    editor.ui.registry.addMenuButton('tableclass', {
      text: 'Class List',
      icon: 'table-class-list',
      fetch: (callback) => {
        callback(Arr.map(tableClassList, (value) => {
          const item: Menu.ToggleMenuItemSpec = {
            text: value.title,
            type: 'togglemenuitem',
            onAction: (_api: Menu.MenuItemInstanceApi) => {
              editor.execCommand('mceTableToggleClass', false, value.value);
            },
            onSetup: onSetupToggle(editor, 'tableclass', value.value)
          };

          return item;
        }));
      }
    });
  }

  const tableCellClassList = getCellClassList(editor);

  if (tableCellClassList.length !== 0) {
    editor.ui.registry.addMenuButton('tablecellclass', {
      text: 'Cell Class List',
      icon: 'table-cell-class-list',
      fetch: (callback) => {
        callback(Arr.map(tableCellClassList, (value) => {
          const item: Menu.ToggleMenuItemSpec = {
            text: value.title,
            type: 'togglemenuitem',
            onAction: (_api: Menu.MenuItemInstanceApi) => {
              editor.execCommand('mceTableCellToggleClass', false, value.value);
            },
            onSetup: onSetupToggle(editor, 'tablecellclass', value.value)
          };

          return item;
        }));
      }
    });
  }

  const alignTableButtons = [
    {
      name: 'tablecellvaligntop',
      text: 'Align Top',
      cmd: 'top',
      icon: 'align-cell-top'
    },
    {
      name: 'tablecellvaligncenter',
      text: 'Align Center',
      cmd: 'center',
      icon: 'align-cell-center'
    },
    {
      name: 'tablecellvalignbottom',
      text: 'Align Bottom',
      cmd: 'bottom',
      icon: 'align-cell-bottom'
    },
  ];

  editor.ui.registry.addMenuButton('tablecellvalign', {
    icon: 'table-cell-valign',
    fetch: (callback) => {
      callback(Arr.map(alignTableButtons, (item): Menu.ToggleMenuItemSpec => {
        return {
          text: item.text,
          type: 'togglemenuitem',
          onAction: () => {
            editor.execCommand('mceTableApplyCellStyle', false, {
              'vertical-align': item.cmd
            });
          },
          icon: item.icon,
          onSetup: onSetupToggle(editor, 'tablecellverticalalign', item.name)
        };
      }));
    }
  });

  editor.ui.registry.addButton('tablecaption', {
    tooltip: 'Toggle Table Caption',
    onAction: () => {
      editor.execCommand('mceTableToggleCaption', false, true);
    },
    icon: 'table-caption-toggle'
  });

  const tableCellBackgroundColors = getTableCellBackgroundColors(editor);
  editor.ui.registry.addMenuButton('tablecellbackgroundcolor', {
    icon: 'table-cell-background-color',
    tooltip: 'Table Cell Background Color',
    fetch: (callback) => {
      callback([
        {
          type: 'fancymenuitem',
          fancytype: 'colorswatch',
          initData: {
            colorselection: tableCellBackgroundColors.length > 0 ? tableCellBackgroundColors : undefined
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
    }
  });

  const tableCellBorderColors = getTableCellBorderColors(editor);
  editor.ui.registry.addMenuButton('tablecellbordercolor', {
    icon: 'table-cell-border-color',
    tooltip: 'Table Cell Border Color',
    fetch: (callback) => {
      callback([
        {
          type: 'fancymenuitem',
          fancytype: 'colorswatch',
          initData: {
            colorselection: tableCellBorderColors.length > 0 ? tableCellBorderColors : undefined
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
    }
  });

  const tableCellBorderWidthsList = getTableBorderWidths(editor);
  editor.ui.registry.addMenuButton('tablecellborderwidth', {
    icon: 'border-width',
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
          onSetup: onSetupToggle(editor, 'tablecellborderwidth', item.value)
        };
      }));
    }
  });

  const tableCellBorderStylesList = getTableBorderStyles(editor);
  editor.ui.registry.addMenuButton('tablecellborderstyle', {
    icon: 'border-style',
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
          onSetup: onSetupToggle(editor, 'tablecellborderstyle', item.value)
        };
      }));
    }
  });

  editor.ui.registry.addButton('tablecolumnheader', {
    tooltip: 'Table Column Header',
    icon: 'table-top-header',
    onAction: cmd('mceTableToggleColumnHeader'),
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  editor.ui.registry.addButton('tablerowheader', {
    tooltip: 'Table Row Header',
    icon: 'table-left-header',
    onAction: cmd('mceTableToggleRowHeader'),
    onSetup: selectionTargets.onSetupColumn(LockedDisable.onAny)
  });

  editor.ui.registry.addButton('tablecolprops', {
    tooltip: 'Column properties',
    icon: 'table-column-properties',
    onAction: cmd('mceTableColumnProps'),
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

const onSetupToggle = (editor: Editor, styleName: string, styleValue: string) => {
  return (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
    const boundCallback = Singleton.unbindable();

    const init = () => {
      const value = {
        value: styleValue
      };

      api.setActive(editor.formatter.match(styleName, value));
      const binding = editor.formatter.formatChanged(styleName, api.setActive);
      boundCallback.set(binding);
    };

    // The editor may or may not have been setup yet, so check for that
    editor.initialized ? init() : editor.on('init', init);

    return boundCallback.clear;
  };
};

const applyColorSetup = (editor: Editor, value: string, setColor: (colorValue: string) => void) => {
  if (value === 'custom') {
    const dialog = colorPickerDialog(editor);
    dialog((colorOpt) => {
      colorOpt.each(setColor);
    }, '#000000');
  } else if (value === 'remove') {
    setColor('');
  } else {
    setColor(value);
  }
};

const colorPickerDialog = (editor: Editor) => (callback: ColorInputCallback, value: string) => {
  let isValid = false;

  const onSubmit = (api: Dialog.DialogInstanceApi<ColorSwatchDialogData>) => {
    const data = api.getData();
    const hex = data.colorpicker;
    if (isValid) {
      callback(Optional.from(hex));
      api.close();
    } else {
      editor.windowManager.alert(editor.translate([ 'Invalid hex color code: {0}', hex ]));
    }
  };

  const onAction = (_api: Dialog.DialogInstanceApi<ColorSwatchDialogData>, details) => {
    if (details.name === 'hex-valid') {
      isValid = details.value;
    }
  };

  const initialData: ColorSwatchDialogData = {
    colorpicker: value
  };

  editor.windowManager.open({
    title: 'Color Picker',
    size: 'normal',
    body: {
      type: 'panel',
      items: [
        {
          type: 'colorpicker',
          name: 'colorpicker',
          label: 'Color'
        }
      ]
    },
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    initialData,
    onAction,
    onSubmit,
    onClose: Fun.noop,
    onCancel: () => {
      callback(Optional.none());
    }
  });
};