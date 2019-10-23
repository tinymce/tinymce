import { Assert, UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Element, Value } from '@ephox/sugar';
import * as Assertions from 'ephox/agar/api/Assertions';
import { Chain } from 'ephox/agar/api/Chain';
import * as FocusTools from 'ephox/agar/api/FocusTools';
import * as Guard from 'ephox/agar/api/Guard';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import * as DomContainers from 'ephox/agar/test/DomContainers';

UnitTest.asynctest('FocusToolsTest', (success, failure) => {

  const doc = Element.fromDom(document);
  const docNode = Element.fromDom(document.documentElement);

  Pipeline.async({}, [
    DomContainers.mSetup,
    Step.log('cat1'),
    FocusTools.sSetFocus('Focusing body', docNode, 'body'),

    Step.log('cat2'),
    FocusTools.sIsOnSelector('Should be on body', doc, 'body'),
    FocusTools.sSetFocus('Focusing div', docNode, 'div[test-id]'),
    FocusTools.sIsOnSelector('Should be on div[test-id]', doc, 'div[test-id]'),
    FocusTools.sSetFocus('Focusing input', docNode, 'div[test-id] input'),
    FocusTools.sIsOnSelector('Should be on div[test-id] input', doc, 'div[test-id] input'),
    FocusTools.sSetActiveValue(doc, 'new value'),

    Chain.asStep(doc, [
      FocusTools.cGetFocused,
      Chain.control(
        Chain.on((active, next, die, logs) => {
          Assert.eq('Should be expected value', 'new value', Value.get(active));
          next(active, logs);
        }),
        Guard.addLogging('Asserting the value of the input field after it has been set.')
      )
    ]),
    Step.raw((state, next, die, logs) => {
      FocusTools.sIsOn('checking that sIsOn works', state.input).runStep(state, next, die, logs);
    }),
    FocusTools.sTryOnSelector(
      'Should be on div[test-id] input',
      doc,
      'div[test-id] input'
    ),
    FocusTools.sSetFocus('Focusing div again', docNode, 'div[test-id]'),
    FocusTools.sIsOnSelector('Should be on div again', doc, 'div[test-id]'),

    // Check that try until not is working for sIsOn, sIsOnSelector and sTryOnSelector
    Step.control(
      FocusTools.sIsOn('tryUntilNotCheck (sIsOn)', Element.fromTag('span')),
      Guard.tryUntilNot(
        'Focus should not be on something that is not in the DOM'
      )
    ),

    Step.control(
      FocusTools.sIsOnSelector('tryUntilNotCheck (sIsOnSelector)', doc, '.not-really-there'),
      Guard.tryUntilNot(
        'Focus should not be on something that is not there'
      )
    ),

    Step.control(
      FocusTools.sTryOnSelector('tryUntilNotCheck (sTryOnSelector)', doc, '.not-really-there'),
      Guard.tryUntilNot(
        'Focus should not be on something that is not there'
      )
    ),

    // TODO: Need to get rid of this boilerplate
    Step.raw((value, next, die, logs) => {
      Chain.asStep(value.container, [
        FocusTools.cSetFocus('Setting focus via chains on the input', 'input')
      ]).runStep(value, next, die, logs);
    }),
    FocusTools.sIsOnSelector('Should now be on input again', doc, 'input'),

    Step.raw((value, next, die, logs) => {
      Chain.asStep(value.container, [
        FocusTools.cSetActiveValue('chained.value')
      ]).runStep(value, next, die, logs);
    }),

    Step.raw((value, next, die, logs) => {
      Chain.asStep(value.container, [
        FocusTools.cGetActiveValue,
        Assertions.cAssertEq('Checking the value of input after set by chaining APIs', 'chained.value')
      ]).runStep(value, next, die, logs);
    }),

    Step.raw((value, next, die, logs) => {
      Chain.asStep(doc, [
        FocusTools.cGetFocused,
        Assertions.cAssertDomEq('Checking that focused element is the input', value.input)
      ]).runStep(value, next, die, logs);
    }),

    DomContainers.mTeardown

  ], (_, logs) => {
    success();
  }, failure);
});
