/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

type FilterFn = string | RegExp | Function;

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const shouldMergeClasses = getSetting<boolean>('importcss_merge_classes');

const shouldImportExclusive = getSetting<boolean>('importcss_exclusive');

const getSelectorConverter = getSetting<(selector: string) => boolean>('importcss_selector_converter');

const getSelectorFilter = getSetting<FilterFn>('importcss_selector_filter');

const getCssGroups = getSetting<{ title: string; filter?: FilterFn }[]>('importcss_groups');

const shouldAppend = getSetting<boolean>('importcss_append');

const getFileFilter = getSetting<FilterFn>('importcss_file_filter');

const getSkin = (editor: Editor) => {
  const skin = editor.getParam('skin');
  return skin !== false ? skin || 'oxide' : false;
};

const getSkinUrl = getSetting<string>('skin_url');

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
