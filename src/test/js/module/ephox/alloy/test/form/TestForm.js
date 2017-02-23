define(
  'ephox.alloy.test.form.TestForm',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.katamari.api.Obj'
  ],

  function (Assertions, Step, Representing, Obj) {
    var helper = function (component) {
      var sAssertRep = function (expected) {
        return Step.sync(function () {
          var val = Representing.getValue(component);
          Assertions.assertEq(
            'Checking form value',
            expected,

            Obj.map(val, function (v, k) {
              return v.getOrDie(k + ' field is "None"'); 
            })
          );
        });
      };

      var sSetRep = function (newValues) {
        return Step.sync(function () {
          Representing.setValue(component, newValues);
        });
      };

      return {
        sAssertRep: sAssertRep,
        sSetRep: sSetRep
      };
    };

    return {
      helper: helper
    };
  }
);