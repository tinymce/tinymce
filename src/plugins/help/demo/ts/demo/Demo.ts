declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'help link table paste code emoticons fullpage print fullscreen advlist anchor bbcode colorpicker textcolor',
  toolbar: 'help',
  height: 600,
  menubar: 'view insert tools help'
});

export {};