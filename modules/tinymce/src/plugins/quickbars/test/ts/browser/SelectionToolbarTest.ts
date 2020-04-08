import { ApproxStructure, Assertions, Chain, GeneralSteps, Guard, Log, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import QuickbarsPlugin from 'tinymce/plugins/quickbars/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.quickbars.SelectionToolbarTest', (success, failure) => {

  const imgSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  Theme();
  LinkPlugin();
  QuickbarsPlugin();

  enum Alignment {
    Left = 'left',
    Right = 'right',
    Center = 'center'
  }

  const sAssertButtonToggledState = (name: string, state: boolean) => Chain.asStep(Body.body(), [
    Chain.control(
      Chain.fromChains( [
        UiFinder.cFindIn(`.tox-toolbar button[aria-label="${name}"]`),
        Assertions.cAssertStructure(`Check ${name} button is ${state ? 'active' : 'inactive'}`,
          ApproxStructure.build((s, str, arr) => s.element('button', {
            classes: [ state ? arr.has('tox-tbtn--enabled') : arr.not('tox-tbtn--enabled') ]
          }))
        )
      ]),
      Guard.tryUntil('wait for toolbar button state')
    )
  ]);

  const sWaitForTextToolbarAndAssertState = (tinyUi: TinyUi, bold: boolean, italic: boolean, heading2: boolean, heading3: boolean, link: boolean, blockquote: boolean) => GeneralSteps.sequence([
    tinyUi.sWaitForUi('wait for text selection toolbar to show', '.tox-toolbar'),
    sAssertButtonToggledState('Bold', bold),
    sAssertButtonToggledState('Italic', italic),
    sAssertButtonToggledState('Link', link),
    sAssertButtonToggledState('Heading 2', heading2),
    sAssertButtonToggledState('Heading 3', heading3),
    sAssertButtonToggledState('Blockquote', blockquote)
  ]);

  const sSetImageAndAssertToolbarState = (tinyApis: TinyApis, tinyUi: TinyUi, useFigure: boolean, alignment?: Alignment) => {
    let attrs, imageHtml;
    if (alignment === undefined) {
      attrs = useFigure ? 'class="image"' : '';
    } else if (alignment === Alignment.Center) {
      attrs = useFigure ? `class="image align-${alignment}"` : 'style="margin-left: auto; margin-right: auto; display: block;"';
    } else {
      attrs = useFigure ? `class="image align-${alignment}"` : `style="float: ${alignment};"`;
    }

    if (useFigure) {
      imageHtml = `<figure ${attrs} contenteditable="false"><img src="${imgSrc}"><figcaption contenteditable="true">Caption</figcaption></figure>`;
    } else {
      imageHtml = `<p><img src="${imgSrc}" ${attrs}></p>`;
    }

    return GeneralSteps.sequence([
      tinyApis.sSetContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p>' + imageHtml),
      tinyApis.sSelect(useFigure ? 'figure' : 'img', []),
      tinyUi.sWaitForUi('wait for image selection toolbar to show', '.tox-toolbar'),
      sAssertButtonToggledState('Align left', alignment === Alignment.Left),
      sAssertButtonToggledState('Align center', alignment === Alignment.Center),
      sAssertButtonToggledState('Align right', alignment === Alignment.Right)
    ]);
  };

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TBA', 'Text selection toolbar', [
        tinyApis.sSetContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p><blockquote><p>Some quoted content</p></blockquote>'),
        tinyApis.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 4),
        sWaitForTextToolbarAndAssertState(tinyUi, false, false, false, false, false, false),
        tinyApis.sSetSelection([ 0, 1, 0 ], 0, [ 0, 1, 0 ], 3),
        sWaitForTextToolbarAndAssertState(tinyUi, true, false, false, false, false, false),
        tinyApis.sSetSelection([ 0, 3, 0 ], 1, [ 0, 3, 0 ], 4),
        sWaitForTextToolbarAndAssertState(tinyUi, false, true, false, false, false, false),
        tinyApis.sSetSelection([ 1, 0 ], 0, [ 1, 0 ], 1),
        sWaitForTextToolbarAndAssertState(tinyUi, false, false, false, false, false, true)
      ]),
      Log.stepsAsStep('TBA', 'Image selection toolbar', [
        sSetImageAndAssertToolbarState(tinyApis, tinyUi, false),
        sSetImageAndAssertToolbarState(tinyApis, tinyUi, false, Alignment.Left),
        sSetImageAndAssertToolbarState(tinyApis, tinyUi, false, Alignment.Center),
        sSetImageAndAssertToolbarState(tinyApis, tinyUi, false, Alignment.Right),
        sSetImageAndAssertToolbarState(tinyApis, tinyUi, true),
        sSetImageAndAssertToolbarState(tinyApis, tinyUi, true, Alignment.Left),
        sSetImageAndAssertToolbarState(tinyApis, tinyUi, true, Alignment.Center),
        sSetImageAndAssertToolbarState(tinyApis, tinyUi, true, Alignment.Right)
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'quickbars link',
    inline: true,
    toolbar: false,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
