import { Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import { Selection } from 'tinymce/core/api/dom/Selection';
import Theme from 'tinymce/themes/modern/Theme';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import ViewBlock from '../../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.api.dom.SelectionRangeTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const validateRangeTest = function (root, shouldSetRange, editor) {

      const selection = Selection(DOM, DOM.win, null, editor);
      const rng = document.createRange();
      rng.setStartBefore(root.firstElementChild.firstElementChild);
      rng.setEndAfter(root.firstElementChild.firstElementChild);

      selection.setRng(rng);
      const selected = selection.getRng();
      Assertions.assertEq('range set', shouldSetRange, root.firstElementChild === selected.startContainer);
  };

  const innerHtml = '<p><span>Blue</span><span>Orange</span></p>';

  Theme();

  const DOM = DOMUtils.DOM;
  const viewBlock = ViewBlock();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {

    const sTestSimpleDocumentRange = Logger.t('Sets simple range in document', Step.sync(function () {
      viewBlock.update(innerHtml);
      const div = viewBlock.get();

      validateRangeTest(div, true, editor);
    }));

    const sTestSimpleDocumentRangeNotAttached = Logger.t('Unattached simple range not set', Step.sync(function () {
      const div = document.createElement('div');
      DOMUtils.DOM.setHTML(div, innerHtml);

      validateRangeTest(div, false, editor);
    }));

    const sTestShadowRootRange = Logger.t('Sets shadow range in document', Step.sync(function () {
      viewBlock.update('<div></div>');
      const div = viewBlock.get().firstElementChild;

      if (div.attachShadow) {
        const shadow = div.attachShadow({mode: 'open'});
        DOMUtils.DOM.setHTML(shadow, innerHtml);

        validateRangeTest(shadow, true, editor);
      }
    }));

    const sTestShadowRootRangeNotAttached = Logger.t('Unattached shadow range not set', Step.sync(function () {
      const div = document.createElement('div');
      if (div.attachShadow) {
        const shadow = div.attachShadow({mode: 'open'});
        DOMUtils.DOM.setHTML(shadow, innerHtml);

        validateRangeTest(shadow, false, editor);
      }
    }));

    viewBlock.attach();

    Pipeline.async({}, [
      sTestSimpleDocumentRange,
      sTestSimpleDocumentRangeNotAttached,
      sTestShadowRootRange,
      sTestShadowRootRangeNotAttached
    ], onSuccess, onFailure);
  }, {
    skin_url: '/project/js/tinymce/skins/lightgray',
    inline: true
  }, function () {
    viewBlock.detach();
    success();
  }, failure);
});
