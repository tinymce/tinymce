/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections } from '@ephox/darwin';

import { ResizeHandler } from '../actions/ResizeHandler';
import { Clipboard as FakeClipboard } from '../core/Clipboard';
import { CellSelectionApi } from '../selection/CellSelection';
import { SelectionTargets } from '../selection/SelectionTargets';

export interface Api {
  readonly fakeClipboard: FakeClipboard;
  readonly resizeHandler: ResizeHandler;
  readonly selectionTargets: SelectionTargets;
  readonly selections: Selections;
  readonly cellSelection: CellSelectionApi;
}

const getApi = (clipboard: FakeClipboard, resizeHandler: ResizeHandler, selectionTargets: SelectionTargets, selections: Selections, cellSelection: CellSelectionApi): Api => ({
  fakeClipboard: clipboard,
  resizeHandler,
  selectionTargets,
  selections,
  cellSelection
});

export { getApi };

