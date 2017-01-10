define(
  'ephox.alloy.api.behaviour.BehaviourExport',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.epithet.Id',
    'ephox.peanut.Fun',
    'global!Array',
    'global!Error'
  ],

  function (Behaviour, FieldSchema, ValueSchema, Id, Fun, Array, Error) {
    var spi = Id.generate('spi');
   
    var santa = function (fields, name, active, apis, extra) {
      return Behaviour.create(
        FieldSchema.optionObjOf(name, fields),
        name,
        active,
        apis,
        extra
      );
    };

    var modeSanta = function (branchKey, branches, name, active, apis, extra) {
      return Behaviour.create(
        FieldSchema.optionOf(name, ValueSchema.choose(branchKey, branches)),
        name,
        active,
        apis,
        extra
      );
    };
   
    return {
      spi: Fun.constant(spi),
      modeSanta: modeSanta,
      santa: santa
    };
  }
);