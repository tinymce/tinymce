import { Assertions, Chain, GeneralSteps, Logger, Pipeline, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Cell } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Editor } from 'tinymce/core/api/Editor';
import ModernTheme from 'tinymce/themes/modern/Theme';

import { assertMarker, sAnnotate, sAssertHtmlContent } from '../../module/test/AnnotationAsserts';

UnitTest.asynctest('browser.tinymce.core.annotate.AnnotationChangedTest', (success, failure) => {

  ModernTheme();

  const changes: Cell<Array<{state: boolean, name: string, uid: string}>> = Cell([ ]);

  const sAssertChanges = (message: string, expected: Array<{uid: string, state: boolean, name: string}>) => Logger.t(
    message,
    // Use a chain so that changes.get() can be evaluated at run-time.
    Chain.asStep({ }, [
      Chain.mapper((_) => {
        return changes.get();
      }),
      Chain.op((cs: Array<{uid: string, name: string}>) => {
        Assertions.assertEq('Checking changes', expected, cs);
      })
    ])
  );

  const sClearChanges = Step.sync(() => {
    changes.set([ ]);
  });

  TinyLoader.setup(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    const sTestAnnotationEvents = (label: string, start: number[], soffset: number, expected: Array<{ uid: string, name: string, state: boolean}>): any => {
      return GeneralSteps.sequence([
        tinyApis.sSetSelection(start, soffset, start, soffset),
        Waiter.sTryUntil(
          label,
          sAssertChanges('sTestAnnotationEvents.sAssertChanges', expected),
          10,
          1000
        ),
      ]);
    };

    const sTestChanges = GeneralSteps.sequence([
      // '<p>This |is the first paragraph</p><p>This is the second.</p><p>This is| the third.</p><p>Spanning |multiple</p><p>par||ag||raphs| now</p>'
      tinyApis.sSetContent([
        '<p>This is the first paragraph</p>',
        '<p>This is the second.</p>',
        '<p>This is the third.</p>',
        '<p>Spanning multiple</p>',
        '<p>paragraphs now</p>'
      ].join('')),
      tinyApis.sSetSelection([ 0, 0 ], 'This '.length, [ 0, 0 ], 'This is'.length),
      sAnnotate(editor, 'alpha', 'id-one', { anything: 'comment-1' }),

      tinyApis.sSetSelection([ 1, 0 ], 'T'.length, [ 1, 0 ], 'This is'.length),
      sAnnotate(editor, 'alpha', 'id-two', { anything: 'comment-two' }),

      tinyApis.sSetSelection([ 2, 0 ], 'This is the th'.length, [ 2, 0 ], 'This is the thir'.length),
      sAnnotate(editor, 'beta', 'id-three', { something: 'comment-three' }),

      tinyApis.sSetSelection([ 3, 0 ], 'Spanning '.length, [ 4, 0 ], 'paragraphs'.length),
      sAnnotate(editor, 'gamma', 'id-four', { something: 'comment-four' }),

      tinyApis.sSetSelection([ 4, 0, 0 ], 'par'.length, [ 4, 0, 0 ], 'parag'.length ),
      sAnnotate(editor, 'delta', 'id-five', { something: 'comment-five' }),

      Step.wait(1000),
      sClearChanges,

      sAssertHtmlContent(tinyApis, [
        `<p>This <span data-mce-annotation="alpha" data-test-anything="comment-1" data-mce-annotation-uid="id-one" class="mce-annotation">is</span> the first paragraph</p>`,

        `<p>T<span data-mce-annotation="alpha" data-test-anything="comment-two" data-mce-annotation-uid="id-two" class="mce-annotation">his is</span> the second.</p>`,

        `<p>This is the th<span data-mce-annotation="beta" data-test-something="comment-three" data-mce-annotation-uid="id-three" class="mce-annotation">ir</span>d.</p>`,

        `<p>Spanning <span data-mce-annotation="gamma" data-test-something="comment-four" data-mce-annotation-uid="id-four" class="mce-annotation">multiple</span></p>`,

        `<p><span data-mce-annotation="gamma" data-test-something="comment-four" data-mce-annotation-uid="id-four" class="mce-annotation">par` +
          `<span data-mce-annotation="delta" data-test-something="comment-five" data-mce-annotation-uid="id-five" class="mce-annotation delta-test">ag</span>` +
          `raphs</span> now</p>`
      ]),

      // Outside: p(0) > text(0) > "Th".length
      // Inside: p(0) > span(1) > text(0) > 'i'.length
      // Inside: p(1) > span(1) > text(0), 'hi'.length
      // Outside: p(1) > text(2) > ' the '.length

      Waiter.sTryUntil(
        'Waiting for no changes',
        sAssertChanges('Should be no changes', [ ]),
        10,
        1000
      ),

      sTestAnnotationEvents(
        'No annotation at cursor',
        [ 0, 0 ], 'Th'.length,
        [
          { state: false, name: 'delta', uid: null },
          { state: false, name: 'gamma', uid: null }
        ]
      ),

      sTestAnnotationEvents(
        'At annotation alpha, id = id-one',
        [ 0, 1, 0 ], 'i'.length,
        [
          { state: false, name: 'delta', uid: null },
          { state: false, name: 'gamma', uid: null },
          { state: true, name: 'alpha', uid: 'id-one' }
        ]
      ),

      sTestAnnotationEvents(
        'At annotation alpha, id = id-two',
        [ 1, 1, 0 ], 'hi'.length,
        [
          { state: false, name: 'delta', uid: null },
          { state: false, name: 'gamma', uid: null },
          { state: true, name: 'alpha', uid: 'id-one' },
          { state: true, name: 'alpha', uid: 'id-two' }
        ]
      ),

      tinyApis.sSetSelection([ 1, 1, 0 ], 'his'.length, [ 1, 1, 0 ], 'his'.length),
      // Give it time to throttle a node change.
      Step.wait(400),
      Waiter.sTryUntil(
        'Moving selection within the same marker (alpha id-two) ... shoud not fire change',
        sAssertChanges('checking changes',
          [
            { state: false, name: 'delta', uid: null },
            { state: false, name: 'gamma', uid: null },
            { state: true, name: 'alpha', uid: 'id-one' },
            { state: true, name: 'alpha', uid: 'id-two' }
          ]
        ),
        10,
        1000
      ),

      sTestAnnotationEvents(
        'Outside annotations again',
        [ 1, 2 ], ' the '.length,
        [
          { state: false, name: 'delta', uid: null },
          { state: false, name: 'gamma', uid: null },
          { state: true, name: 'alpha', uid: 'id-one' },
          { state: true, name: 'alpha', uid: 'id-two' },
          { state: false, name: 'alpha', uid: null }
        ]
      ),

      sTestAnnotationEvents(
        'Inside annotation beta, id = id-three',
        [ 2, 1, 0 ], 'i'.length,
        [
          { state: false, name: 'delta', uid: null },
          { state: false, name: 'gamma', uid: null },
          { state: true, name: 'alpha', uid: 'id-one' },
          { state: true, name: 'alpha', uid: 'id-two' },
          { state: false, name: 'alpha', uid: null },
          { state: true, name: 'beta', uid: 'id-three' }
        ]
      ),

      tinyApis.sSetSelection([ 2, 0 ], 'T'.length, [ 2, 0 ], 'T'.length),
      Waiter.sTryUntil(
        'Moving selection outside all annotations. Should fire null',
        sAssertChanges('checking changes',
          [
            { state: false, name: 'delta', uid: null },
            { state: false, name: 'gamma', uid: null },
            { state: true, name: 'alpha', uid: 'id-one' },
            { state: true, name: 'alpha', uid: 'id-two' },
            { state: false, name: 'alpha', uid: null },
            { state: true, name: 'beta', uid: 'id-three' },
            { state: false, name: 'beta', uid: null }
          ]
        ),
        10,
        1000
      ),

      tinyApis.sSetSelection([ 2, 2 ], 'd'.length, [ 2, 2 ], 'd'.length),
      // Give it time to throttle a node change.
      Step.wait(400),
      Waiter.sTryUntil(
        'Moving selection outside all annotations (again). Should NOT fire null because it already has',
        sAssertChanges('checking changes',
          [
            { state: false, name: 'delta', uid: null },
            { state: false, name: 'gamma', uid: null },
            { state: true, name: 'alpha', uid: 'id-one' },
            { state: true, name: 'alpha', uid: 'id-two' },
            { state: false, name: 'alpha', uid: null },
            { state: true, name: 'beta', uid: 'id-three' },
            { state: false, name: 'beta', uid: null }
          ]
        ),
        10,
        1000
      ),
      sClearChanges,

      tinyApis.sSetSelection([ 4, 0, 1, 0 ], 'a'.length, [ 4, 0, 1, 0 ], 'a'.length),
      // Give it time to throttle a node change.
      Step.wait(400),
      Waiter.sTryUntil(
        'Moving selection inside delta (which is inside gamma)',
        sAssertChanges('checking changes',
          [
            { state: true, name: 'delta', uid: 'id-five' },
            { state: true, name: 'gamma', uid: 'id-four' }
          ]
        ),
        10,
        1000
      ),

      tinyApis.sSetSelection([ 4, 0, 0 ], 'p'.length, [ 4, 0, 0 ], 'p'.length),
      // Give it time to throttle a node change.
      Step.wait(400),
      Waiter.sTryUntil(
        'Moving selection inside just gamma (but not delta)',
        sAssertChanges('checking changes',
          [
            { state: true, name: 'delta', uid: 'id-five' },
            { state: true, name: 'gamma', uid: 'id-four' },
            { state: false, name: 'delta', uid: null }
          ]
        ),
        10,
        1000
      ),
    ]);

    Pipeline.async({}, [
      tinyApis.sFocus,
      sTestChanges
    ], onSuccess, onFailure);
  }, {
    skin_url: '/project/js/tinymce/skins/lightgray',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        ed.experimental.annotator.register('alpha', {
          decorate: (uid, data) => {
            return {
              attributes: {
                'data-test-anything': data.anything
              },
              classes: [ ]
            };
          }
        });

        ed.experimental.annotator.register('beta', {
          decorate: (uid, data) => {
            return {
              attributes: {
                'data-test-something': data.something
              },
              classes: [ ]
            };
          }
        });

        ed.experimental.annotator.register('gamma', {
          decorate: (uid, data) => {
            return {
              attributes: {
                'data-test-something': data.something
              },
              classes: [ ]
            };
          }
        });

        ed.experimental.annotator.register('delta', {
          decorate: (uid, data) => {
            return {
              attributes: {
                'data-test-something': data.something
              },
              classes: [ 'delta-test' ]
            };
          }
        });

        // NOTE: Have to use old function syntax here when accessing "arguments"
        const listener = function (state, name, obj) {
          // NOTE: These failures won't stop the tests, but they will stop it before it updates
          // the changes in changes.set
          if (state === false) {
            Assertions.assertEq('Argument count must be "2" (state, name) if state is false', 2, arguments.length);
          } else {
            const { uid, nodes } = obj;
            // In this test, gamma markers span multiple nodes
            if (name === 'gamma') { Assertions.assertEq('Gamma annotations must have 2 nodes', 2, nodes.length); }
            assertMarker(ed, { uid, name }, nodes);
          }

          changes.set(
            changes.get().concat([
              { uid: state ? obj.uid : null, name, state }
            ])
          );
        };

        ed.experimental.annotator.annotationChanged('alpha', listener);
        ed.experimental.annotator.annotationChanged('beta', listener);
        ed.experimental.annotator.annotationChanged('gamma', listener);
        ed.experimental.annotator.annotationChanged('delta', listener);
      });
    }
  }, success, failure);
});