import { ApproxStructure, Assertions } from '@ephox/agar';
import { AlloyComponent, Composing, GuiFactory, Representing, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { renderIFrame } from 'tinymce/themes/silver/ui/dialog/IFrame';

import TestProviders from '../../../module/TestProviders';

describe('phantom.tinymce.themes.silver.components.iframe.IFrameTest', () => {
  const browser = PlatformDetection.detect().browser;
  const platformNeedsSandboxing = !(browser.isIE() || browser.isEdge());

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderIFrame({
      name: 'frame-a',
      label: Optional.some('iframe label'),
      sandboxed: true
    }, TestProviders)
  ));

  const assertInitialIframeStructure = (component: AlloyComponent) => Assertions.assertStructure(
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
    component.element
  );

  const assertSandboxedIframeContent = (frame: AlloyComponent, content: string) =>
    // Can't check content inside the iframe due to permission issues.
    // So instead, check that there is a source tag now.
    Assertions.assertStructure(
      'Checking to see that the src tag is now set on the iframe',
      ApproxStructure.build((s, str, _arr) => s.element('iframe', {
        classes: [ ],
        attrs: {
          srcdoc: str.contains(content)
        }
      })),
      frame.element
    );

  const assertStandardIframeContent = (frame: AlloyComponent) =>
    // TODO: See if we can match the contents inside the iframe body. That may not be possible though,
    //       as attempting to use assertStructure is throwing permission errors from tests
    Assertions.assertStructure(
      'Checking to see that the src tag is now set on the iframe',
      ApproxStructure.build((s, str, _arr) => s.element('iframe', {
        classes: [],
        attrs: {
          src: str.is(`javascript:''`)
        }
      })),
      frame.element
    );

  it('Check basic structure', () => {
    assertInitialIframeStructure(hook.component());
  });

  it('Check iframe content structure', () => {
    const component = hook.component();
    const frame = Composing.getCurrent(component).getOrDie('Could not find internal frame field');
    const content = '<p><span class="me">Me</span></p>';
    Representing.setValue(frame, content);
    if (platformNeedsSandboxing) {
      assertSandboxedIframeContent(frame, content);
    } else {
      assertStandardIframeContent(frame);
    }
  });
});
