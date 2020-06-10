import { Assertions, Chain, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import * as GetSelectionContent from 'tinymce/core/selection/GetSelectionContent';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.selection.GetSelectionContentTest', (success, failure) => {
  Theme();
  const browser = PlatformDetection.detect().browser;
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

  const cGetContent = (args: any) => Chain.mapper((editor: Editor) => GetSelectionContent.getContent(editor, args));

  const sAssertGetContent = (label: string, editor: Editor, expectedContents: string, args: any = {}) => Chain.asStep(editor, [
    cGetContent(args),
    Assertions.cAssertEq(label + ': Should be expected contents', expectedContents)
  ]);

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
        Assertions.cAssertEq(label + ': Should be expected contents', expectedContents)
      ]),
      Step.sync(function () {
        editor.off('BeforeGetContent', handler);
      })
    ]);
  };

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Should be empty contents on a caret selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 0),
        sAssertGetContent('Should be empty selection on caret', editor, '')
      ])),
      Logger.t('Should be text contents on a range selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 1),
        sAssertGetContent('Should be some content', editor, 'a')
      ])),
      Logger.t('Should be text contents provided by override handler', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 1),
        sAssertGetContentOverrideBeforeGetContent('Should be overridden content', editor, 'X')
      ])),
      Logger.t(`Should be text contents when editor isn't focused and format is text`, GeneralSteps.sequence([
        sAddTestDiv,
        tinyApis.sSetContent('<p>ab</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 2),
        sFocusDiv,
        sAssertGetContent('Should be some content', editor, 'ab', { format: 'text' }),
        sRemoveTestDiv
      ])),
      Logger.t('Should be text content with newline', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>ab<br/>cd</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 2 ], 2),
        sAssertGetContent('Should be some content', editor, `ab${Env.ie === 11 ? '\r\n' : '\n'}cd`, { format: 'text' })
      ])),
      Logger.t('Should be text content with leading visible spaces', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>content<em> Leading space</em></p>'),
        tinyApis.sSetSelection([ 0 ], 1, [ 0 ], 2),
        sAssertGetContent('Should be some content', editor, ' Leading space', { format: 'text' })
      ])),
      Logger.t('Should be text content with trailing visible spaces', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><em>Trailing space </em>content</p>'),
        tinyApis.sSetSelection([ 0 ], 0, [ 0 ], 1),
        sAssertGetContent('Should be some content', editor, 'Trailing space ', { format: 'text' })
      ])),
      Logger.t('Should be text content without non-visible leading/trailing spaces', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><em> spaces </em></p>'),
        tinyApis.sSetSelection([ 0 ], 0, [ 0 ], 1),
        // Firefox, IE & Edge actually renders the trailing space within the editor in this case
        // however Firefox reports via innerText that it doesn't render the trailing space. So
        // as discussed we should use whatever it is returning for innerText
        browser.isIE() || browser.isEdge() ?
          sAssertGetContent('Should be some content', editor, 'spaces ', { format: 'text' }) :
          sAssertGetContent('Should be some content', editor, 'spaces', { format: 'text' }),
        tinyApis.sSetContent('<p> spaces </p>'),
        tinyApis.sSetSelection([ ], 0, [ ], 1),
        sAssertGetContent('Should be some content', editor, 'spaces', { format: 'text' })
      ]))
    ], onSuccess, onFailure);
  }, {
    selector: 'textarea',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
