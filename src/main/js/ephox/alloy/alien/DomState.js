define(
  'ephox.alloy.alien.DomState',

  [
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Id'
  ],

  function (Objects, Id) {
    var attrName = Id.generate('dom-data');
    // In order to discourage using this module more than once, the attribute
    // is going to be hard-coded.    
    var getOrCreate = function (element, f) {
      var existing = Objects.readOptFrom(element.dom(), attrName);
      var data = existing.getOrThunk(f);
      element.dom()[attrName] = data;
      return data;
    };

    return {
      getOrCreate: getOrCreate
    };
  }
);
