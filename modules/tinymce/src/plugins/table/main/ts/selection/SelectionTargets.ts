/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional } from '@ephox/katamari';
import { RunOperation, TableLookup } from '@ephox/snooker';
import { SelectorExists, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';
import { SelectionTargets as ModelSelectionTargets } from 'tinymce/models/dom/table/main/ts/selection/SelectionTargets';

import * as Util from '../core/Util';

type UiApi = Menu.MenuItemInstanceApi | Toolbar.ToolbarButtonInstanceApi;
type UiToggleApi = Menu.ToggleMenuItemInstanceApi | Toolbar.ToolbarToggleButtonInstanceApi;

/*
onAny - disable if any column in the selection is locked
onFirst - disable if the first column in the table is selected and is locked
onLast - disable if the the last column in the table is selected and is locked
*/
export const enum LockedDisable {
  onAny = 'onAny',
  onFirst = 'onFirst',
  onLast = 'onLast'
}
type LockedDisableStrs = keyof typeof LockedDisable;

export interface SelectionTargets {
  readonly onSetupTable: (api: UiApi) => () => void;
  readonly onSetupCellOrRow: (api: UiApi) => () => void;
  readonly onSetupColumn: (lockedDisable: LockedDisable) => (api: UiApi) => () => void;
  readonly onSetupPasteable: (getClipboardData: () => Optional<SugarElement[]>) => (api: UiApi) => () => void;
  readonly onSetupPasteableColumn: (getClipboardData: () => Optional<SugarElement[]>, lockedDisable: LockedDisable) => (api: UiApi) => () => void;
  readonly onSetupMergeable: (api: UiApi) => () => void;
  readonly onSetupUnmergeable: (api: UiApi) => () => void;
  readonly onSetupTableWithCaption: (api: UiToggleApi) => () => void;
  readonly onSetupTableRowHeaders: (api: UiToggleApi) => () => void;
  readonly onSetupTableColumnHeaders: (api: UiToggleApi) => () => void;
  readonly resetTargets: () => void;
  readonly targets: () => Optional<RunOperation.CombinedTargets>;
}

interface ExtractedSelectionDetails {
  readonly mergeable: boolean;
  readonly unmergeable: boolean;
  readonly locked: Record<LockedDisableStrs, boolean>;
}

export const getSelectionTargets = (editor: Editor, modelSelectionTargets: ModelSelectionTargets): SelectionTargets => {
  const selectionDetails = modelSelectionTargets.selectionDetails;

  const isCaption = SugarNode.isTag('caption');
  const isDisabledForSelection = (key: keyof ExtractedSelectionDetails) => selectionDetails().forall((details) => !details[key]);

  const onSetup = modelSelectionTargets.onSetup;
  const onSetupWithToggle = modelSelectionTargets.onSetupWithToggle;

  const isDisabledFromLocked = (lockedDisable: LockedDisable) =>
    selectionDetails().exists((details) => details.locked[lockedDisable]);

  const onSetupTable = (api: UiApi) => onSetup(api, (_) => false);
  const onSetupCellOrRow = (api: UiApi) => onSetup(api, (targets) => isCaption(targets.element));
  const onSetupColumn = (lockedDisable: LockedDisable) => (api: UiApi) => onSetup(api, (targets) => isCaption(targets.element) || isDisabledFromLocked(lockedDisable));
  const onSetupPasteable = (getClipboardData: () => Optional<SugarElement[]>) => (api: UiApi) =>
    onSetup(api, (targets) => isCaption(targets.element) || getClipboardData().isNone());
  const onSetupPasteableColumn = (getClipboardData: () => Optional<SugarElement[]>, lockedDisable: LockedDisable) => (api: UiApi) =>
    onSetup(api, (targets) => isCaption(targets.element) || getClipboardData().isNone() || isDisabledFromLocked(lockedDisable));
  const onSetupMergeable = (api: UiApi) => onSetup(api, (_targets) => isDisabledForSelection('mergeable'));
  const onSetupUnmergeable = (api: UiApi) => onSetup(api, (_targets) => isDisabledForSelection('unmergeable'));

  const onSetupTableWithCaption = (api: UiToggleApi) => {
    return onSetupWithToggle(api, Fun.never, (targets) => {
      const tableOpt = TableLookup.table(targets.element, Util.getIsRoot(editor));
      return tableOpt.exists((table) => SelectorExists.child(table, 'caption'));
    });
  };

  const onSetupTableHeaders = (command: string, headerType: 'header' | 'th') =>
    (api: UiToggleApi): () => void => {
      return onSetupWithToggle(api,
        (targets) => isCaption(targets.element),
        () => editor.queryCommandValue(command) === headerType
      );
    };

  const onSetupTableRowHeaders = onSetupTableHeaders('mceTableRowType', 'header');

  const onSetupTableColumnHeaders = onSetupTableHeaders('mceTableColType', 'th');

  return {
    onSetupTable,
    onSetupCellOrRow,
    onSetupColumn,
    onSetupPasteable,
    onSetupPasteableColumn,
    onSetupMergeable,
    onSetupUnmergeable,
    onSetupTableWithCaption,
    onSetupTableRowHeaders,
    onSetupTableColumnHeaders,
    resetTargets: modelSelectionTargets.resetTargets,
    targets: modelSelectionTargets.targets
  };
};
