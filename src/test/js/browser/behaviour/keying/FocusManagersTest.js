asynctest(
  'Browser Test: behaviour.keying.FocusManagersTest',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.test.GuiSetup',
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (
    Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Logger, Step, UiFinder, Behaviour, Focusing, Keying, Tabstopping, GuiFactory, Memento, GuiSetup,
    Arr, Focus, Attr, SelectorFind
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var manager = function (prefix) {
      var active = '';

      var set = function (component, focusee) {
        active = Attr.get(focusee, 'class');
      };

      var get = function (component) {
        return SelectorFind.descendant(component.element(), '.' + active);
      };

      // Test only method
      var sAssert = function (label, expected) {
        return Step.sync(function () {
          Assertions.assertEq(prefix + ' ' + label, expected, active);
        });
      };

      return {
        set: set,
        get: get,
        sAssert: sAssert
      };
    };

    var acyclicManager = manager('acyclic');
    var memAcyclic = Memento.record({
      dom: {
        tag: 'div',
        classes: [ 'acyclic' ]
      },
      components: Arr.map([ '1', '2', '3' ], function (num) {
        return {
          dom: {
            tag: 'span',
            classes: [ 'acyclic-' + num ],
            innerHtml: 'acyclic-' + num
          },
          behaviours: Behaviour.derive([
            Tabstopping.config({ }),
            Focusing.config({ })
          ])
        };
      }),
      behaviours: Behaviour.derive([
        Keying.config({
          mode: 'acyclic',
          focusManager: acyclicManager
        })
      ])
    });

    var cyclicManager = manager('cyclic');
    var memCyclic = Memento.record({
      dom: {
        tag: 'div',
        classes: [ 'cyclic' ]
      },
      components: Arr.map([ '1', '2', '3' ], function (num) {
        return {
          dom: {
            tag: 'span',
            classes: [ 'cyclic-' + num ],
            innerHtml: 'cyclic-' + num
          },
          behaviours: Behaviour.derive([
            Tabstopping.config({ }),
            Focusing.config({ })
          ])
        };
      }),
      behaviours: Behaviour.derive([
        Keying.config({
          mode: 'cyclic',
          focusManager: cyclicManager
        })
      ])
    });


    GuiSetup.setup(
      function (store, doc, body) {
        return GuiFactory.build({
          dom: {
            tag: 'div',
            classes: [ 'container' ]
          },
          components: [
            memAcyclic.asSpec(),
            memCyclic.asSpec()
          ],

          behaviours: Behaviour.derive([
            Focusing.config({ })
          ])
        });
      },

      function (doc, body, gui, component, store) {

        var sFocusStillUnmoved = function (label) {
          return Logger.t(
            label,
            FocusTools.sTryOnSelector('Focus always stays on outer container', doc, '.container')
          );
        };

        var sFocusIn = function (component) {
          return Step.sync(function () {
            Keying.focusIn(component);
          });
        };

        var sKeyInside = function (comp, selector, key, modifiers) {
          return Chain.asStep(comp.element(), [
            UiFinder.cFindIn(selector),
            Chain.op(function (inside) {
              Keyboard.keydown(key, modifiers, inside);
            })
          ]);
        };

        var acyclic = memAcyclic.get(component);
        var cyclic = memCyclic.get(component);


        var sTestKeying = function (label, comp, manager, keyName) {
          return Logger.t(
            label + ' Keying',
            GeneralSteps.sequence([
              sFocusIn(comp),
              manager.sAssert('Focus in ' + label + '-1', label + '-1'),
              sFocusStillUnmoved(label + '.focusIn'),

              // Pressing tab will work based on the get from focusManager, so it should move to acyclic-2
              sKeyInside(comp, '.' + label + '-1', Keys[keyName](), { }),
              manager.sAssert('Focus in ' + label + '-2', label + '-2'),
              sFocusStillUnmoved(label + '.' + keyName)
            ])
          );
        };

        return [
          Logger.t(
            'Initial focus on container',
            Step.sync(function () {
              Focus.focus(component.element());
            })
          ),

          sTestKeying(
            'acyclic',
            acyclic,
            acyclicManager,
            'tab'
          ),

          sTestKeying(
            'cyclic',
            cyclic,
            cyclicManager,
            'tab'
          )
        ];
      },
      success,
      failure
    );
  }
);
