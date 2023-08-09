import { ApproxStructure, Assertions, Waiter } from '@ephox/agar';
import { AlloyComponent, Composing, Container, GuiFactory, Representing, TestHelpers } from '@ephox/alloy';
import { describe, context, it } from '@ephox/bedrock-client';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
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

  const browser = PlatformDetection.detect().browser;
  const isSafari = browser.isSafari();
  const isFirefox = browser.isFirefox();
  const isSafariOrFirefox = isSafari || isFirefox;

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
        classes: [ arr.has('tox-navobj'), (border ? arr.has : arr.not)('tox-navobj-bordered') ],
        children: [
          s.element('div', {
            attrs: {
              'data-alloy-tabstop': str.is('true')
            }
          }),
          s.element('iframe', {
            classes: [
              arr.has('tox-dialog__iframe'),
              (transparent ? arr.not : arr.has)(`${baseClassPrefix}opaque`)
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

  const testContent = '<p><span class="me">Me</span></p>';

  const assertScrollAtTop = ({ scrollTop }: HTMLElement, label: string) => assert.strictEqual(scrollTop, 0, label);
  const assertScrollAtMiddle = ({ scrollTop, scrollHeight }: HTMLElement, label: string) => assert.approximately(scrollTop, scrollHeight / 2, 1, label);
  const assertScrollAtBottom = ({ scrollTop, scrollHeight, clientHeight }: HTMLElement, label: string) => assert.isAtLeast(Math.ceil(scrollTop) + clientHeight, scrollHeight, label);
  const assertScrollAtBottomOverflow = (el: HTMLElement, label: string) => {
    assert.notStrictEqual(el.scrollTop, 0, label);
    assertScrollAtBottom(el, label);
  };
  const assertIframeScroll = (iframe: HTMLIFrameElement, hasDoctype: boolean, assertFn: (scrollingEl: HTMLElement) => void) =>
    Optional.from(hasDoctype ? iframe.contentDocument?.documentElement : iframe.contentDocument?.body).fold(
      () => assert.fail(`Could not find element`),
      (el: HTMLElement) => assertFn(el)
    );
  const assertIframeScrollAtBottom = (iframe: HTMLIFrameElement, hasDoctype: boolean, label: string) => assertIframeScroll(iframe, hasDoctype, (el: HTMLElement) => assertScrollAtBottom(el, label));
  const assertIframeScrollAtBottomOverflow = (iframe: HTMLIFrameElement, hasDoctype: boolean, label: string) => assertIframeScroll(iframe, hasDoctype, (el: HTMLElement) => assertScrollAtBottomOverflow(el, label));

  const assertScrollApproximatelyAt = ({ scrollTop }: HTMLElement, expectedScrollTop: number, label: string) => assert.approximately(scrollTop, expectedScrollTop, 1, label);

  const normalizeContent = (content: string, hasDoctype: boolean) => hasDoctype ? `<!DOCTYPE html><html><body>${content}</body></html>` : content;

  let isIframeLoaded = false;
  const setContentAndWaitForLoad = (frame: AlloyComponent, content: string, shouldContentHaveDoctype: boolean) => {
    isIframeLoaded = false;
    const iframe = frame.element.dom as HTMLIFrameElement;
    iframe.onload = () => isIframeLoaded = true;
    Representing.setValue(frame, normalizeContent(content, shouldContentHaveDoctype));
    return Waiter.pTryUntilPredicate('Wait for iframe to finish loading', () => isIframeLoaded).then(() => iframe.onload = Fun.noop);
  };

  const getDoctypeLabel = (hasDoctype: boolean) => hasDoctype ? 'content has doctype' : 'content does not have doctype';

  const testIterativeContentChange = (frameNumber: number, shouldContentHaveDoctype: boolean, assertFn: (iframe: HTMLIFrameElement, it: number) => void, maxIterations: number = 10) => async () => {
    const frame = getFrameFromFrameNumber(frameNumber);

    for (let i = 0, content = ''; i < maxIterations; ++i) {
      content += testContent;
      await setContentAndWaitForLoad(frame, content, shouldContentHaveDoctype);
      assertFn(frame.element.dom as HTMLIFrameElement, i);
    }
  };

  const streamFrameNumber = 2;

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

      Representing.setValue(frame, testContent);
      if (assertUsingSrcdoc) {
        assertSandboxIframeSrcdoc(frame, testContent);
      } else {
        await Waiter.pTryUntil('Waiting for iframe body to be set', () =>
          Optional.from(frame.element.dom.contentDocument?.body).fold(
            () => assert.fail('Could not find iframe body'),
            (body) => assertSandboxedIframeContent(body, testContent)
          ));
      }
    };

    it('Check iframe content', testSandboxedIframeContent(0, true));
    it('TINY-10032: Check iframe content with streamContent: true', testSandboxedIframeContent(streamFrameNumber, false));
  });

  context('Autoscrolling', () => {
    const enum ScrollPosition {
      Top,
      Middle,
      Bottom
    }

    const initialLongContent = '<p>1</p>'.repeat(50);
    const newLongContent = `${initialLongContent}${'<p>2</p>'.repeat(50)}`;

    const testStreamScroll = (initialScrollPosition: ScrollPosition, shouldContentHaveDoctype: boolean) => async () => {
      const frame = getFrameFromFrameNumber(streamFrameNumber);
      const iframe = frame.element.dom as HTMLIFrameElement;

      await setContentAndWaitForLoad(frame, initialLongContent, shouldContentHaveDoctype);

      const doc = iframe.contentDocument;
      await Optional.from(iframe.contentWindow).fold(
        () => assert.fail('Could not find iframe window'),
        (win) =>
          Optional.from(shouldContentHaveDoctype ? doc?.documentElement : doc?.body).fold(
            () => assert.fail(`Could not find iframe ${shouldContentHaveDoctype ? 'documentElement' : 'body'}`),
            async (el) => {
              let initialScroll: number;
              if (initialScrollPosition === ScrollPosition.Top) {
                initialScroll = 0;
              } else if (initialScrollPosition === ScrollPosition.Middle) {
                initialScroll = el.scrollHeight / 2;
              } else {
                initialScroll = el.scrollHeight;
              }

              win.scrollTo(0, initialScroll);

              if (initialScrollPosition === ScrollPosition.Top) {
                assertScrollAtTop(el, 'iframe should be scrolled to top initially');
              } else if (initialScrollPosition === ScrollPosition.Middle) {
                assertScrollAtMiddle(el, 'iframe should be scrolled to middle initially');
              } else {
                assertScrollAtBottomOverflow(el, 'iframe should be scrolled to bottom initially');
              }

              await setContentAndWaitForLoad(frame, newLongContent, shouldContentHaveDoctype);

              Optional.from(shouldContentHaveDoctype ? doc?.documentElement : doc?.body).fold(
                () => assert.fail(`Could not find updated iframe ${shouldContentHaveDoctype ? 'documentElement' : 'body'}`),
                (updatedEl) => {
                  if (initialScrollPosition === ScrollPosition.Top) {
                    assertScrollAtTop(updatedEl, 'iframe scroll should be at top after setting value');
                  } else if (initialScrollPosition === ScrollPosition.Middle) {
                    assertScrollApproximatelyAt(updatedEl, initialScroll, 'iframe scroll should be at previous middle after setting value');
                  } else {
                    assertScrollAtBottomOverflow(updatedEl, 'iframe should be at bottom after setting value');
                  }
                }
              );
            }
          )
      );
    };

    Arr.each([ true, false ], (shouldContentHaveDoctype) => {
      const doctypeLabel = getDoctypeLabel(shouldContentHaveDoctype);

      it(`TINY-10032: Should keep scroll at top when streamContent: true, iframe is at top, and ${doctypeLabel}`,
        testStreamScroll(ScrollPosition.Top, shouldContentHaveDoctype));

      it(`TINY-10032: Should keep scroll at middle when streamContent: true, iframe is at middle, and ${doctypeLabel}`,
        testStreamScroll(ScrollPosition.Middle, shouldContentHaveDoctype));

      it(`TINY-10032: Should scroll to bottom when streamContent: true, iframe is already scrolled to bottom, and ${doctypeLabel}}`,
        testStreamScroll(ScrollPosition.Bottom, shouldContentHaveDoctype));

      it(`TINY-10109: Check that scroll is kept at bottom when changing content iteratively and ${doctypeLabel}`,
        testIterativeContentChange(streamFrameNumber, shouldContentHaveDoctype, (iframe, it) =>
          assertIframeScrollAtBottom(iframe, shouldContentHaveDoctype, `iframe should be scrolled to bottom on iteration ${it}`)));

      it(`TINY-10032: Should scroll to bottom when adding overflowing content in an empty iframe and ${doctypeLabel}`, async () => {
        const frame = getFrameFromFrameNumber(streamFrameNumber);
        const iframe = frame.element.dom as HTMLIFrameElement;
        await Waiter.pTryUntil('Waiting for iframe content to be set to empty initially', () => {
          Representing.setValue(frame, '');
          assert.equal(iframe.contentDocument?.body.innerHTML, '', 'iframe should be empty initially');
        });
        await setContentAndWaitForLoad(frame, initialLongContent, shouldContentHaveDoctype);
        await Waiter.pTryUntil('Waiting for iframe to be scrolled to bottom', () => {
          assertIframeScrollAtBottomOverflow(iframe, shouldContentHaveDoctype, 'iframe should be scrolled to bottom after setting value');
        });
      });
    });

    it('TINY-10032: Should not scroll to bottom when stream: false', () => {
      const frame = getFrameFromFrameNumber(0);
      Representing.setValue(frame, newLongContent);
      Optional.from(frame.element.dom.contentWindow).fold(
        () => assert.fail('Could not find iframe document element'),
        (win) => assert.equal(win.scrollY, 0, 'iframe scroll should be at top')
      );
    });
  });

  context('Updating iframe content in intervals (streaming simulation)', () => {
    const setValueInIntervals = (frame: AlloyComponent, interval: number, maxNumIntervals: number, shouldContentHaveDoctype: boolean): void => {
      let iterations = 0;
      let content = '';
      const intervalId = setInterval(() => {
        content += testContent;
        Representing.setValue(frame, normalizeContent(content, shouldContentHaveDoctype));

        if (++iterations > maxNumIntervals) {
          clearInterval(intervalId);
        }
      }, interval);
    };

    const assertIframeStateAfterIntervals = (iframe: HTMLIFrameElement, maxNumIntervals: number, shouldContentHaveDoctype: boolean) => {
      assert.equal(iframe.contentDocument?.body.innerHTML, testContent.repeat(maxNumIntervals + 1), 'iframe content should match');
      assertIframeScrollAtBottomOverflow(iframe, shouldContentHaveDoctype, 'iframe should be scrolled to bottom');
    };

    Arr.each([ true, false ], (shouldContentHaveDoctype) => {
      const doctypeLabel = getDoctypeLabel(shouldContentHaveDoctype);
      it(`TINY-10078 & TINY-10097: Check for throttled iframe load on Safari and iframe scroll position is at bottom after streaming when ${doctypeLabel}`, async () => {
        const frame = getFrameFromFrameNumber(streamFrameNumber);
        const iframe = frame.element.dom as HTMLIFrameElement;

        let loadCount = 0;
        iframe.onload = () => loadCount++;

        const interval = 100;
        const maxNumIntervals = 10;
        setValueInIntervals(frame, interval, maxNumIntervals, shouldContentHaveDoctype);

        await Waiter.pTryUntil('Wait for update intervals to finish', () => {
          // TINY-10078, TINY-10097, TINY-10128: Artificial 500ms throttle on Safari, 200ms throttle on Firefox.
          const expectedLoads = (isSafariOrFirefox ? interval * maxNumIntervals / (isSafari ? 500 : 200) : maxNumIntervals) + 1;
          if (isFirefox) {
            assert.approximately(loadCount, expectedLoads, 1, `iframe should have approximately ${expectedLoads} loads`);
          } else {
            assert.strictEqual(loadCount, expectedLoads, `iframe should have exactly ${expectedLoads} loads`);
          }
          assertIframeStateAfterIntervals(iframe, maxNumIntervals, shouldContentHaveDoctype);
        });

        iframe.onload = Fun.noop;
      });

      it(`TINY-10078, TINY-10097, TINY-10128: When updating rapidly and ${doctypeLabel}, artificial throttles should not impact content completeness and scroll should be kept at bottom`, async () => {
        const frame = getFrameFromFrameNumber(streamFrameNumber);
        const maxNumIntervals = 10;
        setValueInIntervals(frame, 0, maxNumIntervals, shouldContentHaveDoctype);

        const iframe = frame.element.dom as HTMLIFrameElement;
        await Waiter.pTryUntil('Wait for update intervals to finish', () =>
          assertIframeStateAfterIntervals(iframe, maxNumIntervals, shouldContentHaveDoctype));
      });
    });
  });
});
