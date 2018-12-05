import { document } from '@ephox/dom-globals';

declare const tinymce: any;

export default function () {
  const textarea = document.createElement('textarea');
  textarea.rows = 20;
  textarea.cols = 80;
  textarea.innerHTML = '<p>Bolt</p>';
  textarea.classList.add('tinymce');
  document.querySelector('#ephox-ui').appendChild(textarea);

  tinymce.init({
    selector: 'textarea',
    theme (editor, target) {
      const dom = tinymce.DOM;
      let editorContainer;

      editorContainer = dom.insertAfter(dom.create('div', { style: 'border: 1px solid gray' },
        '<div>' +
        '<button data-mce-command="bold">B</button>' +
        '<button data-mce-command="italic">I</button>' +
        '<button data-mce-command="mceInsertContent" data-mce-value="Hello">Insert Hello</button>' +
        '</div>' +
        '<div style="border-top: 1px solid gray"></div>'
      ), target);

      dom.setStyle(editorContainer, 'width', target.offsetWidth);

      tinymce.each(dom.select('button', editorContainer), function (button) {
        dom.bind(button, 'click', function (e) {
          e.preventDefault();

          editor.execCommand(
            dom.getAttrib(e.target, 'data-mce-command'),
            false,
            dom.getAttrib(e.target, 'data-mce-value')
          );
        });
      });

      editor.on(function () {
        tinymce.each(dom.select('button', editorContainer), function (button) {
          editor.formatter.formatChanged(dom.getAttrib(button, 'data-mce-command'), function (state) {
            button.style.color = state ? 'red' : '';
          });
        });
      });

      return {
        editorContainer,
        iframeContainer: editorContainer.lastChild,
        iframeHeight: target.offsetHeight - editorContainer.firstChild.offsetHeight
      };
    },
    height: 600
  });
}