import { Assert, UnitTest } from '@ephox/bedrock-client';
import { KAssert } from '@ephox/katamari-assertions';

import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as SugarNode from 'ephox/sugar/api/node/SugarNode';
import { NodeValue } from 'ephox/sugar/impl/NodeValue';

UnitTest.test('NodeValue Test', () => {

  const nodeValueThrowsForWrongElement = () => {
    // NodeValue throws for wrong element
    Assert.throws('should have thrown', () => {
      NodeValue(SugarNode.isComment, 'comment').get(SugarElement.fromHtml('<span />'));
    });

    Assert.throws('should have thrown', () => {
      NodeValue(SugarNode.isText, 'text').get(SugarElement.fromHtml('<div />'));
    });

    Assert.throws('should have thrown', () => {
      const n = SugarElement.fromDom(document.createComment('Llamas are bigger than frogs.'));
      NodeValue(SugarNode.isElement, 'tt').get(n);
    });
  };

  const nodeValueIsEmptyForElement = () => {
    const div = SugarElement.fromHtml('<div />');
    Assert.eq('eq', '', NodeValue(SugarNode.isElement, 'div').get(div));
    KAssert.eqNone('eq', NodeValue(SugarNode.isElement, 'div').getOption(div));
  };

  const nodeValueForTextElement = () => {
    const t = 'Llamas. Llamas everywhere.';
    const n = SugarElement.fromText(t);
    Assert.eq('eq', t, NodeValue(SugarNode.isText, 'text').get(n));
    KAssert.eqSome('eq', t, NodeValue(SugarNode.isText, 'text').getOption(n));
  };

  const nodeValueForCommentElement = () => {
    const t = 'arbitrary content';
    const n = SugarElement.fromDom(document.createComment(t));
    Assert.eq('eq', t, NodeValue(SugarNode.isComment, 'comment').get(n));
    KAssert.eqSome('eq', t, NodeValue(SugarNode.isComment, 'comment').getOption(n));
  };

  const setNodeValueForTextElement = () => {
    const n = SugarElement.fromText('Llamas. Llamas everywhere.');
    NodeValue(SugarNode.isText, 'text').set(n, 'patronus');
    Assert.eq('eq', 'patronus', NodeValue(SugarNode.isText, 'text').get(n));
  };

  const setNodeValueForCommentElement = () => {
    const n = SugarElement.fromDom(document.createComment('arbitrary content'));
    NodeValue(SugarNode.isComment, 'comment').set(n, '&&*#*(@');
    Assert.eq('eq', '&&*#*(@', NodeValue(SugarNode.isComment, 'comment').get(n));
  };

  nodeValueThrowsForWrongElement();
  nodeValueIsEmptyForElement();
  nodeValueForTextElement();
  nodeValueForCommentElement();
  setNodeValueForTextElement();
  setNodeValueForCommentElement();
});
