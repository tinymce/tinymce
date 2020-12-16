import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.dom.TreeWalkerTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();
  let nodes;

  const setup = () => {
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
  };

  const compareNodeLists = (expectedNodes, actutalNodes) => {
    if (expectedNodes.length !== actutalNodes.length) {
      return false;
    }

    for (let i = 0; i < expectedNodes.length; i++) {
      if (expectedNodes[i] !== actutalNodes[i]) {
        return false;
      }
    }

    return true;
  };

  suite.test('next', () => {
    const walker = new DomTreeWalker(nodes[0], viewBlock.get());

    const actualNodes = [ walker.current() ];
    while ((walker.next())) {
      actualNodes.push(walker.current());
    }

    LegacyUnit.equal(compareNodeLists(nodes, actualNodes), true, 'Should be the same');
  });

  suite.test('prev2', () => {
    const walker = new DomTreeWalker(nodes[nodes.length - 1], viewBlock.get());
    let actualNodes;

    actualNodes = [ walker.current() ];
    while ((walker.prev2())) {
      actualNodes.push(walker.current());
    }

    actualNodes = actualNodes.reverse();
    LegacyUnit.equal(compareNodeLists(nodes, actualNodes), true, 'Should be the same');
  });

  suite.test('prev2(shallow:true)', () => {
    const walker = new DomTreeWalker(nodes[nodes.length - 1], viewBlock.get());
    let actualNodes;

    actualNodes = [ walker.current() ];
    while ((walker.prev2(true))) {
      actualNodes.push(walker.current());
    }

    actualNodes = actualNodes.reverse();
    LegacyUnit.equal(compareNodeLists(viewBlock.get().childNodes, actualNodes), true, 'Should be the same');
  });

  viewBlock.attach();
  setup();

  Pipeline.async({}, suite.toSteps({}), () => {
    viewBlock.detach();
    success();
  }, failure);
});
