/* eslint-disable no-console */
import Editor from 'tinymce/core/api/Editor';

declare const window: any;
declare let tinymce: any;

export default () => {

  const paintClientRect = (rect, color, id) => {
    const editor: Editor = tinymce.activeEditor;
    const dom = editor.dom;
    let rectDiv: HTMLElement;
    const viewPort = editor.dom.getViewPort();

    if (!rect) {
      return;
    }

    color = color || 'red';
    id = id || color;
    rectDiv = dom.get(id);

    if (!rectDiv) {
      rectDiv = dom.add(editor.getBody(), 'div');
    }

    dom.setAttrib(rectDiv, 'id', id);
    dom.setStyles(rectDiv, {
      position: 'absolute',
      left: (rect.left + viewPort.x) + 'px',
      top: (rect.top + viewPort.y) + 'px',
      width: (rect.width || 1) + 'px',
      height: rect.height + 'px',
      background: color,
      opacity: 0.8
    });
  };

  const paintClientRects = (rects, color) => {
    tinymce.util.Tools.each(rects, (rect, index) => {
      paintClientRect(rect, color, color + index);
    });
  };

  const logPos = (caretPosition) => {
    const container = caretPosition.container(),
      offset = caretPosition.offset();

    if (container.nodeType === 3) {
      if (container.data[offset]) {
        console.log(container.data[offset]);
      } else {
        console.log('<end of text node>');
      }
    } else {
      console.log(container, offset, caretPosition.getNode());
    }
  };

  window.paintClientRect = paintClientRect;
  window.paintClientRects = paintClientRects;
  window.logPos = logPos;

  tinymce.init({
    selector: 'textarea.tinymce',
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    add_unload_trigger: false,
    toolbar: 'insertfile undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify' +
    ' | bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons table codesample',
    plugins: [ 'code' ],
    content_css: '../css/content_editable.css',
    height: 400
  });

  tinymce.init({
    selector: 'div.tinymce',
    inline: true,
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    add_unload_trigger: false,
    toolbar: 'insertfile undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify' +
    ' | bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons table codesample',
    plugins: [ 'code' ],
    content_css: '../css/content_editable.css'
  });

  window.tinymce = tinymce;
};
