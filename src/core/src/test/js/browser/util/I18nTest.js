asynctest(
  'browser.tinymce.core.util.I18nTest',
  [
    'ephox.mcagar.api.LegacyUnit',
    'ephox.agar.api.Pipeline',
    'tinymce.core.util.I18n'
  ],
  function (LegacyUnit, Pipeline, I18n) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    suite.test("Translate strings", function () {
      var undef;
      var translate = I18n.translate;

      I18n.add("code", {
        "text": "text translation",
        "value:{0}{1}": "value translation:{0}{1}",
        "text{context:something}": "text translation with context",
        "value:{0}{1}{context:something}": "value translation:{0}{1} with context",
        "empty string": ""
      });

      LegacyUnit.equal(translate("text"), "text translation");
      LegacyUnit.equal(translate("untranslated text"), "untranslated text");
      LegacyUnit.equal(translate(["untranslated value:{0}{1}", "a", "b"]), "untranslated value:ab");
      LegacyUnit.equal(translate(["value:{0}{1}", "a", "b"]), "value translation:ab");
      LegacyUnit.equal(translate("untranslated text{context:context}"), "untranslated text");
      LegacyUnit.equal(translate(["untranslated value:{0}{1}{context:something}", "a", "b"]), "untranslated value:ab");
      LegacyUnit.equal(translate(["value:{0}{1}{context:something}", "a", "b"]), "value translation:ab with context");

      // check if translate survives some awkward cases
      LegacyUnit.deepEqual(translate("empty string"), "");
      LegacyUnit.equal(translate(["untranslated value:{0}{1}", "a"]), "untranslated value:a{1}",
        "Do not strip tokens that weren't replaced.");

      LegacyUnit.equal(translate([{}]), "[object Object]");
      LegacyUnit.equal(translate(function () { }), "[object Function]");

      LegacyUnit.equal(translate(null), "");
      LegacyUnit.equal(translate(0), "0", "0");
      LegacyUnit.equal(translate(true), "true", "true");
      LegacyUnit.equal(translate(false), "false", "false");

      LegacyUnit.equal(translate({}), "[object Object]", "[object Object]");
      LegacyUnit.equal(translate({ raw: "" }), "", "empty string");
      LegacyUnit.equal(translate({ raw: false }), "false", "false");
      LegacyUnit.equal(translate({ raw: undef }), "");
      LegacyUnit.equal(translate({ raw: null }), "");

      // https://github.com/tinymce/tinymce/issues/3029
      LegacyUnit.equal(translate("hasOwnProperty"), "hasOwnProperty");
      I18n.add("code", {
        "hasOwnProperty": "good"
      });
      LegacyUnit.equal(translate("hasOwnProperty"), "good");
    });

    suite.test("Switch language", function () {
      for (var key in I18n.data) {
        delete I18n.data[key];
      }

      I18n.add("code1", {
        "text": "translation1"
      });

      LegacyUnit.equal(I18n.getCode(), "code1");
      LegacyUnit.strictEqual(I18n.rtl, false);
      LegacyUnit.deepEqual(I18n.data, {
        "code1": {
          "text": "translation1"
        }
      });

      I18n.add("code2", {
        "_dir": "rtl",
        "text": "translation2"
      });

      LegacyUnit.equal(I18n.getCode(), "code2");
      LegacyUnit.strictEqual(I18n.rtl, true);
      LegacyUnit.deepEqual(I18n.data, {
        "code1": {
          "text": "translation1"
        },

        "code2": {
          "_dir": "rtl",
          "text": "translation2"
        }
      });

      I18n.rtl = false;
    });

    Pipeline.async({}, suite.toSteps({}), function () {
      success();
    }, failure);
  }
);
