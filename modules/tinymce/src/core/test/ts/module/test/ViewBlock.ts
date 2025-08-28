import { after, afterEach, before } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

interface ViewBlock {
  readonly attach: (preventDuplicates?: boolean) => void;
  readonly detach: () => void;
  readonly update: (html: string) => void;
  readonly get: () => HTMLElement;
}

const ViewBlock = (): ViewBlock => {
  const domElm = DOMUtils.DOM.create('div', {
    style: 'position: absolute; right: 10px; top: 10px;'
  });

  const attach = (preventDuplicates?: boolean) => {
    if (preventDuplicates && domElm.parentNode === document.body) {
      detach();
    }
    document.body.appendChild(domElm);
  };

  const detach = () => {
    DOMUtils.DOM.remove(domElm);
  };

  const update = (html: string) => {
    DOMUtils.DOM.setHTML(domElm, html);
  };

  const get = Fun.constant(domElm);

  return {
    attach,
    update,
    detach,
    get
  };
};

export const bddSetup = (preventDuplicates?: boolean): ViewBlock => {
  const viewBlock = ViewBlock();
  let hasFailure = false;

  before(() => viewBlock.attach(preventDuplicates));
  afterEach(function () {
    if (this.currentTest?.isFailed() === true) {
      hasFailure = true;
    }
  });
  after(() => {
    if (!hasFailure) {
      viewBlock.detach();
    }
  });
  return viewBlock;
};

export default ViewBlock;
