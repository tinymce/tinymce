import { ApproxStructure, Assertions, Chain, Log, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('tinymce.themes.silver.test.browser.throbber.ThrobberTest', (success, failure) => {
  Theme();

  const sAssertThrobberHiddenStructure = Chain.asStep(Body.body(), [
    UiFinder.cFindIn('.tox-throbber'),
    Assertions.cAssertStructure('Checking disabled structure', ApproxStructure.build((s, str, arr) => {
      return s.element('div', {
        attrs: {
          'aria-hidden': str.is('true')
        },
        classes: [arr.has('tox-throbber')],
        styles: {
          display: str.is('none')
        }
      });
    }))
  ]);

  const sAssertThrobberShownStructure = Chain.asStep(Body.body(), [
    UiFinder.cFindIn('.tox-throbber'),
    Assertions.cAssertStructure('Checking enabled structure', ApproxStructure.build((s, str, arr) => {
      return s.element('div', {
        attrs: {
          'aria-hidden': str.none()
        },
        classes: [ arr.has('tox-throbber') ],
        styles: {
          display: str.none()
        },
        children: [
          s.element('div', {
            attrs: {
              'aria-label': str.is('Loading...')
            },
            classes: [ arr.has('tox-throbber__busy-spinner') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-spinner') ],
                children: [
                  s.element('div', { }),
                  s.element('div', { }),
                  s.element('div', { })
                ]
              })
            ]
          })
        ]
      });
    }))
  ]);

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const sSetProgressState = (state: boolean, time?: number) => Step.sync(() => {
      if (state) {
        editor.setProgressState(true, time);
      } else {
        editor.setProgressState(false);
      }
    });

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Throbber actions test', [
        sAssertThrobberHiddenStructure,
        sSetProgressState(true),
        UiFinder.sWaitForVisible('Wait for throbber to show', Body.body(), '.tox-throbber'),
        sAssertThrobberShownStructure,
        sSetProgressState(false),
        UiFinder.sWaitForHidden('Wait for throbber to hide', Body.body(), '.tox-throbber'),
        sAssertThrobberHiddenStructure
      ]),
      Log.stepsAsStep('TBA', 'Throbber actions with timeout test', [
        sSetProgressState(true, 300),
        // Wait for a little and make sure the throbber is still hidden
        Step.wait(150),
        sAssertThrobberHiddenStructure,
        UiFinder.sWaitForVisible('Wait for throbber to show', Body.body(), '.tox-throbber'),
        sAssertThrobberShownStructure,
        sSetProgressState(false),
        UiFinder.sWaitForHidden('Wait for throbber to hide', Body.body(), '.tox-throbber'),
        sAssertThrobberHiddenStructure
      ])
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
