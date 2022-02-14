/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

/*
 NOTE: This file is partially duplicated in the following locations:
  - models/dom/table/core/TableUtils.ts
  - plugins/table/core/Utils.ts
  - advtable
 Make sure that if making changes to this file, the other files are updated as well
 */

import { Compare, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';

const getBody = (editor: Editor): SugarElement<HTMLElement> =>
  SugarElement.fromDom(editor.getBody());

const getIsRoot = (editor: Editor) => (element: SugarElement<Node>): boolean =>
  Compare.eq(element, getBody(editor));

export {
  getBody,
  getIsRoot
};
