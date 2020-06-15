import {
  ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Log, NamedChain, Pipeline, Step, UiFinder, Waiter
} from '@ephox/agar';
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
    Assertions.assertEq('Container should be statically positioned', 'static', Css.get(container, 'position'));
  }));

  const sAssertAbsolutePos = (container: Element, contentArea: Element, position: 'above' | 'below') => Waiter.sTryUntil('Wait for toolbar to be absolute', Step.sync(() => {
    const left = Css.get(container, 'left');
    const top = parseInt(Strings.removeTrailing(Css.get(container, 'top'), 'px'), 10);

    const containerAreaBounds = Boxes.box(contentArea);
    const assertTop = position === 'above' ?
      containerAreaBounds.y - container.dom().clientHeight :
      containerAreaBounds.bottom;

    Assertions.assertEq('Container should be absolutely positioned', 'absolute', Css.get(container, 'position'));
    Assertions.assertEq(`Container left position (${left}) should be 0px`, '0px', left);
    Assertions.assertEq(`Container should be positioned ${position} contentarea, ${top}px should be ~${assertTop}px`, true, Math.abs(top - assertTop) < 3);
  }));

  const sAssertDockedPos = (header: Element, position: 'top' | 'bottom') => Waiter.sTryUntil('Wait for toolbar to be docked', Step.sync(() => {
    const left = Css.get(header, 'left');
    const top = parseInt(Strings.removeTrailing(Css.get(header, position), 'px'), 10);

    const assertTop = 0;

    Assertions.assertEq('Header container should be docked (fixed position)', 'fixed', Css.get(header, 'position'));
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
    sActiveEditor(tinyApis)
  ]));

  const sActiveEditor = (tinyApis: TinyApis) => GeneralSteps.sequence([
    tinyApis.sFocus(),
    tinyApis.sNodeChanged(),
    UiFinder.sWaitForVisible('Wait for editor to be visible', Body.body(), '.tox-editor-header')
  ]);

  const sDeactivateEditor = (editor: Editor) => Step.label('Deactivate editor', GeneralSteps.sequence([
    FocusTools.sSetFocus('Focus outside editor', Element.fromDom(document.documentElement), 'div.scroll-div'),
    Step.sync(() => {
      editor.fire('focusout');
    }),
    UiFinder.sWaitForHidden('Wait for editor to hide', Body.body(), '.tox.tox-tinymce-inline')
  ]));

  const setupPageScroll = (contentAreaContainer: Element) => {
    const createScrollDiv = () => Element.fromHtml<HTMLElement>('<div tabindex="0" class="scroll-div" style="height: 500px;"></div>');

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

  const cTest = (getSteps: (data: Data) => Step<any, any>[]) => Chain.runStepsOnValue((editor: Editor) => {
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
        contentAreaContainer
      }),
      Step.sync(() => {
        teardownScroll();
      })
    ];
  });

  const settings = {
    theme: 'silver',
    inline: true,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce'
  };

  const getTopPositionSteps = ({
    editor,
    tinyApis,
    header,
    container,
    contentAreaContainer
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
  ];

  const getBottomPositionSteps = ({
    editor,
    tinyApis,
    header,
    container,
    contentAreaContainer
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
  ];

  Pipeline.async({}, [
    Log.chainsAsStep('TINY-3621', 'Test inline toolbar position with toolbar_location: "top"', [
      McEditor.cFromSettings({
        ...settings,
        toolbar_location: 'top'
      }),
      cTest((data) => getTopPositionSteps(data)),
      McEditor.cRemove
    ]),

    Log.chainsAsStep('TINY-3621', 'Test inline toolbar position with toolbar_location: "bottom"', [
      McEditor.cFromSettings({
        ...settings,
        toolbar_location: 'bottom'
      }),
      cTest((data) => getBottomPositionSteps(data)),
      McEditor.cRemove
    ]),

    Log.chainsAsStep('TINY-3161', 'Test inline toolbar position with toolbar_location: "auto"', [
      McEditor.cFromSettings({
        ...settings,
        toolbar_location: 'auto'
      }),
      cTest(({
        editor,
        tinyApis,
        header,
        container,
        contentAreaContainer
      }) => [
        // Should be the same as top in most cases, it should only switch to the bottom when there's no room
        // in the document to show above the contentAreaContainer which we model here by using a fixed position container
        ...getTopPositionSteps({ editor, tinyApis, header, container, contentAreaContainer }),
        Log.stepsAsStep('TINY-3161', 'Select item at the top of content, when there\'s no room to render above (docked position)', [
          Step.sync(() => {
            const editorBody = Element.fromDom(editor.getBody());
            Css.set(editorBody, 'position', 'absolute');
            Css.set(editorBody, 'top', '0');
            Css.set(editorBody, 'left', '0');
          }),
          sScrollToElementAndActivate(tinyApis, contentAreaContainer, ':first-child'),
          sAssertAbsolutePos(container, contentAreaContainer, 'below'),
          sAssertDockedPos(header, 'bottom'),
          sScrollToElement(contentAreaContainer, 'p:contains("STOP AND CLICK HERE")'),
          sAssertDockedPos(header, 'bottom'),
          sScrollToElement(contentAreaContainer, ':last-child', true),
          sAssertAbsolutePos(container, contentAreaContainer, 'above'),
          sAssertDockedPos(header, 'top'),
          sDeactivateEditor(editor),
          Step.sync(() => {
            const editorBody = Element.fromDom(editor.getBody());
            Css.remove(editorBody, 'position');
            Css.remove(editorBody, 'top');
          })
        ])
      ]),
      McEditor.cRemove
    ]),

    Log.chainsAsStep('TINY-5955', 'Test fixed toolbar position', [
      NamedChain.asChain([
        NamedChain.write('toolbar', Chain.mapper(() => {
          const toolbar = Element.fromHtml('<div id="toolbar"></div>');
          Insert.append(Body.body(), toolbar);
          return toolbar;
        })),
        NamedChain.write('editor', McEditor.cFromSettings({
          ...settings,
          fixed_toolbar_container: '#toolbar'
        })),
        NamedChain.read('editor', cTest((data) => {
          // Add a margin to offset the regular max-width of the toolbar
          Css.set(data.contentAreaContainer, 'margin-left', '100px');

          return [
            Log.stepsAsStep('TINY-5955', 'Activate and check toolbar styles', [
              sActiveEditor(data.tinyApis),
              sAssertStaticPos(data.header),
              Assertions.sAssertStructure('Assert container isn\'t position absolute', ApproxStructure.build((s, str) =>
                s.element('div', {
                  styles: {
                    position: str.none(),
                    top: str.none(),
                    left: str.none()
                  }
                })
              ), data.container),
              Assertions.sAssertStructure('Assert no header width or max-width set', ApproxStructure.build((s, str) =>
                s.element('div', {
                  styles: {
                    'width': str.none(),
                    'max-width': str.none()
                  }
                })
              ), data.header),
              sDeactivateEditor(data.editor)
            ])
          ];
        })),
        NamedChain.read('editor', McEditor.cRemove),
        NamedChain.read('toolbar', Chain.op((toolbar) => {
          Remove.remove(toolbar);
        }))
      ])
    ])
  ], success, failure);
});
