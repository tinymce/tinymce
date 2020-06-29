import { Assertions, Chain, GeneralSteps, Log, Mouse, NamedChain, Pipeline, Step, UiFinder } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { HTMLElement } from '@ephox/dom-globals';
import { Cell, Obj, Strings } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Css, Element, Hierarchy } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.dom.ControlSelectionTest', function (success, failure) {
  Theme();
  const eventCounter = Cell<Record<string, number>>({ });

  const sContextMenuClickInMiddleOf = (editor: Editor, elementPath: number[]) => Step.sync(() => {
    const element = Hierarchy.follow(Element.fromDom(editor.getBody()), elementPath).getOrDie().dom() as HTMLElement;
    const rect = element.getBoundingClientRect();
    const clientX = (rect.left + rect.width / 2), clientY = (rect.top + rect.height / 2);
    editor.fire('mousedown', { target: element, clientX, clientY, button: 2 });
    editor.fire('mouseup', { target: element, clientX, clientY, button: 2 });
    editor.fire('contextmenu', { target: element, clientX, clientY, button: 2 });
  });

  const sResetEventCounter = Step.sync(() => eventCounter.set({ }));

  const sAssertEventCount = (type: string, count: number) => Step.sync(() => {
    Assert.eq(`Check ${type} event count is ${count}`, count, Obj.get(eventCounter.get(), type.toLowerCase()).getOr(0));
  });

  const sResizeAndAssertEventCount = (editorBody: Element, resizeSelector: string, delta: number, expectedCount: number) => GeneralSteps.sequence([
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

  const cGetElementDimensions = (name: string) => Chain.mapper((element: Element): number =>
    Css.getRaw(element, name).map((v) => parseInt(v, 10)).getOr(0));

  const cAssertElementDimension = (label: string, expectedDimension: number) => Chain.op((dimension: number) => {
    Assertions.assertEq(label, true, Math.abs(dimension - expectedDimension) < 3);
  });

  const cGetAndAssertDimensions = (width: number, height: number) => NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), Chain.identity, 'element'),
    NamedChain.direct('element', cGetElementDimensions('width'), 'elementWidth'),
    NamedChain.direct('element', cGetElementDimensions('height'), 'elementHeight'),
    NamedChain.read('elementWidth', cAssertElementDimension('Assert element width', width)),
    NamedChain.read('elementHeight', cAssertElementDimension('Assert element height', height)),
    NamedChain.outputInput
  ]);

  const sResizeAndAssertDimensions = (editorBody: Element, targetSelector: string, resizeSelector: string, delta: number, width: number, height: number) => {
    const expectedWidth = Strings.endsWith(resizeSelector, 'sw') || Strings.endsWith(resizeSelector, 'nw') ? width - delta : width + delta;
    const expectedHeight = Strings.endsWith(resizeSelector, 'nw') || Strings.endsWith(resizeSelector, 'ne') ? height - delta : height + delta;

    return Chain.asStep(editorBody, [
      NamedChain.asChain([
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'body'),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Wait for resize handlers to show', resizeSelector), 'resizeHandle'),
        NamedChain.direct('body', UiFinder.cFindIn(targetSelector), 'target'),
        NamedChain.read('resizeHandle', Mouse.cMouseDown),
        NamedChain.direct('body', UiFinder.cFindIn('.mce-clonedresizable'), 'ghost'),
        NamedChain.read('ghost', cGetAndAssertDimensions(width, height)),
        NamedChain.read('resizeHandle', Mouse.cMouseMoveTo(delta, delta)),
        NamedChain.read('ghost', cGetAndAssertDimensions(expectedWidth, expectedHeight)),
        NamedChain.read('resizeHandle', Mouse.cMouseUp),
        NamedChain.read('target', cGetAndAssertDimensions(expectedWidth, expectedHeight)),
        NamedChain.outputInput
      ])
    ]);
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const editorBody = Element.fromDom(editor.getBody());
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
        sResizeAndAssertDimensions(editorBody, 'table', '#mceResizeHandlesw', 10, 600, 100)
      ]),
      Log.stepsAsStep('TINY-4161', 'Resize ghost element dimensions match target element when using relative width', [
        sResetEventCounter,
        tinyApis.sSetContent('<p><table style="width: 100%; height: 50px"><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table></p>'),
        tinyApis.sSelect('td', [ 0 ]),
        sResizeAndAssertDimensions(editorBody, 'table', '#mceResizeHandlese', -10, 798, 50)
      ])
    ], onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'body.mce-content-body  { margin: 0 }',
    width: 800
  }, success, failure);
});
