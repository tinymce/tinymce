import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import * as Settings from 'tinymce/themes/silver/api/Settings';
import { ElementInstances } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';

const tElement = ElementInstances.tElement;

UnitTest.asynctest('Inline getUiContainer returns shadow root', (success, failure) => {

  Theme();

  TinyLoader.setupInShadowRoot((editor, shadowRoot, onSuccess) => {
    Assert.eq('Should be shadow root', shadowRoot, Settings.getUiContainer(editor), tElement());

    onSuccess();
  }, {
    base_url: '/project/tinymce/js/tinymce',
    inline: true
  }, () => success(), failure);
});
