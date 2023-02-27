import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { assert } from 'chai';

import AstNode from 'tinymce/core/api/html/Node';
import * as ParserUtils from 'tinymce/core/html/ParserUtils';

type CeType = 'false' | 'true' | 'inherit' | 'none';
type Branch = [AstNode, AstNode[]];

describe('browser.tinymce.core.html.ParserUtilsTest', () => {
  context('findClosestEditingHost', () => {
    const generateContentEditableBranch = (states: CeType[]): Optional<Branch> => {
      const generateNode = (type: CeType) => {
        const node = AstNode.create('div');
        if (type !== 'none') {
          node.attr('contenteditable', type);
        }
        return node;
      };

      return Arr.head(states).map((first) => {
        const firstNode = generateNode(first);
        return Arr.foldl(states.slice(1), ([ node, nodes ], type) => {
          const newNode = generateNode(type);
          return [ node.append(newNode), nodes.concat([ newNode ]) ];
        }, [ firstNode, [ firstNode ]]);
      });
    };

    const testFindClosestEditingHost = (states: CeType[], expectedIndex: number) => {
      const [ node, nodes ] = generateContentEditableBranch(states).getOrDie('Failed to generate branch');
      const actualIndex = ParserUtils.findClosestEditingHost(node).bind((host) => Arr.findIndex(nodes, (bnode) => bnode === host)).getOr(-1);
      assert.equal(actualIndex, expectedIndex, 'Expect to find editing host at specified index in branch.');
    };

    it('Should not find a editing host on a node without a contentEditable attribute', () =>
      testFindClosestEditingHost([ 'none' ], -1)
    );

    it('Should not find a editing host on a cef node', () =>
      testFindClosestEditingHost([ 'false' ], -1)
    );

    it('Should not find a editing host on a inherit node', () =>
      testFindClosestEditingHost([ 'inherit' ], -1)
    );

    it('Should find a editing host on a cet node', () =>
      testFindClosestEditingHost([ 'true' ], 0)
    );

    it('Should not find a editing host on a only cef nodes', () =>
      testFindClosestEditingHost([ 'false', 'false', 'false' ], -1)
    );

    it('Should find last cet if there are multiple one in a row', () =>
      testFindClosestEditingHost([ 'true', 'true', 'true' ], 0)
    );

    it('Should find last cet just before a cef', () =>
      testFindClosestEditingHost([ 'true', 'false', 'true', 'true' ], 2)
    );

    it('Should not find a editing host since the closest one is cef', () =>
      testFindClosestEditingHost([ 'true', 'false' ], -1)
    );

    it('Should find last cet ignoring inherit', () =>
      testFindClosestEditingHost([ 'true', 'inherit', 'inherit', 'true' ], 0)
    );

    it('Should find last cet ignoring none', () =>
      testFindClosestEditingHost([ 'true', 'none', 'none', 'true' ], 0)
    );
  });
});

