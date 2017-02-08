asynctest(
  'browser.tinymce.core.CaretContainerTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.Env',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.dom.DomQuery',
    'tinymce.core.text.Zwsp',
    'tinymce.core.test.ViewBlock',
    'global!document'
  ],
  function (LegacyUnit, Pipeline, Env, CaretContainer, $, Zwsp, ViewBlock, document) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    var viewBlock = new ViewBlock();

    if (!Env.ceFalse) {
      return;
    }

    var getRoot = function () {
      return viewBlock.get();
    };

    var setupHtml = function (html) {
      viewBlock.update(html);
    };

    suite.test('isCaretContainer', function () {
      LegacyUnit.equal(CaretContainer.isCaretContainer(document.createTextNode('text')), false);
      LegacyUnit.equal(CaretContainer.isCaretContainer($('<span></span>')[0]), false);
      LegacyUnit.equal(CaretContainer.isCaretContainer($('<span data-mce-caret="1"></span>')[0]), true);
      LegacyUnit.equal(CaretContainer.isCaretContainer($('<span data-mce-caret="1">x</span>')[0].firstChild), true);
      LegacyUnit.equal(CaretContainer.isCaretContainer(document.createTextNode(Zwsp.ZWSP)), true);
    });

    suite.test('isCaretContainerBlock', function () {
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock(document.createTextNode('text')), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock($('<span></span>')[0]), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock($('<span data-mce-caret="1"></span>')[0]), true);
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock($('<span data-mce-caret="1">a</span>')[0].firstChild), true);
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock(document.createTextNode(Zwsp.ZWSP)), false);
    });

    suite.test('isCaretContainerInline', function () {
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(document.createTextNode('text')), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline($('<span></span>')[0]), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline($('<span data-mce-caret="1"></span>')[0]), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline($('<span data-mce-caret="1">a</span>')[0].firstChild), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(document.createTextNode(Zwsp.ZWSP)), true);
    });

    suite.test('insertInline before element', function () {
      setupHtml('<span contentEditable="false">1</span>');
      LegacyUnit.equal(CaretContainer.insertInline(getRoot().firstChild, true), getRoot().firstChild);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().firstChild), true);
    });

    suite.test('insertInline after element', function () {
      setupHtml('<span contentEditable="false">1</span>');
      LegacyUnit.equal(CaretContainer.insertInline(getRoot().firstChild, false), getRoot().lastChild);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().lastChild), true);
    });

    suite.test('insertInline between elements', function () {
      setupHtml('<span contentEditable="false">1</span><span contentEditable="false">1</span>');
      LegacyUnit.equal(CaretContainer.insertBlock('p', getRoot().lastChild, true), getRoot().childNodes[1]);
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]), true);
    });

    suite.test('insertInline before element with ZWSP', function () {
      setupHtml('abc' + Zwsp.ZWSP + '<span contentEditable="false">1</span>');
      LegacyUnit.equal(CaretContainer.insertInline(getRoot().lastChild, true), getRoot().childNodes[1]);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().firstChild), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]), true);
    });

    suite.test('insertInline after element with ZWSP', function () {
      setupHtml('<span contentEditable="false">1</span>' + Zwsp.ZWSP + 'abc');
      LegacyUnit.equal(CaretContainer.insertInline(getRoot().firstChild, false), getRoot().childNodes[1]);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().lastChild), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]), true);
    });

    suite.test('insertBlock before element', function () {
      setupHtml('<span contentEditable="false">1</span>');
      LegacyUnit.equal(CaretContainer.insertBlock('p', getRoot().firstChild, true), getRoot().firstChild);
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock(getRoot().firstChild), true);
    });

    suite.test('insertBlock after element', function () {
      setupHtml('<span contentEditable="false">1</span>');
      LegacyUnit.equal(CaretContainer.insertBlock('p', getRoot().firstChild, false), getRoot().lastChild);
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock(getRoot().lastChild), true);
    });

    suite.test('insertBlock between elements', function () {
      setupHtml('<span contentEditable="false">1</span><span contentEditable="false">1</span>');
      LegacyUnit.equal(CaretContainer.insertInline(getRoot().lastChild, true), getRoot().childNodes[1]);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]), true);
    });

    suite.test('remove', function () {
      setupHtml('<span contentEditable="false">1</span>');

      CaretContainer.insertInline(getRoot().firstChild, true);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().firstChild), true);

      CaretContainer.remove(getRoot().firstChild);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().firstChild), false);
    });

    suite.test('startsWithCaretContainer', function () {
      setupHtml(Zwsp.ZWSP + 'abc');
      LegacyUnit.equal(CaretContainer.startsWithCaretContainer(getRoot().firstChild), true);
    });

    suite.test('endsWithCaretContainer', function () {
      setupHtml('abc' + Zwsp.ZWSP);
      LegacyUnit.equal(CaretContainer.endsWithCaretContainer(getRoot().firstChild), true);
    });

    suite.test('hasContent', function () {
      setupHtml('<span contentEditable="false">1</span>');
      var caretContainerBlock = CaretContainer.insertBlock('p', getRoot().firstChild, true);
      LegacyUnit.equal(CaretContainer.hasContent(caretContainerBlock), false);
      caretContainerBlock.insertBefore(document.createTextNode('a'), caretContainerBlock.firstChild);
      LegacyUnit.equal(CaretContainer.hasContent(caretContainerBlock), true);
    });

    suite.test('showCaretContainerBlock', function () {
      setupHtml('<span contentEditable="false">1</span>');
      var caretContainerBlock = CaretContainer.insertBlock('p', getRoot().firstChild, true);
      caretContainerBlock.insertBefore(document.createTextNode('a'), caretContainerBlock.firstChild);
      CaretContainer.showCaretContainerBlock(caretContainerBlock);
      LegacyUnit.equal(caretContainerBlock.outerHTML, '<p>a</p>');
    });

    viewBlock.attach();
    Pipeline.async({}, suite.toSteps({}), function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);
