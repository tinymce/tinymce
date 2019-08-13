import Element from 'ephox/sugar/api/node/Element';
import { assert, UnitTest } from '@ephox/bedrock';
import NodeValue from 'ephox/sugar/impl/NodeValue';
import * as Node from 'ephox/sugar/api/node/Node';
import { document } from '@ephox/dom-globals';

UnitTest.test('NodeValue Test', function () {

  function nodeValueThrowsForWrongElement() {
    // NodeValue throws for wrong element
    assert.throws(() => {
      NodeValue(Node.isComment, 'comment').get(Element.fromHtml('<span />'));
    });

    assert.throws(() => {
      NodeValue(Node.isText, 'text').get(Element.fromHtml('<div />'));
    });

    assert.throws(() => {
      const n = Element.fromDom(document.createComment('Llamas are bigger than frogs.'));
      NodeValue(Node.isElement, 'tt').get(n);
    });
  }

  function nodeValueIsEmptyForElement() {
    const div = Element.fromHtml('<div />');
    assert.eq('', NodeValue(Node.isElement, 'div').get(div));
    assert.eq(true, NodeValue(Node.isElement, 'div').getOption(div).isNone());
  }

  function nodeValueForTextElement() {
    const t = 'Llamas. Llamas everywhere.';
    const n = Element.fromText(t);
    assert.eq(t, NodeValue(Node.isText, 'text').get(n));
    assert.eq(t, NodeValue(Node.isText, 'text').getOption(n).getOrDie());
  }

  function nodeValueForCommentElement() {
    const t = 'arbitrary content';
    const n = Element.fromDom(document.createComment(t));
    assert.eq(t, NodeValue(Node.isComment, 'comment').get(n));
    assert.eq(t, NodeValue(Node.isComment, 'comment').getOption(n).getOrDie());
  }

  function setNodeValueForTextElement() {
    const n = Element.fromText('Llamas. Llamas everywhere.');
    NodeValue(Node.isText, 'text').set(n, 'patronus');
    assert.eq('patronus', NodeValue(Node.isText, 'text').get(n));
  }

  function setNodeValueForCommentElement() {
    const n = Element.fromDom(document.createComment('arbitrary content'));
    NodeValue(Node.isComment, 'comment').set(n, '&&*#*(@');
    assert.eq('&&*#*(@', NodeValue(Node.isComment, 'comment').get(n));
  }

  nodeValueThrowsForWrongElement();
  nodeValueIsEmptyForElement();
  nodeValueForTextElement();
  nodeValueForCommentElement();
  setNodeValueForTextElement();
  setNodeValueForCommentElement();
});
