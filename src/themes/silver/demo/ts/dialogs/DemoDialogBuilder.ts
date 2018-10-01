import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import { setupDemo } from '../components/DemoHelpers';
import { Debugging } from '@ephox/alloy';

const buildDemoDialog = (spec) => {
  const helpers = setupDemo();
  Debugging.registerInspector(spec.title, helpers.uiMothership);
  const winMgr = WindowManager.setup(helpers.extras);
  winMgr.open(spec, {}, () => {});
};

export {
  buildDemoDialog
};