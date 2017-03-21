asynctest(
  'browser.tinymce.core.CaretContainerRemoveTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.sugar.api.node.Element',
    'global!document',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretContainerRemove',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.Env',
    'tinymce.core.test.ViewBlock'
  ],
  function (Assertions, Logger, Pipeline, Step, Element, document, CaretContainer, CaretContainerRemove, CaretPosition, Env, ViewBlock) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
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

    var sTestRemove = Logger.t(
      'Remove',
      Step.sync(function () {
        setupHtml('<span contentEditable="false">1</span>');

        CaretContainer.insertInline(getRoot().firstChild, true);
        Assertions.assertEq('Should be inline container', true, CaretContainer.isCaretContainerInline(getRoot().firstChild));

        CaretContainerRemove.remove(getRoot().firstChild);
        Assertions.assertEq('Should not be inline container', false, CaretContainer.isCaretContainerInline(getRoot().firstChild));
      })
    );

    var sTestRemoveAndRepositionBlockAtOffset = Logger.t(
      'removeAndReposition block in same parent at offset',
      Step.sync(function () {
        setupHtml('<span contentEditable="false">1</span>');

        CaretContainer.insertBlock('p', getRoot().firstChild, true);
        Assertions.assertEq('Should be block container', true, CaretContainer.isCaretContainerBlock(getRoot().firstChild));

        var pos = CaretContainerRemove.removeAndReposition(getRoot().firstChild, new CaretPosition(getRoot(), 0));
        Assertions.assertEq('Should be unchanged offset', 0, pos.offset());
        Assertions.assertDomEq('Should be unchanged container', Element.fromDom(getRoot()), Element.fromDom(pos.container()));
        Assertions.assertEq('Should not be block container', false, CaretContainer.isCaretContainerBlock(getRoot().firstChild));
      })
    );

    var sTestRemoveAndRepositionBeforeOffset = Logger.t(
      'removeAndReposition block in same parent before offset',
      Step.sync(function () {
        setupHtml('<span contentEditable="false">1</span><span contentEditable="false">2</span>');

        CaretContainer.insertBlock('p', getRoot().childNodes[1], true);
        Assertions.assertEq('Should be block container', true, CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]));

        var pos = CaretContainerRemove.removeAndReposition(getRoot().childNodes[1], new CaretPosition(getRoot(), 0));
        Assertions.assertEq('Should be unchanged offset', 0, pos.offset());
        Assertions.assertDomEq('Should be unchanged container', Element.fromDom(getRoot()), Element.fromDom(pos.container()));
        Assertions.assertEq('Should not be block container', false, CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]));
      })
    );

    var sTestRemoveAndRepositionAfterOffset = Logger.t(
      'removeAndReposition block in same parent after offset',
      Step.sync(function () {
        setupHtml('<span contentEditable="false">1</span><span contentEditable="false">2</span>');

        CaretContainer.insertBlock('p', getRoot().childNodes[1], true);
        Assertions.assertEq('Should be block container', true, CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]));

        var pos = CaretContainerRemove.removeAndReposition(getRoot().childNodes[1], new CaretPosition(getRoot(), 3));
        Assertions.assertEq('Should be changed offset', 2, pos.offset(), 2);
        Assertions.assertDomEq('Should be unchanged container', Element.fromDom(getRoot()), Element.fromDom(pos.container()));
        Assertions.assertEq('Should not be block container', false, CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]));
      })
    );

    viewBlock.attach();
    Pipeline.async({}, [
      sTestRemove,
      sTestRemoveAndRepositionBlockAtOffset,
      sTestRemoveAndRepositionBeforeOffset,
      sTestRemoveAndRepositionAfterOffset
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);
