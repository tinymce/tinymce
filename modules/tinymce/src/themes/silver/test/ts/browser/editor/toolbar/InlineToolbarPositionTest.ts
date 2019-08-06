import { Assertions, FocusTools, GeneralSteps, Log, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Attr, Body, Css, Element, Scroll } from '@ephox/sugar';

import Theme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('Inline Editor Toolbar Position test', (success, failure) => {
  Theme();

  const sAssertAbsolutePos = (container: Element) => Waiter.sTryUntil('Wait for toolbar to be absolute', Step.sync(() => {
    Assertions.assertEq(`Container should be absolutely positioned`, 'absolute', Css.get(container, 'position'));
    const top = Css.get(container, 'top');
    const left = Css.get(container, 'left');
    Assertions.assertEq(`Container top position (${top}) should be an integer`, true, top.indexOf('.') === -1);
    Assertions.assertEq(`Container left position (${left}) should be 0px`, '0px', left);
  }), 100, 1000);

  const sAssertDockedPos = (container: Element) => Waiter.sTryUntil('Wait for toolbar to be docked', Step.sync(() => {
    Assertions.assertEq(`Container should be docked (fixed position)`, 'fixed', Css.get(container, 'position'));
    const top = Css.get(container, 'top');
    const left = Css.get(container, 'left');
    const prevTop = Attr.get(container, 'data-dock-top');
    Assertions.assertEq(`Container top position (${top}) should be 0px`, '0px', top);
    Assertions.assertEq(`Container left position (${left}) should be 0px`, '0px', left);
    Assertions.assertEq(`Container previous top position (${prevTop}) should be an integer`, true, prevTop.indexOf('.') === -1);
  }), 100, 1000);

  const sScrollToElement = (contentAreaContainer: Element, selector: string) => GeneralSteps.sequence([
    Step.sync(() => {
      const elm = UiFinder.findIn(contentAreaContainer, selector).getOrDie();
      Scroll.intoView(elm, false);
    })
  ]);

  const sScrollToElementAndActivate = (tinyApis, contentAreaContainer: Element, selector: string) => Step.label('Activate editor', GeneralSteps.sequence([
    sScrollToElement(contentAreaContainer, selector),
    tinyApis.sSelect(selector, []),
    tinyApis.sFocus,
    tinyApis.sNodeChanged,
    UiFinder.sWaitForVisible('Wait for editor to be visible', Body.body(), '.tox.tox-tinymce-inline')
  ]));

  const sDeactivateEditor = (editor: Editor) => Step.label('Deactivate editor', GeneralSteps.sequence([
    FocusTools.sSetFocus('Focus outside editor', Element.fromDom(document.documentElement), 'div.prepend-content'),
    Step.sync(() => {
      editor.fire('focusout');
    }),
    UiFinder.sWaitForHidden('Wait for editor to hide', Body.body(), '.tox.tox-tinymce-inline')
  ]));

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
      const uiContainer = Element.fromDom(editor.getContainer());
      const contentAreaContainer = Element.fromDom(editor.getContentAreaContainer());

      const tinyApis = TinyApis(editor);
      const content = '<p>START CONTENT</p>' + Arr.range(98, (i) => i === 49 ? '<p>STOP AND CLICK HERE</p>' : '<p>Some content...</p>').join('\n') + '<p>END CONTENT</p>';
      const prependContent = document.createElement('div');
      prependContent.innerHTML = '<div class="prepend-content" tabindex="0">' + Arr.range(20, () => '<p>Prepended content</p>').join('\n') + '</div>';

      Pipeline.async({ }, [
        Step.sync(() => {
          contentAreaContainer.dom().parentNode.insertBefore(prependContent, contentAreaContainer.dom());
        }),
        tinyApis.sSetContent(content),
        Log.stepsAsStep('TINY-3621', 'Select item at the top of the content (absolute position)', [
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, ':first-child'),
          sAssertAbsolutePos(uiContainer),
          sDeactivateEditor(editor)
        ]),
        Log.stepsAsStep('TINY-3621', 'Select item in the middle of the content (docked position)', [
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, 'p:contains("STOP AND CLICK HERE")'),
          sAssertDockedPos(uiContainer),
          sDeactivateEditor(editor)
        ]),
        Log.stepsAsStep('TINY-3621', 'Select item at the bottom of the content (docked position)', [
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, ':last-child'),
          sAssertDockedPos(uiContainer),
          sDeactivateEditor(editor)
        ]),
        Log.stepsAsStep('TINY-3621', 'Select item at the top of the content and scroll to middle and back', [
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, ':first-child'),
          sAssertAbsolutePos(uiContainer),
          sScrollToElement(contentAreaContainer, 'p:contains("STOP AND CLICK HERE")'),
          sAssertDockedPos(uiContainer),
          sScrollToElement(contentAreaContainer, ':first-child'),
          sAssertAbsolutePos(uiContainer),
          sDeactivateEditor(editor)
        ]),
        Step.sync(() => {
          contentAreaContainer.dom().parentNode.removeChild(prependContent);
        })
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      inline: true,
      menubar: false,
      base_url: '/project/tinymce/js/tinymce',
    },
    () => {
      success();
    },
    failure
  );
});
