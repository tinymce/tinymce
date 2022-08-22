import { Assertions, Chain, NamedChain, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Result } from '@ephox/katamari';
import { Attribute, Class, Compare, Truncate } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Highlighting } from 'ephox/alloy/api/behaviour/Highlighting';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as ChainUtils from 'ephox/alloy/test/ChainUtils';

UnitTest.asynctest('HighlightingTest', (success, failure) => {

  GuiSetup.setup((store, _doc, _body) => {
    const makeItem = (name: string) => Container.sketch({
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
        classes: [ name, 'test-item' ],
        attributes: {
          'data-value': name
        }
      }
    });
    return GuiFactory.build(
      Container.sketch({
        containerBehaviours: Behaviour.derive([
          Highlighting.config({
            highlightClass: 'test-selected',
            itemClass: 'test-item',

            onHighlight: (containerComp, itemComp) => {
              store.adder(
                `onHighlight: ${Attribute.get(itemComp.element, 'data-value')}`
              )();
            },

            onDehighlight: (containerComp, itemComp) => {
              store.adder(
                `onDehighlight: ${Attribute.get(itemComp.element, 'data-value')}`
              )();
            },
          })
        ]),
        components: Arr.map([
          'alpha',
          'beta',
          'gamma'
        ], makeItem)
      })
    );

  }, (_doc, _body, _gui, component, store) => {
    const cCheckNum = (label: string, expected: number) => Chain.fromChains([
      Chain.mapper((array) => array.length),
      Assertions.cAssertEq(label, expected)
    ]);

    const cCheckNumOf = (label: string, selector: string, expected: number) => {
      const field = 'check-' + selector;
      return Chain.fromChains([
        NamedChain.direct('container', UiFinder.cFindAllIn(selector), field),
        NamedChain.direct(field, cCheckNum(label, expected), '_')
      ]);
    };

    const cCheckSelected = (label: string, expected: string) => Chain.fromChains([
      // always check there is only 1
      cCheckNumOf(label + '\nChecking number of selected: ', '.test-selected', 1),
      NamedChain.direct('container', UiFinder.cFindIn('.test-selected'), 'selected'),
      NamedChain.direct('selected', Chain.binder((sel) => Class.has(sel, expected) ? Result.value(sel) :
        Result.error(label + '\nIncorrect element selected. Expected: ' + expected + ', but was: ' +
          Attribute.get(sel, 'class'))), '_')
    ]);

    const cHighlight: Chain<any, any> = Chain.op((item: AlloyComponent) => {
      Highlighting.highlight(component, item);
    });

    const cDehighlight: Chain<any, any> = Chain.op((item: AlloyComponent) => {
      Highlighting.dehighlight(component, item);
    });

    const cDehighlightAll: Chain<any, any> = Chain.op(() => {
      Highlighting.dehighlightAll(component);
    });

    const cHighlightFirst: Chain<any, any> = Chain.op(() => {
      Highlighting.highlightFirst(component);
    });

    const cHighlightLast: Chain<any, any> = Chain.op(() => {
      Highlighting.highlightLast(component);
    });

    const cHighlightAt = (index: number): Chain<any, any> => Chain.op(() => {
      Highlighting.highlightAt(component, index);
    });

    const cHighlightAtError = (index: number): Chain<any, any> => Chain.binder((v) => {
      try {
        Highlighting.highlightAt(component, index);
        return Result.error('Expected to get an error because there should be no item with index ' + index);
      } catch (e) { /* */ }
      return Result.value(v);
    });

    const cIsHighlighted = Chain.mapper((item) => Highlighting.isHighlighted(component, item));

    const cGetHighlightedOrDie = Chain.binder(() => Highlighting.getHighlighted(component).fold(() => Result.error<AlloyComponent, Error>(new Error('getHighlighted did not find a selection')), Result.value));

    const cGetHighlightedIsNone = Chain.binder((v) => Highlighting.getHighlighted(component).fold(() => Result.value(v), (comp) => Result.error('Highlighted value should be nothing. Was: ' + Truncate.getHtml(comp.element))));

    const cGetFirst = Chain.binder(() => Highlighting.getFirst(component).fold(() => Result.error<AlloyComponent, Error>(new Error('getFirst found nothing')), Result.value));

    const cGetLast = Chain.binder(() => Highlighting.getLast(component).fold(() => Result.error<AlloyComponent, Error>(new Error('getLast found nothing')), Result.value));

    const cHasClass = (clazz: string) => Chain.binder((comp: AlloyComponent) => {
      const elem = comp.element;
      return Class.has(elem, clazz) ? Result.value(elem) :
        Result.error('element ' + Truncate.getHtml(elem) + ' did not have class: ' + clazz);
    });

    const cFindComponent = (selector: string) => Chain.fromChains([
      UiFinder.cFindIn(selector),
      ChainUtils.eToComponent(component)
    ]);

    return [
      Chain.asStep({}, [
        NamedChain.asChain([
          NamedChain.writeValue('container', component.element),
          NamedChain.direct('container', cFindComponent('.alpha'), 'alpha'),
          NamedChain.direct('container', cFindComponent('.beta'), 'beta'),
          NamedChain.direct('container', cFindComponent('.gamma'), 'gamma'),

          cCheckNumOf('Should be none selected', '.test-selected', 0),
          cCheckNumOf('Should be three items', '.test-item', 3),

          store.cAssertEq('Store should be empty', [ ]),

          NamedChain.write('first', cGetFirst),
          NamedChain.write('last', cGetLast),

          NamedChain.direct('first', cHasClass('alpha'), '_'),
          NamedChain.direct('last', cHasClass('gamma'), '_'),

          cHighlightFirst,
          cCheckSelected('highlightFirst => Alpha is selected', 'alpha'),
          store.cAssertEq('No highlights -> Highlighting alpha', [
            'onHighlight: alpha'
          ]),
          store.cClear,

          cHighlightLast,
          cCheckSelected('highlightLast => Gamma is selected', 'gamma'),
          store.cAssertEq('Highlighting alpha -> Highlighting gamma', [
            'onDehighlight: alpha',
            'onHighlight: gamma'
          ]),
          store.cClear,

          NamedChain.direct('beta', cHighlight, '_'),
          cCheckSelected('highlight(beta) => Beta is selected', 'beta'),
          store.cAssertEq('Highlighting gamma -> Highlighting beta', [
            'onDehighlight: gamma',
            'onHighlight: beta'
          ]),
          store.cClear,

          NamedChain.direct('beta', cDehighlight, '_'),
          cCheckNumOf('beta should be deselected', '.test-selected', 0),
          store.cAssertEq('Highlighting beta -> No highlights', [
            'onDehighlight: beta'
          ]),
          store.cClear,

          cHighlightAt(1),
          cCheckSelected('highlightAt(component, 1) => Beta is selected', 'beta'),
          store.cAssertEq('No highlights -> Highlighting beta', [
            'onHighlight: beta'
          ]),
          store.cClear,

          cHighlightAtError(6),
          store.cAssertEq('Highlighting beta -> error', [ ]),

          cHighlightFirst,
          cCheckSelected('highlightFirst => Alpha is selected', 'alpha'),
          store.cAssertEq('Highlighting beta -> Highlighting alpha', [
            'onDehighlight: beta',
            'onHighlight: alpha'
          ]),
          store.cClear,

          cDehighlightAll,
          cCheckNumOf('everything should be deselected', '.test-selected', 0),
          store.cAssertEq('Highlighting alpha -> No highlights', [
            'onDehighlight: alpha'
          ]),
          store.cClear,

          cHighlightLast,
          NamedChain.direct('beta', cIsHighlighted, 'beta-is'),
          NamedChain.direct('beta-is', Assertions.cAssertEq('isHighlighted(beta)', false), '_'),
          NamedChain.direct('gamma', cIsHighlighted, 'gamma-is'),
          NamedChain.direct('gamma-is', Assertions.cAssertEq('isHighlighted(gamma)', true), '_'),
          store.cAssertEq('No highlights -> Highlighting gamma', [
            'onHighlight: gamma'
          ]),
          store.cClear,

          NamedChain.direct('container', cGetHighlightedOrDie, 'highlighted-comp'),
          NamedChain.direct('highlighted-comp', cHasClass('gamma'), '_'),

          cDehighlightAll,
          NamedChain.direct('container', cGetHighlightedIsNone, '_'),

          Chain.op((_input) => {
            Highlighting.highlightBy(component, (comp) => Class.has(comp.element, 'beta'));
          }),
          store.cAssertEq('Highlighting gamma -> Highlighting beta', [
            'onDehighlight: gamma',
            'onHighlight: beta'
          ]),
          store.cClear,
          NamedChain.direct('container', cGetHighlightedOrDie, 'blah'),

          // Now we test the unusual cases of Highlighting the same thing
          NamedChain.direct('beta', cHighlight, '_'),
          store.cAssertEq('Highlighting beta -> Highlighting beta', [ ]),
          store.cClear,

          // And the especially unusual case of Highlighting the same thing, after
          // something else has somehow also received the highlight class
          NamedChain.direct('gamma', Chain.op((gamma) => {
            Class.add(gamma.element, 'test-selected');
          }), '_'),
          NamedChain.direct('beta', cHighlight, '_'),
          store.cAssertEq(
            'Highlighting beta (+ gamma somehow has highlight) -> Highlighting beta',
            [ 'onDehighlight: gamma' ]
          ),
          store.cClear,

          NamedChain.bundle((output) => {
            const candidates = Highlighting.getCandidates(component);
            const expected = [ output.alpha, output.beta, output.gamma ];

            Assertions.assertEq('Checking length of getCandidates array', expected.length, candidates.length);
            Arr.each(expected, (exp, i) => {
              const actual = candidates[i];
              Assertions.assertEq(
                'Checking DOM element at index: ' + i, true,
                Compare.eq(exp.element, actual.element)
              );
            });

            return Result.value(output);

          })
        ])
      ])
    ];
  }, success, failure);
});
