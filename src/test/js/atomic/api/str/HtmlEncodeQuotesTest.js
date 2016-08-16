test('htmlEncodeDoubleQuotes',

  [
    'ephox.katamari.api.Strings'
  ],

  function(Strings) {

    function check(expected, input) {
        var actual = Strings.htmlEncodeDoubleQuotes(input);
        assert.eq(expected, actual);
    }

    check("", "");
    check("a", "a");
    check("&quot;", "\"");
    check("&quot;&quot;", "\"\"");
    check("a&quot;b&quot;c", "a\"b\"c");
    check("&quot;", "&quot;");
  }
);

