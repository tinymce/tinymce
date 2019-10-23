import { Assertions, Chain, NamedChain3 as NC, Truncate, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Result } from '@ephox/katamari';
import { Attr, Class, Compare, Element } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Highlighting } from 'ephox/alloy/api/behaviour/Highlighting';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as ChainUtils from 'ephox/alloy/test/ChainUtils';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Element as DomElement } from '@ephox/dom-globals';

type TestTypes = {
  container: Element<DomElement>;
  list: Array<Element<DomElement>>;
  selected: Element<DomElement>;
  alpha: AlloyComponent;
  beta: AlloyComponent;
  gamma: AlloyComponent;
  first: AlloyComponent;
  last: AlloyComponent;
  'beta-is': boolean;
  'gamma-is': boolean;
  'highlighted-comp': AlloyComponent;
};

UnitTest.asynctest('HighlightingTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    const makeItem = (name: string) => {
      return Container.sketch({
        dom: {
          tag: 'span',
          styles: {
            'display': 'inline-block',
            'width': '100px',
            'height': '30px',
            'border': '1px solid red',
            'text-align': 'center',
            'vertical-align': 'middle'
          },
          innerHtml: name,
          classes: [ name, 'test-item' ]
        }
      });
    };
    return GuiFactory.build(
      Container.sketch({
        containerBehaviours: Behaviour.derive([
          Highlighting.config({
            highlightClass: 'test-selected',
            itemClass: 'test-item'
          })
        ]),
        components: Arr.map([
          'alpha',
          'beta',
          'gamma'
        ], makeItem)
      })
    );

  }, (doc, body, gui, component, store) => {
    const cCheckNum = (label: string, expected: number) => {
      return Chain.fromChains([
        Chain.mapper((array) => array.length),
        Assertions.cAssertEq(label, expected)
      ]);
    };

    const cCheckNumOf = (label: string, selector: string, expected: number) => {
      return NC.fragment<TestTypes>([
        NC.direct('container', UiFinder.cFindAllIn(selector), 'list'),
        NC.read('list', cCheckNum(label, expected))
      ]);
    };

    const cCheckSelected = (label: string, expected: string) => {
      return NC.fragment<TestTypes>([
        // always check there is only 1
        cCheckNumOf(label + '\nChecking number of selected: ', '.test-selected', 1),
        NC.direct('container', UiFinder.cFindIn('.test-selected'), 'selected'),
        NC.read('selected', Chain.binder((sel) => {
          return Class.has(sel, expected) ? Result.value(sel) :
            Result.error(label + '\nIncorrect element selected. Expected: ' + expected + ', but was: ' +
              Attr.get(sel, 'class'));
        }))
      ]);
    };

    const cHighlight = Chain.op((item: AlloyComponent) => {
      Highlighting.highlight(component, item);
    });

    const cDehighlight = Chain.op((item: AlloyComponent) => {
      Highlighting.dehighlight(component, item);
    });

    const cDehighlightAll = <T> () => Chain.op<T>(() => {
      Highlighting.dehighlightAll(component);
    });

    const cHighlightFirst = <T> () => Chain.op<T>(() => {
      Highlighting.highlightFirst(component);
    });

    const cHighlightLast = <T> () => Chain.op<T>(() => {
      Highlighting.highlightLast(component);
    });

    const cHighlightAt = <T>(index: number) => {
      return Chain.op<T>(() => {
        Highlighting.highlightAt(component, index);
      });
    };

    const cHighlightAtError = <T> (index: number) => {
      return Chain.binder<T, T, string>((v) => {
        try {
          Highlighting.highlightAt(component, index);
          return Result.error('Expected to get an error because there should be no item with index ' + index);
        } catch (e) { /* */ }
        return Result.value(v);
      });
    };

    const cIsHighlighted = Chain.mapper((item: AlloyComponent) => {
      return Highlighting.isHighlighted(component, item);
    });

    const cGetHighlightedOrDie = Chain.binder<void, AlloyComponent, Error>(() => {
      return Highlighting.getHighlighted(component).fold(() => {
        return Result.error(new Error('getHighlighted did not find a selection'));
      }, Result.value);
    });

    const cGetHighlightedIsNone = Chain.binder((v) => {
      return Highlighting.getHighlighted(component).fold(() => {
        return Result.value(v);
      }, (comp) => {
        return Result.error('Highlighted value should be nothing. Was: ' + Truncate.getHtml(comp.element()));
      });
    });

    const cGetFirst = Chain.binder<void, AlloyComponent, Error>(() => {
      return Highlighting.getFirst(component).fold(() => {
        return Result.error(new Error('getFirst found nothing'));
      }, Result.value);
    });

    const cGetLast = Chain.binder<void, AlloyComponent, Error>(() => {
      return Highlighting.getLast(component).fold(() => {
        return Result.error(new Error('getLast found nothing'));
      }, Result.value);
    });

    const cHasClass = (clazz: string) => {
      return Chain.binder<AlloyComponent, Element<DomElement>, string>((comp: AlloyComponent) => {
        const elem = comp.element();
        return Class.has(elem, clazz) ? Result.value(elem) :
          Result.error('element ' + Truncate.getHtml(elem) + ' did not have class: ' + clazz);
      });
    };

    const cFindComponent = (selector: string): Chain<Element<DomElement>, AlloyComponent> => {
      return Chain.fromChains([
        UiFinder.cFindIn(selector),
        ChainUtils.eToComponent(component)
      ]);
    };

    return [
      Chain.asStep({}, [
        NC.asEffectChain<TestTypes>()([
          NC.inject(component.element(), 'container'),
          NC.direct('container', cFindComponent('.alpha'), 'alpha'),
          NC.direct('container', cFindComponent('.beta'), 'beta'),
          NC.direct('container', cFindComponent('.gamma'), 'gamma'),

          cCheckNumOf('Should be none selected', '.test-selected', 0),
          cCheckNumOf('Should be three items', '.test-item', 3),

          NC.write(cGetFirst, 'first'),
          NC.write(cGetLast, 'last'),

          NC.read('first', cHasClass('alpha')),
          NC.read('last', cHasClass('gamma')),

          cHighlightFirst(),
          cCheckSelected('highlightFirst => Alpha is selected', 'alpha'),

          cHighlightLast(),
          cCheckSelected('highlightLast => Gamma is selected', 'gamma'),

          NC.read('beta', cHighlight),
          cCheckSelected('highlight(beta) => Beta is selected', 'beta'),

          NC.read('beta', cDehighlight),
          cCheckNumOf('beta should be deselected', '.test-selected', 0),

          cHighlightAt(1),
          cCheckSelected('highlightAt(compontent, 1) => Beta is selected', 'beta'),

          cHighlightAtError(6),

          cHighlightFirst(),
          cCheckSelected('highlightFirst => Alpha is selected', 'alpha'),
          cDehighlightAll(),
          cCheckNumOf('everything should be deselected', '.test-selected', 0),

          cHighlightLast(),
          NC.direct('beta', cIsHighlighted, 'beta-is'),
          NC.read('beta-is', Assertions.cAssertEq('isHighlighted(beta)', false)),

          NC.direct('gamma', cIsHighlighted, 'gamma-is'),
          NC.read('gamma-is', Assertions.cAssertEq('isHighlighted(gamma)', true)),

          NC.write(cGetHighlightedOrDie, 'highlighted-comp'),
          NC.read('highlighted-comp', cHasClass('gamma')),

          cDehighlightAll(),
          NC.read('container', cGetHighlightedIsNone),

          Chain.op((_input) => {
            Highlighting.highlightBy(component, (comp) => {
              return Class.has(comp.element(), 'beta');
            });
          }),

          NC.effect(cGetHighlightedOrDie),

          NC.readX(NC.getKeys('alpha', 'beta', 'gamma'), Chain.op((expected) => {
            const candidates = Highlighting.getCandidates(component);

            Assertions.assertEq('Checking length of getCandidates array', expected.length, candidates.length);
            Arr.each(expected, (exp, i) => {
              const actual = candidates[i];
              Assertions.assertEq(
                'Checking DOM element at index: ' + i, true,
                Compare.eq(exp.element(), actual.element())
              );
            });
          })),
        ])
      ])
    ];
  }, () => { success(); }, failure);
});
