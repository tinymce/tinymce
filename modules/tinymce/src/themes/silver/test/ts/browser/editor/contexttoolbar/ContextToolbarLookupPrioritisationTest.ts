import { Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Toolbar } from '@ephox/bridge';
import { Arr, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { ContextTypes } from 'tinymce/themes/silver/ContextToolbar';
import { matchStartNode } from 'tinymce/themes/silver/ui/context/ContextToolbarLookup';

UnitTest.asynctest('Context toolbar prioritisation on lookup test', (success, failure) => {

  const createToolbar = (items): Toolbar.ContextToolbar => ({
    type: 'contexttoolbar',
    items,
    predicate: () => true,
    position: 'selection',
    scope: 'node'
  });

  const createForm = (): Toolbar.ContextForm =>({
    type: 'contextform',
    initValue: () => 'test',
    label: Option.none(),
    launch: Option.none(),
    commands: [{
      onAction: () => {},
      original: {
        onAction: () => {}
      },
      disabled: false,
      tooltip: Option.none(),
      icon: Option.none(),
      text: Option.none(),
      onSetup: () => () => {}
    }],
    predicate: () => true,
    position: 'selection',
    scope: 'node'
  });

  const assertMatch = (nodeCandidates: ContextTypes[], editorCandidates: ContextTypes[], expectedCandidates: ContextTypes[]) => {
    const elem = Element.fromHtml('<span>test</span>');
    matchStartNode(elem, nodeCandidates, editorCandidates).each((result) => {
      Arr.map(result.toolbars, (t, i) => Assert.eq('Assert toolbars are equal', t, expectedCandidates[i]));
    });
  };

  // requirements:
  // 1. prioritise context forms over context menus
  // 2. prioritise node scoped over editor scoped context forms
  // 3. only show max 1 context form
  // 4. concatenate all available context toolbars if no context form

  Pipeline.async({ }, [
    Log.step('TINY-4495', 'Assert toolbar lookup prioritises forms over toolbars', Step.sync(() => {
      const form = createForm();
      assertMatch([ createToolbar('bold'), form ], [], [ form ]);
    })),

    Log.step('TINY-4495', 'Assert toolbar lookup prioritises node scoped context FORMS over editor scoped context FORMS', Step.sync(() => {
      const nodeScoped = [ createForm() ];
      const editorScoped = [ createForm() ];
      assertMatch(nodeScoped, editorScoped, nodeScoped);
    })),

    Log.step('TINY-4495', 'Assert toolbar lookup only returns one form', Step.sync(() => {
      const form = createForm();
      assertMatch([ form, createForm(), createForm() ], [], [ form ]);
    })),

    Log.step('TINY-4495', 'Assert toolbar lookup concatenates node scoped context TOOLBARS and editor scoped context TOOLBARS', Step.sync(() => {
      const nodeScoped = [ createToolbar('a') ];
      const editorScoped = [ createToolbar('b') ];
      assertMatch(nodeScoped, editorScoped, Arr.flatten([ nodeScoped, editorScoped ]));
    }))
  ], success, failure);

});
