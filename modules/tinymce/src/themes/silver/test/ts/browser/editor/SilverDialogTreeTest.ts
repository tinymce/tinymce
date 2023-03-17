import { FocusTools, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.DialogTreeTest', () => {

  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'tree',
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addButton('tree', {
        text: 'Tree',
        onAction: () => {
          ed.windowManager.open({
            title: 'Tree',
            buttons: [
              {
                type: 'cancel',
                text: 'Cancel',
              }
            ],
            body: {
              type: 'panel',
              items: [{
                type: 'tree',
                onLeafAction: Fun.noop,
                items: [
                  {
                    type: 'directory',
                    id: 'dir',
                    title: 'Dir',
                    menu: {
                      icon: 'image-options',
                      type: 'menubutton',
                      fetch: (success) => success([
                        {
                          type: 'menuitem',
                          text: 'menuitem',
                          onAction: Fun.noop
                        }
                      ])
                    },
                    children: [
                      {
                        type: 'leaf',
                        title: 'File 3',
                        id: '3',
                      },
                      {
                        type: 'leaf',
                        title: 'File 4',
                        id: '4',
                        menu: {
                          icon: 'image-options',
                          type: 'menubutton',
                          fetch: (success) => success([
                            {
                              type: 'menuitem',
                              text: 'menuitem',
                              onAction: Fun.noop
                            }
                          ])
                        }
                      },
                    ]
                  },
                  {
                    type: 'leaf',
                    title: 'File 5',
                    id: '5',
                  },
                  {
                    type: 'leaf',
                    title: 'File 6',
                    id: '6',
                  },
                ]
              }]
            }
          });
        }
      });
    }
  }, [], true);

  it('TINY-9614: Tree is navigable using up and down arrow keys and using tab and shoft+tab keys', () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, 'button:contains("Tree")');
    const dirElement = FocusTools.isOnSelector('Dir', SugarDocument.getDocument(), '.tox-tree--directory__label:contains("Dir")');
    TinyUiActions.keystroke(editor, Keys.down());
    const file5Element = FocusTools.isOnSelector('File 5', SugarDocument.getDocument(), '.tox-tree--leaf__label:contains("File 5")');
    TinyUiActions.keystroke(editor, Keys.up());
    FocusTools.isOn('Dir', dirElement);
    TinyUiActions.keystroke(editor, Keys.tab());
    const dirMenuElement = FocusTools.isOnSelector('Dir menu', SugarDocument.getDocument(), '.tox-tree--directory__label:contains("Dir") > .tox-mbtn' );
    TinyUiActions.keystroke(editor, Keys.tab());
    FocusTools.isOn('File 5', file5Element);
    TinyUiActions.keystroke(editor, Keys.tab(), { shiftKey: true });
    FocusTools.isOn('Dir menu', dirMenuElement);
    TinyUiActions.keystroke(editor, Keys.tab(), { shiftKey: true });
    FocusTools.isOn('Dir', dirElement);
    TinyUiActions.closeDialog(editor);
  });
});
