import { AlloyComponent, HotspotAnchorSpec } from '@ephox/alloy';
import { Cell, Fun, Future, Option, Result } from '@ephox/katamari';
import { Body } from '@ephox/sugar';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import { ApiUrlData } from 'tinymce/themes/silver/backstage/UrlInputBackstage';
import TestProviders from './TestProviders';

export default function (sink?: AlloyComponent): UiFactoryBackstage {
  // NOTE: Non-sensical anchor
  const hotspotAnchorFn = (): HotspotAnchorSpec => ({
    anchor: 'hotspot',
    hotspot: sink
  });
  const headerLocation = Cell<'top' | 'bottom'>('top');

  return {
    shared: {
      providers: TestProviders,
      interpreter: Fun.identity,
      anchors: {
        inlineDialog: hotspotAnchorFn,
        banner: hotspotAnchorFn,
        cursor: () => ({
          anchor: 'selection',
          root: Body.body()
        }),
        node: (elem) => ({
          anchor: 'node',
          root: Body.body(),
          node: elem
        })
      },
      header: {
        isPositionedAtTop: () => headerLocation.get() !== 'bottom',
        getDockingMode: headerLocation.get,
        setDockingMode: headerLocation.set
      },
      getSink: () => Result.value(sink)
    },
    urlinput: {
      getHistory: () => [],
      addToHistory: () => {},
      getLinkInformation: () => Option.none(),
      getValidationHandler: () => Option.none(),
      getUrlPicker: (_filetype) => Option.some((entry: ApiUrlData) => Future.pure(entry))
    },
    dialog: {
      isDraggableModal: () => false
    }
  };
}
