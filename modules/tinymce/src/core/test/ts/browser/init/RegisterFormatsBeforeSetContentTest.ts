import { Pipeline, Step } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import { UnitTest, Assert } from '@ephox/bedrock-client';

import Theme from 'tinymce/themes/silver/Theme';
import { Cell, Option, Obj, Arr, Strings } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('Register formats before setContent test', (success, failure) => {
  const customFormatNames = Cell<Option<string[]>>(Option.none());

  const storeFormats = (editor: Editor) => {
    const names = Arr.filter(Obj.keys(editor.formatter.get()), (key) => Strings.startsWith(key, 'custom-'));
    customFormatNames.set(Option.some(names));
  };

  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    Pipeline.async({}, [
      Step.sync(() => {
        Assert.eq('Should be custom formats names based on the titles in style_formats', [
          'custom-my-block-format',
          'custom-my-inline-format',
          'custom-my-selector-format'
        ], customFormatNames.get().getOrDie('Should be format names'));
      })
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    style_formats: [
      { title: 'my-block-format', block: 'h1' },
      { title: 'my-inline-format', inline: 'b' },
      { title: 'my-selector-format', selector: 'h1', classes: ['class'] }
    ],
    setup: (editor) => {
      editor.on('beforesetcontent', (_) => storeFormats(editor));
    }
  }, success, failure);
});
