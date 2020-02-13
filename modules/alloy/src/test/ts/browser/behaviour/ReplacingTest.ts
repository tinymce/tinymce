import { ApproxStructure, Assertions, Logger, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Option } from '@ephox/katamari';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

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

    const makeTag = (tag: string, classes: string[]): AlloySpec => {
      return {
        dom: {
          tag,
          classes
        },
        components: [ ]
      };
    };

    const sCheckReplaceAt = (label: string, expectedClasses: string[], inputClasses: string[], replaceeIndex: number, replaceClass: string) => {
      return Logger.t(
        `${label}: Check replaceAt(${replaceeIndex}, "${replaceClass}") for data: [${inputClasses.join(', ')}]`,
        Step.sync(() => {
          Replacing.set(component,
              Arr.map(inputClasses, (ic) => makeTag('div', [ ic ]))
          );
          Replacing.replaceAt(component, replaceeIndex, Option.some(makeTag('div', [ replaceClass ])));
          Assertions.assertStructure(
            'Asserting structure',
            ApproxStructure.build((s, str, arr) => {
              return s.element('div', {
                children: Arr.map(expectedClasses, (ec) => s.element('div', { classes: [ arr.has(ec) ] }))
              });
            }),
            component.element()
          );
        })
      );
    };

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
        Assert.eq('Should have no contents', [ ], Replacing.contents(component));
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
        Assert.eq('Should have 2 children', 2, Replacing.contents(component).length);
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
        Assert.eq('Should have 2 children still', 2, Replacing.contents(component).length);
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
        Assert.eq('Should have 3 children now', 3, Replacing.contents(component).length);
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
        Assert.eq('Should have 4 children now', 4, Replacing.contents(component).length);
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
        Assert.eq('Should have 3 children again', 3, Replacing.contents(component).length);
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
        Assert.eq('Should have 4 children again', 4, Replacing.contents(component).length);
      }),

      sCheckReplaceAt(
        '.replaceAt 0 of 0 - should do nothing',
        [ ],
        [ ],
        0,
        'replaceAt-0'
      ),

      sCheckReplaceAt(
        '.replaceAt 0 of 1',
        [ 'replaceAt-0' ],
        [ 'original' ],
        0,
        'replaceAt-0'
      ),

      sCheckReplaceAt(
        '.replaceAt 0 of 3',
        [ 'replaceAt-0', 'original2', 'original3' ],
        [ 'original1', 'original2', 'original3' ],
        0,
        'replaceAt-0'
      ),

      sCheckReplaceAt(
        '.replaceAt 2 of 3',
        [ 'original1', 'original2', 'replaceAt-2' ],
        [ 'original1', 'original2', 'original3' ],
        2,
        'replaceAt-2'
      )
    ];
  }, () => { success(); }, failure);
});
