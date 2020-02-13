import { Log, Pipeline, Chain, UiFinder, FocusTools, Keyboard, Keys, GeneralSteps, Waiter, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyApis, TinyDom, TinyLoader, TinyUi, UiChains} from '@ephox/mcagar';

import ImagePlugin from 'tinymce/plugins/image/Plugin';
import ImageToolsPlugin from 'tinymce/plugins/imagetools/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { Element } from '@ephox/sugar';
import ImageUtils from '../module/test/ImageUtils';
import ImageOps from '../module/test/ImageOps';
import { Option } from '@ephox/katamari';

UnitTest.asynctest('browser.tinymce.plugins.imagetools.ContextToolbarTest', (success, failure) => {
  Theme();
  ImagePlugin();
  ImageToolsPlugin();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);
    const doc = Element.fromDom(document);
    const imgOps = ImageOps(editor);

    const srcUrl = '/project/tinymce/src/plugins/imagetools/demo/img/dogleft.gif';

    const sOpenContextToolbar = (source) => {
      return GeneralSteps.sequence([
        ImageUtils.sLoadImage(editor, source, {width: 460, height: 598}),
        tinyApis.sSelect('img', []),
        tinyUi.sWaitForUi('Wait for table context toolbar', '.tox-toolbar button[aria-label="Rotate counterclockwise"]'),
      ]);
    };

    // Use keyboard shortcut ctrl+F9 to navigate to the context toolbar
    const sPressKeyboardShortcutKey = Keyboard.sKeydown(Element.fromDom(editor.getDoc()), 120, { ctrl: true });
    const sPressRightArrowKey = Keyboard.sKeydown(doc, Keys.right(), { });

    // Assert focus is on the expected toolbar button
    const sAssertFocusOnItem = (label, selector) => {
      return FocusTools.sTryOnSelector(`Focus should be on: ${label}`, doc, selector);
    };

    const sWaitForDialogOpenThenCloseDialog = (childSelector: string) => {
      const selector = 'div[role="dialog"]';
      return GeneralSteps.sequence([
        Chain.asStep(editor, [
          tinyUi.cWaitForPopup('wait for dialog', `div.tox-dialog__title`),
          tinyUi.cWaitForPopup('wait for dialog child element', childSelector),
          UiChains.cCloseDialog(selector)
        ]),
        Waiter.sTryUntil('Wait for dialog to close', UiFinder.sNotExists(TinyDom.fromDom(document.body), selector), 50, 5000)
      ]);
    };

    const getImageSrc = () => {
      const dom = editor.dom;
      const element = dom.getParent(editor.selection.getStart(), 'img');
      return dom.getAttrib(element, 'src');
    };

    const cGetImageSrc = Chain.injectThunked(getImageSrc);

    const cClickContextToolbarButton = (label) => {
      return Chain.fromParent(tinyUi.cWaitForPopup('wait for Imagetools toolbar', '.tox-pop__dialog div'), [
        imgOps.cClickToolbarButton(label)
      ]);
    };

    const sAssertImageFlip = (label) => {
      return Chain.asStep({editor}, [
        Chain.label(`Assert ${label}`,
        NamedChain.asChain([
          NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
          Chain.label('Store img src before flip', NamedChain.write('srcBeforeFlip', cGetImageSrc)),
          Chain.label('Flip image', NamedChain.read('editor', cClickContextToolbarButton(label))),
          Waiter.cTryUntilPredicate('Wait for image to flip', (state: Record<string, any>) => {
            const oldSrc = Option.from(state.srcBeforeFlip).getOrDie();
            const newSrc = getImageSrc();
            return newSrc !== oldSrc;
          })
        ]))
      ]);
    };

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TBA', 'ImageTools: context toolbar keyboard navigation test', [
        sOpenContextToolbar(srcUrl),
        sPressKeyboardShortcutKey,
        sAssertFocusOnItem('Rotate counterclockwise button', 'button[aria-label="Rotate counterclockwise"]'),
        sPressRightArrowKey,
        sAssertFocusOnItem('Rotate clockwise button', 'button[aria-label="Rotate clockwise"]'),
        sPressRightArrowKey,
        sAssertFocusOnItem('Flip vertically button', 'button[aria-label="Flip vertically"]'),
        sPressRightArrowKey,
        sAssertFocusOnItem('Flip horizontally button', 'button[aria-label="Flip horizontally"]'),
        sPressRightArrowKey,
        sAssertFocusOnItem('Edit image button', 'button[aria-label="Edit image"]'),
        sPressRightArrowKey,
        sAssertFocusOnItem('Image options button', 'button[aria-label="Image options"]'),
        sPressRightArrowKey,
        sAssertFocusOnItem('Rotate counterclockwise button', 'button[aria-label="Rotate counterclockwise"]')
      ]),
      Log.stepsAsStep('TBA', 'ImageTools: context toolbar functionality test', [
        sOpenContextToolbar(srcUrl),
        imgOps.sExecToolbar('Rotate counterclockwise'),
        Waiter.sTryUntil('Wait for image to be rotated', tinyApis.sAssertContentPresence({ 'img[width="598"][height="460"]': 1 })),
        imgOps.sExecToolbar('Rotate clockwise'),
        Waiter.sTryUntil('Wait for image to be rotated', tinyApis.sAssertContentPresence({ 'img[width="460"][height="598"]': 1 })),
        sAssertImageFlip('Flip horizontally'),
        sAssertImageFlip('Flip vertically'),
        Chain.asStep({}, [cClickContextToolbarButton('Edit image')]),
        /* Previously there was a fixed wait here, waiting for the dialog to display.
        Without this wait, you can't see the dialog if you're watching the test.
        However, the below DOM assertions insist that the dialog is, indeed, there.
        */
        sWaitForDialogOpenThenCloseDialog('div.tox-image-tools__image>img'),
        Chain.asStep({}, [cClickContextToolbarButton('Image options')]),
        sWaitForDialogOpenThenCloseDialog('div.tox-form'),
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: 'image imagetools',
    base_url: '/project/tinymce/js/tinymce',
    height: 900
  }, success, failure);
});
