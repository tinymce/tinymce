import { Arr, Obj, Optional, Optionals } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';

const setup = (editor: Editor): void => {
  const { sidebars } = editor.ui.registry.getAll();

  // Setup each registered sidebar
  Arr.each(Obj.keys(sidebars), (name) => {
    const spec = sidebars[name];
    const isActive = () => Optionals.is(Optional.from(editor.queryCommandValue('ToggleSidebar')), name);
    editor.ui.registry.addToggleButton(name, {
      icon: spec.icon,
      tooltip: spec.tooltip,
      onAction: (buttonApi) => {
        editor.execCommand('ToggleSidebar', false, name);
        buttonApi.setActive(isActive());
      },
      onSetup: (buttonApi) => {
        buttonApi.setActive(isActive());
        const handleToggle = () => buttonApi.setActive(isActive());
        editor.on('ToggleSidebar', handleToggle);
        return () => {
          editor.off('ToggleSidebar', handleToggle);
        };
      },
      context: 'any'
    });
  });
};

export {
  setup
};
