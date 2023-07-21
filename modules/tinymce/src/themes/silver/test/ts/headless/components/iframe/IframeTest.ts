import { ApproxStructure, Assertions, Waiter } from '@ephox/agar';
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
    const assertSandboxedIframeContent = (iframeBody: HTMLElement, content: string) =>
      assert.equal(iframeBody.innerHTML, content, 'iframe content should match');

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

    const testSandboxedIframeContent = (frameNumber: number, assertUsingSrcdoc: boolean) => async () => {
      const frame = getFrameFromFrameNumber(frameNumber);
      const content = '<p><span class="me">Me</span></p>';
      Representing.setValue(frame, content);
      if (assertUsingSrcdoc) {
        assertSandboxIframeSrcdoc(frame, content);
      } else {
        await Waiter.pTryUntil('Waiting for iframe body to be set', () =>
          assertSandboxedIframeContent(frame.element.dom.contentDocument?.body, content));
      }
    };

    it('Check iframe content', testSandboxedIframeContent(0, true));
    it('TINY-10032: Check iframe content with streamContent: true', testSandboxedIframeContent(2, false));
  });

  context('Autoscrolling to bottom', () => {
    const enum ScrollPosition {
      Top,
      Middle,
      Bottom
    }

    const initialLongContent = '<p>1</p>'.repeat(50);
    const newLongContent = `${initialLongContent}${'<p>2</p>'.repeat(50)}`;

    const assertScrollAtBottom = ({ scrollTop, scrollHeight, clientHeight }: HTMLElement, label: string) => assert.isAtLeast(Math.ceil(scrollTop) + clientHeight, scrollHeight, label);
    const assertScrollAtMiddle = ({ scrollTop, scrollHeight }: HTMLElement, label: string) => assert.approximately(scrollTop, scrollHeight / 2, 1, label);
    const assertScrollAtTop = ({ scrollTop }: HTMLElement, label: string) => assert.strictEqual(scrollTop, 0, label);

    const testStreamScrollToBottom = (initialScroll: ScrollPosition) => async () => {
      const frame = getFrameFromFrameNumber(2);
      const iframe = frame.element.dom as HTMLIFrameElement;

      let isIframeLoaded = false;
      iframe.onload = () => isIframeLoaded = true;
      const setValueAndWaitForLoad = (content: string) => {
        isIframeLoaded = false;
        Representing.setValue(frame, content);
        return Waiter.pTryUntilPredicate('Wait for iframe to finish loading', () => isIframeLoaded);
      };

      await setValueAndWaitForLoad(initialLongContent);

      await Optional.from(iframe.contentWindow).fold(
        () => assert.fail('Could not find iframe window'),
        (win) =>
          Optional.from(iframe.contentDocument?.body).fold(
            () => assert.fail('Could not find iframe body'),
            async (body) => {
              if (initialScroll === ScrollPosition.Top) {
                win.scrollTo(0, 0);
                assertScrollAtTop(body, 'iframe should be scrolled to top initially');
              } else if (initialScroll === ScrollPosition.Middle) {
                win.scrollTo(0, body.scrollHeight / 2);
                assertScrollAtMiddle(body, 'iframe should be scrolled to middle initially');
              } else {
                win.scrollTo(0, body.scrollHeight);
                assertScrollAtBottom(body, 'iframe should be scrolled to bottom initially');
              }

              await setValueAndWaitForLoad(newLongContent);

              if (initialScroll === ScrollPosition.Top) {
                assertScrollAtTop(body, 'iframe scroll should be at top after setting value');
              } else if (initialScroll === ScrollPosition.Middle) {
                assertScrollAtMiddle(body, 'iframe scroll should be at middle after setting value');
              } else {
                assertScrollAtBottom(body, 'iframe should be at bottom after setting value');
              }
            }
          )
      );
    };

    it('TINY-10032: Should keep scroll at top when streamContent: true and iframe is at top',
      testStreamScrollToBottom(ScrollPosition.Top));

    it('TINY-10078: Should keep scroll at middle when streamContent: true and iframe is at middle',
      testStreamScrollToBottom(ScrollPosition.Middle));

    it('TINY-10032: Should scroll to bottom when streamContent: true and iframe is already scrolled to bottom',
      testStreamScrollToBottom(ScrollPosition.Bottom));

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
