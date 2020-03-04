import { Assertions, Chain, FocusTools, GeneralSteps, Log, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { Boxes } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { document, HTMLElement } from '@ephox/dom-globals';
import { Arr, Strings } from '@ephox/katamari';
import { Editor as McEditor, TinyApis } from '@ephox/mcagar';
import { Body, Css, Element, Insert, Remove, SelectorFind } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Inline Editor Toolbar Position test', (success, failure) => {
  Theme();

  const sAssertStaticPos = (container: Element) => Waiter.sTryUntil('Wait for toolbar to be absolute', Step.sync(() => {
    Assertions.assertEq(`Container should be statically positioned`, 'static', Css.get(container, 'position'));
  }));

  const sAssertAbsolutePos = (container: Element, contentArea: Element, position: 'above' | 'below') => Waiter.sTryUntil('Wait for toolbar to be absolute', Step.sync(() => {
    const left = Css.get(container, 'left');
    const top = parseInt(Strings.removeTrailing(Css.get(container, 'top'), 'px'), 10);

    const containerAreaBounds = Boxes.box(contentArea);
    const assertTop = position === 'above' ?
      containerAreaBounds.y() - container.dom().clientHeight :
      containerAreaBounds.bottom();

    Assertions.assertEq(`Container should be absolutely positioned`, 'absolute', Css.get(container, 'position'));
    Assertions.assertEq(`Container left position (${left}) should be 0px`, '0px', left);
    Assertions.assertEq(`Container should be positioned ${position} contentarea, ${top}px should be ~${assertTop}px`, true, Math.abs(top - assertTop) < 3);
  }));

  const sAssertDockedPos = (header: Element, position: 'top' | 'bottom') => Waiter.sTryUntil('Wait for toolbar to be docked', Step.sync(() => {
    const left = Css.get(header, 'left');
    const top = parseInt(Strings.removeTrailing(Css.get(header, position), 'px'), 10);

    const assertTop = 0;

    Assertions.assertEq(`Header container should be docked (fixed position)`, 'fixed', Css.get(header, 'position'));
    Assertions.assertEq(`Header container left position (${left}) should be 0px`, '0px', left);
    Assertions.assertEq(`Header container should be docked to ${position}, ${top}px should be ~${assertTop}px`, true, Math.abs(top - assertTop) < 3);
  }));

  const sScrollToElement = (contentAreaContainer: Element, selector: string, alignWindowBottom = false) => Step.sync(() => {
    const elm = UiFinder.findIn(contentAreaContainer, selector).getOrDie();
    elm.dom().scrollIntoView(alignWindowBottom);
  });

  const sScrollToElementAndActivate = (tinyApis: TinyApis, element: Element, selector: string, alignWindowBottom = false) => Step.label('Activate editor', GeneralSteps.sequence([
    sScrollToElement(element, selector, alignWindowBottom),
    tinyApis.sSelect(selector, []),
    tinyApis.sFocus(),
    tinyApis.sNodeChanged(),
    UiFinder.sWaitForVisible('Wait for editor to be visible', Body.body(), '.tox-editor-header')
  ]));

  const sDeactivateEditor = (editor: Editor) => Step.label('Deactivate editor', GeneralSteps.sequence([
    FocusTools.sSetFocus('Focus outside editor', Element.fromDom(document.documentElement), 'div.scroll-div'),
    Step.sync(() => {
      editor.fire('focusout');
    }),
    UiFinder.sWaitForHidden('Wait for editor to hide', Body.body(), '.tox.tox-tinymce-inline')
  ]));

  const setupPageScroll = (contentAreaContainer: Element) => {
    const createScrollDiv = () => {
      return Element.fromHtml<HTMLElement>('<div tabindex="0" class="scroll-div" style="height: 500px;"></div>');
    };

    const divBefore = createScrollDiv();
    const divAfter = createScrollDiv();

    Insert.after(contentAreaContainer, divBefore);
    Insert.before(contentAreaContainer, divAfter);

    return () => {
      Remove.remove(divBefore);
      Remove.remove(divAfter);
    };
  };

  interface Data {
    editor: Editor;
    tinyApis: TinyApis;
    header: Element;
    container: Element;
    contentAreaContainer: Element;
  }

  const cTest = (getSteps: (data: Data) => Step<any, any>[]) => {
    return Chain.runStepsOnValue((editor: Editor) => {
      const tinyApis = TinyApis(editor);
      const container = Element.fromDom(editor.getContainer());
      const contentAreaContainer = Element.fromDom(editor.getContentAreaContainer());
      const header = SelectorFind.descendant(Element.fromDom(editor.getContainer()), '.tox-editor-header').getOr(container);
      editor.setContent('<p>START CONTENT</p>' + Arr.range(98, (i) => i === 49 ? '<p>STOP AND CLICK HERE</p>' : '<p>Some content...</p>').join('\n') + '<p>END CONTENT</p>');

      let teardownScroll: () => void;

      return [
        Step.sync(() => {
          teardownScroll = setupPageScroll(contentAreaContainer);
        }),
        ...getSteps({
          editor,
          tinyApis,
          header,
          container,
          contentAreaContainer,
        }),
        Step.sync(() => {
          teardownScroll();
        }),
      ];
    });
  };

  const settings = {
    theme: 'silver',
    inline: true,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce',
  };

  Pipeline.async({}, [
    Log.chainsAsStep('', 'Test inline toolbar position with toolbar_location: "top"', [
      McEditor.cFromSettings(settings),
      cTest(({
        editor,
        tinyApis,
        header,
        container,
        contentAreaContainer,
      }) => [
        Log.stepsAsStep('TINY-3621', 'Select item at the start of the content (absolute position)', [
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, ':first-child'),
          sAssertAbsolutePos(container, contentAreaContainer, 'above'),
          sAssertStaticPos(header),
          sDeactivateEditor(editor)
        ]),
        Log.stepsAsStep('TINY-3621', 'Select item in the middle of the content (docked position) and scroll back to top', [
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, 'p:contains("STOP AND CLICK HERE")'),
          sAssertDockedPos(header, 'top'),
          sScrollToElement(contentAreaContainer, ':first-child'),
          sAssertStaticPos(header),
          sDeactivateEditor(editor)
        ]),
        Log.stepsAsStep('TINY-3621', 'Select item at the bottom of the content (docked position) and scroll back to top', [
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, ':last-child'),
          sAssertDockedPos(header, 'top'),
          sScrollToElement(contentAreaContainer, ':first-child'),
          sAssertStaticPos(header),
          sDeactivateEditor(editor)
        ]),
        Log.stepsAsStep('TINY-3621', 'Select item at the top of the content and scroll to middle and back', [
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, ':first-child'),
          sAssertStaticPos(header),
          sScrollToElement(contentAreaContainer, 'p:contains("STOP AND CLICK HERE")'),
          sAssertDockedPos(header, 'top'),
          sScrollToElement(contentAreaContainer, ':first-child'),
          sAssertStaticPos(header),
          sDeactivateEditor(editor)
        ]),
        Log.stepsAsStep('TINY-4530', 'Select item at the start of the content and change format (absolute position)', [
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, ':first-child'),
          sAssertAbsolutePos(container, contentAreaContainer, 'above'),
          sAssertStaticPos(header),
          tinyApis.sExecCommand('mceToggleFormat', 'div'),
          sAssertAbsolutePos(container, contentAreaContainer, 'above'),
          sDeactivateEditor(editor)
        ])
      ]),
      McEditor.cRemove
    ]),

    Log.chainsAsStep('', 'Test inline toolbar position with toolbar_location: "bottom"', [
      McEditor.cFromSettings({
        ...settings,
        toolbar_location: 'bottom'
      }),
      cTest(({
        editor,
        tinyApis,
        header,
        container,
        contentAreaContainer,
      }) => [
        Log.stepsAsStep('TINY-3621', 'Select item at the start of the content (docked position) and scroll to bottom', [
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, ':first-child'),
          sAssertDockedPos(header, 'bottom'),
          sScrollToElement(contentAreaContainer, ':last-child', true),
          sAssertStaticPos(header),
          sDeactivateEditor(editor)
        ]),
        Log.stepsAsStep('TINY-3621', 'Select item in the middle of the content (docked position) and scroll to bottom', [
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, 'p:contains("STOP AND CLICK HERE")'),
          sAssertDockedPos(header, 'bottom'),
          sScrollToElement(contentAreaContainer, ':last-child', true),
          sAssertStaticPos(header),
          sDeactivateEditor(editor)
        ]),
        Log.stepsAsStep('TINY-3621', 'Select item at the bottom of the content (absolute position)', [
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, ':last-child', true),
          sAssertAbsolutePos(container, contentAreaContainer, 'below'),
          sAssertStaticPos(header),
          sDeactivateEditor(editor)
        ]),
        Log.stepsAsStep('TINY-3621', 'Select item at the bottom of the content and scroll to middle and back', [
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, ':last-child', true),
          sAssertStaticPos(header),
          sScrollToElement(contentAreaContainer, 'p:contains("STOP AND CLICK HERE")'),
          sAssertDockedPos(header, 'bottom'),
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, ':last-child', true),
          sAssertStaticPos(header),
          sDeactivateEditor(editor)
        ]),
        Log.stepsAsStep('TINY-4530', 'Select item at the bottom of the content and change format (absolute position)', [
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, ':last-child', true),
          sAssertAbsolutePos(container, contentAreaContainer, 'below'),
          sAssertStaticPos(header),
          tinyApis.sExecCommand('mceToggleFormat', 'div'),
          sAssertAbsolutePos(container, contentAreaContainer, 'below'),
          sDeactivateEditor(editor)
        ])
      ]),
      McEditor.cRemove
    ]),
  ], success, failure);
});
