import { before, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.dom.TreeWalkerTest', () => {
  const viewBlock = ViewBlock.bddSetup();
  let nodes: Node[];

  before(() => {
    const all = (node: Node) => {
      let list = [ node ];

      if (node.hasChildNodes()) {
        for (let i = 0; i < node.childNodes.length; i++) {
          list = list.concat(all(node.childNodes[i]));
        }
      }

      return list;
    };

    viewBlock.update(
      '1' +
      '<ul>' +
        '<li>' +
          '2' +
          '<ul>' +
            '<li>3</li>' +
            '<li>4</li>' +
          '</ul>' +
          '</li>' +
          '<li>' +
          '5' +
          '<ul>' +
            '<li>6</li>' +
            '<li>7</li>' +
          '</ul>' +
        '</li>' +
      '</ul>' +
      '8'
    );

    nodes = all(viewBlock.get()).slice(1);
  });

  const compareNodeLists = (expectedNodes: ArrayLike<Node>, actualNodes: ArrayLike<Node>) => {
    if (expectedNodes.length !== actualNodes.length) {
      return false;
    }

    for (let i = 0; i < expectedNodes.length; i++) {
      if (expectedNodes[i] !== actualNodes[i]) {
        return false;
      }
    }

    return true;
  };

  it('next', () => {
    const walker = new DomTreeWalker(nodes[0], viewBlock.get());

    const actualNodes: Node[] = [ walker.current() as Node ];
    while ((walker.next())) {
      actualNodes.push(walker.current() as Node);
    }

    assert.isTrue(compareNodeLists(nodes, actualNodes), 'Should be the same');
  });

  it('prev2', () => {
    const walker = new DomTreeWalker(nodes[nodes.length - 1], viewBlock.get());

    let actualNodes: Node[] = [ walker.current() as Node ];
    while ((walker.prev2())) {
      actualNodes.push(walker.current() as Node);
    }

    actualNodes = actualNodes.reverse();
    assert.isTrue(compareNodeLists(nodes, actualNodes), 'Should be the same');
  });

  it('prev2(shallow:true)', () => {
    const walker = new DomTreeWalker(nodes[nodes.length - 1], viewBlock.get());

    let actualNodes: Node[] = [ walker.current() as Node ];
    while ((walker.prev2(true))) {
      actualNodes.push(walker.current() as Node);
    }

    actualNodes = actualNodes.reverse();
    assert.isTrue(compareNodeLists(viewBlock.get().childNodes, actualNodes), 'Should be the same');
  });
});
