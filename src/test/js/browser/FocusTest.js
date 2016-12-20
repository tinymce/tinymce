test(
  'FocusTest',

  [
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove'
  ],

  function (Attr, Body, Compare, Element, Focus, Insert, Remove) {
    var div = Element.fromTag('div');
    Attr.set(div, 'tabindex', '-1');

    var input = Element.fromTag('input');

    Insert.append(div, input);
    Insert.append(Body.body(), div);

    Focus.focus(input);
    assert.eq(true, Compare.eq(Focus.active().getOrDie(), input));
    Focus.focus(div);
    assert.eq(true, Compare.eq(Focus.active().getOrDie(), div));
    Focus.focus(input);
    assert.eq(true, Compare.eq(Focus.active().getOrDie(), input));
    Focus.focusInside(div);
    assert.eq(true, Compare.eq(Focus.active().getOrDie(), input));
    Focus.focusInside(input);
    assert.eq(true, Compare.eq(Focus.active().getOrDie(), input));
    Focus.focus(div);
    assert.eq(true, Compare.eq(Focus.active().getOrDie(), div));

    Remove.remove(div);
  }
);