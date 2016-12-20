test(
  'BodyTest',

  [
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (Body, Element, Insert, Remove, SelectorFind) {
    var body = SelectorFind.first('body').getOrDie();

    var div = Element.fromTag('div');
    var child = Element.fromTag('span');
    var text = Element.fromText('hi');
    Insert.append(child, text);
    Insert.append(div, child);
    assert.eq(false, Body.inBody(div));
    assert.eq(false, Body.inBody(child));
    assert.eq(false, Body.inBody(text));

    Insert.append(body, div);
    assert.eq(true, Body.inBody(div));
    assert.eq(true, Body.inBody(child));
    assert.eq(true, Body.inBody(text));
    assert.eq(true, Body.inBody(body));

    Remove.remove(div);
  }
);
