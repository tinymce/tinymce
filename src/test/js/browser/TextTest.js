test(
  'TextTest',

  [
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Text',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Element, Text, Traverse) {
    var ensureClobberedTextNodeDoesNotThrow = function () {
      var span = Element.fromHtml('<span>hi</span>');
      Traverse.child(span, 0).each(function (text0) {
        span.dom().innerHTML = 'smashed';
        var v = Text.get(text0); // Throws in IE10.
        assert.eq('string', typeof(v));
      });
    };

    ensureClobberedTextNodeDoesNotThrow();

    var notText = Element.fromTag('span');
    var t = Element.fromText('a');
    assert.eq('a', Text.get(t));
    Text.set(t, 'blue');
    assert.eq('blue', t.dom().nodeValue);

    try {
      Text.get(notText);
      assert.fail('get on non-text did not throw');
    } catch (e) {
      // pass
    }

    try {
      Text.set(notText, 'bogus');
      assert.fail('set on non-text did not throw');
    } catch (e) {
      // pass
    }
  }
);
