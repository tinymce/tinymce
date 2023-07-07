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
          border: false,
          sandboxed: true,
          streamContent: false,
          transparent: true
        }, TestProviders, Optional.none()),
        renderIFrame({
          name: 'frame-b',
          label: Optional.some('iframe label'),
          border: false,
          sandboxed: true,
          streamContent: false,
          transparent: false
        }, TestProviders, Optional.none()),
        renderIFrame({
          name: 'frame-c',
          label: Optional.some('iframe label'),
          border: false,
          sandboxed: true,
          streamContent: true,
          transparent: true
        }, TestProviders, Optional.none()),
        renderIFrame({
          name: 'frame-d',
          label: Optional.some('iframe label'),
          border: true,
          sandboxed: true,
          streamContent: false,
          transparent: true
        }, TestProviders, Optional.none()),
      ]
    })
  ));

  const getFrameFromFrameNumber = (frameNumber: number) => {
    const frame = hook.component().components()[frameNumber];
    return Composing.getCurrent(frame).getOrDie('Could not find internal frame field');
  };

  const assertInitialIframeStructure = (component: AlloyComponent, transparent: boolean, border: boolean) => Assertions.assertStructure(
    'Checking initial structure',
    ApproxStructure.build((s, str, arr) => {
      const labelStructure = s.element('label', {
        classes: [ arr.has('tox-label') ],
        html: str.is('iframe label')
      });

      const baseClassPrefix = 'tox-dialog__iframe--';
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
              (transparent ? arr.not : arr.has)(`${baseClassPrefix}opaque`),
              (border ? arr.has : arr.not)(`${baseClassPrefix}bordered`)
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
    const [ frame1, frame2, frame3, frame4 ] = hook.component().components();
    assertInitialIframeStructure(frame1, true, false);
    assertInitialIframeStructure(frame2, false, false);
    assertInitialIframeStructure(frame3, true, false);
    assertInitialIframeStructure(frame4, true, true);
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
      const frame = getFrameFromFrameNumber(frameNumber);
      const content = '<p><span class="me">Me</span></p>';
      Representing.setValue(frame, content);
      if (assertUsingSrcdoc) {
        assertSandboxIframeSrcdoc(frame, content);
      } else {
        assertSandboxedIframeContent(frame, content);
      }
    };

    it('Check iframe content', testSandboxedIframeContent(0, true));
    it('TINY-10032: Check iframe content with streamContent: true', testSandboxedIframeContent(2, false));
  });

  context('Autoscrolling to bottom', () => {
    const initialLongContent = '<p>1</p>'.repeat(50);
    const newLongContent = `${initialLongContent}${'<p>2</p>'.repeat(50)}`;

    const testStreamScrollToBottom = (initialScrollAtBottom: boolean, shouldScrollToBottom: boolean) => () => {
      const isScrollAtBottom = ({ scrollTop, scrollHeight, clientHeight }: HTMLElement) => scrollTop + clientHeight >= scrollHeight;
      const isScrollAtTop = ({ scrollTop }: HTMLElement) => scrollTop === 0;

      const frame = getFrameFromFrameNumber(2);
      Representing.setValue(frame, initialLongContent);

      const iframe = frame.element.dom as HTMLIFrameElement;
      Optional.from(iframe.contentWindow).fold(
        () => assert.fail('Could not find iframe document element'),
        (win) =>
          Optional.from(iframe.contentDocument?.documentElement).fold(
            () => assert.fail('Could not find iframe document element'),
            (docEl) => {
              if (initialScrollAtBottom) {
                win.scrollTo(0, Number.MAX_SAFE_INTEGER);
                assert.isTrue(isScrollAtBottom(docEl), 'iframe should be scrolled to bottom initially');
              } else {
                win.scrollTo(0, 0);
                assert.isTrue(isScrollAtTop(docEl), 'iframe should be scrolled to top initially');
              }

              Representing.setValue(frame, newLongContent);
              if (shouldScrollToBottom) {
                assert.isTrue(isScrollAtBottom(docEl), 'iframe should be scrolled to bottom after setting value');
              } else {
                assert.isTrue(isScrollAtTop(docEl), 'iframe scroll should be at top after setting value');
              }
            }
          )
      );
    };

    it('TINY-10032: Should not scroll to bottom when streamContent: true and iframe is not already scrolled to bottom',
      testStreamScrollToBottom(false, false));

    it('TINY-10032: Should scroll to bottom when streamContent: true and iframe is already scrolled to bottom',
      testStreamScrollToBottom(true, true));

    it('TINY-10032: Should not scroll to bottom when stream: false', () => {
      const frame = getFrameFromFrameNumber(0);
      Representing.setValue(frame, newLongContent);
      Optional.from(frame.element.dom.contentWindow).fold(
        () => assert.fail('Could not find iframe document element'),
        (win) => assert.equal(win.scrollY, 0, 'iframe scroll should be at top')
      );
    });
  });
});
