import { UnitTest, assert } from "@ephox/bedrock";
import { Fun, Obj, Option, StringMatch } from "@ephox/katamari";
import { PlatformDetection } from "@ephox/sand";
import { Element, Attr, Css, Html, Traverse } from "@ephox/sugar";
import AriaVoice from "ephox/echo/api/AriaVoice";

UnitTest.test('AriaRegisterTest', function () {
  var platform = PlatformDetection.detect();

  // @tunic-tag=aria

  var matchToString = function (subject) {
    return StringMatch.cata(subject,
      function (value) { return 'startsWith(' + value + ')'; },
      function (regex) { return 'pattern(' + regex + ')'; },
      function (value) { return 'contains(' + value + ')'; },
      function (value) { return 'exact(' + value + ')'; },
      function () { return 'all'; },
      function (sm) { return 'not(' + matchToString(sm) + ')'; }
    );
  };

  var checkValues = function (label, type, expected, getActual) {
    Obj.each(expected, function (exp, k) {
      exp.fold(function () { // no actual & no expected -> OK
        getActual(k).each(function (v) { // actual but no expected
          assert.fail('Test: ' + label + '. Token should not have: ' + k + '=' + v);
        });
      }, function (expMatch) {
        getActual(k).fold(function () { // no actual, but expected
          assert.fail(type + ' expected: ' + matchToString(expMatch) + ' for ' + k + ' but was none');
        }, function (actual) { // actual and expected -> OK if matches
          var ok = StringMatch.matches(expMatch, actual);
          assert.eq(true, ok, 'Test: ' + label + '. Expected: ' + matchToString(expMatch) + ' for ' + k + ', but was: ' + actual);
        });
      });
    });
  };

  var oStarts = Fun.compose(Option.some, function (s) { return StringMatch.starts(s, StringMatch.caseInsensitive); });
  var oExact = Fun.compose(Option.some, function (s) { return StringMatch.exact(s, StringMatch.caseInsensitive); });

  // This test is used to ensure that the tokens created by the various aria voice pathways are
  // correct. Note, that nothing will actually be adding to the page, this is all about checking
  // the values themselves.

  var check = function (label, rootAttributes, attributes, styles, root, token) {
    checkValues(label, 'Parent Attribute', rootAttributes, function (k) {
      var a = Attr.get(root, k);
      return Option.from(a);
    });

    checkValues(label, 'Attribute', attributes, function (k) {
      var a = Attr.get(token, k);
      return Option.from(a);
    });

    checkValues(label, 'Style', styles, Fun.curry(Css.getRaw, token));
  };

  var checkDynamic = function (label, rootAttributes, attributes, styles, voice, text) {
    var root = Element.fromTag('div');
    voice(root, text);
    var token = Traverse.firstChild(root).getOrDie();
    check(label, rootAttributes, attributes, styles, root, token);
    assert.eq(text, Html.get(token));
  };


  var checkStatic = function (label, rootAttributes, attributes, styles, voice, text) {
    var root = Element.fromTag('div');
    var token = AriaVoice.describe(root, text);
    check(label, rootAttributes, attributes, styles, root, token);
    assert.eq(text, Html.get(token));
  };

  checkDynamic(
    'speaking "dog"',
    {
      'aria-describedby': platform.browser.isFirefox() ? oStarts('ephox-echo-voice') : Option.none()
    },
    {
      'aria-live': oExact('polite'),
      'aria-atomic': oExact('true'),
      'aria-label': oExact('dog'),
      'role': oExact('presentation')
    },
    {
      'position': oExact('absolute'),
      'left': oExact('-9999px'),
      'display': Option.none()
    },
    AriaVoice.speak,
    'dog'
  );

  checkDynamic(
    'shouting "fire"',
    {
      'aria-describedby': platform.browser.isFirefox() ? oStarts('ephox-echo-voice') : Option.none()
    },
    {
      'aria-live': oExact('assertive'),
      'aria-atomic': oExact('true'),
      'aria-label': Option.none(),
      'role': oExact('alert')
    },
    {
      'position': oExact('absolute'),
      'left': oExact('-9999px'),
      'display': Option.none()
    },
    AriaVoice.shout,
    'fire'
  );

  checkStatic(
    'describing: a long long time ago',
    {
      'aria-describedby': oStarts('ephox-echo-voice')
    },
    {
      'aria-live': Option.none(),
      'aria-atomic': Option.none(),
      'aria-label': Option.none(),
      'role': oExact('presentation')
    },
    {
      display: oExact('none')
    },
    AriaVoice.describe,
    'a long long time ago'
  );
});
