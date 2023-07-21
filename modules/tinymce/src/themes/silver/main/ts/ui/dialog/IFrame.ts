import { AlloyComponent, Behaviour, Focusing, FormField, SketchSpec, Tabstopping } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Cell, Optional, Throttler, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attribute, SugarElement } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { renderFormFieldWith, renderLabel } from '../alien/FieldLabeller';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import * as NavigableObject from '../general/NavigableObject';

interface IFrameSourcing {
  readonly getValue: (frame: AlloyComponent) => string;
  readonly setValue: (frame: AlloyComponent, value: string) => void;
}

type IframeSpec = Omit<Dialog.Iframe, 'type'>;

const browser = PlatformDetection.detect().browser;
const isSafari = browser.isSafari();
const isFirefox = browser.isFirefox();

const getDynamicSource = (initialData: Optional<string>, stream: boolean): IFrameSourcing => {
  const cachedValue = Cell(initialData.getOr(''));

  const isElementScrollAtBottom = ({ scrollTop, scrollHeight, clientHeight }: HTMLElement) =>
    Math.ceil(scrollTop) + clientHeight >= scrollHeight;

  const scrollToY = (win: Window, y: number | 'bottom') =>
    win.scrollTo(0, y === 'bottom' ? win.document.body.scrollHeight : y);

  const writeValue = (iframeElement: SugarElement<HTMLIFrameElement>, html: string, fallbackFn: () => void): void => {
    const iframe = iframeElement.dom;
    Optional.from(iframe.contentDocument).fold(
      fallbackFn,
      (doc) => {
        let lastScrollTop = 0;
        // TINY-10032: If documentElement (or body) is nullable, we assume document is empty and so scroll is at bottom.
        const isScrollAtBottom = Optional.from(
          // TINY-10078: On Firefox, if the HTML does not begin with an HTML document type declaration, the body holds the scroll position,
          // not the documentElement.
          isFirefox && !/^<!DOCTYPE (html|HTML)/.test(html) ? doc.body : doc.documentElement
        ).map((el) => {
          lastScrollTop = el.scrollTop;
          return el;
        }).forall(isElementScrollAtBottom);

        const scrollAfterWrite = (): void => {
          const win = iframe.contentWindow;
          if (Type.isNonNullable(win)) {
            if (isScrollAtBottom) {
              scrollToY(win, 'bottom');
            } else if (!isScrollAtBottom && (isSafari || isFirefox) && lastScrollTop !== 0) {
              // TINY-10078: Safari and Firefox reset scroll to top on each document.write(), so we need to restore scroll manually
              scrollToY(win, lastScrollTop);
            }
          }
        };

        // TINY-10078: On Safari, attempting to scroll before iframe has finished loading will cause scroll to reset to top upon load.
        // We won't do this for all browsers since this does introduce a slight visual lag.
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

  // TINY-10097: Throttle to reduce flickering, as the document.write() method still observes significant flickering on Safari.
  const writeValueThrottler = isSafari ? Optional.some(Throttler.first(writeValue, 500)) : Optional.none();

  return {
    getValue: (_frameComponent: AlloyComponent): string =>
      // Ideally we should fetch data from the iframe...innerHtml, this triggers Cors errors
      cachedValue.get(),
    setValue: (frameComponent: AlloyComponent, html: string) => {
      if (cachedValue.get() !== html) {
        const iframeElement = frameComponent.element as SugarElement<HTMLIFrameElement>;
        const setSrcdocValue = () => Attribute.set(iframeElement, 'srcdoc', html);

        if (stream) {
          const args = [ iframeElement, html, setSrcdocValue ] as const;
          writeValueThrottler.fold(() => writeValue(...args), (throttler) => throttler.throttle(...args));
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

const renderIFrame = (spec: IframeSpec, providersBackstage: UiFactoryBackstageProviders, initialData: Optional<string>): SketchSpec => {
  const baseClass = 'tox-dialog__iframe';
  const borderedClass = spec.border ? [ `${baseClass}--bordered` ] : [];
  const opaqueClass = spec.transparent ? [] : [ `${baseClass}--opaque` ];

  const attributes = {
    ...spec.label.map<{ title?: string }>((title) => ({ title })).getOr({}),
    ...initialData.map((html) => ({ srcdoc: html })).getOr({}),
    ...spec.sandboxed ? { sandbox: 'allow-scripts allow-same-origin' } : { },
  };

  const sourcing = getDynamicSource(initialData, spec.streamContent);

  const pLabel = spec.label.map((label) => renderLabel(label, providersBackstage));

  const factory = (newSpec: { uid: string }) => NavigableObject.craft(
    {
      // We need to use the part uid or the label and field won't be linked with ARIA
      uid: newSpec.uid,
      dom: {
        tag: 'iframe',
        attributes,
        classes: [
          baseClass,
          ...borderedClass,
          ...opaqueClass
        ]
      },
      behaviours: Behaviour.derive([
        Tabstopping.config({ }),
        Focusing.config({ }),
        RepresentingConfigs.withComp(initialData, sourcing.getValue, sourcing.setValue)
      ])
    }
  );

  // Note, it's not going to handle escape at this point.
  const pField = FormField.parts.field({
    factory: { sketch: factory }
  });

  return renderFormFieldWith(pLabel, pField, [ 'tox-form__group--stretched' ], [ ]);
};

export {
  renderIFrame
};
