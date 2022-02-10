/*
 NOTE: This file is partially duplicated in the following locations:
  - models/dom/test/module/table/TableTestUtils.ts
  - plugins/table/test/module/TableTestUtils.ts
 Make sure that if making changes to this file, the other files are updated as well
 */

import { Assertions, StructAssert } from '@ephox/agar';
import { SelectorFind } from '@ephox/sugar';
import { TinyDom } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

const assertTableStructure = (editor: Editor, structure: StructAssert): void => {
  const table = SelectorFind.descendant(TinyDom.body(editor), 'table').getOrDie('A table should exist');
  Assertions.assertStructure('Should be a table the expected structure', structure, table);
};

export {
  assertTableStructure
};
