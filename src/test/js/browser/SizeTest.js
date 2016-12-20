test(
  'SizeTest',

  [
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.view.Width',
    'ephox.sugar.test.Div'
  ],

  function (Body, Css, Height, Insert, Remove, Width, Div) {
    var c = Div();

    var checker = function (cssProp, api) {
      var checkExc = function (expected, f) {
        try {
          f();
          assert.fail('Expected exception not thrown.');
        } catch (e) {
          assert.eq(expected, e);
        }
      };

      var exact = function () {
        return Css.getRaw(c, cssProp).getOrDie('value was not set');
      };

      api.set(c, 100);
      assert.eq(100, api.get(c));
      checkExc(cssProp + '.set accepts only positive integer values. Value was 100%', function () {
        api.set(c, '100%');
      });
      checkExc(cssProp + '.set accepts only positive integer values. Value was 100px', function () {
        api.set(c, '100px');
      });
      assert.eq('100px', exact());

      Css.set(c, cssProp, '85%');
      assert.eq('85%', exact());

      if (Body.inBody(c)) {
        // percentage height is calcualted as zero, but percentage width works just fine
        if (cssProp === 'height') {
          assert.eq(0, api.get(c));
        } else {
          assert.eq(true, api.get(c) > 0);
        }
      }

      Css.set(c, cssProp, '30px');
      assert.eq(30, api.get(c));
      assert.eq('30px', exact());
    };

    checker('height', Height);
    checker('width', Width);
    Insert.append(Body.body(), c);
    checker('height', Height);
    checker('width', Width);

    Remove.remove(c);
  }
);
