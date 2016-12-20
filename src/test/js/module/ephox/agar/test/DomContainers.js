define(
  'ephox.agar.test.DomContainers',

  [
    'ephox.agar.api.Step',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove'
  ],

  function (Step, Attr, Element, Insert, Remove) {
    var mSetup = Step.stateful(function (state, next, die) {
      var container = Element.fromTag('div');
      Attr.set(container, 'tabindex', '-1');
      Attr.set(container, 'test-id', 'true');

      var input = Element.fromTag('input');
      Insert.append(container, input);

      Insert.append(Element.fromDom(document.body), container);
      next({
        container: container,
        input: input
      });
    });

    var mTeardown = Step.stateful(function (state, next, die) {
      Remove.remove(state.container);
      next(state);
    });

    return {
      mSetup: mSetup,
      mTeardown: mTeardown
    };
  }
);