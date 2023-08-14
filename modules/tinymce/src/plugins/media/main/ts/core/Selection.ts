import Editor from 'tinymce/core/api/Editor';

import * as UpdateHtml from './UpdateHtml';

declare let escape: any;
declare let unescape: any;

const isMediaElement = (element: Element): boolean =>
  element.hasAttribute('data-mce-object') || element.hasAttribute('data-ephox-embed-iri');

const setup = (editor: Editor): void => {
  editor.on('click keyup touchend', () => {
    const selectedNode = editor.selection.getNode();

    if (selectedNode && editor.dom.hasClass(selectedNode, 'mce-preview-object')) {
      if (editor.dom.getAttrib(selectedNode, 'data-mce-selected')) {
        selectedNode.setAttribute('data-mce-selected', '2');
      }
    }
  });

  editor.on('ObjectResized', (e) => {
    const target = e.target;

    if (target.getAttribute('data-mce-object')) {
      let html = target.getAttribute('data-mce-html');
      if (html) {
        html = unescape(html);
        target.setAttribute('data-mce-html', escape(
          UpdateHtml.updateHtml(html, {
            width: String(e.width),
            height: String(e.height)
          }, false, editor.schema)
        ));
      }
    }
  });
};

export {
  setup,
  isMediaElement
};
