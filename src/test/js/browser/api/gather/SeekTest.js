test(
  'api.dom.DomGather.{seekLeft,seekRight}',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.api.dom.DomGather',
    'ephox.phoenix.test.Page'
  ],

  function (Arr, DomGather, Page) {
    var page = Page();

    var is = function (x) {
      return function (e) {
        return e.dom() === x.dom();
      };
    };

    var check = function (spec) {
      var actual = spec.seek(spec.element, spec.predicate, is(page.container)).getOrDie('No actual element found.');
      assert.eq(spec.expected.dom(), actual.dom());
    };

    var cases = [
      {
        seek: DomGather.seekLeft,
        element: page.p2,
        predicate: is(page.p1),
        expected: page.p1
      },
      {
        seek: DomGather.seekRight,
        element: page.p1,
        predicate: is(page.p2),
        expected: page.p2
      }
    ];

    page.connect();
    Arr.map(cases, check);
    page.disconnect();
  }
);