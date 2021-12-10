import { Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Logger, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attribute, Focus, SelectorFind, SugarElement } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('Browser Test: behaviour.keying.FocusManagersTest', (success, failure) => {
  const createManager = (prefix: string) => {
    let active: string | undefined = '';

    const set = (_component: AlloyComponent, focusee: SugarElement<HTMLElement>) => {
      active = Attribute.get(focusee, 'class');
    };

    const get = (component: AlloyComponent) => SelectorFind.descendant<HTMLElement>(component.element, '.' + active);

    // Test only method
    const sAssert = (label: string, expected: string) => Step.sync(() => {
      Assertions.assertEq(prefix + ' ' + label, expected, active);
    });

    return {
      set,
      get,
      sAssert
    };
  };

  const makeItems = (tag: string, prefix: string, haveTabstop: boolean, firstNum: number) => Arr.map([ firstNum, firstNum + 1, firstNum + 2 ], (num) => ({
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
  }));

  const acyclicManager = createManager('acyclic');
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

  const cyclicManager = createManager('cyclic');
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

  const flatgridManager = createManager('flatgrid');
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

  const flowManager = createManager('flow');
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

  const matrixManager = createManager('matrix');
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

  const menuManager = createManager('menu');
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
    (_store, _doc, _body) => GuiFactory.build({
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
    }),

    (doc, _body, _gui, component, _store) => {

      const sFocusStillUnmoved = (label: string) => Logger.t(
        label,
        FocusTools.sTryOnSelector('Focus always stays on outer container', doc, '.container')
      );

      const sFocusIn = (component: AlloyComponent) => Step.sync(() => {
        Keying.focusIn(component);
      });

      const sKeyInside = (comp: AlloyComponent, selector: string, key: number, modifiers: { }) => Chain.asStep(comp.element, [
        UiFinder.cFindIn(selector),
        Chain.op((inside) => {
          Keyboard.keydown(key, modifiers, inside);
        })
      ]);

      const acyclic = memAcyclic.get(component);
      const cyclic = memCyclic.get(component);
      const flatgrid = memFlatgrid.get(component);
      const flow = memFlow.get(component);
      const matrix = memMatrix.get(component);
      const menu = memMenu.get(component);

      const sTestKeying = (label: string, comp: AlloyComponent, manager: ReturnType<typeof createManager>, keyName: keyof typeof Keys) => Logger.t(
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

      return [
        Logger.t(
          'Initial focus on container',
          Step.sync(() => {
            Focus.focus(component.element);
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
