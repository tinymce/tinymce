import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import DOMUtils from 'tinymce/core/dom/DOMUtils';
import EventUtils from 'tinymce/core/dom/EventUtils';
import UiUtils from 'tinymce/ui/test/UiUtils';
import ViewBlock from 'tinymce/ui/test/ViewBlock';
import Api from 'tinymce/ui/Api';
import Factory from 'tinymce/core/ui/Factory';
import Tools from 'tinymce/core/util/Tools';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.ui.MenuButtonTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];
  var suite = LegacyUnit.createSuite();
  var viewBlock = new ViewBlock();

  // Registers ui widgets to factory
  Api.registerToFactory();

  var createMenuButton = function (settings) {
    EventUtils.Event.clean(viewBlock.get());
    viewBlock.update('');

    return Factory.create(Tools.extend({
      type: 'menubutton',
      menu: [
        { text: '1' },
        { text: '2' },
        { text: '3' }
      ]
    }, settings)).renderTo(viewBlock.get());
  };

  suite.test("menubutton text, size default", function () {
    var menuButton = createMenuButton({ text: 'X' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, menuButton), [0, 0, 39, 30], 4);
  });

  suite.test("menubutton text, size large", function () {
    var menuButton = createMenuButton({ text: 'X', size: 'large' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, menuButton), [0, 0, 52, 38], 5);
  });

  suite.test("menubutton text, size small", function () {
    var menuButton = createMenuButton({ text: 'X', size: 'small' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, menuButton), [0, 0, 30, 23], 4);
  });

  suite.test("menubutton text, width 100, height 100", function () {
    var menuButton = createMenuButton({ text: 'X', width: 100, height: 100 });

    LegacyUnit.equal(UiUtils.rect(viewBlock, menuButton), [0, 0, 100, 100]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, menuButton.getEl().firstChild), [1, 1, 98, 98]);
  });

  suite.test("menubutton icon, size default", function () {
    var menuButton = createMenuButton({ icon: 'test' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, menuButton), [0, 0, 46, 30], 4);
  });

  suite.test("menubutton icon, size small", function () {
    var menuButton = createMenuButton({ icon: 'test', size: 'small' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, menuButton), [0, 0, 39, 24], 4);
  });

  suite.test("menubutton icon, size large", function () {
    var menuButton = createMenuButton({ icon: 'test', size: 'large' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, menuButton), [0, 0, 56, 40], 6);
  });

  suite.test("menubutton icon, width 100, height 100", function () {
    var menuButton = createMenuButton({ icon: 'test', width: 100, height: 100 });

    LegacyUnit.equal(UiUtils.rect(viewBlock, menuButton), [0, 0, 100, 100]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, menuButton.getEl().firstChild), [1, 1, 98, 98]);
  });

  suite.test("menubutton text & icon, size default", function () {
    var menuButton = createMenuButton({ text: 'X', icon: 'test' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, menuButton), [0, 0, 59, 30], 4);
  });

  suite.test("menubutton text & icon, size large", function () {
    var menuButton = createMenuButton({ text: 'X', icon: 'test', size: 'large' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, menuButton), [0, 0, 71, 40], 4);
  });

  suite.test("menubutton text & icon, size small", function () {
    var menuButton = createMenuButton({ text: 'X', icon: 'test', size: 'small' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, menuButton), [0, 0, 54, 24], 5);
  });

  suite.test("menubutton text & icon, width 100, height 100", function () {
    var menuButton = createMenuButton({ text: 'X', icon: 'test', width: 100, height: 100 });

    LegacyUnit.equal(UiUtils.rect(viewBlock, menuButton), [0, 0, 100, 100]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, menuButton.getEl().firstChild), [1, 1, 98, 98]);
  });

  suite.test("menubutton click event", function () {
    var menuButton, clicks = {};

    menuButton = createMenuButton({
      text: 'X',
      onclick: function () {
        clicks.a = 'a';
      }
    });

    menuButton.on('click', function () {
      clicks.b = 'b';
    });

    menuButton.on('click', function () {
      clicks.c = 'c';
    });

    menuButton.fire('click');

    LegacyUnit.equal(clicks, { a: 'a', b: 'b', c: 'c' });
  });

  UiUtils.loadSkinAndOverride(viewBlock, function () {
    Pipeline.async({}, suite.toSteps({}), function () {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.detach();
      success();
    }, failure);
  });
});

