/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional } from '@ephox/katamari';
import { Attribute, Compare, SugarElement, SugarNode, TransformFind } from '@ephox/sugar';

import Editor from '../api/Editor';
import { ContentLanguage } from '../api/SettingsTypes';
import { bindRange } from '../selection/RangeMap';

export const getContentLanguage = (editor: Editor): ContentLanguage | null => bindRange(editor, (elm) => {
  const root = SugarElement.fromDom(editor.getBody());
  return TransformFind.closest(elm, (node) => {
    if (!SugarNode.isElement(node)) {
      return Optional.none();
    }

    const codeOpt = Attribute.getOpt(node, 'lang');
    const customCode = Attribute.getOpt(node, 'data-mce-lang').getOrUndefined();
    // The actual language title doesn't matter, because all we're going to do
    // is pass this to normalise (which ignores the title)
    const title = '';

    return codeOpt.map((code): ContentLanguage => ({ code, customCode, title }));
  }, Fun.curry(Compare.eq, root));
})
  .getOrNull();

export const contentLanguageAction = (editor: Editor, lang: ContentLanguage): void => {
  editor.formatter.toggle('lang', {
    value: lang.code,
    customValue: lang.customCode
  });
  editor.nodeChanged();
};
