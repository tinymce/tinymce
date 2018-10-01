import { Element } from '@ephox/sugar';

import { Editor } from '../../../../../core/main/ts/api/Editor';

// import ButtonSetupDemo from './ButtonSetupDemo';
declare let tinymce: any;

export default function () {
  const makeSidebar = (ed: Editor, name: string, background: string, width: number) => {
    ed.addSidebar(name, {
      icon: 'comment',
      tooltip: 'Tooltip for ' + name,
      onrender: (api) => {
        console.log('onrender ' + name);
        const box = Element.fromHtml('<div style="width: ' + width + 'px; background: ' + background + ';"></div>');
        api.element().appendChild(box.dom());
      },
      onshow: (api) => {
        console.log('onshow ' + name);
      },
      onhide: (api) => {
        console.log('onhide ' + name);
      },
    });
  };

  tinymce.init({
    selector: 'textarea.tiny-text',
    theme: 'silver',
    toolbar: 'sidebar1 sidebar2 sidebar3',
    plugins: [
      'lists', // Required for list functionality (commands),
      'autolink', // Required for turning pasted text into hyperlinks
      'autosave', // Required to prevent users losing content when they press back
    ],
    // statusbar: false,
    resize: 'both',

    setup (ed: Editor) {
      makeSidebar(ed, 'sidebar1', 'green', 200);
      makeSidebar(ed, 'sidebar2', 'red', 300);
      makeSidebar(ed, 'sidebar3', 'blue', 150);
    }
  });
}