/* tslint:disable:no-console */
import { console } from '@ephox/dom-globals';
import { Merger } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

declare let tinymce: any;

export default function () {

  const makeSidebar = (ed, name: string, background: string, width: number) => {
    ed.ui.registry.addSidebar(name, {
      icon: 'comment',
      tooltip: 'Tooltip for ' + name,
      onSetup: (api) => {
        console.log('onSetup ' + name);
        const box = Element.fromHtml('<div style="width: ' + width + 'px; background: ' + background + ';"></div>');
        api.element().appendChild(box.dom());
        return () => {
          api.element().removeChild(box.dom());
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

  const settings = {
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    content_css: '../../../../js/tinymce/skins/content/default/content.css',
    selector: 'textarea',
    setup(ed) {
      makeSidebar(ed, 'sidebar1', 'green', 200);
    },
    plugins: [
      'print preview media link image'
    ],
    add_unload_trigger: false,
    autosave_ask_before_unload: false,
    toolbar: 'undo redo | sidebar1 | print preview media'
  };

  tinymce.init(settings);
  tinymce.init(Merger.deepMerge(settings, { inline: true, selector: 'div.tinymce' }));
}
