import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';
import KeyboardShortcutsTab from 'tinymce/plugins/help/ui/KeyboardShortcutsTab';
import VersionTab from 'tinymce/plugins/help/ui/VersionTab';
import PluginsTab from 'tinymce/plugins/help/ui/PluginsTab';

import { setupDemo } from '../components/DemoHelpers';
import { Fun } from '@ephox/katamari';

declare let tinymce: any;

export default () => {
  const helpers = setupDemo();
  const winMgr = WindowManager.setup(helpers.extras);

  tinymce.init(
    {
      selector: 'textarea.tiny-text',
      theme: 'silver',
      plugins: [
        'advlist'
      ]
    }
  ).then(function (editors) {
    const editor = editors[0];
    winMgr.open(
      {
        title: 'Help',
        size: 'large',
        body: {
          type: 'tabpanel',
          // tabs: take objects with a title and item array
          tabs: [
            // E.G.
            // {
            //   title: 'Title shown',
            //   items: [
            //     {
            //       type: 'htmlpanel',
            //       html: '<p>Html paragraph</p>'
            //     }
            //   ]
            // },
            KeyboardShortcutsTab.tab(),
            PluginsTab.tab(editor),
            VersionTab.tab()
          ]
        },
        buttons: [
          {
            type: 'cancel',
            name: 'cancel',
            text: 'Cancel'
          },
          {
            type: 'submit',
            name: 'save',
            text: 'Save',
            primary: true
          }
        ],
        initialData: {},
        onSubmit: (api) => {
          api.close();
        }
      }, {}, Fun.noop);
  });

  // The end user will use this as config

};
