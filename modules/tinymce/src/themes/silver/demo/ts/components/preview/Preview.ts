import { Fun } from '@ephox/katamari';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import { setupDemo } from '../DemoHelpers';

export default () => {
  const helpers = setupDemo();
  const winMgr = WindowManager.setup(helpers.extras);

  // The end user will use this as config
  winMgr.open(
    {
      title: 'Preview',
      size: 'large',
      body: {
        type: 'panel',
        items: [
          {
            name: 'preview',
            type: 'iframe'
          }
        ]
      },
      buttons: [
        {
          type: 'cancel',
          name: 'cancel',
          text: 'Close'
        }
      ],
      initialData: {
        preview: 'Some content '
      },
      onSubmit: (_api) => {
        // eslint-disable-next-line no-console
        console.log('Preview Demo onSubmit');
      },
      onClose: () => {
        // eslint-disable-next-line no-console
        console.log('Preview Demo Close');
      }
    }, {}, Fun.noop);
};
