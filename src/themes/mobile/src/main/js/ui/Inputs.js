define(
  'tinymce.themes.mobile.ui.Inputs',

  [
    'ephox.alloy.api.ui.DataField',
    'ephox.alloy.api.ui.Input',
    'ephox.katamari.api.Option'
  ],

  function (DataField, Input, Option) {
    var field = function (name, placeholder) {
      return {
        name: name,
        spec: Input.sketch({
          placeholder: placeholder,
          inputBehaviours: {
            composing: { find: Option.some }
          }
        })
      };
    };

    var hidden = function (name) {
      return {
        name: name,
        spec: DataField.sketch({
          dom: {
            tag: 'span',
            styles: {
              display: 'none'
            }
          },
          getInitialValue: Option.none
        })
      };
    };

    return {
      field: field,
      hidden: hidden
    };
  }
);