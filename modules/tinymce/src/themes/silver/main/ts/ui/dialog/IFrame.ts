import { AlloyComponent, Behaviour, Focusing, FormField, Receiving, SketchSpec, Tabstopping } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Cell, Fun, Optional, Optionals, Throttler, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attribute, Class, Compare, SugarElement, Traverse } from '@ephox/sugar';

import * as Backstage from '../../backstage/Backstage';
import * as FieldLabeller from '../alien/FieldLabeller';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';
import * as NavigableObject from '../general/NavigableObject';
import * as DialogChannels from '../window/DialogChannels';

interface IFrameSourcing {
  readonly getValue: (frame: AlloyComponent) => string;
  readonly setValue: (frame: AlloyComponent, value: string) => void;
}

export interface DialogFocusShiftedEvent extends CustomEvent {
  readonly newFocus: Optional<SugarElement<HTMLElement>>;
}

type IframeSpec = Omit<Dialog.Iframe, 'type'>;

const browser = PlatformDetection.detect().browser;
const isSafari = browser.isSafari();
const isFirefox = browser.isFirefox();
const isSafariOrFirefox = isSafari || isFirefox;
const isChromium = browser.isChromium();

const isElementScrollAtBottom = ({ scrollTop, scrollHeight, clientHeight }: HTMLElement) =>
  Math.ceil(scrollTop) + clientHeight >= scrollHeight;

const scrollToY = (win: Window, y: number | 'bottom') =>
  // TINY-10128: The iframe body is occasionally null when we attempt to scroll, so instead of using body.scrollHeight, use a
  // fallback value of 99999999. To minimise the potential impact of future browser changes, this fallback is significantly smaller
  // than the minimum of the maximum value Window.scrollTo would take on supported browsers:
  // Chromium: > Number.MAX_SAFE_INTEGER
  // Safari: 2^31 - 1 = 2147483647
  // Firefox: 2147483583
  win.scrollTo(0, y === 'bottom' ? 99999999 : y);

const getScrollingElement = (doc: Document, html: string): Optional<HTMLElement> => {
  // TINY-10110: The scrolling element can change between body and documentElement depending on whether there
  // is a doctype declaration. However, this behavior is inconsistent on Chrome and Safari so checking for
  // the scroll properties is the most reliable way to determine which element is the scrolling element, at
  // least for the purposes of determining whether scroll is at bottom.
  const body = doc.body;
  return Optional.from(!/^<!DOCTYPE (html|HTML)/.test(html) &&
      (!isChromium && !isSafari || Type.isNonNullable(body) && (body.scrollTop !== 0 || Math.abs(body.scrollHeight - body.clientHeight) > 1))
    ? body : doc.documentElement);
};

const writeValue = (iframeElement: SugarElement<HTMLIFrameElement>, html: string, fallbackFn: () => void): void => {
  const iframe = iframeElement.dom;
  Optional.from(iframe.contentDocument).fold(
    fallbackFn,
    (doc) => {
      let lastScrollTop = 0;
      // TINY-10032: If documentElement (or body) is nullable, we assume document is empty and so scroll is at bottom.
      const isScrollAtBottom = getScrollingElement(doc, html).map((el) => {
        lastScrollTop = el.scrollTop;
        return el;
      }).forall(isElementScrollAtBottom);

      const scrollAfterWrite = (): void => {
        const win = iframe.contentWindow;
        if (Type.isNonNullable(win)) {
          if (isScrollAtBottom) {
            scrollToY(win, 'bottom');
          } else if (!isScrollAtBottom && isSafariOrFirefox && lastScrollTop !== 0) {
            // TINY-10078: Safari and Firefox reset scroll to top on each document.write(), so we need to restore scroll manually
            scrollToY(win, lastScrollTop);
          }
        }
      };

      // TINY-10109: On Safari, attempting to scroll before the iframe has finished loading will cause scroll to reset to top upon load.
      // TINY-10128: We will not wait for the load event on Chrome and Firefox since doing so causes the scroll to jump around erratically,
      // especially on Firefox. However, not waiting for load has the trade-off of potentially losing bottom scroll when updating at a very
      // rapid rate, as attempting to scroll before the iframe body is loaded will not work.
      if (isSafari) {
        iframe.addEventListener('load', scrollAfterWrite, { once: true });
      }

      doc.open();
      doc.write(html);
      doc.close();

      if (!isSafari) {
        scrollAfterWrite();
      }
    });
};

// TINY-10078: On Firefox, throttle to 200ms to improve scrolling experience. Since we are manually maintaining previous scroll position
// on each update, when updating rapidly without a throttle, attempting to scroll around the iframe can feel stuck.
// TINY-10097: On Safari, throttle to 500ms to reduce flickering as the document.write() method still observes significant flickering.
// Also improves scrolling, as scroll positions are maintained manually similar to Firefox.
const throttleInterval = Optionals.someIf(isSafariOrFirefox, isSafari ? 500 : 200);

// TINY-10078: Use Throttler.adaptable to ensure that any content added during the waiting period is not lost.
const writeValueThrottler = throttleInterval.map((interval) => Throttler.adaptable(writeValue, interval));

const getDynamicSource = (initialData: Optional<string>, stream: boolean): IFrameSourcing => {
  const cachedValue = Cell(initialData.getOr(''));
  return {
    getValue: (_frameComponent: AlloyComponent): string =>
      // Ideally we should fetch data from the iframe...innerHtml, this triggers Cors errors
      cachedValue.get(),
    setValue: (frameComponent: AlloyComponent, html: string) => {
      if (cachedValue.get() !== html) {
        const iframeElement = frameComponent.element as SugarElement<HTMLIFrameElement>;
        const setSrcdocValue = () => Attribute.set(iframeElement, 'srcdoc', html);

        if (stream) {
          writeValueThrottler.fold(Fun.constant(writeValue), (throttler) => throttler.throttle)(iframeElement, html, setSrcdocValue);
        } else {
          // TINY-3769: We need to use srcdoc here, instead of src with a data URI, otherwise browsers won't retain the Origin.
          // See https://bugs.chromium.org/p/chromium/issues/detail?id=58999#c11
          setSrcdocValue();
        }
      }
      cachedValue.set(html);
    }
  };
};

const renderIFrame = (spec: IframeSpec, providersBackstage: Backstage.UiFactoryBackstageProviders, initialData: Optional<string>): SketchSpec => {
  const baseClass = 'tox-dialog__iframe';
  const opaqueClass = spec.transparent ? [] : [ `${baseClass}--opaque` ];
  const containerBorderedClass = spec.border ? [ `tox-navobj-bordered` ] : [];

  const attributes = {
    ...spec.label.map<{ title?: string }>((title) => ({ title })).getOr({}),
    ...initialData.map((html) => ({ srcdoc: html })).getOr({}),
    ...spec.sandboxed ? { sandbox: 'allow-scripts allow-same-origin' } : { }
  };

  const sourcing = getDynamicSource(initialData, spec.streamContent);

  const pLabel = spec.label.map((label) => FieldLabeller.renderLabel(label, providersBackstage));

  const factory = (newSpec: { uid: string }) => NavigableObject.craft(
    Optional.from(containerBorderedClass),
    {
      // We need to use the part uid or the label and field won't be linked with ARIA
      uid: newSpec.uid,
      dom: {
        tag: 'iframe',
        attributes,
        classes: [
          baseClass,
          ...opaqueClass
        ]
      },
      behaviours: Behaviour.derive([
        Tabstopping.config({ }),
        Focusing.config({ }),
        RepresentingConfigs.withComp(initialData, sourcing.getValue, sourcing.setValue),
        Receiving.config({
          channels: {
            [DialogChannels.dialogFocusShiftedChannel]: {
              onReceive: (comp, message: DialogFocusShiftedEvent) => {
                message.newFocus.each((newFocus) => {
                  Traverse.parentElement(comp.element).each((parent) => {
                    const f = Compare.eq(comp.element, newFocus) ? Class.add : Class.remove;
                    f(parent, 'tox-navobj-bordered-focus');
                  });
                });
              }
            }
          }
        })
      ])
    }
  );

  // Note, it's not going to handle escape at this point.
  const pField = FormField.parts.field({
    factory: { sketch: factory }
  });

  return FieldLabeller.renderFormFieldWith(pLabel, pField, [ 'tox-form__group--stretched' ], [ ]);
};

export {
  renderIFrame
};
