import { ApproxStructure, Assertions, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import Plugin from 'tinymce/plugins/quickbars/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

enum Alignment {
  Left = 'left',
  Right = 'right',
  Center = 'center'
}

describe('browser.tinymce.plugins.quickbars.SelectionToolbarTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'quickbars link',
    inline: true,
    toolbar: false,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme, LinkPlugin, Plugin ], true);

  const imgSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  const pAssertButtonToggledState = async (name: string, state: boolean) => {
    const button = await UiFinder.pWaitForVisible('Wait for button', SugarBody.body(), `.tox-toolbar button[aria-label="${name}"]`);
    await Waiter.pTryUntil('Wait for toolbar button state', () => {
      return Assertions.assertStructure('', ApproxStructure.build((s, _str, arr) => s.element('button', {
        classes: [ state ? arr.has('tox-tbtn--enabled') : arr.not('tox-tbtn--enabled') ]
      })), button);
    });
  };

  const pWaitForTextToolbarAndAssertState = async (bold: boolean, italic: boolean, heading2: boolean, heading3: boolean, link: boolean, blockquote: boolean) => {
    await pAssertButtonToggledState('Bold', bold);
    await pAssertButtonToggledState('Italic', italic);
    await pAssertButtonToggledState('Link', link);
    await pAssertButtonToggledState('Heading 2', heading2);
    await pAssertButtonToggledState('Heading 3', heading3);
    await pAssertButtonToggledState('Blockquote', blockquote);
  };

  const pSetImageAndAssertToolbarState = async (editor: Editor, useFigure: boolean, alignment?: Alignment) => {
    let attrs: string;
    let imageHtml: string;
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

    editor.setContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p>' + imageHtml);
    TinySelections.select(editor, useFigure ? 'figure' : 'img', []);
    await pAssertButtonToggledState('Align left', alignment === Alignment.Left);
    await pAssertButtonToggledState('Align center', alignment === Alignment.Center);
    await pAssertButtonToggledState('Align right', alignment === Alignment.Right);
  };

  it.skip('TBA: Text selection toolbar', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p><blockquote><p>Some quoted content</p></blockquote>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    await pWaitForTextToolbarAndAssertState(false, false, false, false, false, false);
    TinySelections.setSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 3);
    await pWaitForTextToolbarAndAssertState(true, false, false, false, false, false);
    TinySelections.setSelection(editor, [ 0, 3, 0 ], 1, [ 0, 3, 0 ], 4);
    await pWaitForTextToolbarAndAssertState(false, true, false, false, false, false);
    TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 1);
    await pWaitForTextToolbarAndAssertState(false, false, false, false, false, true);
  });

  it('TBA: Image selection toolbar', async () => {
    const editor = hook.editor();
    await pSetImageAndAssertToolbarState(editor, false);
    await pSetImageAndAssertToolbarState(editor, false, Alignment.Left);
    await pSetImageAndAssertToolbarState(editor, false, Alignment.Center);
    await pSetImageAndAssertToolbarState(editor, false, Alignment.Right);
    await pSetImageAndAssertToolbarState(editor, true);
    await pSetImageAndAssertToolbarState(editor, true, Alignment.Left);
    await pSetImageAndAssertToolbarState(editor, true, Alignment.Center);
    await pSetImageAndAssertToolbarState(editor, true, Alignment.Right);
  });
});

// UnitTest.asynctest('browser.tinymce.plugins.quickbars.SelectionToolbarTest', (success, failure) => {

//   const imgSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

//   Theme();
//   LinkPlugin();
//   QuickbarsPlugin();



//   const sAssertButtonToggledState = (name: string, state: boolean) => Chain.asStep(SugarBody.body(), [
//     Chain.control(
//       Chain.fromChains( [
//         UiFinder.cFindIn(`.tox-toolbar button[aria-label="${name}"]`),
//         Assertions.cAssertStructure(`Check ${name} button is ${state ? 'active' : 'inactive'}`,
//           ApproxStructure.build((s, str, arr) => s.element('button', {
//             classes: [ state ? arr.has('tox-tbtn--enabled') : arr.not('tox-tbtn--enabled') ]
//           }))
//         )
//       ]),
//       Guard.tryUntil('wait for toolbar button state')
//     )
//   ]);

//   const sWaitForTextToolbarAndAssertState = (tinyUi: TinyUi, bold: boolean, italic: boolean, heading2: boolean, heading3: boolean, link: boolean, blockquote: boolean) => GeneralSteps.sequence([
//     tinyUi.sWaitForUi('wait for text selection toolbar to show', '.tox-toolbar'),
//     sAssertButtonToggledState('Bold', bold),
//     sAssertButtonToggledState('Italic', italic),
//     sAssertButtonToggledState('Link', link),
//     sAssertButtonToggledState('Heading 2', heading2),
//     sAssertButtonToggledState('Heading 3', heading3),
//     sAssertButtonToggledState('Blockquote', blockquote)
//   ]);

//   const sSetImageAndAssertToolbarState = (tinyApis: TinyApis, tinyUi: TinyUi, useFigure: boolean, alignment?: Alignment) => {
//     let attrs, imageHtml;
//     if (alignment === undefined) {
//       attrs = useFigure ? 'class="image"' : '';
//     } else if (alignment === Alignment.Center) {
//       attrs = useFigure ? `class="image align-${alignment}"` : 'style="margin-left: auto; margin-right: auto; display: block;"';
//     } else {
//       attrs = useFigure ? `class="image align-${alignment}"` : `style="float: ${alignment};"`;
//     }

//     if (useFigure) {
//       imageHtml = `<figure ${attrs} contenteditable="false"><img src="${imgSrc}"><figcaption contenteditable="true">Caption</figcaption></figure>`;
//     } else {
//       imageHtml = `<p><img src="${imgSrc}" ${attrs}></p>`;
//     }

//     return GeneralSteps.sequence([
//       tinyApis.sSetContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p>' + imageHtml),
//       tinyApis.sSelect(useFigure ? 'figure' : 'img', []),
//       tinyUi.sWaitForUi('wait for image selection toolbar to show', '.tox-toolbar'),
//       sAssertButtonToggledState('Align left', alignment === Alignment.Left),
//       sAssertButtonToggledState('Align center', alignment === Alignment.Center),
//       sAssertButtonToggledState('Align right', alignment === Alignment.Right)
//     ]);
//   };

//   TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
//     const tinyApis = TinyApis(editor);
//     const tinyUi = TinyUi(editor);

//     Pipeline.async({}, [
//       tinyApis.sFocus(),
//       Log.stepsAsStep('TBA', 'Text selection toolbar', [
//         tinyApis.sSetContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p><blockquote><p>Some quoted content</p></blockquote>'),
//         TinySelections.setSelection([ 0, 0 ], 0, [ 0, 0 ], 4),
//         sWaitForTextToolbarAndAssertState(tinyUi, false, false, false, false, false, false),
//         TinySelections.setSelection([ 0, 1, 0 ], 0, [ 0, 1, 0 ], 3),
//         sWaitForTextToolbarAndAssertState(tinyUi, true, false, false, false, false, false),
//         TinySelections.setSelection([ 0, 3, 0 ], 1, [ 0, 3, 0 ], 4),
//         sWaitForTextToolbarAndAssertState(tinyUi, false, true, false, false, false, false),
//         TinySelections.setSelection([ 1, 0 ], 0, [ 1, 0 ], 1),
//         sWaitForTextToolbarAndAssertState(tinyUi, false, false, false, false, false, true)
//       ]),
//       Log.stepsAsStep('TBA', 'Image selection toolbar', [
//         sSetImageAndAssertToolbarState(tinyApis, tinyUi, false),
//         sSetImageAndAssertToolbarState(tinyApis, tinyUi, false, Alignment.Left),
//         sSetImageAndAssertToolbarState(tinyApis, tinyUi, false, Alignment.Center),
//         sSetImageAndAssertToolbarState(tinyApis, tinyUi, false, Alignment.Right),
//         sSetImageAndAssertToolbarState(tinyApis, tinyUi, true),
//         sSetImageAndAssertToolbarState(tinyApis, tinyUi, true, Alignment.Left),
//         sSetImageAndAssertToolbarState(tinyApis, tinyUi, true, Alignment.Center),
//         sSetImageAndAssertToolbarState(tinyApis, tinyUi, true, Alignment.Right)
//       ])
//     ], onSuccess, onFailure);
//   }, {
//     plugins: 'quickbars link',
//     inline: true,
//     toolbar: false,
//     menubar: false,
//     base_url: '/project/tinymce/js/tinymce'
//   }, success, failure);
// });
