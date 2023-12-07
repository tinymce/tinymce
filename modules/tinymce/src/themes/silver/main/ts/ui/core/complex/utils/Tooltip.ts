import Editor from 'tinymce/core/api/Editor';

import { BespokeSelectTooltip } from '../BespokeSelect';

const makeConcatenatedTooltip = (editor: Editor, label: string, value: string) =>
  editor.translate(`${label} ${value}`);

const makePlaceholderTooltip = (editor: Editor, labelWithPlaceholder: string, value: string) =>
  editor.translate([ labelWithPlaceholder, editor.translate(value) ]);

const makeTooltip = (editor: Editor, { tooltip, hasPlaceholder }: BespokeSelectTooltip, value: string): string =>
  (hasPlaceholder ? makePlaceholderTooltip : makeConcatenatedTooltip)(editor, tooltip, value);

export {
  makeTooltip
};
