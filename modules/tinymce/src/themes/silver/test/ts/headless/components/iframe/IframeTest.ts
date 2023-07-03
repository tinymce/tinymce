import { ApproxStructure, Assertions } from '@ephox/agar';
import { AlloyComponent, Composing, Container, GuiFactory, Representing, TestHelpers } from '@ephox/alloy';
import { describe, context, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { assert } from 'chai';

import { renderIFrame } from 'tinymce/themes/silver/ui/dialog/IFrame';

import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.iframe.IFrameTest', () => {
  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      dom: {
        tag: 'div'
      },
      components: [
        renderIFrame({
          name: 'frame-a',
          label: Optional.some('iframe label'),
          sandboxed: true,
          scrollToBottom: false,
          transparent: true,
          useDocumentWrite: false
        }, TestProviders, Optional.none()),
        renderIFrame({
          name: 'frame-b',
          label: Optional.some('iframe label'),
          sandboxed: true,
          scrollToBottom: false,
          transparent: false,
          useDocumentWrite: false
        }, TestProviders, Optional.none()),
        renderIFrame({
          name: 'frame-c',
          label: Optional.some('iframe label'),
          sandboxed: true,
          scrollToBottom: false,
          transparent: true,
          useDocumentWrite: true
        }, TestProviders, Optional.none()),
      ]
    })
  ));

  const assertInitialIframeStructure = (component: AlloyComponent, transparent: boolean) => Assertions.assertStructure(
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
            classes: [
              arr.has('tox-dialog__iframe'),
              transparent ? arr.not('tox-dialog__iframe--opaque') : arr.has('tox-dialog__iframe--opaque')
            ],
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

  it('Check basic structure', () => {
    const [ frame1, frame2 ] = hook.component().components();
    assertInitialIframeStructure(frame1, true);
    assertInitialIframeStructure(frame2, false);
  });

  context('iframe content', () => {
    const assertSandboxedIframeContent = (frame: AlloyComponent, content: string) =>
      Optional.from(frame.element.dom.contentDocument?.body).fold(
        () => assert.fail('Could not find iframe document body'),
        (body) => assert.equal(body.innerHTML, content, 'iframe content should match')
      );

    const assertSandboxIframeSrcdoc = (frame: AlloyComponent, content: string) =>
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

    const testSandboxedIframeContent = (frameNumber: number, assertUsingSrcdoc: boolean) => () => {
      const frame = hook.component().components()[frameNumber];
      const currentFrame = Composing.getCurrent(frame).getOrDie('Could not find internal frame field');
      const content = '<p><span class="me">Me</span></p>';
      Representing.setValue(currentFrame, content);
      if (assertUsingSrcdoc) {
        assertSandboxIframeSrcdoc(currentFrame, content);
      } else {
        assertSandboxedIframeContent(currentFrame, content);
      }
    };

    it('Check iframe content', testSandboxedIframeContent(0, true));
    it('TINY-10032: Check iframe content with useDocumentWrite: true', testSandboxedIframeContent(2, false));
  });
});
