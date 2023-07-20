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

  const scrollToYAfterWrite = (win: Window, scrollY: number | 'bottom') => {
    const scrollToY = (body: HTMLElement) => win.scrollTo(0, scrollY === 'bottom' ? body.scrollHeight : scrollY);

    if (isSafari) {
      // TINY-10078: On Safari, the body not immediately available after document.write(), meaning the iframe has not finished updating.
      // Wait for the body to ensure scroll does not reset to near-top unexpectedly once the update operation is complete.
      const waitForBody = (): Promise<HTMLElement> => new Promise((resolve, reject) => {
        let retries = 0;
        const interval = setInterval(() => {
          if (Type.isNonNullable(win.document.body)) {
            clearInterval(interval);
            resolve(win.document.body);
          } else {
            retries++;
          }
        });

        if (retries > 100) {
          clearInterval(interval);
          reject();
        }
      });

      waitForBody().then(scrollToY);
    } else {
      scrollToY(win.document.body);
    }
  };

  const writeValue = (iframeElement: SugarElement<HTMLIFrameElement>, html: string, fallbackFn: () => void): void => {
    const iframe = iframeElement.dom;
    Optional.from(iframe.contentDocument).fold(
      fallbackFn,
      (doc) => {
        let lastScrollTop = 0;
        // TINY-10032: If documentElement is null, we assume document is empty and so scroll is at bottom.
        const isScrollAtBottom = Optional.from(doc.documentElement).map((docEl) => {
          lastScrollTop = docEl.scrollTop;
          return docEl;
        }).forall(isElementScrollAtBottom);

        doc.open();
        doc.write(html);
        doc.close();

        const win = iframe.contentWindow;
        if (Type.isNonNullable(win)) {
          if (isScrollAtBottom) {
            scrollToYAfterWrite(win, 'bottom');
          } else if (!isScrollAtBottom && (isSafari || isFirefox) && lastScrollTop !== 0) {
            // TINY-10078: Safari and Firefox reset scroll to top on each document.write(), so we need to restore scroll manually
            scrollToYAfterWrite(win, lastScrollTop);
          }
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
      // TINY-3769: We need to use srcdoc here, instead of src with a data URI, otherwise browsers won't retain the Origin.
      // See https://bugs.chromium.org/p/chromium/issues/detail?id=58999#c11
      if (cachedValue.get() !== html) {
        const iframeElement = frameComponent.element as SugarElement<HTMLIFrameElement>;
        const setSrcdocValue = () => Attribute.set(iframeElement, 'srcdoc', html);

        if (stream) {
          const args = [ iframeElement, html, setSrcdocValue ] as const;
          writeValueThrottler.fold(() => writeValue(...args), (throttler) => throttler.throttle(...args));
        } else {
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
