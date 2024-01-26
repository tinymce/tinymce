import { AlloyComponent, Behaviour, Focusing, FormField, Receiving, SketchSpec, Tabstopping } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Cell, Optional } from '@ephox/katamari';
import { Attribute, Class, Compare, SugarElement, Traverse } from '@ephox/sugar';

import * as Backstage from '../../backstage/Backstage';
import * as FieldLabeller from '../alien/FieldLabeller';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';
import * as NavigableObject from '../general/NavigableObject';
import * as DialogChannels from '../window/DialogChannels';
import * as IFrameStream from './IFrameStream';

interface IFrameSourcing {
  readonly getValue: (frame: AlloyComponent) => string;
  readonly setValue: (frame: AlloyComponent, value: string) => void;
}

export interface DialogFocusShiftedEvent extends CustomEvent {
  readonly newFocus: Optional<SugarElement<HTMLElement>>;
}

type IframeSpec = Omit<Dialog.Iframe, 'type'>;

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
          IFrameStream.throttledUpdate(iframeElement, html, setSrcdocValue);
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
