import { Assertions, Chain, GeneralSteps, Log, Mouse, NamedChain, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Cell, Obj, Strings } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Attribute, Css, Hierarchy, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.dom.ControlSelectionTest', function (success, failure) {
  Theme();
  const eventCounter = Cell<Record<string, number>>({ });

  const sContextMenuClickInMiddleOf = (editor: Editor, elementPath: number[]) => Step.sync(() => {
    const element = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), elementPath).getOrDie().dom as HTMLElement;
    const target = element as EventTarget;
    const rect = element.getBoundingClientRect();
    const clientX = (rect.left + rect.width / 2), clientY = (rect.top + rect.height / 2);
    editor.fire('mousedown', { target, clientX, clientY, button: 2 } as MouseEvent);
    editor.fire('mouseup', { target, clientX, clientY, button: 2 } as MouseEvent);
    editor.fire('contextmenu', { target, clientX, clientY, button: 2 } as PointerEvent);
  });

  const sResetEventCounter = Step.sync(() => eventCounter.set({ }));

  const sAssertEventCount = (type: string, count: number) => Step.sync(() => {
    Assert.eq(`Check ${type} event count is ${count}`, count, Obj.get(eventCounter.get(), type.toLowerCase()).getOr(0));
  });

  const sResizeAndAssertEventCount = (editorBody: SugarElement, resizeSelector: string, delta: number, expectedCount: number) => GeneralSteps.sequence([
    Chain.asStep(editorBody, [
      UiFinder.cWaitForVisible('Wait for resize handlers to show', resizeSelector),
      Mouse.cMouseDown
    ]),
    sAssertEventCount('ObjectResizeStart', expectedCount - 1),
    sAssertEventCount('ObjectResized', expectedCount - 1),
    Chain.asStep(editorBody, [
      UiFinder.cFindIn(resizeSelector),
      Mouse.cMouseMoveTo(delta, delta),
      Mouse.cMouseUp
    ]),
    sAssertEventCount('ObjectResizeStart', expectedCount),
    sAssertEventCount('ObjectResized', expectedCount)
  ]);

  const cGetElementDimensions = (name: string) => Chain.mapper((element: SugarElement): number =>
    Css.getRaw(element, name).orThunk(() => Attribute.getOpt(element, name))
      .map((v) => parseInt(v, 10))
      .getOr(0));

  const cAssertElementDimension = (label: string, expectedDimension: number) => Chain.op((dimension: number) => {
    Assertions.assertEq(label + ` ${dimension}px ~= ${expectedDimension}px`, true, Math.abs(dimension - expectedDimension) < 3);
  });

  const cGetAndAssertDimensions = (width: number, height: number) => NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), Chain.identity, 'element'),
    NamedChain.direct('element', cGetElementDimensions('width'), 'elementWidth'),
    NamedChain.direct('element', cGetElementDimensions('height'), 'elementHeight'),
    NamedChain.read('elementWidth', cAssertElementDimension('Assert element width', width)),
    NamedChain.read('elementHeight', cAssertElementDimension('Assert element height', height)),
    NamedChain.outputInput
  ]);

  const cWaitForDragHandles = (resizeSelector: string) => UiFinder.cWaitForVisible('Wait for resize handlers to show', resizeSelector);

  const sWaitForDragHandles = (editorBody: SugarElement<HTMLElement>, resizeSelector: string) =>
    Chain.asStep(editorBody, [ cWaitForDragHandles(resizeSelector) ]);

  const sResizeAndAssertDimensions = (editorBody: SugarElement, targetSelector: string, resizeSelector: string, deltaX: number, deltaY: number, width: number, height: number) => {
    const expectedWidth = Strings.endsWith(resizeSelector, 'sw') || Strings.endsWith(resizeSelector, 'nw') ? width - deltaX : width + deltaX;
    const expectedHeight = Strings.endsWith(resizeSelector, 'nw') || Strings.endsWith(resizeSelector, 'ne') ? height - deltaY : height + deltaY;

    return Chain.asStep(editorBody, [
      NamedChain.asChain([
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'body'),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Wait for resize handlers to show', resizeSelector), 'resizeHandle'),
        NamedChain.direct('body', UiFinder.cFindIn(targetSelector), 'target'),
        NamedChain.read('resizeHandle', Mouse.cMouseDown),
        NamedChain.direct('body', UiFinder.cFindIn('.mce-clonedresizable'), 'ghost'),
        NamedChain.read('ghost', cGetAndAssertDimensions(width, height)),
        NamedChain.read('resizeHandle', Mouse.cMouseMoveTo(deltaX, deltaY)),
        NamedChain.read('ghost', cGetAndAssertDimensions(expectedWidth, expectedHeight)),
        NamedChain.read('resizeHandle', Mouse.cMouseUp),
        NamedChain.read('target', cGetAndAssertDimensions(expectedWidth, expectedHeight)),
        NamedChain.outputInput
      ])
    ]);
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const editorBody = SugarElement.fromDom(editor.getBody());
    editor.on('ObjectResizeStart ObjectResized', (e) => {
      const counter = eventCounter.get();
      counter[e.type] = (counter[e.type] || 0) + 1;
    });

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Select image by context menu clicking on it', [
        sResetEventCounter,
        Step.label('Focus editor', tinyApis.sFocus()),
        Step.label('Set editor content to a paragraph with a image within', tinyApis.sSetContent('<p><img src="http://www.google.com/google.jpg" width="100" height="100"></p>')),
        Step.label('Context menu click on the image', sContextMenuClickInMiddleOf(editor, [ 0, 0 ])),
        Step.label('Check that the image is selected', tinyApis.sAssertSelection([ 0 ], 0, [ 0 ], 1))
      ]),
      Log.stepsAsStep('TINY-4161', 'Resize events should not be called if the object isn\'t resized', [
        sResetEventCounter,
        tinyApis.sSetContent('<p><table><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table></p>'),
        tinyApis.sSelect('td', [ 0 ]),
        UiFinder.sWaitForVisible('Wait for resize handlers to show', editorBody, '#mceResizeHandlese'),
        Mouse.sTrueClickOn(editorBody, '#mceResizeHandlese'),
        sAssertEventCount('ObjectResizeStart', 0),
        sAssertEventCount('ObjectResized', 0)
      ]),
      Log.stepsAsStep('TINY-4161', 'Resize events should be called if the object is resized', [
        sResetEventCounter,
        tinyApis.sSetContent('<p><table><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table></p>'),
        tinyApis.sSelect('td', [ 0 ]),
        sResizeAndAssertEventCount(editorBody, '#mceResizeHandlese', 10, 1),
        sResizeAndAssertEventCount(editorBody, '#mceResizeHandlese', 20, 2)
      ]),
      Log.stepsAsStep('TINY-4161', 'Resize ghost element dimensions match target element when using fixed width', [
        sResetEventCounter,
        tinyApis.sSetContent('<p><table style="width: 600px; height: 100px"><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table></p>'),
        tinyApis.sSelect('td', [ 0 ]),
        sResizeAndAssertDimensions(editorBody, 'table', '#mceResizeHandlesw', 10, 10, 600, 100)
      ]),
      Log.stepsAsStep('TINY-4161', 'Resize ghost element dimensions match target element when using relative width', [
        sResetEventCounter,
        tinyApis.sSetContent('<p><table style="width: 100%; height: 50px"><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table></p>'),
        tinyApis.sSelect('td', [ 0 ]),
        sResizeAndAssertDimensions(editorBody, 'table', '#mceResizeHandlese', -10, -10, 798, 50)
      ]),
      Log.stepsAsStep('TINY-6229', 'Resize video element', [
        tinyApis.sSetContent('<p><video controls width="300" height="150"></video></p>'),
        tinyApis.sSelect('video', [ ]),
        sResizeAndAssertDimensions(editorBody, 'video', '#mceResizeHandlese', 300, 150, 300, 150)
      ]),
      Log.stepsAsStep('TINY-6229', 'Resize video media element', [
        tinyApis.sSetContent('<p><span contenteditable="false" class="mce-preview-object mce-object-video"><video controls width="300" height="150"></video></span></p>'),
        tinyApis.sSelect('span', [ ]),
        sResizeAndAssertDimensions(editorBody, 'video', '#mceResizeHandlese', -150, -75, 300, 150)
      ]),
      Log.stepsAsStep('TINY-6229', 'Resize iframe media element', [
        tinyApis.sSetContent('<p><span contenteditable="false" class="mce-preview-object mce-object-iframe"><iframe style="border: 1px solid black" width="400" height="200" src="' + Env.transparentSrc + '" allowfullscreen></iframe></span></p>'),
        tinyApis.sSelect('span', [ ]),
        sResizeAndAssertDimensions(editorBody, 'iframe', '#mceResizeHandlese', 100, 50, 402, 202)
      ]),
      Log.stepsAsStep('TINY-6229', 'data-mce-selected attribute value retained when selecting the same element', [
        tinyApis.sSetContent(
          '<p><span contenteditable="false" class="mce-preview-object mce-object-video"><video controls width="300" height="150"></video></span></p>' +
          '<p><span contenteditable="false" class="mce-preview-object mce-object-audio"><audio controls></audio></span></p>'
        ),
        // Select to set the initial selected element in ControlSelection, change and then come back
        tinyApis.sSelect('span.mce-object-video', [ ]),
        sWaitForDragHandles(editorBody, '#mceResizeHandlenw'),
        tinyApis.sAssertContentPresence({
          'span[data-mce-selected=1] video': 1,
          'span[data-mce-selected] audio': 0
        }),
        Step.sync(() => {
          const audioPreviewSpan = editor.dom.select('span')[1];
          editor.dom.setAttrib(audioPreviewSpan, 'data-mce-selected', '3');
        }),
        tinyApis.sSelect('span.mce-object-audio', [ ]),
        Waiter.sTryUntil('Wait for resize handles to disappear', UiFinder.sNotExists(editorBody, '#mceResizeHandlenw')),
        tinyApis.sAssertContentPresence({
          'span[data-mce-selected] video': 0,
          'span[data-mce-selected=3] audio': 1
        }),
        Step.sync(() => {
          const videoPreviewSpan = editor.dom.select('span')[0];
          editor.dom.setAttrib(videoPreviewSpan, 'data-mce-selected', '2');
        }),
        tinyApis.sSelect('span.mce-object-video', [ ]),
        sWaitForDragHandles(editorBody, '#mceResizeHandlenw'),
        tinyApis.sAssertContentPresence({
          'span[data-mce-selected=2] video': 1,
          'span[data-mce-selected] audio': 0
        })
      ]),
    ], onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'body.mce-content-body  { margin: 0 }',
    width: 800
  }, success, failure);
});
