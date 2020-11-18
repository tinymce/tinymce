import { Assertions, Chain, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Result } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { Attribute, Class, SugarBody, SugarElement, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Editor (Silver) tox wrapping test', (success, failure) => {
  Theme();

  TinyLoader.setupLight(
    (editor: Editor, onSuccess, onFailure) => {
      const replacedElem = SugarElement.fromDom(editor.getElement());

      Pipeline.async({ }, [
        Chain.asStep(SugarBody.body(), [
          UiFinder.cFindIn(`#${Attribute.get(replacedElem, 'id')}`),
          Chain.binder((elem) => Traverse.nextSibling(elem).fold(() => Result.error('Replaced element has no next sibling'), Result.value)),
          Chain.mapper((elem) => Class.has(elem, 'tox-tinymce')),
          Assertions.cAssertEq(`Replaced element's next sibling has "tox-tinymce" class`, true)
        ])
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      menubar: true,
      base_url: '/project/tinymce/js/tinymce'
    },
    () => {
      success();
    },
    failure
  );
});
