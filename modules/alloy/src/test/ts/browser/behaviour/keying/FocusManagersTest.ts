import { Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Logger, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';
import { Attr, Focus, SelectorFind } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('Browser Test: behaviour.keying.FocusManagersTest', (success, failure) => {
  const manager = (prefix) => {
    let active = '';

    const set = (component, focusee) => {
      active = Attr.get(focusee, 'class');
    };

    const get = (component) => {
      return SelectorFind.descendant(component.element(), '.' + active);
    };

    // Test only method
    const sAssert = (label, expected) => {
      return Step.sync(() => {
        Assertions.assertEq(prefix + ' ' + label, expected, active);
      });
    };

    return {
      set,
      get,
      sAssert
    };
  };

  const makeItems = (tag, prefix, haveTabstop, firstNum) => {
    return Arr.map([ firstNum, firstNum + 1, firstNum + 2 ], (num) => {
      return {
        dom: {
          tag,
          classes: [ prefix + '-' + num ],
          innerHtml: prefix + '-' + num
        },
        behaviours: Behaviour.derive(
          Arr.flatten<any>([
            [ Focusing.config({ }) ],
            haveTabstop ? [ Tabstopping.config({ }) ] : [ ]
          ])
        )
      };
    });
  };

  const acyclicManager = manager('acyclic');
  const memAcyclic = Memento.record({
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

  const cyclicManager = manager('cyclic');
  const memCyclic = Memento.record({
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

  const flatgridManager = manager('flatgrid');
  const memFlatgrid = Memento.record({
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

  const flowManager = manager('flow');
  const memFlow = Memento.record({
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

  const matrixManager = manager('matrix');
  const memMatrix = Memento.record({
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

  const menuManager = manager('menu');
  const memMenu = Memento.record({
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
    (store, doc, body) => {
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

    (doc, body, gui, component, store) => {

      const sFocusStillUnmoved = (label) => {
        return Logger.t(
          label,
          FocusTools.sTryOnSelector('Focus always stays on outer container', doc, '.container')
        );
      };

      const sFocusIn = (component) => {
        return Step.sync(() => {
          Keying.focusIn(component);
        });
      };

      const sKeyInside = (comp, selector, key, modifiers) => {
        return Chain.asStep(comp.element(), [
          UiFinder.cFindIn(selector),
          Chain.op((inside) => {
            Keyboard.keydown(key, modifiers, inside);
          })
        ]);
      };

      const acyclic = memAcyclic.get(component);
      const cyclic = memCyclic.get(component);
      const flatgrid = memFlatgrid.get(component);
      const flow = memFlow.get(component);
      const matrix = memMatrix.get(component);
      const menu = memMenu.get(component);

      const sTestKeying = (label, comp, manager, keyName) => {
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
          Step.sync(() => {
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
