import { Strings } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

const makeTooltipText = (editor: Editor, labelWithPlaceholder: string, value: string): string =>
  Strings.isEmpty(value) ? editor.translate(labelWithPlaceholder) : editor.translate([ labelWithPlaceholder, editor.translate(value) ]);

export {
  makeTooltipText
};
