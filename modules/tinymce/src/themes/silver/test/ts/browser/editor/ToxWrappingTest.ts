import { Assertions, Pipeline, Chain, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import { Element, Body, Attr, Traverse, Class } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import { Result } from '@ephox/katamari';

UnitTest.asynctest('Editor (Silver) test', (success, failure) => {
  Theme();

  TinyLoader.setupLight(
    (editor: Editor, onSuccess, onFailure) => {
      const replacedElem = Element.fromDom(editor.getElement());

      Pipeline.async({ }, [
        Chain.asStep(Body.body(), [
          UiFinder.cFindIn(`#${Attr.get(replacedElem, 'id')}`),
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
