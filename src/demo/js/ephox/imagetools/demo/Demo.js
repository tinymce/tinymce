define(
  'ephox.imagetools.demo.Demo',

  [
    'ephox/imagetools/api/BlobConversions',
    'ephox/imagetools/api/ImageTransformations'
  ],

  function (BlobConversions, ImageTransformations) {

      function modify(image, op, args) {
          BlobConversions.imageToBlob(image)
              .then(function (blob) {
                  args.unshift(blob);
                  return ImageTransformations[op].apply(null, args);
              })
              .then(BlobConversions.blobToDataUri)
              .then(function (data) {
                  image.src = data;
              });
      }

      var forms = document.querySelectorAll('.options');
      for (var i = 0; i < forms.length; i++) {
          (function(form) {
              form.onsubmit = function (el) {
                  var selector = document.getElementById('selector');
                  var currOp = selector.options[selector.selectedIndex].value;
                  var image = document.getElementById('editor');
                  modify(image, currOp, [].slice.call(this.elements)
                          .filter(function(el) {
                              return el.tagName != 'BUTTON';
                          })
                          .map(function (el) {
                              return el.value;
                          })
                  );
                  return false;
              }
          }(forms[i]));
      }

      return function() {}; // seems like return should be a function
  }
);

