import { Assertions, Chain, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import GetSelectionContent from 'tinymce/core/selection/GetSelectionContent';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import Env from 'tinymce/core/api/Env';

UnitTest.asynctest('browser.tinymce.selection.GetSelectionContentTest', (success, failure) => {
  Theme();
  const testDivId = 'testDiv1';

  const sFocusDiv = Step.sync(() => {
    const input: any = document.querySelector('#' + testDivId);
    input.focus();
  });

  const sRemoveTestDiv = Step.sync(() => {
    const input = document.querySelector('#' + testDivId);
    input.parentNode.removeChild(input);
  });

  const sAddTestDiv = Step.sync(function () {
    const div = document.createElement('div');
    div.innerHTML = 'xxx';
    div.contentEditable = 'true';
    div.id = testDivId;
    document.body.appendChild(div);
  });

  const cGetContent = (args: any) => {
    return Chain.mapper((editor: Editor) => {
      return GetSelectionContent.getContent(editor, args);
    });
  };

  const sAssertGetContent = (label: string, editor: Editor, expectedContents: string, args: any = {}) => {
    return Chain.asStep(editor, [
      cGetContent(args),
      Assertions.cAssertEq('Should be expected contents', expectedContents)
    ]);
  };

  const sAssertGetContentOverrideBeforeGetContent = (label: string, editor: Editor, expectedContents: string, args: any = {}) => {
    const handler = (e) => {
      if (e.selection === true) {
        e.preventDefault();
        e.content = expectedContents;
      }
    };

    return GeneralSteps.sequence([
      Step.sync(function () {
        editor.on('BeforeGetContent', handler);
      }),
      Chain.asStep(editor, [
        cGetContent(args),
        Assertions.cAssertEq('Should be expected contents', expectedContents)
      ]),
      Step.sync(function () {
        editor.off('BeforeGetContent', handler);
      })
    ]);
  };

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Should be empty contents on a caret selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 0),
        sAssertGetContent('Should be empty selection on caret', editor, '')
      ])),
      Logger.t('Should be text contents on a range selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
        sAssertGetContent('Should be some content', editor, 'a')
      ])),
      Logger.t('Should be text contents provided by override handler', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
        sAssertGetContentOverrideBeforeGetContent('Should be overridden content', editor, 'X')
      ])),
      Logger.t('Should be text contents when editor isn\'t focused and format is text', GeneralSteps.sequence([
        sAddTestDiv,
        tinyApis.sSetContent('<p>ab</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 2),
        sFocusDiv,
        sAssertGetContent('Should be some content', editor, 'ab', { format: 'text' }),
        sRemoveTestDiv
      ])),
      Logger.t('Should be text content with newline', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>ab<br/>cd</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 2], 2),
        sAssertGetContent('Should be some content', editor, `ab${Env.ie === 11 ? '\r\n' : '\n'}cd`, { format: 'text' })
      ]))
    ], onSuccess, onFailure);
  }, {
    selector: 'textarea',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
