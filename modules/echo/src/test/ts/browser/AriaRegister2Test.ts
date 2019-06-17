import { assert, UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';
import { Attr, Element, SelectorFind } from '@ephox/sugar';
import AriaRegister from 'ephox/echo/api/AriaRegister';

UnitTest.test('AriaRegister Test 2', function () {

  const element = function () {
    return Element.fromTag('div');
  };

  const getAssert = function (el, attr, expect) {
    assert.eq(Attr.get(el, attr), expect);
  };

  const hasAssert = function (el, attr, expect) {
    assert.eq(Attr.has(el, attr), expect);
  };

  const editor = function (container, editor, label, help) {
    AriaRegister.editor(container, editor, label, help);
    getAssert(container, 'role', 'application');
    getAssert(container, 'aria-label', label);

    const helpEl = SelectorFind.descendant(container, '.ephox-echo-aria-help');
    help.fold(function () {
      assert.eq(true, helpEl.isNone(), 'incorrectly found help element when no help was set');
    }, function (helpText) {
      const helpContents = helpEl.getOrDie('cannot find help text');
      assert.eq(helpText, helpContents.dom().textContent);
    });
  };

  const inline = function (container, editor, label, help) {
    const cleanInline = AriaRegister.inline(container, editor, label, help);
    getAssert(container, 'role', 'application');
    getAssert(container, 'aria-label', label);

    assert.eq(0, Attr.get(container, 'aria-owns').indexOf('ephox-aria-content_'), 'the aria-owns attribute should start with "ephox-aria-content_" but doesn\'t ');
    assert.eq(0, Attr.get(editor, 'id').indexOf('ephox-aria-content_'), 'the id should start with "ephox-aria-content_" but doesn\'t ');

    const helpEl = SelectorFind.descendant(container, '.ephox-echo-aria-help');
    assert.eq(true, helpEl.isNone(), 'inline editor should NOT have a help container');

    help.fold(function () {
      assert.eq(false, Attr.has(editor, 'aria-label'));
    }, function (helpText) {
      assert.eq(helpText, Attr.get(editor, 'aria-label'));
      cleanInline.destroy();
      assert.eq(false, Attr.has(editor, 'id'));
      assert.eq(false, Attr.has(editor, 'aria-label'));
    });

    // Should not touch id's of items that have already been declared.
    // existing aria-labels should be restored when the editor is restored
    const markedEditor = element();
    Attr.setAll(markedEditor, {
      'id': 'my-precious',
      'aria-label': 'important word'
    });

    const hasMarkings = AriaRegister.inline(container, markedEditor, label, help);
    help.fold(function () {
      assert.eq('important word', Attr.get(markedEditor, 'aria-label'));
      assert.eq('my-precious', Attr.get(markedEditor, 'id'));
    }, function (helpText) {
      assert.eq(helpText, Attr.get(markedEditor, 'aria-label'));
      assert.eq('my-precious', Attr.get(markedEditor, 'id'));
      assert.eq('my-precious', Attr.get(container, 'aria-owns'));

      hasMarkings.destroy();
      assert.eq('important word', Attr.get(markedEditor, 'aria-label'), 'should restore the original aria-label, but didn\'t');
      assert.eq('my-precious', Attr.get(markedEditor, 'id'));
    });
  };

  const toolbar = function (el, label) {
    AriaRegister.toolbar(el, label);
    getAssert(el, 'role', 'group');
    getAssert(el, 'aria-label', label);
  };

  const menu = function (el, label) {
    AriaRegister.menu(el, label);
    getAssert(el, 'role', 'menu');
    getAssert(el, 'aria-label', label);
  };

  const toolbarButton = function () {
    const label = 'I am a tool button';

    const case1 = element();
    AriaRegister.toolbarButton(case1, label, false, false);
    getAssert(case1, 'role', 'button');
    getAssert(case1, 'aria-label', label);
    getAssert(case1, 'aria-haspopup', 'false');
    hasAssert(case1, 'aria-pressed', false);
    hasAssert(case1, 'aria-expanded', false);

    const case2 = element();
    AriaRegister.toolbarButton(case2, label, true, false);
    getAssert(case2, 'role', 'button');
    getAssert(case2, 'aria-label', label);
    getAssert(case2, 'aria-haspopup', 'true');
    hasAssert(case2, 'aria-pressed', false);
    getAssert(case2, 'aria-expanded', 'false');

    const case3 = element();
    AriaRegister.toolbarButton(case3, label, true, true);
    getAssert(case3, 'role', 'button');
    getAssert(case3, 'aria-label', label);
    getAssert(case3, 'aria-haspopup', 'true');
    getAssert(case3, 'aria-pressed', 'false');
    getAssert(case3, 'aria-expanded', 'false');

    const case4 = element();
    AriaRegister.toolbarButton(case4, label, false, true);
    getAssert(case4, 'role', 'button');
    getAssert(case4, 'aria-label', label);
    getAssert(case4, 'aria-haspopup', 'false');
    getAssert(case4, 'aria-pressed', 'false');
    hasAssert(case4, 'aria-expanded', false);
  };

  const toolbarGroup = function (el, label) {
    AriaRegister.toolbarGroup(el);
    hasAssert(el, 'aria-label', false);
    AriaRegister.toolbarGroup(el, label);
    getAssert(el, 'aria-label', label);
  };

  const menuItem = function (el, label) {
    AriaRegister.menuItem(el, Option.some(label), Option.none());
    getAssert(el, 'role', 'menuitem');
    getAssert(el, 'aria-label', label);
    getAssert(el, 'aria-haspopup', 'false');

    AriaRegister.menuItem(el, Option.some(label), Option.some(true));
    getAssert(el, 'role', 'menuitem');
    getAssert(el, 'aria-label', label);
    getAssert(el, 'aria-haspopup', 'true');
  };

  const dialog = function (el, label) {
    AriaRegister.dialog(el, label);
    getAssert(el, 'role', 'dialog');
    getAssert(el, 'aria-label', label);
  };

  const label = function (el, label) {
    AriaRegister.label(el, label);
    getAssert(el, 'aria-label', label);
  };

  editor(element(), element(), 'this should be the editor label', Option.some('editor help'));
  editor(element(), element(), 'this should be the editor label', Option.none());

  // inline(element(), element(), 'this should be the inline editor label', Option.some('inline editor help'));
  inline(element(), element(), 'this should be the inline editor label', Option.none());

  // toolbar(element(), 'this should be the toolbar label');
  // menu(element(), 'I am a menu');
  // toolbarButton();
  // toolbarGroup(element(), 'i am a bar of tools');
  // menuItem(element(), 'Eye am menu eyetem');
  // dialog(element(), 'Diatom Trunk');
  // label(element(), 'put in');
});