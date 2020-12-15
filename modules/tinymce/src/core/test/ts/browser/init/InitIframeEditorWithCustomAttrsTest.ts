import { Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import { Attribute, SugarElement } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest(
  'browser.tinymce.core.init.InitIframeEditorWithCustomAttrsTest',
  (success, failure) => {

    Theme();

    TinyLoader.setup((editor, onSuccess, onFailure) => {
      Pipeline.async({}, [
        Logger.t('Check if iframe has the right custom attributes', Step.sync(() => {
          const ifr = SugarElement.fromDom(editor.iframeElement);

          Assertions.assertEq('Id should not be the defined x', true, Attribute.get(ifr, 'id') !== 'x');
          Assertions.assertEq('Custom attribute whould have the right value', 'a', Attribute.get(ifr, 'data-custom1'));
          Assertions.assertEq('Custom attribute whould have the right value', 'b', Attribute.get(ifr, 'data-custom2'));
        }))
      ], onSuccess, onFailure);
    }, {
      base_url: '/project/tinymce/js/tinymce',
      iframe_attrs: {
        'id': 'x',
        'data-custom1': 'a',
        'data-custom2': 'b'
      }
    }, success, failure);
  }
);
