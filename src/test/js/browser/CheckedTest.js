test(
  'CheckedTest',

  [
    'ephox.sugar.api.properties.Checked',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.properties.Value'
  ],

  function (Checked, Element, InsertAll, Value) {
    var container = Element.fromTag('div');

    var alpha = Element.fromHtml('<input type="radio" value="alpha"></input>');
    var beta = Element.fromHtml('<input type="radio" value="beta"></input>');
    var gamma = Element.fromHtml('<input type="radio" value="gamma"></input>');

    InsertAll.append(container, [ alpha, beta, gamma ]);

    assert.eq(true, Checked.find(container).isNone());
    Checked.set(beta, 'true');
    assert.eq('beta', Value.get(Checked.find(container).getOrDie()));
    Checked.set(alpha, true);
    assert.eq('alpha', Value.get(Checked.find(container).getOrDie()));

  }
);
