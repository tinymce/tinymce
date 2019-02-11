declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'help link table paste code emoticons fullpage print fullscreen advlist anchor bbcode colorpicker textcolor',
  toolbar: 'help',
  height: 300,
  menubar: 'view insert tools help'
});

tinymce.init({
  selector: 'textarea.tinymce2',
  plugins: 'help link table paste code emoticons fullpage print fullscreen advlist anchor bbcode colorpicker textcolor',
  toolbar: 'help',
  height: 300,
  menubar: 'view insert tools help',
  help_version: () => {
    const htmlPanel = {
      type: 'htmlpanel',
      html: '<p>This is a custom version panel...</p>'
    };
    return htmlPanel;
  }
});

export {};