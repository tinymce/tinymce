import { Behaviour, Focusing, Tabstopping, FormField } from '@ephox/alloy';
import { AlloyComponent } from '@ephox/alloy/lib/main/ts/ephox/alloy/api/component/ComponentApi';
import { Types } from '@ephox/bridge';
import { Cell, Merger, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attr } from '@ephox/sugar';

import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import NavigableObject from '../general/NavigableObject';
import { renderLabel, renderFormFieldWith } from '../alien/FieldLabeller';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

const platformNeedsSandboxing = !PlatformDetection.detect().browser.isIE();

interface IFrameSourcing {
  getValue: (frame: AlloyComponent) => string;
  setValue: (frame: AlloyComponent, value: string) => void;
}

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
        // so I guess they will have to be less secure since we can't sandbox on those
        // TODO: Use sandbox if future versions of IE supports iframeComponents with data: uris.
        const doc = frameComponent.element().dom().contentWindow.document;

        doc.open();
        doc.write(html);
        doc.close();

      } else {
        Attr.set(frameComponent.element(), 'src', 'data:text/html;charset=utf-8,' + encodeURIComponent(html));
      }
      cachedValue.set(html);
    }
  };
};

const renderIFrame = (spec: Types.Iframe.Iframe, sharedBackstage: UiFactoryBackstageShared) => {
  const isSandbox = platformNeedsSandboxing && spec.sandboxed;

  const sandboxAttrs = isSandbox ? {
    sandbox: 'allow-scripts'
  } : { };

  const sourcing = getDynamicSource(isSandbox);

  const pLabel = spec.label.map((label) => renderLabel(label, sharedBackstage));

  const factory = (newSpec: { uid: string }) => {
    return NavigableObject.craft(
      {
        // We need to use the part uid or the label and field won't be linked with ARIA
        uid: newSpec.uid,
        dom: {
          tag: 'iframe',
          attributes: Merger.deepMerge(
            sandboxAttrs
          )
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

  const extraClasses = spec.flex ? ['tox-form__group--stretched'] : [];

  return renderFormFieldWith(pLabel, pField, extraClasses);
};

export {
  renderIFrame
};