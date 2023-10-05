import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';

const getTooltipText = (editor: Editor, prefix: string, value: string): string =>
  editor.translate([ `${prefix} {0}`, editor.translate(value) ]);

const setTooltipText = (buttonApi: Menu.NestedMenuItemInstanceApi, editor: Editor, prefix: string, value: string): void =>
  buttonApi.setTooltip(getTooltipText(editor, prefix, value));

export {
  getTooltipText,
  setTooltipText
};
