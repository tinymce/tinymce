import { Assertions, Chain, Logger, Pipeline, Step, StepSequence, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

import { assertMarker, sAnnotate, sAssertHtmlContent } from '../../module/test/AnnotationAsserts';

UnitTest.asynctest('browser.tinymce.core.annotate.AnnotationChangedTest', (success, failure) => {

  Theme();

  const changes: Cell<Array<{state: boolean; name: string; uid: string}>> = Cell([ ]);

  const sAssertChanges = <T> (message: string, expected: Array<{uid: string; state: boolean; name: string}>): Step<T, T> =>
    Logger.t(
      message,
      // Use a chain so that changes.get() can be evaluated at run-time.
      Chain.asStep({ }, [
        Chain.injectThunked(changes.get),
        Chain.op((cs: Array<{uid: string; name: string}>) => {
          Assertions.assertEq('Checking changes', expected, cs);
        })
      ])
    );

  const sClearChanges = <T> (): Step<T, T> =>
    Step.sync(() => {
      changes.set([ ]);
    });

  TinyLoader.setupLight(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    const sTestAnnotationEvents = <T> (label: string, start: number[], soffset: number, expected: Array<{ uid: string; name: string; state: boolean}>): Step<T, T> => StepSequence.sequenceSame<T>([
      tinyApis.sSetSelection(start, soffset, start, soffset),
      Waiter.sTryUntil(
        label,
        sAssertChanges('sTestAnnotationEvents.sAssertChanges', expected)
      )
    ]);

    const sTestChanges = <T> () => StepSequence.sequenceSame<T>([
      tinyApis.sFocus(),
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

      Step.wait(500),
      sClearChanges(),

      sAssertHtmlContent(tinyApis, [
        '<p>This <span data-mce-annotation="alpha" data-test-anything="comment-1" data-mce-annotation-uid="id-one" class="mce-annotation">is</span> the first paragraph</p>',

        '<p>T<span data-mce-annotation="alpha" data-test-anything="comment-two" data-mce-annotation-uid="id-two" class="mce-annotation">his is</span> the second.</p>',

        '<p>This is the th<span data-mce-annotation="beta" data-test-something="comment-three" data-mce-annotation-uid="id-three" class="mce-annotation">ir</span>d.</p>',

        '<p>Spanning <span data-mce-annotation="gamma" data-test-something="comment-four" data-mce-annotation-uid="id-four" class="mce-annotation">multiple</span></p>',

        '<p><span data-mce-annotation="gamma" data-test-something="comment-four" data-mce-annotation-uid="id-four" class="mce-annotation">par' +
          '<span data-mce-annotation="delta" data-test-something="comment-five" data-mce-annotation-uid="id-five" class="mce-annotation delta-test">ag</span>' +
          'raphs</span> now</p>'
      ]),

      // Outside: p(0) > text(0) > "Th".length
      // Inside: p(0) > span(1) > text(0) > 'i'.length
      // Inside: p(1) > span(1) > text(0), 'hi'.length
      // Outside: p(1) > text(2) > ' the '.length

      Waiter.sTryUntil(
        'Waiting for no changes',
        sAssertChanges('Should be no changes', [ ])
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
        )
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
        )
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
        )
      ),
      sClearChanges(),

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
        )
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
        )
      )
    ]);

    Pipeline.runStep({}, sTestChanges<{}>(), onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        ed.annotator.register('alpha', {
          decorate: (uid, data) => ({
            attributes: {
              'data-test-anything': data.anything
            },
            classes: [ ]
          })
        });

        ed.annotator.register('beta', {
          decorate: (uid, data) => ({
            attributes: {
              'data-test-something': data.something
            },
            classes: [ ]
          })
        });

        ed.annotator.register('gamma', {
          decorate: (uid, data) => ({
            attributes: {
              'data-test-something': data.something
            },
            classes: [ ]
          })
        });

        ed.annotator.register('delta', {
          decorate: (uid, data) => ({
            attributes: {
              'data-test-something': data.something
            },
            classes: [ 'delta-test' ]
          })
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

        ed.annotator.annotationChanged('alpha', listener);
        ed.annotator.annotationChanged('beta', listener);
        ed.annotator.annotationChanged('gamma', listener);
        ed.annotator.annotationChanged('delta', listener);
      });
    }
  }, success, failure);
});
