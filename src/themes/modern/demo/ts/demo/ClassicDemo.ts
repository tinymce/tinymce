// /**
//  * ClassicDemo.js
//  *
//  * Released under LGPL License.
//  * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
//  *
//  * License: http://www.tinymce.com/license
//  * Contributing: http://www.tinymce.com/contributing
//  */

import EditorManager from 'tinymce/core/EditorManager';
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
  EditorManager.init({
    selector: 'textarea.tinymce',
    theme: 'modern',
    plugins: [
      'advlist autolink autosave link image lists charmap print preview hr anchor pagebreak spellchecker',
      'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
      'save table contextmenu directionality emoticons template textcolor paste fullpage textcolor colorpicker codesample'
    ],
    skin_url: '../../../../../js/tinymce/skins/lightgray',
    add_unload_trigger: false,
    autosave_ask_before_unload: false,

    toolbar1: 'save newdocument fullpage | bold italic underline strikethrough | alignleft aligncenter alignright ' +
      'alignjustify | styleselect formatselect fontselect fontsizeselect',
    toolbar2: 'cut copy paste pastetext | searchreplace | bullist numlist | outdent indent blockquote | undo redo' +
      ' | link unlink anchor image media help code | insertdatetime preview | forecolor backcolor',
    toolbar3: 'table | hr removeformat | subscript superscript | charmap emoticons | print fullscreen | ltr rtl' +
      ' | spellchecker | visualchars visualblocks nonbreaking template pagebreak restoredraft | insertfile insertimage codesample',
    menubar: false,
    toolbar_items_size: 'small',

    style_formats: [
      { title: 'Bold text', inline: 'b' },
      { title: 'Red text', inline: 'span', styles: { color: '#ff0000' } },
      { title: 'Red header', block: 'h1', styles: { color: '#ff0000' } },
      { title: 'Example 1', inline: 'span', classes: 'example1' },
      { title: 'Example 2', inline: 'span', classes: 'example2' },
      { title: 'Table styles' },
      { title: 'Table row 1', selector: 'tr', classes: 'tablerow1' }
    ],

    templates: [
      { title: 'My template 1', description: 'Some fancy template 1', content: 'My html' },
      { title: 'My template 2', description: 'Some fancy template 2', url: 'development.html' }
    ],

    spellchecker_callback (method, data, success) {
      if (method === 'spellcheck') {
        const words = data.match(this.getWordCharPattern());
        const suggestions = {};

        for (let i = 0; i < words.length; i++) {
          suggestions[words[i]] = ['First', 'second'];
        }

        success({ words: suggestions, dictionary: true });
      }

      if (method === 'addToDictionary') {
        success();
      }
    }
  });
}