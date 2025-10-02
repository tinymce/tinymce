import { TestStore } from '@ephox/agar';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Global } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.CustomComponentsTest', () => {
  const componentUrl1 = 'data:,' + encodeURIComponent('top.customComponentsTest(1)');
  const componentUrl2 = 'data:,' + encodeURIComponent('top.customComponentsTest(2)');

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
          editor.schema.addCustomElements({
            'test-component1': { extends: 'span', componentUrl: componentUrl1 },
            'test-component2': { extends: 'span', componentUrl: componentUrl2 }
          });
        });
      }
    }, [ ]);

    it('TINY-13006: Should have loaded both component scripts', () => {
      store.assertEq('Should have called custom component once', [ 1, 2 ]);
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
          editor.schema.addCustomElements({
            'test-component1': {
              extends: 'span',
              componentUrl: componentUrl1,
            },
            'test-component2': {
              extends: 'span',
              componentUrl: componentUrl1, // Note: using the same URL as component 1
            }
          });
        });
      }
    }, [ ]);

    it('TINY-13006: Should only load the script one since the url is the same for both 1 and 2', () => {
      store.assertEq('Should have called custom component once', [ 1 ]);
    });
  });
});
