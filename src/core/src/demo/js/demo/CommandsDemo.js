/**
 * CommandsDemo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0 */

define(
  'tinymce.core.demo.CommandsDemo',
  [
    'ephox.katamari.api.Arr',
    'global!document',
    'tinymce.core.EditorManager',
    'tinymce.core.PluginManager',
    'tinymce.plugins.advlist.Plugin',
    'tinymce.plugins.anchor.Plugin',
    'tinymce.plugins.autolink.Plugin',
    'tinymce.plugins.autoresize.Plugin',
    'tinymce.plugins.autosave.Plugin',
    'tinymce.plugins.bbcode.Plugin',
    'tinymce.plugins.charmap.Plugin',
    'tinymce.plugins.code.Plugin',
    'tinymce.plugins.codesample.Plugin',
    'tinymce.plugins.colorpicker.Plugin',
    'tinymce.plugins.contextmenu.Plugin',
    'tinymce.plugins.directionality.Plugin',
    'tinymce.plugins.emoticons.Plugin',
    'tinymce.plugins.fullpage.Plugin',
    'tinymce.plugins.fullscreen.Plugin',
    'tinymce.plugins.hr.Plugin',
    'tinymce.plugins.image.Plugin',
    'tinymce.plugins.imagetools.Plugin',
    'tinymce.plugins.importcss.Plugin',
    'tinymce.plugins.insertdatetime.Plugin',
    'tinymce.plugins.legacyoutput.Plugin',
    'tinymce.plugins.link.Plugin',
    'tinymce.plugins.lists.Plugin',
    'tinymce.plugins.media.Plugin',
    'tinymce.plugins.nonbreaking.Plugin',
    'tinymce.plugins.noneditable.Plugin',
    'tinymce.plugins.pagebreak.Plugin',
    'tinymce.plugins.paste.Plugin',
    'tinymce.plugins.preview.Plugin',
    'tinymce.plugins.print.Plugin',
    'tinymce.plugins.save.Plugin',
    'tinymce.plugins.searchreplace.Plugin',
    'tinymce.plugins.spellchecker.Plugin',
    'tinymce.plugins.tabfocus.Plugin',
    'tinymce.plugins.table.Plugin',
    'tinymce.plugins.template.Plugin',
    'tinymce.plugins.textcolor.Plugin',
    'tinymce.plugins.textpattern.Plugin',
    'tinymce.plugins.toc.Plugin',
    'tinymce.plugins.visualblocks.Plugin',
    'tinymce.plugins.visualchars.Plugin',
    'tinymce.plugins.wordcount.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (
    Arr, document, EditorManager, PluginManager, AdvListPlugin, AnchorPlugin, AutoLinkPlugin, AutoResizePlugin, AutoSavePlugin, BbCodePlugin, CharMapPlugin,
    CodePlugin, CodeSamplePlugin, ColorPickerPlugin, ContextMenuPlugin, DirectionalityPlugin, EmoticonsPlugin, FullPagePlugin, FullScreenPlugin, HrPlugin, ImagePlugin,
    ImageToolsPlugin, ImportCssPlugin, InsertDatetimePlugin, LegacyOutputPlugin, LinkPlugin, ListsPlugin, MediaPlugin, NonBreakingPlugin, NonEditablePlugin,
    PageBreakPlugin, PastePlugin, PreviewPlugin, PrintPlugin, SavePlugin, SearchReplacePlugin, SpellCheckerPlugin, TabFocusPlugin, TablePlugin, TemplatePlugin,
    TextColorPlugin, TextPatternPlugin, TocPlugin, VisualBlocksPlugin, VisualCharsPlugin, WordCountPlugin, ModernTheme
  ) {
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

    var cmd = function (command, value) {
      return { command: command, value: value };
    };

    var commands = [
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
      var btn = document.createElement('button');
      btn.innerHTML = cmd.command;
      btn.onclick = function () {
        EditorManager.activeEditor.execCommand(cmd.command, false, cmd.value);
      };
      document.querySelector('#ephox-ui').appendChild(btn);
    });

    return function () {
      EditorManager.init({
        skin_url: '../../../../skins/lightgray/dist/lightgray',
        selector: "textarea.tinymce",
        plugins: [
          "advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker toc",
          "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
          "save table contextmenu directionality emoticons template paste textcolor importcss colorpicker textpattern codesample"
        ],
        theme: "modern",
        toolbar1: 'bold italic',
        menubar: false
      });
    };
  }
);
