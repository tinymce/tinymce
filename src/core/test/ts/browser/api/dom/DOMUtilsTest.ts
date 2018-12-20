import { Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import ViewBlock from '../../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.api.dom.DOMUtilsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const DOM = DOMUtils.DOM;

  const viewBlock = ViewBlock();

  const sTestNotShadowHost = Logger.t('No shadow host returns null', Step.sync(function () {
    viewBlock.update('<div></div>');
    Assertions.assertEq('label', null, DOM.getTopLevelShadowHost(viewBlock.get()));
  }));

  const sTestSingleShadowHost = Logger.t('Single level returns shadow host', Step.sync(function () {
    viewBlock.update('<div></div>');
    const div = viewBlock.get().firstElementChild;
    if (div.attachShadow) {
      const shadow = div.attachShadow({mode: 'open'});
      const para = document.createElement('p');
      shadow.appendChild(para);

      Assertions.assertEq('label', div, DOM.getTopLevelShadowHost(para));
    }
  }));

  const sTestMultiShadowHost = Logger.t('Multi level returns shadow host', Step.sync(function () {
    viewBlock.update('<div></div>');
    const div = viewBlock.get().firstElementChild;
    if (div.attachShadow) {
      const shadow = div.attachShadow({mode: 'open'});
      const para = document.createElement('p');
      shadow.appendChild(para);

      const shadow2 = para.attachShadow({mode: 'open'});
      const para2 = document.createElement('p');
      shadow2.appendChild(para2);

      Assertions.assertEq('label', div, DOM.getTopLevelShadowHost(para2));
    }
  }));

  viewBlock.attach();
  Pipeline.async({}, [
    sTestNotShadowHost,
    sTestSingleShadowHost,
    sTestMultiShadowHost,
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
