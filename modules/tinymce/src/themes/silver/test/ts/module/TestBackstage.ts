import { AlloyComponent, HotspotAnchorSpec } from '@ephox/alloy';
import { Cell, Fun, Future, Optional, Result } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';

import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import { ApiUrlData } from 'tinymce/themes/silver/backstage/UrlInputBackstage';

import TestProviders from './TestProviders';

export default (sink?: AlloyComponent): UiFactoryBackstage => {
  // NOTE: Non-sensical anchor
  const hotspotAnchorFn = (): HotspotAnchorSpec => ({
    type: 'hotspot',
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
          type: 'selection',
          root: SugarBody.body()
        }),
        node: (elem) => ({
          type: 'node',
          root: SugarBody.body(),
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
      getHistory: Fun.constant([]),
      addToHistory: Fun.noop,
      getLinkInformation: Optional.none,
      getValidationHandler: Optional.none,
      getUrlPicker: (_filetype) => Optional.some((entry: ApiUrlData) => Future.pure(entry))
    },
    dialog: {
      isDraggableModal: Fun.never
    }
  };
};
