define(
  'tinymce.themes.mobile.ui.ImagePicker',

  [
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.api.ui.Button',
    'ephox.imagetools.api.BlobConversions',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Option',
    'tinymce.themes.mobile.util.UiDomFactory'
  ],

  function (Memento, AlloyEvents, NativeEvents, Button, BlobConversions, Id, Option, UiDomFactory) {
    var addImage = function (editor, blob) {
      BlobConversions.blobToBase64(blob).then(function (base64) {
        editor.undoManager.transact(function () {
          var cache = editor.editorUpload.blobCache;
          var info = cache.create(
            Id.generate('mceu'), blob, base64
          );
          cache.add(info);
          var img = editor.dom.createHTML('img', {
            src: info.blobUri()
          });
          editor.insertContent(img);
        });
      });
    };

    var extractBlob = function (simulatedEvent) {
      var event = simulatedEvent.event();
      var files = event.raw().target.files || event.raw().dataTransfer.files;
      return Option.from(files[0]);
    };

    var sketch = function (editor) {
      var pickerDom = {
        tag: 'input',
        attributes: { accept: 'image/*', type: 'file', title: '' },
         // Visibility hidden so that it cannot be seen, and position absolute so that it doesn't
        // disrupt the layout
        styles: { visibility: 'hidden', position: 'absolute' }
      };

      var memPicker = Memento.record({
        dom: pickerDom,
        events: AlloyEvents.derive([
          // Stop the event firing again at the button level
          AlloyEvents.cutter(NativeEvents.click()),

          AlloyEvents.run(NativeEvents.change(), function (picker, simulatedEvent) {
            extractBlob(simulatedEvent).each(function (blob) {
              addImage(editor, blob);
            });
          })
        ])
      });

      return Button.sketch({
        dom: UiDomFactory.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-image ${prefix}-icon"></span>'),
        components: [
          memPicker.asSpec()
        ],
        action: function (button) {
          var picker = memPicker.get(button);
          // Trigger a dom click for the file input
          picker.element().dom().click();
        }
      });
    };

    return {
      sketch: sketch
    };
  }
);
