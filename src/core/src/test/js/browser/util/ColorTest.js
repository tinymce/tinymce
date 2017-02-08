asynctest(
  'browser.tinymce.core.util.ColorTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.util.Color'
  ],
  function (LegacyUnit, Pipeline, Color) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    suite.test("Constructor", function () {
      LegacyUnit.equal(new Color().toHex(), '#000000');
      LegacyUnit.equal(new Color('#faebcd').toHex(), '#faebcd');
    });

    suite.test("parse method", function () {
      var color = new Color();

      LegacyUnit.equal(color.parse('#faebcd').toHex(), '#faebcd');
      LegacyUnit.equal(color.parse('#ccc').toHex(), '#cccccc');
      LegacyUnit.equal(color.parse(' #faebcd ').toHex(), '#faebcd');
      LegacyUnit.equal(color.parse('rgb(255,254,253)').toHex(), '#fffefd');
      LegacyUnit.equal(color.parse(' rgb ( 255 , 254 , 253 ) ').toHex(), '#fffefd');
      LegacyUnit.equal(color.parse({ r: 255, g: 254, b: 253 }).toHex(), '#fffefd');
      LegacyUnit.equal(color.parse({ h: 359, s: 50, v: 50 }).toHex(), '#804041');
      LegacyUnit.equal(color.parse({ r: 700, g: 700, b: 700 }).toHex(), '#ffffff');
      LegacyUnit.equal(color.parse({ r: -1, g: -10, b: -20 }).toHex(), '#000000');
    });

    suite.test("toRgb method", function () {
      LegacyUnit.deepEqual(new Color('#faebcd').toRgb(), { r: 250, g: 235, b: 205 });
    });

    suite.test("toHsv method", function () {
      LegacyUnit.deepEqual(new Color('#804041').toHsv(), { h: 359, s: 50, v: 50 });
    });

    suite.test("toHex method", function () {
      LegacyUnit.equal(new Color({ r: 255, g: 254, b: 253 }).toHex(), '#fffefd');
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);