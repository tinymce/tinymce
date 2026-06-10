import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitEditorContentLanguageTest', () => {
  Arr.each([
    { type: 'iframe', settings: {}, getLangElement: TinyDom.documentElement },
    { type: 'inline', settings: { inline: true }, getLangElement: TinyDom.targetElement }
  ], (tester) => {
    context(`${tester.type} editor`, () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        content_language: 'fr',
        base_url: '/project/tinymce/js/tinymce',
        ...tester.settings
      }, []);

      it('should set the lang attribute from content_language', () => {
        const editor = hook.editor();
        const langElement = tester.getLangElement(editor);
        assert.equal(Attribute.get(langElement, 'lang'), 'fr');
      });
    });
  });
});
