import { describe, it } from '@ephox/bedrock-client';
import { Arr, Obj, Singleton, Strings } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.RegisterFormatsBeforeSetContentTest', () => {
  const customFormatNames = Singleton.value<string[]>();
  TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    style_formats: [
      { title: 'my-block-format', block: 'h1' },
      { title: 'my-inline-format', inline: 'b' },
      { title: 'my-selector-format', selector: 'h1', classes: [ 'class' ] }
    ],
    setup: (editor: Editor) => {
      editor.on('BeforeSetContent', (_) => {
        const names = Arr.filter(Obj.keys(editor.formatter.get()), (key) => Strings.startsWith(key, 'custom-'));
        customFormatNames.set(names);
      });
    }
  }, []);

  it('Register formats before setContent test', () => {
    const formats = customFormatNames.get().getOrDie('Should be format names');
    assert.deepEqual(formats, [
      'custom-my-block-format',
      'custom-my-inline-format',
      'custom-my-selector-format'
    ], 'Should be custom formats names based on the titles in style_formats');
  });
});
