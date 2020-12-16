import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import * as TypeText from '../module/test/TypeText';

UnitTest.asynctest('browser.tinymce.core.ClickContentEditableFalseTest', (success, failure) => {

  Theme();

  const sClickMiddleOf = (editor, elementPath) => {
    return Step.sync(() => {
      const element = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), elementPath).getOrDie().dom as HTMLElement;
      const rect = element.getBoundingClientRect();
      const clientX = (rect.left + rect.width / 2), clientY = (rect.top + rect.height / 2);

      editor.fire('mousedown', { target: element, clientX, clientY });
      editor.fire('mouseup', { target: element, clientX, clientY });
      editor.fire('click', { target: element, clientX, clientY });
    });
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Logger.t('Click on content editable false', GeneralSteps.sequence([
        tinyApis.sSetContent('<p contenteditable="false">a</p>'),
        sClickMiddleOf(editor, [ 1 ]),
        tinyApis.sAssertSelection([], 0, [], 1)
      ])),
      Logger.t('Click on content editable false inside content editable true', GeneralSteps.sequence([
        tinyApis.sSetContent('<div contenteditable="true"><p contenteditable="false">a</p></div>'),
        sClickMiddleOf(editor, [ 0, 1 ]),
        tinyApis.sAssertSelection([ 0 ], 0, [ 0 ], 1)
      ])),
      Logger.t('Click on content editable true inside content editable false', GeneralSteps.sequence([
        tinyApis.sSetContent('<div contenteditable="false"><p contenteditable="true">a</p></div>'),
        sClickMiddleOf(editor, [ 1, 0 ]),
        tinyApis.sAssertSelection([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1)
      ])),
      Logger.t('Click on content editable false inside content editable true and then on content editable true and type', GeneralSteps.sequence([
        tinyApis.sSetContent('<div contenteditable="true"><p contenteditable="false">a</p><p>b</p></div>'),
        sClickMiddleOf(editor, [ 0, 1 ]),
        sClickMiddleOf(editor, [ 0, 1 ]),
        tinyApis.sAssertSelection([ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1),
        TypeText.sTypeContentAtSelection(SugarElement.fromDom(editor.getDoc()), 'c'),
        tinyApis.sAssertContent('<div contenteditable="true"><p contenteditable="false">a</p><p>bc</p></div>'),
        tinyApis.sAssertSelection([ 0, 1, 0 ], 2, [ 0, 1, 0 ], 2)
      ])),
      Logger.t('Click on content editable false then outside on content editable inherit', GeneralSteps.sequence([
        tinyApis.sSetContent('<p contenteditable="false">a</p><p>a</p>'),
        sClickMiddleOf(editor, [ 1 ]),
        sClickMiddleOf(editor, [ 1 ]),
        tinyApis.sAssertSelection([ 1, 0 ], 1, [ 1, 0 ], 1)
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, success, failure);
});
