import { ApproxStructure, Assertions, Logger, RawAssertions, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('ReplacingTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Container.sketch({
        containerBehaviours: Behaviour.derive([
          Replacing.config({ })
        ]),
        components: [
          Container.sketch({ dom: { tag: 'span' } })
        ]
      })
    );
  }, (doc, body, gui, component, store) => {
    return [
      Assertions.sAssertStructure(
        'Initially, has a single span',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [
              s.element('span', { })
            ]
          });
        }),
        component.element()
      ),

      Step.sync(() => {
        Replacing.set(component, [

        ]);
      }),

      Assertions.sAssertStructure(
        'After set([]), is empty',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [ ]
          });
        }),
        component.element()
      ),
      Step.sync(() => {
        RawAssertions.assertEq('Should have no contents', [ ], Replacing.contents(component));
      }),

      Step.sync(() => {
        Replacing.set(component, [
          Container.sketch({ uid: 'first' }),
          Container.sketch({ uid: 'second' })
        ]);
      }),

      Assertions.sAssertStructure(
        'After first time of replace([ first, second ])',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [
              s.element('div', { }),
              s.element('div', { })
            ]
          });
        }),
        component.element()
      ),
      Step.sync(() => {
        RawAssertions.assertEq('Should have 2 children', 2, Replacing.contents(component).length);
      }),

      Logger.t(
        'Repeating adding the same uids to check clearing is working',
        Step.sync(() => {
          Replacing.set(component, [
            Container.sketch({ uid: 'first' }),
            Container.sketch({ uid: 'second' })
          ]);
        })
      ),
      Assertions.sAssertStructure(
        'After second time of set([ first, second ])',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [
              s.element('div', { }),
              s.element('div', { })
            ]
          });
        }),
        component.element()
      ),
      Step.sync(() => {
        RawAssertions.assertEq('Should have 2 children still', 2, Replacing.contents(component).length);
      }),

      Logger.t(
        'Replacing.append to put a new thing at the end.',
        Step.sync(() => {
          Replacing.append(component, Container.sketch({ dom: { tag: 'span' } }));
        })
      ),
      Assertions.sAssertStructure(
        'After append(span)',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [
              s.element('div', { }),
              s.element('div', { }),
              s.element('span', { })
            ]
          });
        }),
        component.element()
      ),
      Step.sync(() => {
        RawAssertions.assertEq('Should have 3 children now', 3, Replacing.contents(component).length);
      }),

      Logger.t(
        'Replacing.prepend to put a new thing at the start',
        Step.sync(() => {
          Replacing.prepend(component, Container.sketch({
            dom: {
              tag: 'label'
            }
          }));
        })
      ),

      Assertions.sAssertStructure(
        'After prepend(label)',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [
              s.element('label', {}),
              s.element('div', { }),
              s.element('div', { }),
              s.element('span', { })
            ]
          });
        }),
        component.element()
      ),
      Step.sync(() => {
        RawAssertions.assertEq('Should have 4 children now', 4, Replacing.contents(component).length);
      }),

      Logger.t(
        'Replacing.remove to remove the second div',
        Step.sync(() => {
          const second = component.getSystem().getByUid('second').getOrDie();
          Replacing.remove(component, second);
        })
      ),

      Assertions.sAssertStructure(
        'After remove(second)',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [
              s.element('label', {}),
              s.element('div', { }),
              s.element('span', { })
            ]
          });
        }),
        component.element()
      ),
      Step.sync(() => {
        RawAssertions.assertEq('Should have 3 children again', 3, Replacing.contents(component).length);
      }),

      Logger.t(
        'Removing should have removed from world, so I should be able to re-add it',
        Step.sync(() => {
          Replacing.append(component, Container.sketch({ uid: 'second' }));
        })
      ),

      Assertions.sAssertStructure(
        'After append(second) after remove(second)',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: [
              s.element('label', {}),
              s.element('div', { }),
              s.element('span', { }),
              s.element('div', { })
            ]
          });
        }),
        component.element()
      ),
      Step.sync(() => {
        RawAssertions.assertEq('Should have 4 children again', 4, Replacing.contents(component).length);
      })
    ];
  }, () => { success(); }, failure);
});
