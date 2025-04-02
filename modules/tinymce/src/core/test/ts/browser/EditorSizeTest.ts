import { context, describe, it } from '@ephox/bedrock-client';
import { Height } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.EditorSizeTest', () => {
  context('Minimum Size Enforcement', () => {
    context('Unitless wrapper', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        selector: 'textarea',
        height: 10,
        min_height: 500,
        base_url: '/project/tinymce/js/tinymce'
      }, []);

      it('TINY-11108: unitless', () => {
        const editor = hook.editor();
        assert.equal(Height.get(TinyDom.container(editor)), 500);
      });
    });

    context('em Wrapper', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        selector: 'textarea',
        height: '10em',
        min_height: 500,
        base_url: '/project/tinymce/js/tinymce'
      }, []);

      it('TINY-11108: using em units', () => {
        const editor = hook.editor();
        assert.equal(Height.get(TinyDom.container(editor)), 500);
      });
    });

    context('pt Wrapper', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        selector: 'textarea',
        height: '10pt',
        min_height: 500,
        base_url: '/project/tinymce/js/tinymce'
      }, []);

      it('TINY-11108: using pt units', () => {
        const editor = hook.editor();
        assert.equal(Height.get(TinyDom.container(editor)), 500);
      });
    });

    context('px Wrapper', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        selector: 'textarea',
        height: '10px',
        min_height: 500,
        base_url: '/project/tinymce/js/tinymce'
      }, []);

      it('TINY-11108: using px units', () => {
        const editor = hook.editor();
        assert.equal(Height.get(TinyDom.container(editor)), 500);
      });
    });

    context('percentage wrapper', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        selector: 'textarea',
        height: '10%',
        min_height: 500,
        base_url: '/project/tinymce/js/tinymce'
      }, []);

      it('TINY-11108: using % units', () => {
        const editor = hook.editor();
        // % not really supported, so we do this.
        assert.isTrue(Height.get(TinyDom.container(editor)) < 200);
      });
    });
  });
});
