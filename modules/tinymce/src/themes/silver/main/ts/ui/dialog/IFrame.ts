import { AlloyComponent, Behaviour, Focusing, FormField, SketchSpec, Tabstopping } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Cell, Optional } from '@ephox/katamari';
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

const getDynamicSource = (initialData: Optional<string>, stream: boolean): IFrameSourcing => {
  const cachedValue = Cell(initialData.getOr(''));
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
          const iframe = iframeElement.dom;
          const iframeDoc = Optional.from(iframe.contentDocument);
          const iframeWindow = Optional.from(iframe.contentWindow);

          const isScrollAtBottom = () => {
            const isElementScrollAtBottom = ({ scrollTop, scrollHeight, clientHeight }: HTMLElement) => scrollTop + clientHeight >= scrollHeight;
            return iframeDoc.map((doc) => doc.documentElement).map((docEl) => isElementScrollAtBottom(docEl)).getOr(false);
          };
          const isAtBottom = isScrollAtBottom();

          iframeDoc.fold(
            setSrcdocValue,
            (doc) => {
              doc.open();
              doc.write(html);
              doc.close();
            }
          );

          if (isAtBottom) {
            iframeDoc.map((doc) => doc.body).each((body) => iframeWindow.each((win) => win.scrollTo(0, body.scrollHeight)));
          }
        } else {
          setSrcdocValue();
        }
      }
      cachedValue.set(html);
    }
  };
};

const renderIFrame = (spec: IframeSpec, providersBackstage: UiFactoryBackstageProviders, initialData: Optional<string>): SketchSpec => {
  const isSandbox = spec.sandboxed;
  const isTransparent = spec.transparent;
  const baseClass = 'tox-dialog__iframe';

  const attributes = {
    ...spec.label.map<{ title?: string }>((title) => ({ title })).getOr({}),
    ...initialData.map((html) => ({ srcdoc: html })).getOr({}),
    ...isSandbox ? { sandbox: 'allow-scripts allow-same-origin' } : { },
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
        classes: (isTransparent ? [ baseClass ] : [ baseClass, `${baseClass}--opaque` ])
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
