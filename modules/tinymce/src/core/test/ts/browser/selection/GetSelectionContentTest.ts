import { Assertions, Chain, GeneralSteps, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import Editor from 'tinymce/core/api/Editor';
import { GetSelectionContentArgs, getContent } from 'tinymce/core/selection/GetSelectionContent';
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

  const sAddTestDiv = Step.sync(() => {
    const div = document.createElement('div');
    div.innerHTML = 'xxx';
    div.contentEditable = 'true';
    div.id = testDivId;
    document.body.appendChild(div);
  });

  const cGetContent = (args: GetSelectionContentArgs) =>
    Chain.mapper((editor: Editor) =>
      getContent(editor, args).toString().replace(/[\r]+/g, ''));

  const sAssertGetContent = (label: string, editor: Editor, expectedContents: string, args: GetSelectionContentArgs = {}) =>
    Chain.asStep(editor, [
      cGetContent(args),
      Assertions.cAssertEq(label + ': Should be expected contents', expectedContents)
    ]);

  const sAssertGetContentOverrideBeforeGetContent = (label: string, editor: Editor, expectedContents: string, args: GetSelectionContentArgs = {}) => {
    const handler = (e) => {
      if (e.selection === true) {
        e.preventDefault();
        e.content = expectedContents;
      }
    };

    return Step.label(label, GeneralSteps.sequence([
      Step.sync(() => {
        editor.on('BeforeGetContent', handler);
      }),
      Chain.asStep(editor, [
        cGetContent(args),
        Assertions.cAssertEq(label + ': Should be expected contents', expectedContents)
      ]),
      Step.sync(() => {
        editor.off('BeforeGetContent', handler);
      })
    ]));
  };

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Should be empty contents on a caret selection', [
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 0),
        sAssertGetContent('Should be empty selection on caret', editor, '')
      ]),
      Log.stepsAsStep('TBA', 'Should be text contents on a range selection', [
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 1),
        sAssertGetContent('Should be some content', editor, 'a')
      ]),
      Log.stepsAsStep('TBA', 'Should be text contents provided by override handler', [
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 1),
        sAssertGetContentOverrideBeforeGetContent('Should be overridden content', editor, 'X')
      ]),
      Log.stepsAsStep('TBA', `Should be text contents when editor isn't focused and format is text`, [
        sAddTestDiv,
        tinyApis.sSetContent('<p>ab</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 2),
        sFocusDiv,
        sAssertGetContent('Should be some content', editor, 'ab', { format: 'text' }),
        sRemoveTestDiv
      ]),
      Log.stepsAsStep('TBA', 'Should be text content with newline', [
        tinyApis.sSetContent('<p>ab<br/>cd</p>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 2 ], 2),
        sAssertGetContent('Should be some content', editor, 'ab\ncd', { format: 'text' })
      ]),
      Log.stepsAsStep('TBA', 'Should be text content with leading visible spaces', [
        tinyApis.sSetContent('<p>content<em> Leading space</em></p>'),
        tinyApis.sSetSelection([ 0 ], 1, [ 0 ], 2),
        sAssertGetContent('Should be some content', editor, ' Leading space', { format: 'text' })
      ]),
      Log.stepsAsStep('TBA', 'Should be text content with trailing visible spaces', [
        tinyApis.sSetContent('<p><em>Trailing space </em>content</p>'),
        tinyApis.sSetSelection([ 0 ], 0, [ 0 ], 1),
        sAssertGetContent('Should be some content', editor, 'Trailing space ', { format: 'text' })
      ]),
      Log.stepsAsStep('TINY-6448', 'pre blocks should have preserved spaces', [
        tinyApis.sSetContent('<pre>          This      Has\n     Spaces</pre>'),
        tinyApis.sSetSelection([ 0 ], 0, [ 0 ], 1),
        sAssertGetContent('Should be some content', editor, '          This      Has\n     Spaces', { format: 'text' })
      ]),
      Log.stepsAsStep('TINY-6448', 'p blocks should not preserve spaces', [
        tinyApis.sSetContent('<p>          This      Has\n     Spaces</p>'),
        tinyApis.sSetSelection([ ], 0, [ ], 1),
        sAssertGetContent('Should be some content', editor, 'This Has Spaces', { format: 'text' })
      ]),
      Log.stepsAsStep('TBA', 'Should be text content without non-visible leading/trailing spaces', [
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
      ])
    ], onSuccess, onFailure);
  }, {
    selector: 'textarea',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
