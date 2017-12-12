/* global tinymce, top */

tinymce.init({
  selector: "textarea",
  init_instance_callback: function (editor) {
    top.cspInitInstanceCallback(editor);
  }
});
