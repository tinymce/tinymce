import * as Registry from '../../../main/ts/ephox/bridge/api/Registry';

const editorButtons = Registry.create();

// This would be exposed as a public api in tinymce as something like editor.ui or similar
const getDemoRegistry = () => editorButtons;

export {
  getDemoRegistry
};
