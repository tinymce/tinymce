test('BodyParts',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(input, head, torso, tail, toe) {
      var a = assert.eq;

      a(head,  Strings.head(input));
      a(tail,  Strings.tail(input));
      a(toe,   Strings.toe(input));
      a(torso, Strings.torso(input));
    }

    check("a", "a", "", "", "a");
    check("ab", "a", "a", "b", "b");
    check("abcd", "a", "abc", "bcd", "d");

    function checkFails(fnName) {
      assert.throws(function() {
        Strings[fnName]("");
      });
    }

    checkFails("head");
    checkFails("tail");
    checkFails("toe");
    checkFails("torso");
  }
);
