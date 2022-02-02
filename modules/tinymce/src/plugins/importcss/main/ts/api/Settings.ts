/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { StyleFormat } from 'tinymce/core/api/fmt/StyleFormat';

import { UserDefinedGroup } from '../core/ImportCss';

type SelectorConvertor = () => StyleFormat | undefined;
type FileFilter = string | RegExp | ((value: string, imported?: boolean) => boolean) | undefined;
type SelectorFilter = string | RegExp | ((value: string) => boolean) | undefined;

const shouldMergeClasses = (editor: Editor): boolean | undefined =>
  editor.getParam('importcss_merge_classes');

const shouldImportExclusive = (editor: Editor): boolean | undefined =>
  editor.getParam('importcss_exclusive');

const getSelectorConverter = (editor: Editor): SelectorConvertor | undefined =>
  editor.getParam('importcss_selector_converter');

const getSelectorFilter = (editor: Editor): SelectorFilter =>
  editor.getParam('importcss_selector_filter');

const getCssGroups = (editor: Editor): UserDefinedGroup[] | undefined =>
  editor.getParam('importcss_groups');

const shouldAppend = (editor: Editor): boolean | undefined =>
  editor.getParam('importcss_append');

const getFileFilter = (editor: Editor): FileFilter =>
  editor.getParam('importcss_file_filter');

const getSkin = (editor: Editor): string | boolean => {
  const skin = editor.getParam('skin');
  return skin !== false ? skin || 'oxide' : false;
};

const getSkinUrl = (editor: Editor): string | undefined =>
  editor.getParam('skin_url');

export {
  shouldMergeClasses,
  shouldImportExclusive,
  getSelectorConverter,
  getSelectorFilter,
  getCssGroups,
  shouldAppend,
  getFileFilter,
  getSkin,
  getSkinUrl
};
