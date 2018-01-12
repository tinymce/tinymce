/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import EditorManager from 'tinymce/core/EditorManager';
import Factory from 'tinymce/core/ui/Factory';
import Tools from 'tinymce/core/util/Tools';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import AutoLinkPlugin from 'tinymce/plugins/autolink/Plugin';
import AutoResizePlugin from 'tinymce/plugins/autoresize/Plugin';
import AutoSavePlugin from 'tinymce/plugins/autosave/Plugin';
import BbCodePlugin from 'tinymce/plugins/bbcode/Plugin';
import CharMapPlugin from 'tinymce/plugins/charmap/Plugin';
import CodePlugin from 'tinymce/plugins/code/Plugin';
import CodeSamplePlugin from 'tinymce/plugins/codesample/Plugin';
import ColorPickerPlugin from 'tinymce/plugins/colorpicker/Plugin';
import ContextMenuPlugin from 'tinymce/plugins/contextmenu/Plugin';
import DirectionalityPlugin from 'tinymce/plugins/directionality/Plugin';
import EmoticonsPlugin from 'tinymce/plugins/emoticons/Plugin';
import FullPagePlugin from 'tinymce/plugins/fullpage/Plugin';
import FullScreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import HrPlugin from 'tinymce/plugins/hr/Plugin';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import ImageToolsPlugin from 'tinymce/plugins/imagetools/Plugin';
import ImportCssPlugin from 'tinymce/plugins/importcss/Plugin';
import InsertDatetimePlugin from 'tinymce/plugins/insertdatetime/Plugin';
import LegacyOutputPlugin from 'tinymce/plugins/legacyoutput/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import MediaPlugin from 'tinymce/plugins/media/Plugin';
import NonBreakingPlugin from 'tinymce/plugins/nonbreaking/Plugin';
import NonEditablePlugin from 'tinymce/plugins/noneditable/Plugin';
import PageBreakPlugin from 'tinymce/plugins/pagebreak/Plugin';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import PreviewPlugin from 'tinymce/plugins/preview/Plugin';
import PrintPlugin from 'tinymce/plugins/print/Plugin';
import SavePlugin from 'tinymce/plugins/save/Plugin';
import SearchReplacePlugin from 'tinymce/plugins/searchreplace/Plugin';
import SpellCheckerPlugin from 'tinymce/plugins/spellchecker/Plugin';
import TabFocusPlugin from 'tinymce/plugins/tabfocus/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import TemplatePlugin from 'tinymce/plugins/template/Plugin';
import TextColorPlugin from 'tinymce/plugins/textcolor/Plugin';
import TextPatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import TocPlugin from 'tinymce/plugins/toc/Plugin';
import VisualBlocksPlugin from 'tinymce/plugins/visualblocks/Plugin';
import VisualCharsPlugin from 'tinymce/plugins/visualchars/Plugin';
import WordCountPlugin from 'tinymce/plugins/wordcount/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

AdvListPlugin();
AnchorPlugin();
AutoLinkPlugin();
AutoResizePlugin();
AutoSavePlugin();
BbCodePlugin();
CharMapPlugin();
CodePlugin();
CodeSamplePlugin();
ColorPickerPlugin();
ContextMenuPlugin();
DirectionalityPlugin();
EmoticonsPlugin();
FullPagePlugin();
FullScreenPlugin();
HrPlugin();
ImagePlugin();
ImageToolsPlugin();
ImportCssPlugin();
InsertDatetimePlugin();
LegacyOutputPlugin();
LinkPlugin();
ListsPlugin();
MediaPlugin();
NonBreakingPlugin();
NonEditablePlugin();
PageBreakPlugin();
PastePlugin();
PreviewPlugin();
PrintPlugin();
SavePlugin();
SearchReplacePlugin();
SpellCheckerPlugin();
TabFocusPlugin();
TablePlugin();
TemplatePlugin();
TextColorPlugin();
TextPatternPlugin();
TocPlugin();
VisualBlocksPlugin();
VisualCharsPlugin();
WordCountPlugin();
ModernTheme();

export default function () {
  const config = {
    theme: 'modern',
    plugins: [
      'advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker toc',
      'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
      'save table contextmenu directionality emoticons template paste textcolor importcss colorpicker textpattern codesample'
    ],
    /*
    menubar: 'file edit insert view format table tools',
    menu: {
      file: { title: 'File', items: 'newdocument' },
      edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall' },
      insert: { title: 'Insert', items: 'link media | template hr' },
      view: { title: 'View', items: 'visualaid' },
      format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript | formats | removeformat' },
      table: { title: 'Table', items: 'inserttable tableprops deletetable | cell row column' },
      tools: { title: 'Tools', items: 'spellchecker code' }
    },
    removed_menuitems: 'undo',
    */
    // resize: 'both',
    // statusbar: false,
    // menubar: false,
    add_unload_trigger: false,
    toolbar: 'insertfile undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons table codesample',

    setup (ed) {
      ed.addSidebar('sidebar1', {
        tooltip: 'My side bar 1',
        icon: 'bold',
        onrender (api) {
          const rect = api.element().getBoundingClientRect();
          const panel = Factory.create({
            layout: 'flex',
            direction: 'column',
            pack: 'center',
            align: 'center',
            minWidth: rect.width,
            minHeight: rect.height,
            type: 'panel',
            items: [
              { type: 'button', text: 'Hello world!' }, { type: 'button', text: 'Hello world!' }
            ]
          });
          panel.renderTo(api.element()).reflow();
          console.log('Render panel 1');
        },
        onshow (api) {
          console.log('Show panel 1', api.element());
        },
        onhide (api) {
          console.log('Hide panel 1', api.element());
        }
      });

      ed.addSidebar('sidebar2', {
        tooltip: 'My side bar 2',
        icon: 'italic',
        onrender (api) {
          console.log('Render panel 2', api.element());
        },
        onshow (api) {
          console.log('Show panel 2', api.element());
          api.element().innerHTML = document.body.innerText;
        },
        onhide (api) {
          console.log('Hide panel 2', api.element());
        }
      });
    }
  };

  EditorManager.init(
    Tools.extend({}, config, {
      selector: 'textarea.tinymce',
      skin_url: '../../../../../js/tinymce/skins/lightgray',
      codesample_content_css: '../../../../../js/tinymce/plugins/codesample/css/prism.css'
    })
  );

  EditorManager.init(
    Tools.extend({}, config, {
      selector: 'div.tinymce',
      inline: true,
      skin_url: '../../../../../js/tinymce/skins/lightgray',
      codesample_content_css: '../../../../../js/tinymce/plugins/codesample/css/prism.css'
    })
  );
}