/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Focusing, Tabstopping, FormField, AlloyComponent } from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Cell, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attr } from '@ephox/sugar';

import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import NavigableObject from '../general/NavigableObject';
import { renderLabel, renderFormFieldWith } from '../alien/FieldLabeller';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { Omit } from '../Omit';

const platformNeedsSandboxing = !(PlatformDetection.detect().browser.isIE() || PlatformDetection.detect().browser.isEdge());

interface IFrameSourcing {
  getValue: (frame: AlloyComponent) => string;
  setValue: (frame: AlloyComponent, value: string) => void;
}

type IframeSpec = Omit<Types.Iframe.Iframe, 'type'>;

const getDynamicSource = (isSandbox): IFrameSourcing => {
  const cachedValue = Cell('');
  return {
    getValue: (frameComponent: AlloyComponent): string => {
      // Ideally we should fetch data from the iframe...innerHtml, this triggers Corrs errors
      return cachedValue.get();
    },
    setValue: (frameComponent: AlloyComponent, html: string) => {

      if (!isSandbox) {
        Attr.set(frameComponent.element(), 'src', 'javascript:\'\'');
        // IE 6-11 doesn't support data uris on iframeComponents
        // and Edge only supports upto ~4000 chars in data uris
        // so I guess they will have to be less secure since we can't sandbox on those
        // TODO: Use sandbox if future versions of IE/Edge supports iframeComponents with data: uris.
        const doc = frameComponent.element().dom().contentWindow.document;

        doc.open();
        doc.write(html);
        doc.close();

      } else {
        // TINY-3769: We need to use srcdoc here, instead of src with a data URI, otherwise browsers won't retain the Origin.
        // See https://bugs.chromium.org/p/chromium/issues/detail?id=58999#c11
        Attr.set(frameComponent.element(), 'srcdoc', html);
      }
      cachedValue.set(html);
    }
  };
};

const renderIFrame = (spec: IframeSpec, providersBackstage: UiFactoryBackstageProviders) => {
  const isSandbox = platformNeedsSandboxing && spec.sandboxed;

  const attributes = {
    ...spec.label.map<{ title?: string }>((title) => ({title})).getOr({}),
    ...isSandbox ? { sandbox : 'allow-scripts allow-same-origin' } : { }
  };

  const sourcing = getDynamicSource(isSandbox);

  const pLabel = spec.label.map((label) => renderLabel(label, providersBackstage));

  const factory = (newSpec: { uid: string }) => {
    return NavigableObject.craft(
      {
        // We need to use the part uid or the label and field won't be linked with ARIA
        uid: newSpec.uid,
        dom: {
          tag: 'iframe',
          attributes
        },
        behaviours: Behaviour.derive([
          Tabstopping.config({ }),
          Focusing.config({ }),
          RepresentingConfigs.withComp(Option.none(), sourcing.getValue, sourcing.setValue)
        ])
      }
    );
  };

  // Note, it's not going to handle escape at this point.
  const pField = FormField.parts().field({
    factory: { sketch: factory }
  });

  return renderFormFieldWith(pLabel, pField, ['tox-form__group--stretched']);
};

export {
  renderIFrame
};
