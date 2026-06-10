import { TestStore } from '@ephox/agar';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Global } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';

class CustomComponent extends HTMLElement { }

describe('browser.tinymce.core.CustomComponentsTest', () => {
  const fakeComponentUrl1 = 'data:,' + encodeURIComponent('top.customComponentsTest(1)');
  const fakeComponentUrl2 = 'data:,' + encodeURIComponent('top.customComponentsTest(2)');
  const fakeComponentUrl3 = 'data:,' + encodeURIComponent('top.customComponentsTest(3)');

  context('Iframe editor', () => {
    const store = TestStore<number>();

    before(() => {
      Global.customComponentsTest = (value: number) => {
        store.add(value);
      };
    });

    after(() => {
      delete Global.customComponentsTest;
      store.clear();
    });

    TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      setup: (editor: Editor) => {
        editor.on('PreInit', () => {
          editor.getWin().customElements.define('test-component3', CustomComponent);

          editor.schema.addCustomElements({
            'test-component1': { extends: 'span', componentUrl: fakeComponentUrl1 },
            'test-component2': { extends: 'span', componentUrl: fakeComponentUrl2 },
            'test-component3': { extends: 'span', componentUrl: fakeComponentUrl3 } // Is loaded even if defined
          });
        });
      }
    }, [ ]);

    it('TINY-13006: Should have loaded all three component scripts', () => {
      store.assertEq('Should have called the callback three times', [ 1, 2, 3 ]);
    });
  });

  context('Inline editor', () => {
    const store = TestStore<number>();

    before(() => {
      Global.customComponentsTest = (value: number) => {
        store.add(value);
      };
    });

    after(() => {
      delete Global.customComponentsTest;
      store.clear();
    });

    TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      inline: true,
      setup: (editor: Editor) => {
        editor.on('PreInit', () => {
          editor.getWin().customElements.define('test-component3', CustomComponent);

          editor.schema.addCustomElements({
            'test-component1': {
              extends: 'span',
              componentUrl: fakeComponentUrl1,
            },
            'test-component2': {
              extends: 'span',
              componentUrl: fakeComponentUrl1, // Note: using the same URL as component 1
            },
            'test-component3': {
              extends: 'span',
              componentUrl: fakeComponentUrl3 // Should not be loaded since it's already defined
            }
          });
        });
      }
    }, [ ]);

    it('TINY-13006: Should only load the script one since the url is the same for both 1 and 2 and 3 is already defined', () => {
      store.assertEq('Should have called the callback once', [ 1 ]);
    });
  });
});
