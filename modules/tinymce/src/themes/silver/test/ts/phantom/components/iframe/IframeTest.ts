import { ApproxStructure, Assertions } from '@ephox/agar';
import { AlloyComponent, Composing, GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { renderIFrame } from 'tinymce/themes/silver/ui/dialog/IFrame';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';
import TestProviders from '../../../module/TestProviders';

UnitTest.asynctest('IFrame component Test', (success, failure) => {
  const platformNeedsSandboxing = !(PlatformDetection.detect().browser.isIE() || PlatformDetection.detect().browser.isEdge());

  const sAssertInitialIframeStructure = (component: AlloyComponent) => Assertions.sAssertStructure(
    'Checking initial structure',
    ApproxStructure.build((s, str, arr) => {
      const labelStructure = s.element('label', {
        classes: [ arr.has('tox-label') ],
        html: str.is('iframe label')
      });

      const iframeStructure = s.element('div', {
        classes: [ arr.has('tox-navobj') ],
        children: [
          s.element('div', {
            attrs: {
              'data-alloy-tabstop': str.is('true')
            }
          }),
          s.element('iframe', {
            classes: [ ],
            attrs: {
              // Should be no source.
              src: str.none()
            }
          }),
          s.element('div', {
            attrs: {
              'data-alloy-tabstop': str.is('true')
            }
          })
        ]
      });

      return s.element('div', {
        classes: [ arr.has('tox-form__group') ],
        children: [ labelStructure, iframeStructure ]
      });
    }),
    component.element()
  );

  const sAssertSandboxedIframeContent = (frame: AlloyComponent, content: string) =>
    // Can't check content inside the iframe due to permission issues.
    // So instead, check that there is a source tag now.
    Assertions.sAssertStructure(
      'Checking to see that the src tag is now set on the iframe',
      ApproxStructure.build((s, str, _arr) => s.element('iframe', {
        classes: [ ],
        attrs: {
          srcdoc: str.contains(content)
        }
      })),
      frame.element()
    );

  const sAssertStandardIframeContent = (frame: AlloyComponent) =>
    // TODO: See if we can match the contents inside the iframe body. That may not be possible though,
    //       as attempting to use sAssertStructure is throwing permission errors from tests
    Assertions.sAssertStructure(
      'Checking to see that the src tag is now set on the iframe',
      ApproxStructure.build((s, str, _arr) => s.element('iframe', {
        classes: [],
        attrs: {
          src: str.is(`javascript:''`)
        }
      })),
      frame.element()
    );

  TestHelpers.GuiSetup.setup(
    (_store, _doc, _body) => GuiFactory.build(
      renderIFrame({
        name: 'frame-a',
        label: Option.some('iframe label'),
        sandboxed: true
      }, TestProviders)
    ),
    (_doc, _body, _gui, component, _store) => {

      const frame = Composing.getCurrent(component).getOrDie(
        'Could not find internal frame field'
      );

      // TODO: Make a webdriver test re: keyboard navigation.
      const content = '<p><span class="me">Me</span></p>';
      return [
        sAssertInitialIframeStructure(component),
        RepresentingSteps.sSetValue('Setting to a paragraph', frame, content),
        platformNeedsSandboxing ? sAssertSandboxedIframeContent(frame, content) : sAssertStandardIframeContent(frame)
      ];
    },
    success,
    failure
  );
});
