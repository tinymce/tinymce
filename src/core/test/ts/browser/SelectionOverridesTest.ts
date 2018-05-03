import { Keyboard, Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyDom, TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';
import KeyUtils from '../module/test/KeyUtils';
import VK from 'tinymce/core/api/util/VK';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.SelectionOverridesTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  const pressKey = function (key) {
    return function (editor) {
      Keyboard.keystroke(key, {}, TinyDom.fromDom(editor.getBody()));
    };
  };

  const exitPreTest = function (arrow, offset, expectedContent) {
    return function (editor) {
      editor.setContent('<pre>abc</pre>');

      LegacyUnit.setSelection(editor, 'pre', 1);
      arrow(editor);
      LegacyUnit.equal(editor.getContent(), '<pre>abc</pre>');
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'PRE');

      LegacyUnit.setSelection(editor, 'pre', offset);
      arrow(editor);
      LegacyUnit.equal(editor.getContent(), expectedContent);
      LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
    };
  };

  const ok = function (a, label) {
    LegacyUnit.equal(a, true, label);
  };

  const leftArrow = pressKey(VK.LEFT);
  const rightArrow = pressKey(VK.RIGHT);
  const upArrow = pressKey(VK.UP);
  const downArrow = pressKey(VK.DOWN);

  suite.test('left/right over cE=false inline', function (editor) {
    editor.focus();
    editor.setContent('<span contenteditable="false">1</span>');
    editor.selection.select(editor.$('span')[0]);

    leftArrow(editor);
    LegacyUnit.equal(editor.getContent(), '<p><span contenteditable="false">1</span></p>');
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(editor.selection.getRng().startContainer), true);
    LegacyUnit.equalDom(editor.selection.getRng().startContainer, editor.$('p')[0].firstChild);

    rightArrow(editor);
    LegacyUnit.equal(editor.getContent(), '<p><span contenteditable="false">1</span></p>');
    LegacyUnit.equalDom(editor.selection.getNode(), editor.$('span')[0]);

    rightArrow(editor);
    LegacyUnit.equal(editor.getContent(), '<p><span contenteditable="false">1</span></p>');
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(editor.selection.getRng().startContainer), true);
    LegacyUnit.equalDom(editor.selection.getRng().startContainer, editor.$('p')[0].lastChild);
  });

  suite.test('left/right over cE=false block', function (editor) {
    editor.setContent('<p contenteditable="false">1</p>');
    editor.selection.select(editor.$('p[contenteditable=false]')[0]);

    leftArrow(editor);
    LegacyUnit.equal(editor.getContent(), '<p contenteditable="false">1</p>');
    LegacyUnit.equal(CaretContainer.isCaretContainerBlock(editor.selection.getRng().startContainer), true);

    rightArrow(editor);
    LegacyUnit.equal(editor.getContent(), '<p contenteditable="false">1</p>');
    LegacyUnit.equalDom(editor.selection.getNode(), editor.$('p[contenteditable=false]')[0]);

    rightArrow(editor);
    LegacyUnit.equal(editor.getContent(), '<p contenteditable="false">1</p>');
    LegacyUnit.equal(CaretContainer.isCaretContainerBlock(editor.selection.getRng().startContainer), true);
  });

  suite.test('left before cE=false block and type', function (editor) {
    editor.setContent('<p contenteditable="false">1</p>');
    editor.selection.select(editor.$('p')[0]);

    leftArrow(editor);
    KeyUtils.type(editor, 'a');
    LegacyUnit.equal(editor.getContent(), '<p>a</p><p contenteditable="false">1</p>');
    LegacyUnit.equal(CaretContainer.isCaretContainerBlock(editor.selection.getRng().startContainer.parentNode), false);
  });

  suite.test('right after cE=false block and type', function (editor) {
    editor.setContent('<p contenteditable="false">1</p>');
    editor.selection.select(editor.$('p[contenteditable=false]')[0]);

    rightArrow(editor);
    KeyUtils.type(editor, 'a');
    LegacyUnit.equal(editor.getContent(), '<p contenteditable="false">1</p><p>a</p>');
    LegacyUnit.equal(CaretContainer.isCaretContainerBlock(editor.selection.getRng().startContainer.parentNode), false);
  });

  suite.test('up from P to inline cE=false', function (editor) {
    editor.setContent('<p>a<span contentEditable="false">1</span></p><p>abc</p>');
    LegacyUnit.setSelection(editor, 'p:last', 3);

    upArrow(editor);
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(editor.$('p:first')[0].lastChild), true);
  });

  suite.test('down from P to inline cE=false', function (editor) {
    editor.setContent('<p>abc</p><p>a<span contentEditable="false">1</span></p>');
    LegacyUnit.setSelection(editor, 'p:first', 3);

    downArrow(editor);
    LegacyUnit.equal(CaretContainer.isCaretContainerInline(editor.$('p:last')[0].lastChild), true);
  });

  suite.test('exit pre block (up)', exitPreTest(upArrow, 0, '<p>\u00a0</p><pre>abc</pre>'));
  suite.test('exit pre block (left)', exitPreTest(leftArrow, 0, '<p>\u00a0</p><pre>abc</pre>'));
  suite.test('exit pre block (down)', exitPreTest(downArrow, 3, '<pre>abc</pre><p>\u00a0</p>'));
  suite.test('exit pre block (right)', exitPreTest(rightArrow, 3, '<pre>abc</pre><p>\u00a0</p>'));

  suite.test('click on link in cE=false', function (editor) {
    editor.setContent('<p contentEditable="false"><a href="#"><strong>link</strong></a></p>');
    const evt = editor.fire('click', { target: editor.$('strong')[0] });

    LegacyUnit.equal(evt.isDefaultPrevented(), true);
  });

  suite.test('click next to cE=false block', function (editor) {
    editor.setContent(
      '<table style="width: 100%">' +
      '<tr>' +
      '<td style="vertical-align: top">1</td>' +
      '<td><div contentEditable="false" style="width: 100px; height: 100px">2</div></td>' +
      '</tr>' +
      '</table>'
    );

    const firstTd = editor.dom.select('td')[0];
    const rect = editor.dom.getRect(firstTd);

    editor.fire('mousedown', {
      target: firstTd,
      clientX: rect.x + rect.w,
      clientY: rect.y + 10
    });

    // Since we can't do a real click we need to check if it gets sucked in towards the cE=false block
    LegacyUnit.equal(editor.selection.getNode().nodeName !== 'P', true);
  });

  suite.test('offscreen copy of cE=false block remains offscreen', function (editor) {
    if (Env.ie || Env.gecko) {
      editor.setContent(
        '<table contenteditable="false" style="width: 100%; table-layout: fixed">' +
        '<tbody><tr><td>1</td><td>2</td></tr></tbody>' +
        '</table>'
      );

      editor.selection.select(editor.dom.select('table')[0]);
      const offscreenSelection = editor.dom.select('.mce-offscreen-selection')[0];

      ok(offscreenSelection.offsetLeft !== undefined, 'The offscreen selection\'s left border is undefined');
      ok(offscreenSelection.offsetLeft < 0, 'The offscreen selection\'s left border is onscreen');
      ok(offscreenSelection.offsetWidth + offscreenSelection.offsetLeft < 0,
        'The cE=false offscreen selection is visible on-screen. Right edge: ' +
        offscreenSelection.offsetLeft + '+' + offscreenSelection.offsetWidth + '=' +
        (offscreenSelection.offsetLeft + offscreenSelection.offsetWidth) + 'px'
      );
    } else {
      // Chrome and Safari behave correctly, and PhantomJS also declares itself as WebKit but does not
      // put the off-screen selection off-screen, so fails the above tests. However, it has no visible UI,
      // so everything is off-screen anyway :-)
      ok(true, 'Not a tested browser - Chrome & Safari work, PhantomJS does not put the selection off screen');
    }
  });

  suite.test('set range after ce=false element but lean backwards', function (editor) {
    editor.setContent('<p contenteditable="false">1</p><p contenteditable="false">2</p>');

    const rng = document.createRange();
    rng.setStartBefore(editor.dom.select('p[contenteditable=false]')[1]);
    rng.setEndBefore(editor.dom.select('p[contenteditable=false]')[1]);

    editor.selection.setRng(rng, false);
    LegacyUnit.equal(editor.selection.getNode().getAttribute('data-mce-caret'), 'after');
  });

  suite.test('set range after ce=false element but lean forwards', function (editor) {
    editor.setContent('<p contenteditable="false">1</p><p contenteditable="false">2</p>');

    const rng = document.createRange();
    rng.setStartBefore(editor.dom.select('p[contenteditable=false]')[1]);
    rng.setEndBefore(editor.dom.select('p[contenteditable=false]')[1]);

    editor.selection.setRng(rng, true);
    LegacyUnit.equal(editor.selection.getNode().getAttribute('data-mce-caret'), 'before');
  });

  suite.test('showCaret at TD', function (editor) {
    let rng;

    editor.setContent('<table><tr><td contenteditable="false">x</td></tr></table>');
    rng = editor._selectionOverrides.showCaret(1, editor.dom.select('td')[0], true);
    LegacyUnit.equal(true, rng === null, 'Should be null since TD is not a valid caret target');
  });

  suite.test('showCaret at TH', function (editor) {
    let rng;

    editor.setContent('<table><tr><th contenteditable="false">x</th></tr></table>');
    rng = editor._selectionOverrides.showCaret(1, editor.dom.select('th')[0], true);
    LegacyUnit.equal(true, rng === null, 'Should be null since TH is not a valid caret target');
  });

  suite.test('showCaret block on specific element', function (editor) {
    let rng;

    editor.on('ShowCaret', function (e) {
      if (e.target.getAttribute('data-no-cef') === 'true') {
        e.preventDefault();
      }
    });

    editor.setContent('<p contenteditable="false">a</p><p contenteditable="false" data-no-cef="true">b</p>');

    rng = editor._selectionOverrides.showCaret(1, editor.dom.select('p[contenteditable=false]')[0], true);
    LegacyUnit.equal(true, rng !== null, 'Should return a range');
    editor._selectionOverrides.hideFakeCaret();

    rng = editor._selectionOverrides.showCaret(1, editor.dom.select('p[contenteditable=false]')[1], false);
    LegacyUnit.equal(true, rng === null, 'Should not return a range excluded by ShowCaret event');
    editor._selectionOverrides.hideFakeCaret();
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
