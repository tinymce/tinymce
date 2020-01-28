import { AlloyComponent, HotspotAnchorSpec } from '@ephox/alloy';
import { Fun, Future, Option, Result } from '@ephox/katamari';
import { Body } from '@ephox/sugar';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import { ApiUrlData } from 'tinymce/themes/silver/backstage/UrlInputBackstage';
import TestProviders from './TestProviders';

export default function (sink?: AlloyComponent): UiFactoryBackstage {
  // NOTE: Non-sensical anchor
  const hotspotAnchorFn = (): HotspotAnchorSpec => {
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
        inlineDialog: hotspotAnchorFn,
        banner: hotspotAnchorFn,
        cursor: () => {
          return {
            anchor: 'selection',
            root: Body.body()
          };
        },
        node: (elem) => {
          return {
            anchor: 'node',
            root: Body.body(),
            node: elem
          };
        }
      },
      getSink: () => Result.value(sink)
    },
    urlinput: {
      getHistory: () => [],
      addToHistory: () => {},
      getLinkInformation: () => Option.none(),
      getValidationHandler: () => Option.none(),
      getUrlPicker: (filetype) => Option.some((entry: ApiUrlData) => {
        return Future.pure(entry);
      })
    },
    dialog: {
      isDraggableModal: () => false
    }
  };
}
