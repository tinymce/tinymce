asynctest(
  'browser.tinymce.core.CaretContainerTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'global!document',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.DomQuery',
    'tinymce.core.Env',
    'tinymce.core.test.ViewBlock',
    'tinymce.core.text.Zwsp'
  ],
  function (Pipeline, LegacyUnit, document, CaretContainer, CaretPosition, DomQuery, Env, ViewBlock, Zwsp) {
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
      LegacyUnit.equal(CaretContainer.isCaretContainer(DomQuery('<span></span>')[0]), false);
      LegacyUnit.equal(CaretContainer.isCaretContainer(DomQuery('<span data-mce-caret="1"></span>')[0]), true);
      LegacyUnit.equal(CaretContainer.isCaretContainer(DomQuery('<span data-mce-caret="1">x</span>')[0].firstChild), true);
      LegacyUnit.equal(CaretContainer.isCaretContainer(document.createTextNode(Zwsp.ZWSP)), true);
    });

    suite.test('isCaretContainerBlock', function () {
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock(document.createTextNode('text')), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock(DomQuery('<span></span>')[0]), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock(DomQuery('<span data-mce-caret="1"></span>')[0]), true);
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock(DomQuery('<span data-mce-caret="1">a</span>')[0].firstChild), true);
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock(document.createTextNode(Zwsp.ZWSP)), false);
    });

    suite.test('isCaretContainerInline', function () {
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(document.createTextNode('text')), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(DomQuery('<span></span>')[0]), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(DomQuery('<span data-mce-caret="1"></span>')[0]), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(DomQuery('<span data-mce-caret="1">a</span>')[0].firstChild), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(document.createTextNode(Zwsp.ZWSP)), true);
    });

    suite.test('insertInline before element', function () {
      setupHtml('<span contentEditable="false">1</span>');
      LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().firstChild, true), getRoot().firstChild);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().firstChild), true);
    });

    suite.test('insertInline after element', function () {
      setupHtml('<span contentEditable="false">1</span>');
      LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().firstChild, false), getRoot().lastChild);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().lastChild), true);
    });

    suite.test('insertInline between elements', function () {
      setupHtml('<span contentEditable="false">1</span><span contentEditable="false">1</span>');
      LegacyUnit.equalDom(CaretContainer.insertBlock('p', getRoot().lastChild, true), getRoot().childNodes[1]);
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]), true);
    });

    suite.test('insertInline before element with ZWSP', function () {
      setupHtml('abc' + Zwsp.ZWSP + '<span contentEditable="false">1</span>');
      LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().lastChild, true), getRoot().childNodes[1]);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().firstChild), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]), true);
    });

    suite.test('insertInline after element with ZWSP', function () {
      setupHtml('<span contentEditable="false">1</span>' + Zwsp.ZWSP + 'abc');
      LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().firstChild, false), getRoot().childNodes[1]);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().lastChild), false);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]), true);
    });

    suite.test('insertBlock before element', function () {
      setupHtml('<span contentEditable="false">1</span>');
      LegacyUnit.equalDom(CaretContainer.insertBlock('p', getRoot().firstChild, true), getRoot().firstChild);
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock(getRoot().firstChild), true);
    });

    suite.test('insertBlock after element', function () {
      setupHtml('<span contentEditable="false">1</span>');
      LegacyUnit.equalDom(CaretContainer.insertBlock('p', getRoot().firstChild, false), getRoot().lastChild);
      LegacyUnit.equal(CaretContainer.isCaretContainerBlock(getRoot().lastChild), true);
    });

    suite.test('insertBlock between elements', function () {
      setupHtml('<span contentEditable="false">1</span><span contentEditable="false">1</span>');
      LegacyUnit.equalDom(CaretContainer.insertInline(getRoot().lastChild, true), getRoot().childNodes[1]);
      LegacyUnit.equal(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]), true);
    });

    suite.test('startsWithCaretContainer', function () {
      setupHtml(Zwsp.ZWSP + 'abc');
      LegacyUnit.equal(CaretContainer.startsWithCaretContainer(getRoot().firstChild), true);
    });

    suite.test('endsWithCaretContainer', function () {
      setupHtml('abc');
      viewBlock.get().firstChild.appendData(Zwsp.ZWSP);
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

    suite.test('prependInline', function () {
      setupHtml('a');
      var caretContainerTextNode = CaretContainer.prependInline(getRoot().firstChild);
      LegacyUnit.equal(caretContainerTextNode.data, Zwsp.ZWSP + 'a');
    });

    suite.test('prependInline 2', function () {
      setupHtml('<b>a</b>');
      LegacyUnit.equal(CaretContainer.prependInline(getRoot().firstChild), null);
      LegacyUnit.equal(CaretContainer.prependInline(null), null);
    });

    suite.test('appendInline', function () {
      setupHtml('a');
      var caretContainerTextNode = CaretContainer.appendInline(getRoot().firstChild);
      LegacyUnit.equal(caretContainerTextNode.data, 'a' + Zwsp.ZWSP);
    });

    suite.test('isBeforeInline', function () {
      setupHtml(Zwsp.ZWSP + 'a');
      LegacyUnit.equal(CaretContainer.isBeforeInline(new CaretPosition(getRoot().firstChild, 0)), true);
      LegacyUnit.equal(CaretContainer.isBeforeInline(new CaretPosition(getRoot().firstChild, 1)), false);
    });

    suite.test('isAfterInline', function () {
      setupHtml(Zwsp.ZWSP + 'a');
      LegacyUnit.equal(CaretContainer.isAfterInline(new CaretPosition(getRoot().firstChild, 1)), true);
      LegacyUnit.equal(CaretContainer.isAfterInline(new CaretPosition(getRoot().firstChild, 0)), false);
    });

    viewBlock.attach();
    Pipeline.async({}, suite.toSteps({}), function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);
