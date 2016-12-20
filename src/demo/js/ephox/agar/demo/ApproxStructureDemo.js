define(
  'ephox.agar.demo.ApproxStructureDemo',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.agar.demo.DemoContainer',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.dom.InsertAll'
  ],

  function (ApproxStructure, Assertions, Pipeline, DemoContainer, Class, Element, Html, InsertAll) {
    return function () {
      DemoContainer.init(
        'Approx Structure',
        function (success, failure) {

          var div = Element.fromTag('div');

          var p = Element.fromTag('p');

          var span = Element.fromTag('span');

          InsertAll.append(div, [ p ]);
          InsertAll.append(p, [ span ]);

          Class.add(span, 'dog');


          Pipeline.async({}, [
            Assertions.sAssertStructure(
              'Assert Structure example: ' + Html.getOuter(div),
              ApproxStructure.build(function (s, str, arr) {
                return s.element('div', {
                  children: [
                    s.element('p', {
                      children: [
                        s.element('span', {
                          classes: [ arr.has('dog'), arr.not('cat') ]
                        })
                      ]
                    })
                  ]
                });
              }),
              div
            )
          ], success, failure);

          return [ div ];
        }
      );
    };
  }
);