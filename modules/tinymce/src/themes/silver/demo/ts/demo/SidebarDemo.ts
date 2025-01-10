/* eslint-disable no-console */
import { SugarElement } from '@ephox/sugar';

import { Editor, TinyMCE } from 'tinymce/core/api/PublicApi';

// import ButtonSetupDemo from './ButtonSetupDemo';
declare let tinymce: TinyMCE;

export default (): void => {
  const makeSidebar = (ed: Editor, name: string, background: string, width: number) => {
    ed.ui.registry.addSidebar(name, {
      icon: 'comment',
      tooltip: 'Tooltip for ' + name,
      onSetup: (api) => {
        console.log('onSetup ' + name);
        const box = SugarElement.fromHtml('<div style="width: ' + width + 'px; background: ' + background + ';"></div>');
        api.element().appendChild(box.dom);
        return () => {
          api.element().removeChild(box.dom);
        };
      },
      onShow: (_api) => {
        console.log('onShow ' + name);
      },
      onHide: (_api) => {
        console.log('onHide ' + name);
      }
    });
  };

  tinymce.init({
    selector: 'textarea.tiny-text',
    theme: 'silver',
    toolbar: 'sidebar1 sidebar2 sidebar3',
    plugins: [
      'lists', // Required for list functionality (commands),
      'autolink', // Required for turning pasted text into hyperlinks
      'autosave' // Required to prevent users losing content when they press back
    ],
    // statusbar: false,
    resize: 'both',

    setup: (ed) => {
      makeSidebar(ed, 'sidebar1', 'green', 200);
      makeSidebar(ed, 'sidebar2', 'red', 300);
      makeSidebar(ed, 'sidebar3', 'blue', 150);
    }
  });
};
