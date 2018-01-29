import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

export default function () {
  const domElm = DOMUtils.DOM.create('div', {
    style: 'position: absolute; right: 10px; top: 10px;'
  });

  const attach = function (preventDuplicates?: boolean) {
    if (preventDuplicates && domElm.parentNode === document.body) {
      detach();
    }
    document.body.appendChild(domElm);
  };

  const detach = function () {
    DOMUtils.DOM.remove(domElm);
  };

  const update = function (html: string) {
    DOMUtils.DOM.setHTML(domElm, html);
  };

  const get = function (): HTMLElement {
    return domElm;
  };

  return {
    attach,
    update,
    detach,
    get
  };
}