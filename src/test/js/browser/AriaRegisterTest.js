test(
  'AriaRegisterTest',

  [
    'ephox.echo.api.AriaRegister',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Element',
    'global!assert'
  ],

  function (AriaRegister, Attr, Element, assert) {

    var element = function () {
      return Element.fromTag('div');
    };

    var getAssert = function (el, attr, expect) {
      assert.eq(Attr.get(el, attr), expect);
    };

    var hasAssert = function (el, attr, expect) {
      assert.eq(Attr.has(el, attr), expect);
    };

    var editor = function (el) {
      AriaRegister.editor(el);
      getAssert(el, 'role', 'application');
      var label = Attr.get(el, 'aria-label');
      var expected = 'Textbox.io Rich Text Editor - ';
      assert.eq(label.substr(0, 30), expected);
    };

    var toolbar = function (el) {
      AriaRegister.toolbar(el);
      getAssert(el, 'role', 'toolbar');
      getAssert(el, 'aria-label', 'Rich Text Editor Toolbar');
    };

    var menu = function (el, label) {
      AriaRegister.menu(el, label);
      getAssert(el, 'role', 'menu');
      getAssert(el, 'aria-label', label);
    };

    var toolbarButton = function () {
      var label = 'I am a tool button';

      var case1 = element();
      AriaRegister.toolbarButton(case1, label, false, false);
      getAssert(case1, 'role', 'button');
      getAssert(case1, 'aria-label', label);
      getAssert(case1, 'aria-haspopup', 'false');
      hasAssert(case1, 'aria-pressed', false);
      hasAssert(case1, 'aria-expanded', false);

      var case2 = element();
      AriaRegister.toolbarButton(case2, label, true, false);
      getAssert(case2, 'role', 'button');
      getAssert(case2, 'aria-label', label);
      getAssert(case2, 'aria-haspopup', 'true');
      hasAssert(case2, 'aria-pressed', false);
      getAssert(case2, 'aria-expanded', 'false');

      var case3 = element();
      AriaRegister.toolbarButton(case3, label, true, true);
      getAssert(case3, 'role', 'button');
      getAssert(case3, 'aria-label', label);
      getAssert(case3, 'aria-haspopup', 'true');
      getAssert(case3, 'aria-pressed', 'false');
      getAssert(case3, 'aria-expanded', 'false');

      var case4 = element();
      AriaRegister.toolbarButton(case4, label, false, true);
      getAssert(case4, 'role', 'button');
      getAssert(case4, 'aria-label', label);
      getAssert(case4, 'aria-haspopup', 'false');
      getAssert(case4, 'aria-pressed', 'false');
      hasAssert(case4, 'aria-expanded', false);
    };

    var toolbarGroup = function (el, label) {
      AriaRegister.toolbarGroup(el);
      hasAssert(el, 'aria-label', false);
      AriaRegister.toolbarGroup(el, label);
      getAssert(el, 'aria-label', label);
    };

    var menuItem = function (el, label) {
      AriaRegister.menuItem(el, label);
      getAssert(el, 'role', 'menuitem');
      getAssert(el, 'aria-label', label);
      getAssert(el, 'aria-haspopup', 'false');

      AriaRegister.menuItem(el, label, true);
      getAssert(el, 'role', 'menuitem');
      getAssert(el, 'aria-label', label);
      getAssert(el, 'aria-haspopup', 'true');
    };

    var dialog = function (el, label) {
      AriaRegister.dialog(el, label);
      getAssert(el, 'role', 'dialog');
      getAssert(el, 'aria-label', label);
    };

    var input = function (el, label) {
      AriaRegister.input(el, label);
      getAssert(el, 'aria-label', label);
    };

    editor(element());
    toolbar(element());
    menu(element(), 'I am a menu');
    toolbarButton();
    toolbarGroup(element(), 'i am a bar of tools');
    menuItem(element(), 'Eye am menu eyetem');
    dialog(element(), 'Diatom Trunk');
    input(element(), 'put in');

  }
);