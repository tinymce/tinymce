import { Class, Insert, SelectorFind, SugarBody, SugarElement, Value } from '@ephox/sugar';

import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare const tinymce: TinyMCE;

export default (): void => {
  const textarea = SugarElement.fromTag('textarea');
  textarea.dom.rows = 20;
  textarea.dom.cols = 80;
  Value.set(textarea, '<p>Bolt</p>');
  Class.add(textarea, 'tinymce');
  const container = SelectorFind.descendant(SugarBody.body(), '#ephox-ui').getOrDie();
  Insert.append(container, textarea);

  tinymce.init({
    selector: 'textarea',
    theme: (editor, target) => {
      const dom = tinymce.DOM;

      const editorContainer = dom.insertAfter(dom.create('div', { style: 'border: 1px solid gray' },
        '<div>' +
        '<button data-mce-command="bold">B</button>' +
        '<button data-mce-command="italic">I</button>' +
        '<button data-mce-command="mceInsertContent" data-mce-value="Hello">Insert Hello</button>' +
        '</div>' +
        '<div style="border-top: 1px solid gray"></div>'
      ), target);

      dom.setStyle(editorContainer, 'width', target.offsetWidth);

      tinymce.each(dom.select('button', editorContainer), (button) => {
        dom.bind(button, 'click', (e) => {
          e.preventDefault();

          editor.execCommand(
            dom.getAttrib(e.target, 'data-mce-command'),
            false,
            dom.getAttrib(e.target, 'data-mce-value')
          );
        });
      });

      editor.on('PreInit', () => {
        tinymce.each(dom.select('button', editorContainer), (button) => {
          editor.formatter.formatChanged(dom.getAttrib(button, 'data-mce-command'), (state) => {
            button.style.color = state ? 'red' : '';
          });
        });
      });

      return {
        editorContainer,
        iframeContainer: editorContainer.lastChild as HTMLElement
      };
    },
    height: 600
  });
};
