import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import { onActionExecCommand, onSetupEditableToggle, onSetupStateToggle } from './ControlUtils';

const onActionToggleFormat = (editor: Editor, fmt: string) => (): void => {
  editor.execCommand('mceToggleFormat', false, fmt);
};

const registerFormatButtons = (editor: Editor): void => {
  Tools.each([
    { name: 'bold', text: 'Bold', icon: 'bold' },
    { name: 'italic', text: 'Italic', icon: 'italic' },
    { name: 'underline', text: 'Underline', icon: 'underline' },
    { name: 'strikethrough', text: 'Strikethrough', icon: 'strike-through' },
    { name: 'subscript', text: 'Subscript', icon: 'subscript' },
    { name: 'superscript', text: 'Superscript', icon: 'superscript' }
  ], (btn, _idx) => {
    editor.ui.registry.addToggleButton(btn.name, {
      tooltip: btn.text,
      icon: btn.icon,
      onSetup: onSetupStateToggle(editor, btn.name),
      onAction: onActionToggleFormat(editor, btn.name)
    });
  });

  for (let i = 1; i <= 6; i++) {
    const name = 'h' + i;
    editor.ui.registry.addToggleButton(name, {
      text: name.toUpperCase(),
      tooltip: 'Heading ' + i,
      onSetup: onSetupStateToggle(editor, name),
      onAction: onActionToggleFormat(editor, name)
    });
  }
};

const registerCommandButtons = (editor: Editor): void => {
  Tools.each([
    { name: 'copy', text: 'Copy', action: 'Copy', icon: 'copy' },
    { name: 'help', text: 'Help', action: 'mceHelp', icon: 'help' },
    { name: 'selectall', text: 'Select all', action: 'SelectAll', icon: 'select-all' },
    { name: 'newdocument', text: 'New document', action: 'mceNewDocument', icon: 'new-document' },
    { name: 'print', text: 'Print', action: 'mcePrint', icon: 'print' },
  ], (btn) => {
    editor.ui.registry.addButton(btn.name, {
      tooltip: btn.text,
      icon: btn.icon,
      onAction: onActionExecCommand(editor, btn.action)
    });
  });

  Tools.each([
    { name: 'cut', text: 'Cut', action: 'Cut', icon: 'cut' },
    { name: 'paste', text: 'Paste', action: 'Paste', icon: 'paste' },
    // visualaid was here but also exists in VisualAid.ts?
    { name: 'removeformat', text: 'Clear formatting', action: 'RemoveFormat', icon: 'remove-formatting' },
    { name: 'remove', text: 'Remove', action: 'Delete', icon: 'remove' },
    { name: 'hr', text: 'Horizontal line', action: 'InsertHorizontalRule', icon: 'horizontal-rule' }
  ], (btn) => {
    editor.ui.registry.addButton(btn.name, {
      tooltip: btn.text,
      icon: btn.icon,
      onSetup: onSetupEditableToggle(editor),
      onAction: onActionExecCommand(editor, btn.action)
    });
  });
};

const registerCommandToggleButtons = (editor: Editor): void => {
  Tools.each([
    { name: 'blockquote', text: 'Blockquote', action: 'mceBlockQuote', icon: 'quote' }
  ], (btn) => {
    editor.ui.registry.addToggleButton(btn.name, {
      tooltip: btn.text,
      icon: btn.icon,
      onAction: onActionExecCommand(editor, btn.action),
      onSetup: onSetupStateToggle(editor, btn.name)
    });
  });
};

const registerButtons = (editor: Editor): void => {
  registerFormatButtons(editor);
  registerCommandButtons(editor);
  registerCommandToggleButtons(editor);
};

const registerMenuItems = (editor: Editor): void => {
  Tools.each([
    { name: 'newdocument', text: 'New document', action: 'mceNewDocument', icon: 'new-document' },
    { name: 'copy', text: 'Copy', action: 'Copy', icon: 'copy', shortcut: 'Meta+C' },
    { name: 'selectall', text: 'Select all', action: 'SelectAll', icon: 'select-all', shortcut: 'Meta+A' },
    { name: 'print', text: 'Print...', action: 'mcePrint', icon: 'print', shortcut: 'Meta+P' }
  ], (menuitem) => {
    editor.ui.registry.addMenuItem(menuitem.name, {
      text: menuitem.text,
      icon: menuitem.icon,
      shortcut: menuitem.shortcut,
      onAction: onActionExecCommand(editor, menuitem.action)
    });
  });

  Tools.each([
    { name: 'bold', text: 'Bold', action: 'Bold', icon: 'bold', shortcut: 'Meta+B' },
    { name: 'italic', text: 'Italic', action: 'Italic', icon: 'italic', shortcut: 'Meta+I' },
    { name: 'underline', text: 'Underline', action: 'Underline', icon: 'underline', shortcut: 'Meta+U' },
    { name: 'strikethrough', text: 'Strikethrough', action: 'Strikethrough', icon: 'strike-through' },
    { name: 'subscript', text: 'Subscript', action: 'Subscript', icon: 'subscript' },
    { name: 'superscript', text: 'Superscript', action: 'Superscript', icon: 'superscript' },
    { name: 'removeformat', text: 'Clear formatting', action: 'RemoveFormat', icon: 'remove-formatting' },
    { name: 'cut', text: 'Cut', action: 'Cut', icon: 'cut', shortcut: 'Meta+X' },
    { name: 'paste', text: 'Paste', action: 'Paste', icon: 'paste', shortcut: 'Meta+V' },
    { name: 'hr', text: 'Horizontal line', action: 'InsertHorizontalRule', icon: 'horizontal-rule' }
  ], (menuitem) => {
    editor.ui.registry.addMenuItem(menuitem.name, {
      text: menuitem.text,
      icon: menuitem.icon,
      shortcut: menuitem.shortcut,
      onSetup: onSetupEditableToggle(editor),
      onAction: onActionExecCommand(editor, menuitem.action)
    });
  });

  editor.ui.registry.addMenuItem('codeformat', {
    text: 'Code',
    icon: 'sourcecode',
    onSetup: onSetupEditableToggle(editor),
    onAction: onActionToggleFormat(editor, 'code')
  });
};

const register = (editor: Editor): void => {
  registerButtons(editor);
  registerMenuItems(editor);
};

export {
  register
};
