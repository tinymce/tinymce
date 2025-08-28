import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';

import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Head from 'ephox/sugar/api/node/SugarHead';
import { withIframe } from 'ephox/sugar/test/WithHelpers';

UnitTest.test('head in normal document', () => {
  Assert.eq('head should be head', document.head, Head.getHead(SugarElement.fromDom(document)).dom, Testable.tStrict);
  Assert.eq('head should be head', document.head, Head.head().dom, Testable.tStrict);
});

UnitTest.test('head in iframe', () => {
  withIframe((div, iframe, cw) => {
    Assert.eq('head should be iframe head', cw.document.head, Head.getHead(SugarElement.fromDom(cw.document)).dom, Testable.tStrict);
  });
});
