import { Pipeline, Log, Step } from '@ephox/agar';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { ContextTypes } from 'tinymce/themes/silver/ContextToolbar';
import { Arr } from '@ephox/katamari';
import { Toolbar } from '@ephox/bridge';
import { filterToolbarsByPosition } from 'tinymce/themes/silver/ui/context/ContextToolbarLookup';

UnitTest.asynctest('Context toolbar lookup priority by position test', (success, failure) => {
  // Test prioritise position by 'selection' -> 'node' -> 'line'

  const createToolbars = (positions: string[]): ContextTypes[] => Arr.map(positions, (p) => ({
    type: 'contexttoolbar',
    items: 'bold italic',
    predicate: () => true,
    position: p,
    scope: 'node'
  } as Toolbar.ContextToolbar));

  const sAssertPositionIsPrioritised = (positions: string[], priority: string) => Step.sync(() => {
    const toolbars = createToolbars(positions);
    const prioritisedToolbars = filterToolbarsByPosition(toolbars);
    Arr.map(prioritisedToolbars, (t) => Assert.eq(`Assert priority is ${priority}`, priority, t.position));
  });

  Pipeline.async({ }, [
    Log.step('TINY-4495', 'Test array of 1 toolbar is returned as is', sAssertPositionIsPrioritised([ 'selection' ], 'selection')),

    Log.stepsAsStep('TINY-4495', 'Test multiple positions returned correctly', [
      sAssertPositionIsPrioritised([ 'selection', 'selection' ], 'selection'),
      sAssertPositionIsPrioritised([ 'node', 'node' ], 'node'),
      sAssertPositionIsPrioritised([ 'line', 'line' ], 'line'),
    ]),

    Log.step('TINY-4495', 'Test selection is prioritised over others', sAssertPositionIsPrioritised([ 'line', 'node', 'selection' ], 'selection')),

    Log.step('TINY-4495', 'Test node is prioritised over line', sAssertPositionIsPrioritised([ 'line', 'node' ], 'node')),
  ], success, failure);
});
