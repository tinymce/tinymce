define(
  'ephox.alloy.api.ui.ModalDialog',

  [
    'ephox.alloy.api.ui.CompositeBuilder'
  ],

  function (CompositeBuilder) {
    var schema = [
      
    ];

     var partTypes = [
     
    ];

    var build = function (spec) {
      return CompositeBuilder.build('modal-dialog', schema, partTypes, make, spec);
    };

    var make = function (detail, components, spec, externals) {
      return {
        uiType: 'container'
      };
    };

    return {
      build: build
    };
  }
);