import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

export default function () {
  const domElm = DOMUtils.DOM.create('div', {
    style: 'position: absolute; right: 10px; top: 10px;'
  });

  const attach = function (preventDuplicates?) {
    if (preventDuplicates && domElm.parentNode === document.body) {
      detach();
    }
    document.body.appendChild(domElm);
  };

  const detach = function () {
    DOMUtils.DOM.remove(domElm);
  };

  const update = function (html) {
    DOMUtils.DOM.setHTML(domElm, html);
  };

  const get = function () {
    return domElm;
  };

  return {
    attach,
    update,
    detach,
    get
  };
}