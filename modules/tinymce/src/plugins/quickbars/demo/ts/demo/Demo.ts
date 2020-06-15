declare let tinymce: any;

const quickbarsClassicConfig = {
  selector: 'textarea.tinymce',
  plugins: 'quickbars link code',
  toolbar: 'quickbars code',
  menubar: 'view insert tools custom',
  link_quicklink: true,
  height: 600,
  setup: (ed) => {
    ed.on('init', () => {
      ed.hasVisual = true;
      ed.addVisual();
    });

    ed.on('init', () => {
      ed.setContent('<h1>Heading</h1><p><a name="anchor1"></a>anchor here.');
    });
  }
};

const dfreeHeaderConfig = {
  selector: '.dfree-header',
  plugins: [ 'quickbars' ],
  toolbar: false,
  menubar: false,
  inline: true,
  quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote'
};

const dfreeBodyConfig = {
  selector: '.dfree-body',
  menubar: false,
  inline: true,
  plugins: [
    'autolink',
    'codesample',
    'contextmenu',
    'link',
    'lists',
    'table',
    'textcolor',
    'image',
    'quickbars'
  ],
  toolbar: false,
  quickbars_insert_toolbar: 'bold italic | quicklink h2 h3 blockquote',
  quickbars_selection_toolbar: 'bold italic | h2 h3 | blockquote quicklink',
  contextmenu: 'inserttable | cell row column deletetable'
};

tinymce.init(quickbarsClassicConfig);
tinymce.init(dfreeHeaderConfig);
tinymce.init(dfreeBodyConfig);

export {};
