/**
 * CommandsDemo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
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

  const cmd = function (command, value?) {
    return { command, value };
  };

  const commands = [
    cmd('Bold'),
    cmd('Italic'),
    cmd('Underline'),
    cmd('Strikethrough'),
    cmd('Superscript'),
    cmd('Subscript'),
    cmd('Cut'),
    cmd('Copy'),
    cmd('Paste'),
    cmd('Unlink'),
    cmd('JustifyLeft'),
    cmd('JustifyCenter'),
    cmd('JustifyRight'),
    cmd('JustifyFull'),
    cmd('JustifyNone'),
    cmd('InsertUnorderedList'),
    cmd('InsertOrderedList'),
    cmd('ForeColor', 'red'),
    cmd('HiliteColor', 'green'),
    cmd('FontName', 'Arial'),
    cmd('FontSize', 7),
    cmd('RemoveFormat'),
    cmd('mceBlockQuote'),
    cmd('FormatBlock', 'h1'),
    cmd('mceInsertContent', 'abc'),
    cmd('mceToggleFormat', 'bold'),
    cmd('mceSetContent', 'abc'),
    cmd('Indent'),
    cmd('Outdent'),
    cmd('InsertHorizontalRule'),
    cmd('mceToggleVisualAid'),
    cmd('mceInsertLink', 'url'),
    cmd('selectAll'),
    cmd('delete'),
    cmd('mceNewDocument'),
    cmd('Undo'),
    cmd('Redo'),
    cmd('mceAutoResize'),
    cmd('mceShowCharmap'),
    cmd('mceCodeEditor'),
    cmd('mceDirectionLTR'),
    cmd('mceDirectionRTL'),
    cmd('mceFullPageProperties'),
    cmd('mceFullscreen'),
    cmd('mceImage'),
    cmd('mceInsertDate'),
    cmd('mceInsertTime'),
    cmd('InsertDefinitionList'),
    cmd('mceNonBreaking'),
    cmd('mcePageBreak'),
    cmd('mcePreview'),
    cmd('mcePrint'),
    cmd('mceSave'),
    cmd('SearchReplace'),
    cmd('mceSpellcheck'),
    cmd('mceInsertTemplate', '{$user}'),
    cmd('mceVisualBlocks'),
    cmd('mceVisualChars'),
    cmd('mceMedia'),
    cmd('mceAnchor'),
    cmd('mceTableSplitCells'),
    cmd('mceTableMergeCells'),
    cmd('mceTableInsertRowBefore'),
    cmd('mceTableInsertRowAfter'),
    cmd('mceTableInsertColBefore'),
    cmd('mceTableInsertColAfter'),
    cmd('mceTableDeleteCol'),
    cmd('mceTableDeleteRow'),
    cmd('mceTableCutRow'),
    cmd('mceTableCopyRow'),
    cmd('mceTablePasteRowBefore'),
    cmd('mceTablePasteRowAfter'),
    cmd('mceTableDelete'),
    cmd('mceInsertTable'),
    cmd('mceTableProps'),
    cmd('mceTableRowProps'),
    cmd('mceTableCellProps'),
    cmd('mceEditImage')
  ];

  Arr.each(commands, function (cmd) {
    const btn = document.createElement('button');
    btn.innerHTML = cmd.command;
    btn.onclick = function () {
      EditorManager.activeEditor.execCommand(cmd.command, false, cmd.value);
    };
    document.querySelector('#ephox-ui').appendChild(btn);
  });

  EditorManager.init({
    skin_url: '../../../../js/tinymce/skins/lightgray',
    selector: 'textarea.tinymce',
    plugins: [
      'advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker toc',
      'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
      'save table contextmenu directionality emoticons template paste textcolor importcss colorpicker textpattern codesample'
    ],
    theme: 'modern',
    toolbar1: 'bold italic',
    menubar: false
  });
}