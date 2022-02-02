import { describe, it } from '@ephox/bedrock-client';
import { InlineContent } from '@ephox/bridge';
import { Arr, Fun } from '@ephox/katamari';
import { assert } from 'chai';

import { ContextType } from 'tinymce/themes/silver/ui/context/ContextToolbar';
import { filterByPositionForAncestorNode, filterByPositionForStartNode } from 'tinymce/themes/silver/ui/context/ContextToolbarLookup';

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarLookupPositionPriorityTest', () => {
  const createToolbars = (positions: InlineContent.ContextPosition[]): ContextType[] => Arr.map(positions, (p) => ({
    type: 'contexttoolbar',
    items: 'bold italic',
    predicate: Fun.always,
    position: p,
    scope: 'node'
  }));

  const assertPositionIsPrioritised = (positions: InlineContent.ContextPosition[], priorities: string[], isStartNode: boolean) => {
    const toolbars = createToolbars(positions);
    const prioritisedToolbars = isStartNode ? filterByPositionForStartNode(toolbars) : filterByPositionForAncestorNode(toolbars);
    Arr.each(prioritisedToolbars, (t, i) => {
      assert.equal(t.position, priorities[i], `Assert priority is ${priorities[i]}`);
    });
  };

  it('TINY-4495: Array of 1 toolbar is returned as is', () => {
    assertPositionIsPrioritised([ 'selection' ], [ 'selection' ], true);
  });

  it('TINY-4495: multiple positions returned correctly', () => {
    assertPositionIsPrioritised([ 'selection', 'selection' ], [ 'selection', 'selection' ], true);
    assertPositionIsPrioritised([ 'node', 'node' ], [ 'node', 'node' ], true);
    assertPositionIsPrioritised([ 'line', 'line' ], [ 'line', 'line' ], true);
  });

  it('TINY-4495: selection AND node are prioritised over line for start node, and switched to node', () => {
    assertPositionIsPrioritised([ 'selection', 'node', 'line' ], [ 'node', 'node' ], true);
  });

  it('TINY-4495: selection is prioritised over others for ancestor node', () => {
    assertPositionIsPrioritised([ 'selection', 'node', 'line' ], [ 'selection' ], false);
  });

  it('TINY-4495: node is prioritised over line for start node', () => {
    assertPositionIsPrioritised([ 'line', 'node' ], [ 'node' ], true);
  });

  it('TINY-4495: node is prioritised over line for ancestor node', () => {
    assertPositionIsPrioritised([ 'line', 'node' ], [ 'node' ], false);
  });
});
