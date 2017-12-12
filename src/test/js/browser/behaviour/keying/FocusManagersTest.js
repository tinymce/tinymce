import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { FocusTools } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Keyboard } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Focusing from 'ephox/alloy/api/behaviour/Focusing';
import Keying from 'ephox/alloy/api/behaviour/Keying';
import Tabstopping from 'ephox/alloy/api/behaviour/Tabstopping';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Memento from 'ephox/alloy/api/component/Memento';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Arr } from '@ephox/katamari';
import { Focus } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('Browser Test: behaviour.keying.FocusManagersTest', function() {
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

  var makeItems = function (tag, prefix, haveTabstop, firstNum) {
    return Arr.map([ firstNum, firstNum + 1, firstNum + 2 ], function (num) {
      return {
        dom: {
          tag: tag,
          classes: [ prefix + '-' + num ],
          innerHtml: prefix + '-' + num
        },
        behaviours: Behaviour.derive([
          Focusing.config({ })
        ].concat(haveTabstop ? [ Tabstopping.config({ }) ] : [ ]))
      };
    });
  };

  var acyclicManager = manager('acyclic');
  var memAcyclic = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'acyclic' ]
    },
    components: makeItems('span', 'acyclic', true, 1),
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
    components: makeItems('span', 'cyclic', true, 1),
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'cyclic',
        focusManager: cyclicManager
      })
    ])
  });

  var flatgridManager = manager('flatgrid');
  var memFlatgrid = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'flatgrid' ]
    },
    components: makeItems('span', 'flatgrid', false, 1),
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'flatgrid',
        selector: 'span',
        initSize: {
          numRows: 2,
          numColumns: 2
        },
        focusManager: flatgridManager
      })
    ])
  });

  var flowManager = manager('flow');
  var memFlow = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'flow' ]
    },
    components: makeItems('span', 'flow', false, 1),
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'flow',
        selector: 'span',
        focusManager: flowManager
      })
    ])
  });

  var matrixManager = manager('matrix');
  var memMatrix = Memento.record({
    dom: {
      tag: 'table',
      classes: [ 'matrix' ]
    },
    components: [
      {
        dom: { tag: 'tr' },
        components: makeItems('td', 'matrix', false, 1)
      },
      {
        dom: { tag: 'tr' },
        components: makeItems('td', 'matrix', false, 4)
      }
    ],
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'matrix',
        selectors: {
          row: 'tr',
          cell: 'td'
        },
        focusManager: matrixManager
      })
    ])
  });

  var menuManager = manager('menu');
  var memMenu = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'menu' ]
    },
    components: makeItems('span', 'menu', false, 1),
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'menu',
        selector: 'span',
        focusManager: menuManager
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
          memCyclic.asSpec(),
          memFlatgrid.asSpec(),
          memFlow.asSpec(),
          memMatrix.asSpec(),
          memMenu.asSpec()
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
      var flatgrid = memFlatgrid.get(component);
      var flow = memFlow.get(component);
      var matrix = memMatrix.get(component);
      var menu = memMenu.get(component);

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
        ),

        sTestKeying(
          'flatgrid',
          flatgrid,
          flatgridManager,
          'right'
        ),

        sTestKeying(
          'flow',
          flow,
          flowManager,
          'right'
        ),

        sTestKeying(
          'matrix',
          matrix,
          matrixManager,
          'right'
        ),

        sTestKeying(
          'menu',
          menu,
          menuManager,
          'down'
        )
      ];
    },
    success,
    failure
  );
});

