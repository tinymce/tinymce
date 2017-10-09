/**
 * FullDemo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0 */

define(
  'tinymce.core.demo.FullDemo',
  [
    'ephox.katamari.api.Merger',
    'global!window',
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
    'tinymce.plugins.help.Plugin',
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
    'tinymce.themes.mobile.Theme',
    'tinymce.themes.modern.Theme'
  ],
  function (
    Merger, window, EditorManager, PluginManager, AdvListPlugin, AnchorPlugin, AutoLinkPlugin, AutoResizePlugin, AutoSavePlugin, BbCodePlugin, CharMapPlugin,
    CodePlugin, CodeSamplePlugin, ColorPickerPlugin, ContextMenuPlugin, DirectionalityPlugin, EmoticonsPlugin, FullPagePlugin, FullScreenPlugin, HelpPlugin,
    HrPlugin, ImagePlugin, ImageToolsPlugin, ImportCssPlugin, InsertDatetimePlugin, LegacyOutputPlugin, LinkPlugin, ListsPlugin, MediaPlugin, NonBreakingPlugin,
    NonEditablePlugin, PageBreakPlugin, PastePlugin, PreviewPlugin, PrintPlugin, SavePlugin, SearchReplacePlugin, SpellCheckerPlugin, TabFocusPlugin, TablePlugin,
    TemplatePlugin, TextColorPlugin, TextPatternPlugin, TocPlugin, VisualBlocksPlugin, VisualCharsPlugin, WordCountPlugin, MobileTheme, ModernTheme
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
    MobileTheme();
    HelpPlugin();

    return function () {
      PluginManager.urls.emoticons = '../../../../plugins/emoticons/dist/emoticons';

      var settings = {
        skin_url: '../../../../skins/lightgray/dist/lightgray',
        codesample_content_css: '../../../../plugins/codesample/dist/codesample/css/prism.css',
        visualblocks_content_css: '../../../../plugins/visualblocks/dist/visualblocks/css/visualblocks.css',
        images_upload_url: 'd',
        selector: "textarea",
        //rtl_ui: true,
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
        file_picker_callback: function (callback, value, meta) {
          // Provide file and text for the link dialog
          if (meta.filetype == 'file') {
            callback('https://www.google.com/logos/google.jpg', { text: 'My text' });
          }

          // Provide image and alt text for the image dialog
          if (meta.filetype == 'image') {
            callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text' });
          }

          // Provide alternative source and posted for the media dialog
          if (meta.filetype == 'media') {
            callback('movie.mp4', { source2: 'alt.ogg', poster: 'https://www.google.com/logos/google.jpg' });
          }
        },
        spellchecker_callback: function (method, text, success, failure) {
          var words = text.match(this.getWordCharPattern());

          if (method === "spellcheck") {
            var suggestions = {};

            for (var i = 0; i < words.length; i++) {
              suggestions[words[i]] = ["First", "Second"];
            }

            success(suggestions);
          }

          if (method === "addToDictionary") {
            success();
          }
        },
        templates: [
          { title: 'Some title 1', description: 'Some desc 1', content: 'My content' },
          { title: 'Some title 2', description: 'Some desc 2', content: '<div class="mceTmpl"><span class="cdate">cdate</span><span class="mdate">mdate</span>My content2</div>' }
        ],
        template_cdate_format: "[CDATE: %m/%d/%Y : %H:%M:%S]",
        template_mdate_format: "[MDATE: %m/%d/%Y : %H:%M:%S]",
        image_caption: true,
        theme: "modern",
        mobile: {
          plugins: [
            "autosave lists"
          ]
        },
        plugins: [
          "autosave advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker toc",
          "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
          "save table contextmenu directionality emoticons template paste textcolor importcss colorpicker textpattern",
          "codesample help noneditable print"
        ],
        add_unload_trigger: false,
        toolbar: "insertfile undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | " +
        "bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons table codesample code | ltr rtl"
      };

      EditorManager.init(settings);


      EditorManager.init(Merger.deepMerge(settings, { inline: true, selector: 'div.tinymce' }));

      window.tinymce = EditorManager;
    };
  }
);
