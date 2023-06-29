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
    hotspot: sink as AlloyComponent
  });
  const headerLocation = Cell<'top' | 'bottom'>('top');
  const contextMenuState = Cell(false);

  return {
    shared: {
      providers: TestProviders,
      interpreter: Fun.identity as any,
      anchors: {
        inlineDialog: hotspotAnchorFn,
        inlineBottomDialog: hotspotAnchorFn,
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
      getSink: () => sink ? Result.value(sink) : Result.error('No test sink setup')
    },
    urlinput: {
      getHistory: Fun.constant([]),
      addToHistory: Fun.noop,
      getLinkInformation: Optional.none,
      getValidationHandler: Optional.none,
      getUrlPicker: (_filetype) => Optional.some((entry: ApiUrlData) => Future.pure(entry))
    },
    styles: {
      getData: Fun.constant([])
    },
    colorinput: {
      colorPicker: Fun.noop,
      hasCustomColors: Fun.never,
      getColors: Fun.constant([]),
      getColorCols: Fun.constant(5)
    },
    dialog: {
      isDraggableModal: Fun.never
    },
    setContextMenuState: contextMenuState.set,
    isContextMenuOpen: contextMenuState.get
  };
};
