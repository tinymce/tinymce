import { Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { Element } from '@ephox/sugar';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';
import CaretContainerRemove from 'tinymce/core/caret/CaretContainerRemove';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import Env from 'tinymce/core/api/Env';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.CaretContainerRemoveTest', function (success, failure) {
  const viewBlock = ViewBlock();

  if (!Env.ceFalse) {
    return;
  }

  const getRoot = function () {
    return viewBlock.get();
  };

  const setupHtml = function (html) {
    viewBlock.update(html);
  };

  const sTestRemove = Logger.t(
    'Remove',
    Step.sync(function () {
      setupHtml('<span contentEditable="false">1</span>');

      CaretContainer.insertInline(getRoot().firstChild, true);
      Assertions.assertEq('Should be inline container', true, CaretContainer.isCaretContainerInline(getRoot().firstChild));

      CaretContainerRemove.remove(getRoot().firstChild);
      Assertions.assertEq('Should not be inline container', false, CaretContainer.isCaretContainerInline(getRoot().firstChild));
    })
  );

  const sTestRemoveAndRepositionBlockAtOffset = Logger.t(
    'removeAndReposition block in same parent at offset',
    Step.sync(function () {
      setupHtml('<span contentEditable="false">1</span>');

      CaretContainer.insertBlock('p', getRoot().firstChild, true);
      Assertions.assertEq('Should be block container', true, CaretContainer.isCaretContainerBlock(getRoot().firstChild));

      const pos = CaretContainerRemove.removeAndReposition(getRoot().firstChild, CaretPosition(getRoot(), 0));
      Assertions.assertEq('Should be unchanged offset', 0, pos.offset());
      Assertions.assertDomEq('Should be unchanged container', Element.fromDom(getRoot()), Element.fromDom(pos.container()));
      Assertions.assertEq('Should not be block container', false, CaretContainer.isCaretContainerBlock(getRoot().firstChild));
    })
  );

  const sTestRemoveAndRepositionBeforeOffset = Logger.t(
    'removeAndReposition block in same parent before offset',
    Step.sync(function () {
      setupHtml('<span contentEditable="false">1</span><span contentEditable="false">2</span>');

      CaretContainer.insertBlock('p', getRoot().childNodes[1], true);
      Assertions.assertEq('Should be block container', true, CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]));

      const pos = CaretContainerRemove.removeAndReposition(getRoot().childNodes[1], CaretPosition(getRoot(), 0));
      Assertions.assertEq('Should be unchanged offset', 0, pos.offset());
      Assertions.assertDomEq('Should be unchanged container', Element.fromDom(getRoot()), Element.fromDom(pos.container()));
      Assertions.assertEq('Should not be block container', false, CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]));
    })
  );

  const sTestRemoveAndRepositionAfterOffset = Logger.t(
    'removeAndReposition block in same parent after offset',
    Step.sync(function () {
      setupHtml('<span contentEditable="false">1</span><span contentEditable="false">2</span>');

      CaretContainer.insertBlock('p', getRoot().childNodes[1], true);
      Assertions.assertEq('Should be block container', true, CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]));

      const pos = CaretContainerRemove.removeAndReposition(getRoot().childNodes[1], CaretPosition(getRoot(), 3));
      Assertions.assertEq('Should be changed offset', 2, pos.offset());
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
});
