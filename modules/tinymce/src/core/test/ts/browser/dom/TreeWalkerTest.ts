import { before, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.dom.TreeWalkerTest', () => {
  const viewBlock = ViewBlock.bddSetup();
  let nodes: Node[];

  before(() => {
    const all = (node) => {
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

  const isTextNode = (node: Node | undefined): node is Text => node && node.nodeType === 3;

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

    const actualNodes = [ walker.current() ];
    while ((walker.next())) {
      actualNodes.push(walker.current());
    }

    assert.isTrue(compareNodeLists(nodes, actualNodes), 'Should be the same');
  });

  it('prev2', () => {
    const walker = new DomTreeWalker(nodes[nodes.length - 1], viewBlock.get());
    let actualNodes;

    actualNodes = [ walker.current() ];
    while ((walker.prev2())) {
      actualNodes.push(walker.current());
    }

    actualNodes = actualNodes.reverse();
    assert.isTrue(compareNodeLists(nodes, actualNodes), 'Should be the same');
  });

  it('prev2(shallow:true)', () => {
    const walker = new DomTreeWalker(nodes[nodes.length - 1], viewBlock.get());
    let actualNodes;

    actualNodes = [ walker.current() ];
    while ((walker.prev2(true))) {
      actualNodes.push(walker.current());
    }

    actualNodes = actualNodes.reverse();
    assert.isTrue(compareNodeLists(viewBlock.get().childNodes, actualNodes), 'Should be the same');
  });

  it('TINY-8592: prev2 with abortIf function when reaching 4', () => {
    const walker = new DomTreeWalker(nodes[nodes.length - 1], viewBlock.get());
    let actualNodes;

    actualNodes = [ walker.current() ];
    while ((walker.prev2(false, (node: Node | undefined) => node && isTextNode(node) && node.textContent === '4'))) {
      actualNodes.push(walker.current());
    }

    actualNodes = actualNodes.reverse();
    assert.isTrue(compareNodeLists(nodes.slice(9), actualNodes), 'Should be the same');
  });

  it('TINY-8592: prev2 with abortIf function and shallow mode', () => {
    const walker = new DomTreeWalker(nodes[nodes.length - 1], viewBlock.get());
    let actualNodes;

    actualNodes = [ walker.current() ];
    while ((walker.prev2(false, (node: Node | undefined) => node && !isTextNode(node)))) {
      actualNodes.push(walker.current());
    }

    actualNodes = actualNodes.reverse();
    assert.isTrue(compareNodeLists([ viewBlock.get().childNodes.item(2) ], actualNodes), 'Should be the same');
  });
});
