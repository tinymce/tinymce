define(
  'ephox.alloy.navigation.KeyRules',

  [
    'ephox.alloy.navigation.KeyMatch',
    'ephox.katamari.api.Arr'
  ],

  function (KeyMatch, Arr) {
    var basic = function (key, action) {
      return {
        matches: KeyMatch.is(key),
        classification: action
      };
    };

    var rule = function (matches, action) {
      return {
        matches: matches,
        classification: action
      };
    };

    var choose = function (transitions, event) {
      var transition = Arr.find(transitions, function (t) {
        return t.matches(event);
      });

      return transition.map(function (t) {
        return t.classification;
      });
    };

    return {
      basic: basic,
      rule: rule,
      choose: choose
    };
  }
);