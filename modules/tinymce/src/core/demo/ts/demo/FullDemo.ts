/* eslint-disable no-console */
import { SugarElement } from '@ephox/sugar';
import { RawEditorSettings, TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default () => {

  const makeSidebar = (ed, name: string, background: string, width: number) => {
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

  const settings: RawEditorSettings = {
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    content_css: '../../../../js/tinymce/skins/content/default/content.css',
    images_upload_url: 'd',
    selector: 'textarea',
    // rtl_ui: true,
    importcss_append: true,
    height: 400,
    image_advtab: true,
    image_caption: true,
    theme: 'silver',
    mobile: {
      plugins: [
        'autosave lists'
      ]
    },
    setup: (ed) => {
      makeSidebar(ed, 'sidebar1', 'green', 200);
    },
    plugins: [
      'table'
    ],
    table_class_list: [
      {
        title: 'Speciål',
        value: 'sPECIÅL'
      },
      {
        title: 'Täble',
        value: 'tÄBLE'
      },
      {
        title: 'Clöss',
        value: 'cLÖSS'
      },
    ],
    table_cell_class_list: [
      {
        title: 'Måre',
        value: 'mÅRE'
      },
      {
        title: 'Clässes',
        value: 'cLÄSSES'
      },
      {
        title: 'Höre',
        value: 'hÖRE'
      },
    ],
    // rtl_ui: true,
    add_unload_trigger: false,
    autosave_ask_before_unload: false,
    /* toolbar: 'undo redo sidebar1 | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | align lineheight fontsizeselect fontselect formatselect styleselect insertfile | styleselect | ' +
    'bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons table codesample code | ltr rtl',
    // */
    toolbar: 'tablecolprops | tablerowheader tablecolumnheader tablecellbackground | tablecellbordercolor tablecellborderstyle | tablecellborderwidth  tableclass tablecellclass tablecellvalign tablecaption',
    contextmenu: 'link linkchecker image imagetools table lists spellchecker configurepermanentpen', // */

    toolbar_mode: 'floating',
    /*  table_border_widths: [
      {
        title: '1 Pixel',
        value: '1px'
      },
      {
        title: '20 Pixel',
        value: '20px'
      }
    ],
    table_border_styles: [
      {
        title: 'Solid',
        value: 'solid'
      },
      {
        title: 'Dashed',
        value: 'dashed'
      },
      {
        title: 'Double',
        value: 'double'
      }
    ],*/
    cell_background_color_map: [
      '000000', 'Black',
      '808080', 'Gray',
      'FFFFFF', 'White',
      'FF0000', 'Red',
      'FFFF00', 'Yellow',
      '008000', 'Green',
      '0000FF', 'Blue'
    ],
    emoticons_database_url: '/src/plugins/emoticons/main/js/emojis.js',
    resize_img_proportional: true,
    format_empty_lines: true
  };

  tinymce.init(settings);
};
