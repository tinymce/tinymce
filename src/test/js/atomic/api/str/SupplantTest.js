test('supplant',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, str, obj) {
        var actual = Strings.supplant(str, obj);
        assert.eq(expected, actual);
    }

    check("", "", {});
    check("", "", {cat: "dog"});
    check("a", "a", {});
    check("${a}", "${a}", {a: function(){}});
    check("toaster", "${a}", {a: "toaster"});
    check("cattoastera", "cat${a}a", {a: "toaster"});
  }
);
