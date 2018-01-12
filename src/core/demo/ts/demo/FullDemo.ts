/**
 * FullDemo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Merger } from '@ephox/katamari';
import EditorManager from 'tinymce/core/EditorManager';
import PluginManager from 'tinymce/core/PluginManager';
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
import HelpPlugin from 'tinymce/plugins/help/Plugin';
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
import MobileTheme from 'tinymce/themes/mobile/Theme';
import ModernTheme from 'tinymce/themes/modern/Theme';

declare const window: any;

export default function () {
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
  MobileTheme();
  HelpPlugin();

  PluginManager.urls.emoticons = '../../../../js/tinymce/plugins/emoticons';

  const settings = {
    skin_url: '../../../../js/tinymce/skins/lightgray',
    codesample_content_css: '../../../../js/tinymce/plugins/codesample/css/prism.css',
    visualblocks_content_css: '../../../../js/tinymce/plugins/visualblocks/css/visualblocks.css',
    images_upload_url: 'd',
    selector: 'textarea',
    // rtl_ui: true,
    link_list: [
      { title: 'My page 1', value: 'http://www.tinymce.com' },
      { title: 'My page 2', value: 'http://www.moxiecode.com' }
    ],
    image_list: [
      { title: 'My page 1', value: 'http://www.tinymce.com' },
      { title: 'My page 2', value: 'http://www.moxiecode.com' }
    ],
    image_class_list: [
      { title: 'None', value: '' },
      { title: 'Some class', value: 'class-name' }
    ],
    importcss_append: true,
    height: 400,
    file_picker_callback (callback, value, meta) {
      // Provide file and text for the link dialog
      if (meta.filetype === 'file') {
        callback('https://www.google.com/logos/google.jpg', { text: 'My text' });
      }

      // Provide image and alt text for the image dialog
      if (meta.filetype === 'image') {
        callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text' });
      }

      // Provide alternative source and posted for the media dialog
      if (meta.filetype === 'media') {
        callback('movie.mp4', { source2: 'alt.ogg', poster: 'https://www.google.com/logos/google.jpg' });
      }
    },
    spellchecker_callback (method, text, success, failure) {
      const words = text.match(this.getWordCharPattern());

      if (method === 'spellcheck') {
        const suggestions = {};

        for (let i = 0; i < words.length; i++) {
          suggestions[words[i]] = ['First', 'Second'];
        }

        success(suggestions);
      }

      if (method === 'addToDictionary') {
        success();
      }
    },
    templates: [
      { title: 'Some title 1', description: 'Some desc 1', content: 'My content' },
      { title: 'Some title 2', description: 'Some desc 2', content: '<div class="mceTmpl"><span class="cdate">cdate</span><span class="mdate">mdate</span>My content2</div>' }
    ],
    template_cdate_format: '[CDATE: %m/%d/%Y : %H:%M:%S]',
    template_mdate_format: '[MDATE: %m/%d/%Y : %H:%M:%S]',
    image_caption: true,
    theme: 'modern',
    mobile: {
      plugins: [
        'autosave lists'
      ]
    },
    plugins: [
      'autosave advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker toc',
      'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
      'save table contextmenu directionality emoticons template paste textcolor importcss colorpicker textpattern',
      'codesample help noneditable print'
    ],
    add_unload_trigger: false,
    toolbar: 'insertfile undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons table codesample code | ltr rtl'
  };

  EditorManager.init(settings);
  EditorManager.init(Merger.deepMerge(settings, { inline: true, selector: 'div.tinymce' }));

  window.tinymce = EditorManager;
}
