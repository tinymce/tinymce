import { AlloyComponent, AnchorSpec } from '@ephox/alloy';
import { Fun, Future, Option, Result } from '@ephox/katamari';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import { UrlData } from 'tinymce/themes/silver/backstage/UrlInputBackstage';
import TestProviders from './TestProviders';

export default function (sink?: AlloyComponent): UiFactoryBackstage {
  // NOTE: Non-sensical anchor
  const anchorFn = (): AnchorSpec => {
    return {
      anchor: 'hotspot',
      hotspot: sink
    };
  };

  return {
    shared: {
      providers: TestProviders,
      interpreter: Fun.identity,
      anchors: {
        toolbar: anchorFn,
        toolbarOverflow: anchorFn,
        banner: anchorFn,
        cursor: anchorFn,
        node: anchorFn
      },
      getSink: () => Result.value(sink)
    },
    urlinput: {
      getHistory: () => [],
      addToHistory: () => {},
      getLinkInformation: () => Option.none(),
      getValidationHandler: () => Option.none(),
      getUrlPicker: (filetype) => Option.some((entry: UrlData) => {
        return Future.pure(entry);
      })
    },
    dialog: {
      isDraggableModal: () => false
    }
  };
}