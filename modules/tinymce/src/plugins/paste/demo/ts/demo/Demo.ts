// tslint:disable:no-console
import { console } from '@ephox/dom-globals';

declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'silver',
  skin_url: '../../../../../js/tinymce/skins/ui/oxide',
  plugins: 'paste code',
  toolbar: 'undo redo | pastetext code',
  init_instance_callback(editor) {
    editor.on('PastePreProcess', function (evt) {
      console.log(evt);
    });

    editor.on('PastePostProcess', function (evt) {
      console.log(evt);
    });
  },
  height: 600
});

export {};