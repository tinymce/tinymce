import { Assertions, Chain, NamedChain, Truncate, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Result } from '@ephox/katamari';
import { Attr, Class, Compare } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Highlighting } from 'ephox/alloy/api/behaviour/Highlighting';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as ChainUtils from 'ephox/alloy/test/ChainUtils';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

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
      const field = 'check-' + selector;
      return Chain.fromChains([
        NamedChain.direct('container', UiFinder.cFindAllIn(selector), field),
        NamedChain.direct(field, cCheckNum(label, expected), '_')
      ]);
    };

    const cCheckSelected = (label: string, expected: string) => {
      return Chain.fromChains([
        // always check there is only 1
        cCheckNumOf(label + '\nChecking number of selected: ', '.test-selected', 1),
        NamedChain.direct('container', UiFinder.cFindIn('.test-selected'), 'selected'),
        NamedChain.direct('selected', Chain.binder((sel) => {
          return Class.has(sel, expected) ? Result.value(sel) :
            Result.error(label + '\nIncorrect element selected. Expected: ' + expected + ', but was: ' +
              Attr.get(sel, 'class'));
        }), '_')
      ]);
    };

    const cHighlight = Chain.op((item: AlloyComponent) => {
      Highlighting.highlight(component, item);
    });

    const cDehighlight = Chain.op((item: AlloyComponent) => {
      Highlighting.dehighlight(component, item);
    });

    const cDehighlightAll = Chain.op(() => {
      Highlighting.dehighlightAll(component);
    });

    const cHighlightFirst = Chain.op(() => {
      Highlighting.highlightFirst(component);
    });

    const cHighlightLast = Chain.op(() => {
      Highlighting.highlightLast(component);
    });

    const cHighlightAt = (index: number) => {
      return Chain.op(() => {
        Highlighting.highlightAt(component, index);
      });
    };

    const cHighlightAtError = (index: number) => {
      return Chain.binder((v) => {
        try {
          Highlighting.highlightAt(component, index);
          return Result.error('Expected to get an error because there should be no item with index ' + index);
        } catch (e) { /* */ }
        return Result.value(v);
      });
    };

    const cIsHighlighted = Chain.mapper((item) => {
      return Highlighting.isHighlighted(component, item);
    });

    const cGetHighlightedOrDie = Chain.binder(() => {
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

    const cGetFirst = Chain.binder(() => {
      return Highlighting.getFirst(component).fold(() => {
        return Result.error(new Error('getFirst found nothing'));
      }, Result.value);
    });

    const cGetLast = Chain.binder(() => {
      return Highlighting.getLast(component).fold(() => {
        return Result.error(new Error('getLast found nothing'));
      }, Result.value);
    });

    const cHasClass = (clazz: string) => {
      return Chain.binder((comp: AlloyComponent) => {
        const elem = comp.element();
        return Class.has(elem, clazz) ? Result.value(elem) :
          Result.error('element ' + Truncate.getHtml(elem) + ' did not have class: ' + clazz);
      });
    };

    const cFindComponent = (selector: string) => {
      return Chain.fromChains([
        UiFinder.cFindIn(selector),
        ChainUtils.eToComponent(component)
      ]);
    };

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          NamedChain.writeValue('container', component.element()),
          NamedChain.direct('container', cFindComponent('.alpha'), 'alpha'),
          NamedChain.direct('container', cFindComponent('.beta'), 'beta'),
          NamedChain.direct('container', cFindComponent('.gamma'), 'gamma'),

          cCheckNumOf('Should be none selected', '.test-selected', 0),
          cCheckNumOf('Should be three items', '.test-item', 3),

          NamedChain.write('first', cGetFirst),
          NamedChain.write('last', cGetLast),

          NamedChain.direct('first', cHasClass('alpha'), '_'),
          NamedChain.direct('last', cHasClass('gamma'), '_'),

          cHighlightFirst,
          cCheckSelected('highlightFirst => Alpha is selected', 'alpha'),

          cHighlightLast,
          cCheckSelected('highlightLast => Gamma is selected', 'gamma'),

          NamedChain.direct('beta', cHighlight, '_'),
          cCheckSelected('highlight(beta) => Beta is selected', 'beta'),

          NamedChain.direct('beta', cDehighlight, '_'),
          cCheckNumOf('beta should be deselected', '.test-selected', 0),

          cHighlightAt(1),
          cCheckSelected('highlightAt(compontent, 1) => Beta is selected', 'beta'),

          cHighlightAtError(6),

          cHighlightFirst,
          cCheckSelected('highlightFirst => Alpha is selected', 'alpha'),
          cDehighlightAll,
          cCheckNumOf('everything should be deselected', '.test-selected', 0),

          cHighlightLast,
          NamedChain.direct('beta', cIsHighlighted, 'beta-is'),
          NamedChain.direct('beta-is', Assertions.cAssertEq('isHighlighted(beta)', false), '_'),

          NamedChain.direct('gamma', cIsHighlighted, 'gamma-is'),
          NamedChain.direct('gamma-is', Assertions.cAssertEq('isHighlighted(gamma)', true), '_'),

          NamedChain.direct('container', cGetHighlightedOrDie, 'highlighted-comp'),
          NamedChain.direct('highlighted-comp', cHasClass('gamma'), '_'),

          cDehighlightAll,
          NamedChain.direct('container', cGetHighlightedIsNone, '_'),

          Chain.op((input) => {
            Highlighting.highlightBy(component, (comp) => {
              return Class.has(comp.element(), 'beta');
            });
          }),

          NamedChain.direct('container', cGetHighlightedOrDie, 'blah'),

          NamedChain.bundle((output) => {
            const candidates = Highlighting.getCandidates(component);
            const expected = [ output.alpha, output.beta, output.gamma ];

            Assertions.assertEq('Checking length of getCandidates array', expected.length, candidates.length);
            Arr.each(expected, (exp, i) => {
              const actual = candidates[i];
              Assertions.assertEq(
                'Checking DOM element at index: ' + i, true,
                Compare.eq(exp.element(), actual.element())
              );
            });

            return Result.value(output);

          })
        ])
      ])
    ];
  }, () => { success(); }, failure);
});
