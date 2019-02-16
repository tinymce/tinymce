import { ApproxStructure, Assertions, Chain, GeneralSteps, Log, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';

import QuickbarsPlugin from 'tinymce/plugins/quickbars/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.quickbars.SelectionToolbarTest', (success, failure) => {

  const imgSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  Theme();
  QuickbarsPlugin();

  const sAssertButtonToggledState = (name: string, state: boolean) => {
    return Chain.asStep(Body.body(), [
      UiFinder.cFindIn(`.tox-toolbar button[aria-label="${name}"]`),
      Assertions.cAssertStructure(`Check ${name} button is ${state ? 'active' : 'inactive'}`,
        ApproxStructure.build((s, str, arr) => {
          return s.element('button', {
            classes: [ state ? arr.has('tox-tbtn--enabled') : arr.not('tox-tbtn--enabled') ]
          });
        })
      )
    ]);
  };

  const sWaitForTextToolbarAndAssertState = (tinyUi, bold: boolean, italic: boolean, heading2: boolean, heading3: boolean, blockquote: boolean) => {
    return GeneralSteps.sequence([
      tinyUi.sWaitForUi('wait for text selection toolbar to show', '.tox-toolbar button[aria-label="Bold"]'),
      sAssertButtonToggledState('Bold', bold),
      sAssertButtonToggledState('Italic', italic),
      sAssertButtonToggledState('Heading 2', heading2),
      sAssertButtonToggledState('Heading 3', heading3),
      sAssertButtonToggledState('Blockquote', blockquote)
    ]);
  };

  const sWaitForImageToolbarAndAssertState = (tinyUi, alignLeft: boolean, alignCenter: boolean, alignRight: boolean) => {
    return GeneralSteps.sequence([
      tinyUi.sWaitForPopup('wait for resize handles', '#mceResizeHandlese'),
      tinyUi.sWaitForUi('wait for image selection toolbar to show', '.tox-toolbar button[aria-label="Align left"]'),
      sAssertButtonToggledState('Align left', alignLeft),
      sAssertButtonToggledState('Align center', alignCenter),
      sAssertButtonToggledState('Align right', alignRight)
    ]);
  };

  TinyLoader.setup((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Text selection toolbar', [
        tinyApis.sSetContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p><blockquote><p>Some quoted content</p></blockquote>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
        sWaitForTextToolbarAndAssertState(tinyUi, false, false, false, false, false),
        tinyApis.sSetSelection([0, 1, 0], 0, [0, 1, 0], 3),
        sWaitForTextToolbarAndAssertState(tinyUi, true, false, false, false, false),
        tinyApis.sSetSelection([0, 3, 0], 1, [0, 3, 0], 4),
        sWaitForTextToolbarAndAssertState(tinyUi, false, true, false, false, false),
        tinyApis.sSetSelection([1, 0], 1, [1, 0], 1),
        sWaitForTextToolbarAndAssertState(tinyUi, false, false, false, false, true)
      ]),
      Log.stepsAsStep('TBA', 'Image selection toolbar', [
        tinyApis.sSetContent('<p><img src="' + imgSrc + '"></p>'),
        tinyApis.sSetSelection([0], 0, [0], 1),
        sWaitForImageToolbarAndAssertState(tinyUi, false, false, false),
        tinyApis.sSetContent('<p><img src="' + imgSrc + '" style="float: left;"></p>'),
        tinyApis.sSetSelection([0], 0, [0], 1),
        sWaitForImageToolbarAndAssertState(tinyUi, true, false, false),
        tinyApis.sSetContent('<p><img src="' + imgSrc + '" style="float: right;"></p>'),
        tinyApis.sSetSelection([0], 0, [0], 1),
        sWaitForImageToolbarAndAssertState(tinyUi, false, false, true),
        tinyApis.sSetContent('<p>&nbsp;</p><figure class="image" contenteditable="false"><img src="' + imgSrc + '"><figcaption contenteditable="true">Caption</figcaption></figure>'),
        tinyApis.sSetSelection([1], 0, [1], 1),
        sWaitForImageToolbarAndAssertState(tinyUi, false, false, false),
        tinyApis.sSetContent('<p>&nbsp;</p><figure class="image align-left" style="text-align: left;" contenteditable="false"><img src="' + imgSrc + '"><figcaption contenteditable="true">Caption</figcaption></figure>'),
        tinyApis.sSetSelection([1], 0, [1], 1),
        sWaitForImageToolbarAndAssertState(tinyUi, true, false, false),
        tinyApis.sSetContent('<p>&nbsp;</p><figure class="image align-right" style="text-align: right;" contenteditable="false""><img src="' + imgSrc + '"><figcaption contenteditable="true">Caption</figcaption></figure>'),
        tinyApis.sSetSelection([1], 0, [1], 1),
        sWaitForImageToolbarAndAssertState(tinyUi, false, false, true),
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'quickbars',
    inline: true,
    toolbar: false,
    menubar: false,
    base_url: '/project/js/tinymce'
  }, success, failure);
});
