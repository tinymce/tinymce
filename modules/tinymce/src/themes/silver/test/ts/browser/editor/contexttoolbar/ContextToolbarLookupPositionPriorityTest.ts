import { Pipeline, Log, Step } from '@ephox/agar';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { ContextTypes } from 'tinymce/themes/silver/ContextToolbar';
import { Arr } from '@ephox/katamari';
import { Toolbar } from '@ephox/bridge';
import { filterByPositionForStartNode, filterByPositionForAncestorNode } from 'tinymce/themes/silver/ui/context/ContextToolbarLookup';

UnitTest.asynctest('Context toolbar lookup priority by position test', (success, failure) => {
  const createToolbars = (positions: string[]): ContextTypes[] => Arr.map(positions, (p) => ({
    type: 'contexttoolbar',
    items: 'bold italic',
    predicate: () => true,
    position: p,
    scope: 'node'
  } as Toolbar.ContextToolbar));

  const sAssertPositionIsPrioritised = (positions: string[], priorities: string[], isStartNode: boolean) => Step.sync(() => {
    const toolbars = createToolbars(positions);
    const prioritisedToolbars = isStartNode ? filterByPositionForStartNode(toolbars) : filterByPositionForAncestorNode(toolbars);
    Arr.each(prioritisedToolbars, (t, i) => {
      Assert.eq(`Assert priority is ${priorities[i]}`, priorities[i], t.position);
    });
  });

  Pipeline.async({ }, [
    Log.step('TINY-4495', 'Test array of 1 toolbar is returned as is', sAssertPositionIsPrioritised([ 'selection' ], [ 'selection' ], true)),

    Log.stepsAsStep('TINY-4495', 'Test multiple positions returned correctly', [
      sAssertPositionIsPrioritised([ 'selection', 'selection' ], [ 'selection', 'selection' ], true),
      sAssertPositionIsPrioritised([ 'node', 'node' ], [ 'node', 'node' ], true),
      sAssertPositionIsPrioritised([ 'line', 'line' ], [ 'line', 'line' ], true),
    ]),

    Log.step('TINY-4495', 'Test selection AND node are prioritised over line for start node, and switched to node', sAssertPositionIsPrioritised([ 'selection', 'node', 'line' ], [ 'node', 'node' ], true)),
    Log.step('TINY-4495', 'Test selection is prioritised over others for ancestor node', sAssertPositionIsPrioritised([ 'selection', 'node', 'line' ], [ 'selection' ], false)),

    Log.step('TINY-4495', 'Test node is prioritised over line for start node', sAssertPositionIsPrioritised([ 'line', 'node' ], [ 'node' ], true)),
    Log.step('TINY-4495', 'Test node is prioritised over line for ancestor node', sAssertPositionIsPrioritised([ 'line', 'node' ], [ 'node' ], false)),
  ], success, failure);
});
