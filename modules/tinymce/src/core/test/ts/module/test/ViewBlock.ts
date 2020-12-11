import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

export default () => {
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

  const get = (): HTMLElement => {
    return domElm;
  };

  return {
    attach,
    update,
    detach,
    get
  };
};
