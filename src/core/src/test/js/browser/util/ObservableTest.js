asynctest(
  'browser.tinymce.core.util.ObservableTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.util.Observable',
    'tinymce.core.util.Tools'
  ],
  function (LegacyUnit, Pipeline, Observable, Tools) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    suite.test("Event bubbling/removed state", function () {
      var lastName, lastState, data = '';

      var Class = function (parentObj) {
        this.toggleNativeEvent = function (name, state) {
          lastName = name;
          lastState = state;
        };

        this.parent = function () {
          return parentObj;
        };
      };

      Tools.extend(Class.prototype, Observable);

      var inst1 = new Class();

      inst1.on('click', function () {
        data += 'a';
      });
      LegacyUnit.strictEqual(lastName, 'click');
      LegacyUnit.strictEqual(lastState, true);

      lastName = lastState = null;
      inst1.on('click', function () {
        data += 'b';
      });
      LegacyUnit.strictEqual(lastName, null);
      LegacyUnit.strictEqual(lastState, null);

      var inst2 = new Class(inst1);
      inst2.on('click', function () {
        data += 'c';
      });

      inst2.fire('click');
      LegacyUnit.strictEqual(data, 'cab');

      inst2.on('click', function (e) {
        e.stopPropagation();
      });

      inst2.fire('click');
      LegacyUnit.strictEqual(data, 'cabc');

      inst1.on('remove', function () {
        data += 'r';
      });
      inst1.removed = true;
      inst1.fire('click');
      inst1.fire('remove');
      LegacyUnit.strictEqual(data, 'cabcr');
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);
