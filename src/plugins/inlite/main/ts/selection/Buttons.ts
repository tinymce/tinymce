import Actions from './Actions';

const setupButtons = (editor) => {
  const formatBlock = function (name: string) {
    return function () {
      Actions.formatBlock(editor, name);
    };
  };

  for (let i = 1; i < 6; i++) {
    const name = 'h' + i;

    editor.ui.registry.addToggleButton(name, {
      type: 'togglebutton',
      text: name.toUpperCase(),
      tooltip: 'Heading ' + i,
      onSetup: (buttonApi) => editor.selection.selectorChangedWithUnbind(name, buttonApi.setActive).unbind,
      onAction: formatBlock(name)
    });
  }
};

export default {
  setupButtons
};

// const addToEditor = function (editor: Editor, panel: InlitePanel) {
//   editor.addButton('quicklink', {
//     icon: 'link',
//     tooltip: 'Insert/Edit link',
//     stateSelector: 'a[href]',
//     onclick () {
//       panel.showForm(editor, 'quicklink');
//     }
//   });
// }