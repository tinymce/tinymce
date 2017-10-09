asynctest(
  'browser.tinymce.core.caret.FakeCaretTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.Env',
    'tinymce.core.caret.FakeCaret',
    'tinymce.core.dom.DomQuery',
    'tinymce.core.text.Zwsp',
    'tinymce.core.test.CaretAsserts',
    'tinymce.core.test.ViewBlock'
  ],
  function (LegacyUnit, Pipeline, Env, FakeCaret, $, Zwsp, CaretAsserts, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var viewBlock = new ViewBlock();

    var fakeCaret;

    if (!Env.ceFalse) {
      return;
    }

    var getRoot = function () {
      return viewBlock.get();
    };

    var setup = function () {
      fakeCaret = new FakeCaret(getRoot(), isBlock);
    };

    var teardown = function () {
      fakeCaret.destroy();
    };

    var isBlock = function (node) {
      return node.nodeName === 'DIV';
    };

    suite.test('show/hide (before, block)', function () {
      var rng, $fakeCaretElm;

      $(getRoot()).html('<div>a</div>');

      rng = fakeCaret.show(true, $('div', getRoot())[0]);
      $fakeCaretElm = $(getRoot()).children();

      LegacyUnit.equal($fakeCaretElm[0].nodeName, 'P');
      LegacyUnit.equal($fakeCaretElm.attr('data-mce-caret'), 'before');
      CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretElm[0], 0, $fakeCaretElm[0], 0));

      fakeCaret.hide();
      LegacyUnit.equal($('*[data-mce-caret]', getRoot()).length, 0);
    });

    suite.test('show/hide (before, block)', function () {
      var rng, $fakeCaretElm;

      $(getRoot()).html('<div>a</div>');

      rng = fakeCaret.show(false, $('div', getRoot())[0]);
      $fakeCaretElm = $(getRoot()).children();

      LegacyUnit.equal($fakeCaretElm[1].nodeName, 'P');
      LegacyUnit.equal($fakeCaretElm.eq(1).attr('data-mce-caret'), 'after');
      CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretElm[1], 0, $fakeCaretElm[1], 0));

      fakeCaret.hide();
      LegacyUnit.equal($('*[data-mce-caret]', getRoot()).length, 0);
    });

    suite.test('show/hide (before, inline)', function () {
      var rng, $fakeCaretText;

      $(getRoot()).html('<span>a</span>');

      rng = fakeCaret.show(true, $('span', getRoot())[0]);
      $fakeCaretText = $(getRoot()).contents();

      LegacyUnit.equal($fakeCaretText[0].nodeName, '#text');
      LegacyUnit.equal($fakeCaretText[0].data, Zwsp.ZWSP);
      CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretText[0], 1));

      fakeCaret.hide();
      LegacyUnit.equal($(getRoot()).contents()[0].nodeName, 'SPAN');
    });

    suite.test('show/hide (after, inline)', function () {
      var rng, $fakeCaretText;

      $(getRoot()).html('<span>a</span>');

      rng = fakeCaret.show(false, $('span', getRoot())[0]);
      $fakeCaretText = $(getRoot()).contents();

      LegacyUnit.equal($fakeCaretText[1].nodeName, '#text');
      LegacyUnit.equal($fakeCaretText[1].data, Zwsp.ZWSP);
      CaretAsserts.assertRange(rng, CaretAsserts.createRange($fakeCaretText[1], 1));

      fakeCaret.hide();
      LegacyUnit.equal($(getRoot()).contents()[0].nodeName, 'SPAN');
    });

    suite.test('getCss', function () {
      LegacyUnit.equal(fakeCaret.getCss().length > 10, true);
    });

    suite.test('show before TD', function () {
      var rng;

      getRoot().innerHTML = '<table><tr><td contenteditable="false">x</td></tr></table>';
      rng = fakeCaret.show(false, $('td', getRoot())[0]);
      LegacyUnit.equal(true, rng === null, 'Should be null since TD is not a valid caret target');
    });

    suite.test('show before TH', function () {
      var rng;

      getRoot().innerHTML = '<table><tr><th contenteditable="false">x</th></tr></table>';
      rng = fakeCaret.show(false, $('th', getRoot())[0]);
      LegacyUnit.equal(true, rng === null, 'Should be null since TH is not a valid caret target');
    });

    viewBlock.attach();
    setup();

    Pipeline.async({}, suite.toSteps({}), function () {
      viewBlock.detach();
      teardown();
      success();
    }, failure);
  }
);
