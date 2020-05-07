/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import * as NodeType from './NodeType';

export const isCustomList = (list: HTMLElement) => /\btox\-/.test(list.className);

export const listState = (editor: Editor, listName: string, activate: (active: boolean) => void) =>
  () => {
    const nodeChangeHandler = (e) => {
      const tableCellIndex = Arr.findIndex(e.parents, NodeType.isTableCellNode);
      const parents = tableCellIndex.map((idx) => e.parents.slice(0, idx)).getOr(e.parents);
      const lists = Tools.grep(parents, NodeType.isListNode);
      activate(lists.length > 0 && lists[0].nodeName === listName && !isCustomList(lists[0]));
    };

    editor.on('NodeChange', nodeChangeHandler);

    return () => editor.off('NodeChange', nodeChangeHandler);
  };
