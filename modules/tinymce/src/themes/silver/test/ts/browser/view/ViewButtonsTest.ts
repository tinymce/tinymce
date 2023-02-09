import { TestStore } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.view.ViewButtonsTest', () => {
  context('Iframe mode', () => {
    const store = TestStore();
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar_mode: 'floating',
      toolbar: Arr.range(10, Fun.constant('bold | italic ')).join(''),
      width: 500,
      setup: (editor: Editor) => {
        editor.ui.registry.addView('myview1', {
          buttons: [
            {
              type: 'group',
              buttons: [
                {
                  name: 'initAtNormal',
                  type: 'togglableIconButton',
                  text: 'init-at-normal',
                  icon: 'fullscreen',
                  onAction: (_statusApi) => {
                    // store.add(`myview1:init-at-normal-with-${statusApi.getStatus()}`);
                    // const newStatus = statusApi.getStatus() === 'normal' ? 'toggled' : 'normal';
                    // statusApi.setStatus(newStatus);
                  }
                },
                {
                  name: 'initAtToggled',
                  type: 'togglableIconButton',
                  text: 'init-at-toggled',
                  icon: 'help',
                  onAction: (_statusApi) => {
                    // store.add(`myview1:init-at-toggled-with-${statusApi.getStatus()}`);
                    // const newStatus = statusApi.getStatus() === 'normal' ? 'toggled' : 'normal';
                    // statusApi.setStatus(newStatus);
                  }
                }
              ]
            },
            {
              name: 'initAtToggledNotChangable',
              type: 'togglableIconButton',
              text: 'init-at-toggled-not-changable',
              icon: 'help',
              onAction: (_statusApi) => {
                // store.add(`myview1:init-at-toggled-not-changable-with-${statusApi.getStatus()}`);
              }
            }
          ],
          onShow: (api: any) => {
            api.getContainer().innerHTML = '<button>myview1</button>';
            api.getContainer().querySelector('button')?.focus();
          },
          onHide: store.adder('myview1:hide')
        });

        editor.ui.registry.addContextToolbar('test-context', {
          predicate: (node) => node.nodeName.toLowerCase() === 'img',
          items: 'bold'
        });
      }
    }, []);

    const toggleView = (name: string) => {
      const editor = hook.editor();
      editor.execCommand('ToggleView', false, name);
    };

    const clickViewButton = (editor: Editor, tooltip: string) => TinyUiActions.clickOnUi(editor, `.tox-view button[title='${tooltip}']`);

    // TODO: enable it befor merge
    it.skip('TINY-9523: tooglable button api give the current status and alow user to change it', () => {
      const editor = hook.editor();

      store.clear();

      toggleView('myview1');
      clickViewButton(editor, 'init-at-normal');
      clickViewButton(editor, 'init-at-normal');

      clickViewButton(editor, 'init-at-toggled');
      clickViewButton(editor, 'init-at-toggled');

      clickViewButton(editor, 'init-at-toggled-not-changable');
      clickViewButton(editor, 'init-at-toggled-not-changable');

      store.assertEq('Should trigger fullscreen', [
        'myview1:init-at-normal-with-normal',
        'myview1:init-at-normal-with-toggled',
        'myview1:init-at-toggled-with-toggled',
        'myview1:init-at-toggled-with-normal',
        'myview1:init-at-toggled-not-changable-with-toggled',
        'myview1:init-at-toggled-not-changable-with-toggled'
      ]);
    });
  });
});