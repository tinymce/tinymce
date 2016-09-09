asynctest(
  'ExecutingKeyingTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.compass.Arr'
  ],
 
  function (Assertions, Chain, NamedChain, Step, UiFinder, GuiFactory, GuiSetup, Arr) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var makeItem = function (name) {
        return {
          uiType: 'custom',
          dom: {
            tag: 'span',
            styles: {
              display: 'inline-block',
              width: '100px',
              height: '30px',
              border: '1px solid red',
              'text-align': 'center',
              'vertical-align': 'middle'
            },
            innerHtml: name,
            classes: [ name, 'test-item' ]
          }
        };
      };

      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        highlighting: {
          highlightClass: 'test-selected',
          itemClass: 'test-item'
        },
        components: Arr.map([
          'alpha',
          'beta',
          'gamma'
        ], makeItem)
      });

    }, function (doc, body, gui, component, store) {
      var cCheckNum = function (label, expected) {
        return Chain.fromChains([
          Chain.mapper(function (array) { return array.length; }),
          Assertions.cAssertEq(label, expected)
        ]);
      };

      var cCheckNumOf = function (label, selector, expected) {
        var field = 'check-' + selector;
        return Chain.fromChains([
          NamedChain.direct('container', UiFinder.cFindAllIn(selector), field),
          NamedChain.direct(field, cCheckNum(label, expected), '_')
        ]);
      };

      return [
        Chain.asStep({}, [
          NamedChain.asChain([
            NamedChain.writeValue('container', component.element()),
            cCheckNumOf('Should be none selected', '.test-selected', 0),
            cCheckNumOf('Should be three items', '.test-item', 3)
          ])
        ]),
        UiFinder.sNotExists(gui.element(), '.test-selected'),
        UiFinder.sNotExists(gui.element(), '.test-item')
      ];
    }, function () { success(); }, failure);

  }
);