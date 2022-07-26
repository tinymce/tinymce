import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import AstNode, { Attributes } from 'tinymce/core/api/html/Node';

describe('browser.tinymce.core.html.NodeTest', () => {
  const emptyAttributes = [] as unknown as Attributes;

  it('construction', () => {
    let node;

    node = new AstNode('#text', 3);
    assert.equal(node.name, '#text');
    assert.equal(node.type, 3);

    node = new AstNode('#comment', 8);
    assert.equal(node.name, '#comment');
    assert.equal(node.type, 8);

    node = new AstNode('b', 1);
    assert.equal(node.name, 'b');
    assert.equal(node.type, 1);
    assert.deepEqual(node.attributes, emptyAttributes);

    node = new AstNode('#pi', 7);
    assert.equal(node.name, '#pi');
    assert.equal(node.type, 7);

    node = new AstNode('#doctype', 10);
    assert.equal(node.name, '#doctype');
    assert.equal(node.type, 10);

    node = new AstNode('#cdata', 4);
    assert.equal(node.name, '#cdata');
    assert.equal(node.type, 4);

    node = new AstNode('#frag', 11);
    assert.equal(node.name, '#frag');
    assert.equal(node.type, 11);
  });

  it('append inside empty node', () => {
    const root = new AstNode('#frag', 11);
    const node = root.append(new AstNode('b', 1));
    assert.equal(root.firstChild?.parent === root, true);
    assert.isUndefined(root.firstChild?.next);
    assert.isUndefined(root.firstChild?.prev);
    assert.isUndefined(root.firstChild?.firstChild);
    assert.isUndefined(root.firstChild?.lastChild);
    assert.equal(node.parent === root, true);
    assert.isUndefined(node.next);
    assert.isUndefined(node.prev);
    assert.isUndefined(node.firstChild);
    assert.isUndefined(node.lastChild);
  });

  it('append node after node', () => {
    const root = new AstNode('#frag', 11);
    const node2 = root.append(new AstNode('a', 1));
    const node = root.append(new AstNode('b', 1));
    assert.strictEqual(root.firstChild?.parent, root, 'root.firstChild.parent === root');
    assert.strictEqual(root.firstChild, node2, 'root.firstChild');
    assert.strictEqual(root.lastChild, node, 'root.firstChild');
    assert.strictEqual(root.firstChild?.next, node, 'root.firstChild.next');
    assert.isUndefined(root.firstChild?.prev, 'root.firstChild.prev');
    assert.isUndefined(root.firstChild?.firstChild, 'root.firstChild.firstChild');
    assert.isUndefined(root.firstChild?.lastChild, 'root.firstChild.lastChild');
    assert.strictEqual(node2.parent, root, 'node2.parent === root');
    assert.strictEqual(node2.next, node, 'node2.next');
    assert.isUndefined(node2.prev, 'node2.prev');
    assert.isUndefined(node2.firstChild, 'node2.firstChild');
    assert.isUndefined(node2.lastChild, 'node2.lastChild');
    assert.strictEqual(node.parent, root, 'node.parent === root');
    assert.isUndefined(node.next, 'node.next');
    assert.strictEqual(node.prev, node2, 'node.prev');
    assert.isUndefined(node.firstChild, 'node.firstChild');
    assert.isUndefined(node.lastChild, 'node.lastChild');
  });

  it('append existing node before other existing node', () => {
    const root = new AstNode('#frag', 11);
    const node = root.append(new AstNode('a', 1));
    const node2 = root.append(new AstNode('b', 1));
    root.append(node);
    assert.strictEqual(root.firstChild, node2, 'root.firstChild');
    assert.strictEqual(root.lastChild, node, 'root.lastChild');
    assert.equal(node.next, null, 'node.next');
    assert.strictEqual(node.prev, node2, 'node.prev');
    assert.strictEqual(node.parent, root, 'node.parent');
    assert.strictEqual(node2.parent, root, 'node2.parent');
    assert.equal(node2.prev, undefined, 'node2.prev');
    assert.strictEqual(node2.next, node, 'node2.next');
  });

  it('remove unattached node', () => {
    assert.isUndefined(new AstNode('#text', 3).remove().parent);
  });

  it('remove single child', () => {
    const root = new AstNode('#frag', 11);
    const p = new AstNode('p', 1);
    root.append(p);

    const removedNode = p.remove();
    assert.isUndefined(root.firstChild);
    assert.isUndefined(root.lastChild);
    assert.isNull(removedNode.parent);
    assert.isNull(removedNode.next);
    assert.isNull(removedNode.prev);
    assert.equal(removedNode.name, 'p');
  });

  it('remove middle node', () => {
    const root = new AstNode('#frag', 11);
    const node = root.append(new AstNode('a', 1));
    const node2 = root.append(new AstNode('b', 1));
    const node3 = root.append(new AstNode('c', 1));
    node2.remove();
    assert.isNull(node2.parent);
    assert.isNull(node2.next);
    assert.isNull(node2.prev);
    assert.strictEqual(root.firstChild, node, 'root.firstChild');
    assert.strictEqual(root.lastChild, node3, 'root.lastChild');
    assert.strictEqual(node.next, node3, 'node.next');
    assert.equal(node.prev, undefined, 'node.prev');
    assert.strictEqual(node3.prev, node, 'node3.prev');
    assert.equal(node3.next, undefined, 'node3.next');
  });

  it('insert after last', () => {
    const fragment = new AstNode('#frag', 11);
    const root = fragment.append(new AstNode('body', 1));
    const node = root.append(new AstNode('a', 1));
    const node2 = root.insert(new AstNode('x', 1), node);
    assert.strictEqual(root.firstChild, node, 'root.firstChild');
    assert.strictEqual(root.lastChild, node2, 'root.lastChild');
    assert.strictEqual(node.next, node2, 'node.next');
    assert.strictEqual(node2.prev, node, 'node2.prev');
    assert.strictEqual(node2.parent, root, 'node3.next');
  });

  it('insert before first', () => {
    const fragment = new AstNode('#frag', 11);
    const root = fragment.append(new AstNode('body', 1));
    const node = root.append(new AstNode('a', 1));
    const node2 = root.insert(new AstNode('x', 1), node, true);
    assert.strictEqual(root.firstChild, node2, 'root.firstChild');
    assert.strictEqual(root.lastChild, node, 'root.lastChild');
    assert.strictEqual(node2.parent, root, 'node2.lastChild');
    assert.strictEqual(node2.next, node, 'node2.next');
    assert.strictEqual(node2.prev, undefined, 'node2.prev');
    assert.strictEqual(node.parent, root, 'node.lastChild');
    assert.strictEqual(node.next, undefined, 'node.next');
    assert.strictEqual(node.prev, node2, 'node.prev');
  });

  it('insert before second', () => {
    const fragment = new AstNode('#frag', 11);
    const root = fragment.append(new AstNode('body', 1));
    const node = root.append(new AstNode('a', 1));
    const node2 = root.append(new AstNode('b', 1));
    const node3 = root.insert(new AstNode('x', 1), node2, true);
    assert.strictEqual(root.firstChild, node, 'root.firstChild');
    assert.strictEqual(root.lastChild, node2, 'root.lastChild');
    assert.strictEqual(node3.parent, root, 'node3.parent');
    assert.strictEqual(node3.next, node2, 'node3.next');
    assert.strictEqual(node3.prev, node, 'node3.prev');
  });

  it('insert after and between two nodes', () => {
    const fragment = new AstNode('#frag', 11);
    const root = fragment.append(new AstNode('body', 1));
    const node = root.append(new AstNode('a', 1));
    const node2 = root.append(new AstNode('b', 1));
    const node3 = root.insert(new AstNode('x', 1), node);
    assert.strictEqual(root.firstChild, node, 'root.firstChild');
    assert.strictEqual(root.lastChild, node2, 'root.lastChild');
    assert.strictEqual(node.next, node3, 'node.next');
    assert.strictEqual(node2.prev, node3, 'node2.prev');
    assert.strictEqual(node3.parent, root, 'node3.next');
    assert.strictEqual(node3.next, node2, 'node3.next');
    assert.strictEqual(node3.prev, node, 'node3.prev');
  });

  it('replace single child', () => {
    const root = new AstNode('#frag', 11);
    const node1 = root.append(new AstNode('b', 1));
    const node2 = root.append(new AstNode('em', 1));
    node1.replace(node2);
    assert.strictEqual(root.firstChild, node2, 'root.firstChild');
    assert.strictEqual(root.lastChild, node2, 'root.lastChild');
    assert.strictEqual(node2.parent, root, 'node2.parent');
    assert.isNull(node2.next, 'node2.next');
    assert.isUndefined(node2.prev, 'node2.prev');
  });

  it('replace first child', () => {
    const root = new AstNode('#frag', 11);
    const node1 = root.append(new AstNode('b', 1));
    const node2 = root.append(new AstNode('em', 1));
    const node3 = root.append(new AstNode('b', 1));
    node1.replace(node2);
    assert.strictEqual(root.firstChild, node2, 'root.firstChild');
    assert.strictEqual(root.lastChild, node3, 'root.lastChild');
    assert.strictEqual(node2.parent, root, 'node2.parent');
    assert.strictEqual(node2.next, node3, 'node2.next');
    assert.isUndefined(node2.prev, 'node2.prev');
  });

  it('replace last child', () => {
    const root = new AstNode('#frag', 11);
    const node1 = root.append(new AstNode('b', 1));
    const node3 = root.append(new AstNode('b', 1));
    const node2 = root.append(new AstNode('em', 1));
    node3.replace(node2);
    assert.strictEqual(root.firstChild, node1, 'root.firstChild');
    assert.strictEqual(root.lastChild, node2, 'root.lastChild');
    assert.strictEqual(node2.parent, root, 'node2.parent');
    assert.isNull(node2.next, 'node2.next');
    assert.strictEqual(node2.prev, node1, 'node2.prev');
  });

  it('replace middle child', () => {
    const root = new AstNode('#frag', 11);
    const node1 = root.append(new AstNode('b', 1));
    const node2 = root.append(new AstNode('b', 1));
    const node3 = root.append(new AstNode('b', 1));
    const node4 = root.append(new AstNode('em', 1));
    node2.replace(node4);
    assert.strictEqual(root.firstChild, node1, 'root.firstChild');
    assert.strictEqual(root.lastChild, node3, 'root.lastChild');
    assert.strictEqual(node4.parent, root, 'node4.parent');
    assert.strictEqual(node4.next, node3, 'node4.next');
    assert.strictEqual(node4.prev, node1, 'node4.prev');
  });

  it('attr', () => {
    let node: AstNode;

    node = new AstNode('b', 1);
    assert.deepEqual(node.attributes, emptyAttributes);
    node.attr('attr1', 'value1');
    assert.equal(node.attr('attr1'), 'value1');
    assert.isUndefined(node.attr('attr2'));
    assert.deepEqual(node.attributes, [{ name: 'attr1', value: 'value1' }] as unknown as Attributes);
    assert.deepEqual(node.attributes?.map as Record<string, string>, { attr1: 'value1' });

    node = new AstNode('b', 1);
    assert.deepEqual(node.attributes, emptyAttributes);
    node.attr('attr1', 'value1');
    node.attr('attr1', 'valueX');
    assert.equal(node.attr('attr1'), 'valueX');
    assert.deepEqual(node.attributes, [{ name: 'attr1', value: 'valueX' }] as unknown as Attributes);
    assert.deepEqual(node.attributes?.map as Record<string, string>, { attr1: 'valueX' });

    node = new AstNode('b', 1);
    assert.deepEqual(node.attributes, emptyAttributes);
    node.attr('attr1', 'value1');
    node.attr('attr2', 'value2');
    assert.equal(node.attr('attr1'), 'value1');
    assert.equal(node.attr('attr2'), 'value2');
    assert.deepEqual(node.attributes, [{ name: 'attr1', value: 'value1' }, { name: 'attr2', value: 'value2' }] as unknown as Attributes);
    assert.deepEqual(node.attributes?.map as Record<string, string>, { attr1: 'value1', attr2: 'value2' });

    node = new AstNode('b', 1);
    assert.deepEqual(node.attributes, emptyAttributes);
    node.attr('attr1', 'value1');
    node.attr('attr1', null);
    assert.isUndefined(node.attr('attr1'));
    assert.deepEqual(node.attributes, emptyAttributes);
    assert.deepEqual(node.attributes?.map as Record<string, string>, {});

    node = new AstNode('b', 1);
    node.attr({ a: '1', b: '2' });
    assert.deepEqual(node.attributes, [{ name: 'a', value: '1' }, { name: 'b', value: '2' }] as unknown as Attributes);
    assert.deepEqual(node.attributes?.map as Record<string, string>, { a: '1', b: '2' });

    node = new AstNode('b', 1);
    node.attr(null as any);
    assert.deepEqual(node.attributes, emptyAttributes);
    assert.deepEqual(node.attributes?.map as Record<string, string>, {});
  });

  it('clone', () => {
    let node: AstNode;
    let clone: AstNode;

    node = new AstNode('#text', 3);
    node.value = 'value';
    clone = node.clone();
    assert.equal(clone.name, '#text');
    assert.equal(clone.type, 3);
    assert.equal(clone.value, 'value');
    assert.isUndefined(clone.parent);
    assert.isUndefined(clone.next);
    assert.isUndefined(clone.prev);

    const root = new AstNode('#frag', 11);
    node = new AstNode('#text', 3);
    node.value = 'value';
    root.append(node);
    assert.equal(clone.name, '#text');
    assert.equal(clone.type, 3);
    assert.equal(clone.value, 'value');
    assert.isUndefined(clone.parent);
    assert.isUndefined(clone.next);
    assert.isUndefined(clone.prev);

    node = new AstNode('b', 1);
    node.attr('id', 'id');
    node.attr('class', 'class');
    node.attr('title', 'title');
    clone = node.clone();
    assert.equal(clone.name, 'b');
    assert.equal(clone.type, 1);
    assert.deepEqual(clone.attributes, [{ name: 'class', value: 'class' }, { name: 'title', value: 'title' }] as unknown as Attributes);
    assert.deepEqual(clone.attributes?.map as Record<string, string>, { class: 'class', title: 'title' });
  });

  it('unwrap', () => {
    let root, node1, node2;

    root = new AstNode('#frag', 11);
    node1 = root.append(new AstNode('b', 1));
    node2 = node1.append(new AstNode('em', 1));
    node1.unwrap();
    assert.strictEqual(root.firstChild, node2, 'root.firstChild');
    assert.strictEqual(root.lastChild, node2, 'root.lastChild');
    assert.strictEqual(node2.parent, root, 'node2.parent');

    root = new AstNode('#frag', 11);
    node1 = root.append(new AstNode('b', 1));
    node2 = node1.append(new AstNode('em', 1));
    const node3 = node1.append(new AstNode('span', 1));
    node1.unwrap();
    assert.strictEqual(root.firstChild, node2, 'root.firstChild');
    assert.strictEqual(root.lastChild, node3, 'root.lastChild');
    assert.strictEqual(node2.parent, root, 'node2.parent');
    assert.strictEqual(node3.parent, root, 'node3.parent');
  });

  it('empty', () => {
    const root = new AstNode('#frag', 11);
    const node1 = root.append(new AstNode('b', 1));
    node1.empty();
    assert.strictEqual(root.firstChild, node1, 'root.firstChild');
    assert.strictEqual(root.lastChild, node1, 'root.firstChild');
    assert.isNull(node1.firstChild, 'node1.firstChild');
    assert.isNull(node1.lastChild, 'node1.firstChild');
  });

  it('isEmpty', () => {
    let root: AstNode;
    let node1: AstNode;
    let node2: AstNode;

    root = new AstNode('#frag', 11);
    node1 = root.append(new AstNode('p', 1));
    node2 = node1.append(new AstNode('b', 1));
    assert.isTrue(root.isEmpty({ img: 1 }), 'Is empty 1');
    assert.isTrue(node1.isEmpty({ img: 1 }), 'Is empty 2');

    root = new AstNode('#frag', 11);
    node1 = root.append(new AstNode('p', 1));
    node2 = node1.append(new AstNode('img', 1));
    assert.isFalse(root.isEmpty({ img: 1 }), 'Is not empty 1');
    assert.isFalse(node1.isEmpty({ img: 1 }), 'Is not empty 2');

    root = new AstNode('#frag', 11);
    node1 = root.append(new AstNode('p', 1));
    node2 = node1.append(new AstNode('#text', 3));
    node2.value = 'X';
    assert.isFalse(root.isEmpty({ img: 1 }), 'Is not empty 3');
    assert.isFalse(node1.isEmpty({ img: 1 }), 'Is not empty 4');

    root = new AstNode('#frag', 11);
    node1 = root.append(new AstNode('p', 1));
    node2 = node1.append(new AstNode('#text', 3));
    node2.value = '';
    assert.isTrue(root.isEmpty({ img: 1 }), 'Is empty 4');
    assert.isTrue(node1.isEmpty({ img: 1 }), 'Is empty 5');

    root = new AstNode('#frag', 11);
    root.append(new AstNode('a', 1)).attr('name', 'x');
    assert.isFalse(root.isEmpty({ img: 1 }), 'Contains anchor with name attribute.');

    const isSpan = (node: AstNode) => {
      return node.name === 'span';
    };

    root = new AstNode('#frag', 11);
    root.append(new AstNode('span', 1));
    assert.isFalse(root.isEmpty({ img: 1 }, {}, isSpan), 'Should be false since the predicate says true.');

    root = new AstNode('#frag', 11);
    root.append(new AstNode('b', 1));
    assert.isTrue(root.isEmpty({ img: 1 }, {}, isSpan), 'Should be true since the predicate says false.');
  });

  context('children', () => {
    it('TINY-7756: Returns empty array when there are no children', () => {
      const root = new AstNode('p', 1);
      assert.lengthOf(root.children(), 0);
    });

    it('TINY-7756: Returns single child', () => {
      const root = new AstNode('p', 1);
      const child = root.append(new AstNode('span', 1));

      const children = root.children();
      assert.lengthOf(children, 1);
      assert.strictEqual(children[0], child);
    });

    it('TINY-7756: Returns all children in order', () => {
      const root = new AstNode('p', 1);
      const child1 = root.append(new AstNode('span', 1));
      const child2 = root.append(new AstNode('strong', 1));
      const child3 = root.append(new AstNode('em', 1));

      const children = root.children();
      assert.lengthOf(children, 3);
      assert.strictEqual(children[0], child1);
      assert.strictEqual(children[1], child2);
      assert.strictEqual(children[2], child3);
    });

    it('TINY-7756: Does not return descendants', () => {
      const root = new AstNode('div', 1);
      const child1 = root.append(new AstNode('span', 1));
      child1.append(new AstNode('#text', 3));
      const child2 = root.append(new AstNode('p', 1));
      child2.append(new AstNode('strong', 1));
      const child3 = root.append(new AstNode('em', 1));

      const children = root.children();
      assert.lengthOf(children, 3);
      assert.strictEqual(children[0], child1);
      assert.strictEqual(children[1], child2);
      assert.strictEqual(children[2], child3);
    });
  });
});
