import { Assert, UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { KAssert } from '@ephox/katamari-assertions';
import Element from 'ephox/sugar/api/node/Element';
import * as Node from 'ephox/sugar/api/node/Node';
import NodeValue from 'ephox/sugar/impl/NodeValue';

UnitTest.test('NodeValue Test', () => {

  const nodeValueThrowsForWrongElement = () => {
    // NodeValue throws for wrong element
    Assert.throws('should have thrown', () => {
      NodeValue(Node.isComment, 'comment').get(Element.fromHtml('<span />'));
    });

    Assert.throws('should have thrown', () => {
      NodeValue(Node.isText, 'text').get(Element.fromHtml('<div />'));
    });

    Assert.throws('should have thrown', () => {
      const n = Element.fromDom(document.createComment('Llamas are bigger than frogs.'));
      NodeValue(Node.isElement, 'tt').get(n);
    });
  };

  const nodeValueIsEmptyForElement = () => {
    const div = Element.fromHtml('<div />');
    Assert.eq('eq', '', NodeValue(Node.isElement, 'div').get(div));
    KAssert.eqNone('eq', NodeValue(Node.isElement, 'div').getOption(div));
  };

  const nodeValueForTextElement = () => {
    const t = 'Llamas. Llamas everywhere.';
    const n = Element.fromText(t);
    Assert.eq('eq', t, NodeValue(Node.isText, 'text').get(n));
    KAssert.eqSome('eq', t, NodeValue(Node.isText, 'text').getOption(n));
  };

  const nodeValueForCommentElement = () => {
    const t = 'arbitrary content';
    const n = Element.fromDom(document.createComment(t));
    Assert.eq('eq', t, NodeValue(Node.isComment, 'comment').get(n));
    KAssert.eqSome('eq', t, NodeValue(Node.isComment, 'comment').getOption(n));
  };

  const setNodeValueForTextElement = () => {
    const n = Element.fromText('Llamas. Llamas everywhere.');
    NodeValue(Node.isText, 'text').set(n, 'patronus');
    Assert.eq('eq', 'patronus', NodeValue(Node.isText, 'text').get(n));
  };

  const setNodeValueForCommentElement = () => {
    const n = Element.fromDom(document.createComment('arbitrary content'));
    NodeValue(Node.isComment, 'comment').set(n, '&&*#*(@');
    Assert.eq('eq', '&&*#*(@', NodeValue(Node.isComment, 'comment').get(n));
  };

  nodeValueThrowsForWrongElement();
  nodeValueIsEmptyForElement();
  nodeValueForTextElement();
  nodeValueForCommentElement();
  setNodeValueForTextElement();
  setNodeValueForCommentElement();
});
