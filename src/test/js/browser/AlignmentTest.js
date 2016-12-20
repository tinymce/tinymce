test(
  'AlignmentTest',

  [
    'ephox.sugar.api.properties.Alignment',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.test.EphoxElement'
  ],

  function (Alignment, Attr, Body, Element, Insert, Remove, Traverse, EphoxElement) {
    var body = Body.body();
    var createDirectionalP = function (direction) {
      var divEl = EphoxElement('div');
      var par = EphoxElement('p');
      Attr.setAll(divEl, {dir: direction});
      Insert.append(body, divEl);
      Insert.append(divEl, par);
      return par;
    };

    var check = function (element, property, value, expected) {
      var res = Alignment.hasAlignment(element, property, value);
      assert.eq(expected, res);
      Traverse.parent(element).each(Remove.remove);
    };

    var rtlP = createDirectionalP('rtl');
    check(rtlP, 'text-align', 'left', false);
    var rtlIsRight = createDirectionalP('rtl');
    check(rtlIsRight, 'text-align', 'right', true);

    /* should never be checking alignment on a text node */
    check(Element.fromText('Bacon eatsum'), 'text-align', 'left', false);
  }
);