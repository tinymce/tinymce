define(
  'tinymce.themes.mobile.ui.Inputs',

  [
    'ephox.alloy.api.ui.Input',
    'ephox.katamari.api.Option'
  ],

  function (Input, Option) {
    var field = function (name, placeholder) {
      return {
        name: name,
        spec: Input.sketch({
          dom: {
            attributes: {
              placeholder: placeholder
            }
          },
          behaviours: {
            composing: { find: Option.some }
          }
        })
      };
    };

    return {
      field: field
    };
  }
);