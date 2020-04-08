import { Assertions, GeneralSteps, Log, Pipeline, RealKeys, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('webdriver.tinymce.core.content.PlaceholderTest', (success, failure) => {
  Theme();

  const togglePlaceholderCount = Cell(0);
  const placeholder = 'Type here...';

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApi = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const sClearCount = Step.sync(() => togglePlaceholderCount.set(0));
    const sAssertCount = (count: number) => Step.sync(() => {
      Assertions.assertEq('Assert PlaceholderToggle count', count, togglePlaceholderCount.get());
    });

    const sSetContent = (content: string) => GeneralSteps.sequence([
      tinyApi.sSetContent(content),
      sClearCount
    ]);

    const sAssertPlaceholder = (expected: boolean) => Waiter.sTryUntil('Wait for placeholder to update', Step.sync(() => {
      const body = editor.getBody();
      const dataPlaceholder = editor.dom.getAttrib(body, 'data-mce-placeholder');
      const ariaPlaceholder = editor.dom.getAttrib(body, 'aria-placeholder');
      const expectedPlaceholder = expected ? placeholder : '';
      Assertions.assertEq('Check data-mce-placeholder attribute', expectedPlaceholder, dataPlaceholder);
      Assertions.assertEq('Check aria-placeholder attribute', expectedPlaceholder, ariaPlaceholder);
    }));

    const sAssertPlaceholderExists = sAssertPlaceholder(true);
    const sAssertPlaceholderNotExists = sAssertPlaceholder(false);

    // The Delete command doesn't work on IE 11 so skip it
    const browserSpecificTests = PlatformDetection.detect().browser.isIE() ? [ ] : [
      Log.stepsAsStep('TINY-3917', 'Check placeholder restores when deleting content via command', [
        sSetContent('<p>a</p>'),
        tinyApi.sSetCursor([ 0, 0 ], 1),
        sAssertPlaceholderNotExists,
        tinyApi.sExecCommand('Delete'),
        sAssertPlaceholderExists,
        sAssertCount(1)
      ])
    ];

    Pipeline.async({}, [
      tinyApi.sFocus(),
      Log.stepsAsStep('TINY-3917', 'Check placeholder shown with no content', [
        sSetContent('<p></p>'),
        sAssertPlaceholderExists
      ]),
      Log.stepsAsStep('TINY-3917', 'Check placeholder hidden with content', [
        sSetContent('<p>Some content</p>'),
        sAssertPlaceholderNotExists
      ]),
      Log.stepsAsStep('TINY-3917', 'Check placeholder hides when typing content and returns once content is deleted', [
        sSetContent('<p></p>'),
        sAssertPlaceholderExists,
        RealKeys.sSendKeysOn('iframe => body => p', [ RealKeys.text('t') ]),
        sAssertPlaceholderNotExists,
        RealKeys.sSendKeysOn('iframe => body => p', [ RealKeys.backspace() ]),
        sAssertPlaceholderExists,
        sAssertCount(2)
      ]),
      Log.stepsAsStep('TINY-3917', 'Check placeholder hides when typing content, returns on undo and hides on redo', [
        sSetContent('<p></p>'),
        sAssertPlaceholderExists,
        RealKeys.sSendKeysOn('iframe => body => p', [ RealKeys.text('t') ]),
        sAssertPlaceholderNotExists,
        tinyUi.sClickOnToolbar('Click on undo', '.tox-tbtn[title="Undo"]'),
        sAssertPlaceholderExists,
        tinyUi.sClickOnToolbar('Click on redo', '.tox-tbtn[title="Redo"]'),
        sAssertPlaceholderNotExists,
        sAssertCount(3)
      ]),
      Log.stepsAsStep('TINY-3917', 'Press bold, type content, placeholder hides and returns once content is deleted', [
        sSetContent('<p></p>'),
        sAssertPlaceholderExists,
        tinyUi.sClickOnToolbar('Click on bold', '.tox-tbtn[title="Bold"]'),
        sAssertPlaceholderExists,
        RealKeys.sSendKeysOn('iframe => body => p', [ RealKeys.text('t') ]),
        sAssertPlaceholderNotExists,
        RealKeys.sSendKeysOn('iframe => body => p', [ RealKeys.backspace() ]),
        sAssertPlaceholderExists,
        sAssertCount(2)
      ]),
      Log.stepsAsStep('TINY-3917', 'Check placeholder hides when inserting content via command', [
        sSetContent('<p></p>'),
        sAssertPlaceholderExists,
        tinyApi.sExecCommand('mceInsertContent', '<a href="#id">Link</a>'),
        sAssertPlaceholderNotExists,
        sAssertCount(1)
      ]),
      Log.stepsAsStep('TINY-3917', 'Check placeholder hides when inserting list via command', [
        sSetContent('<p></p>'),
        sAssertPlaceholderExists,
        tinyApi.sExecCommand('InsertOrderedList'),
        sAssertPlaceholderNotExists,
        sAssertCount(1)
      ]),
      Log.stepsAsStep('TINY-4828', 'Check placeholder hides when pasting content into the editor', [
        sSetContent('<p></p>'),
        sAssertPlaceholderExists,
        // Note: This fakes a paste event
        Step.sync(() => {
          editor.fire('paste');
          editor.getBody().innerHTML = '<p>Pasted content</p>';
        }),
        sAssertPlaceholderNotExists,
        sAssertCount(1)
      ])
    ].concat(browserSpecificTests), onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'undo redo | bold',
    placeholder,
    setup: (editor) => {
      editor.on('PlaceholderToggle', () => {
        togglePlaceholderCount.set(togglePlaceholderCount.get() + 1);
      });
    }
  }, success, failure);
});
