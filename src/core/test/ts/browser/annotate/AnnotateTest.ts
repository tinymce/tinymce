import { Pipeline, Step, ApproxStructure, GeneralSteps, Logger, Assertions, Waiter, Chain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Editor } from 'tinymce/core/api/Editor';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { Arr, Cell } from '@ephox/katamari';

UnitTest.asynctest('browser.tinymce.plugins.remark.AnnotateTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();

  const changes = Cell([ ]);

  const sAssertChanges = (message, expected) => Logger.t(
    message,
    // Use a chain so that changes.get() can be evaluated at run-time.
    Chain.asStep({ }, [
      Chain.mapper((_) => {
        return changes.get();
      }),
      Chain.op((cs) => {
        Assertions.assertEq('Checking changes', expected, cs);
      })
    ])
  );

  const sClearChanges = Step.sync(() => {
    changes.set([ ]);
  });

  TinyLoader.setup(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    // TODO: Consider testing collapse sections.

    const sAnnotate = (uid, anything) => Step.sync(() => {
      editor.annotator.annotate('test-annotation', {
        uid,
        anything
      });
    });

    // This will result in an attribute order-insensitive HTML assertion
    const sAssertContent = (children) => {
      return tinyApis.sAssertContentStructure(
        ApproxStructure.build((s, str, arr) => {
          return s.element('body', {
            children: Arr.map(children, ApproxStructure.fromHtml)
          });
        })
      );
    };

    const sTestInOneParagraph = GeneralSteps.sequence([
      // '<p>This |is| the first paragraph</p><p>This is the second.</p>'
      tinyApis.sSetContent('<p>This is the first paragraph</p><p>This is the second.</p>'),
      tinyApis.sSetSelection([ 0, 0 ], 'This '.length, [ 0, 0 ], 'This is'.length),
      sAnnotate('test-uid', 'one-paragraph'),
      sAssertContent([
        `<p>This <span data-test-anything="one-paragraph" data-mce-annotation="test-annotation" data-mce-annotation-uid="test-uid" class="mce-annotation">is</span> the first paragraph</p>`,
        '<p>This is the second.</p'
      ]),

      tinyApis.sAssertSelection([ 0 ], 1, [ 0 ], 2)
    ]);

    const sTestInTwoParagraphs = GeneralSteps.sequence([
      // '<p>This |is the first paragraph</p><p>This is| the second.</p>'
      tinyApis.sSetContent('<p>This is the first paragraph</p><p>This is the second.</p>'),
      tinyApis.sSetSelection([ 0, 0 ], 'This '.length, [ 1, 0 ], 'This is'.length),
      sAnnotate('test-uid', 'two-paragraphs'),
      sAssertContent([
        `<p>This <span data-mce-annotation="test-annotation" data-test-anything="two-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">is the first paragraph</span></p>`,
        `<p><span data-mce-annotation="test-annotation" data-test-anything="two-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">This is</span> the second.</p>`
      ]),
      tinyApis.sAssertSelection([ 0 ], 1, [ 1 ], 1)
    ]);

    const sTestInThreeParagraphs = GeneralSteps.sequence([
      // '<p>This |is the first paragraph</p><p>This is the second.</p><p>This is| the third.</p>'
      tinyApis.sSetContent('<p>This is the first paragraph</p><p>This is the second.</p><p>This is the third.</p>'),
      tinyApis.sSetSelection([ 0, 0 ], 'This '.length, [ 2, 0 ], 'This is'.length),
      sAnnotate('test-uid', 'three-paragraphs'),
      sAssertContent([
        `<p>This <span data-mce-annotation="test-annotation" data-test-anything="three-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">is the first paragraph</span></p>`,
        `<p><span data-mce-annotation="test-annotation" data-test-anything="three-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">This is the second.</span></p>`,
        `<p><span data-mce-annotation="test-annotation" data-test-anything="three-paragraphs" data-mce-annotation-uid="test-uid" class="mce-annotation">This is</span> the third.</p>`
      ]),
      tinyApis.sAssertSelection([ 0 ], 1, [ 2 ], 1),
      sClearChanges,

      tinyApis.sSetSelection([ 0, 0 ], 'T'.length, [ 0, 0 ], 'T'.length),

      Waiter.sTryUntil(
        'Waiting until annotation event comes through',
        sAssertChanges('Should have received annotation null', [ { uid: null, name: null } ]),
        10,
        1000
      )
    ]);

    Pipeline.async({}, [
      tinyApis.sFocus,
      sTestInOneParagraph,
      sTestInTwoParagraphs,
      sTestInThreeParagraphs
    ], onSuccess, onFailure);
  }, {
    skin_url: '/project/js/tinymce/skins/lightgray',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        ed.annotator.register('test-annotation', {
          decorate: (uid, data) => {
            return {
              attributes: {
                'data-test-anything': data.anything
              },
              classes: [ ]
            };
          }
        });

        ed.annotator.annotationChanged((uid, name) => {
          changes.set(
            changes.get().concat([
              { uid, name }
            ])
          );
        });
      });
    }
  }, success, failure);
});