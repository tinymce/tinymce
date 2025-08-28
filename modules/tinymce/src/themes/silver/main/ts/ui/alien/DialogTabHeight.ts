import { AlloyComponent, AlloyEvents, EventFormat, Replacing, SystemEvents, TabbarTypes, TabSection } from '@ephox/alloy';
import { Arr, Singleton } from '@ephox/katamari';
import { Css, Focus, Height, SelectorFind, SugarElement, SugarShadowDom, Traverse, Width } from '@ephox/sugar';

import { formResizeEvent } from '../general/FormEvents';

export interface TabHeightMode {
  readonly extraEvents: AlloyEvents.AlloyEventKeyAndHandler<EventFormat>[];
  readonly selectFirst: boolean;
}

const measureHeights = (allTabs: TabbarTypes.TabButtonWithViewSpec[], tabview: SugarElement<HTMLElement>, tabviewComp: AlloyComponent): number[] => Arr.map(allTabs, (_tab, i) => {
  Replacing.set(tabviewComp, allTabs[i].view());
  const rect = tabview.dom.getBoundingClientRect();
  Replacing.set(tabviewComp, [ ]);
  return rect.height;
});

const getMaxHeight = (heights: number[]) => Arr.head(Arr.sort(heights, (a, b) => {
  if (a > b) {
    return -1;
  } else if (a < b) {
    return +1;
  } else {
    return 0;
  }
}));

const getMaxTabviewHeight = (dialog: SugarElement<HTMLElement>, tabview: SugarElement<HTMLElement>, tablist: SugarElement<HTMLElement>) => {
  const documentElement = Traverse.documentElement(dialog).dom;
  const rootElm = SelectorFind.ancestor(dialog, '.tox-dialog-wrap').getOr(dialog);
  const isFixed = Css.get(rootElm, 'position') === 'fixed';

  // Get the document or window/viewport height
  let maxHeight: number;
  if (isFixed) {
    maxHeight = Math.max(documentElement.clientHeight, window.innerHeight);
  } else {
    maxHeight = Math.max(documentElement.offsetHeight, documentElement.scrollHeight);
  }

  // Determine the current height taken up by the tabview panel
  const tabviewHeight = Height.get(tabview);
  const isTabListBeside = tabview.dom.offsetLeft >= tablist.dom.offsetLeft + Width.get(tablist);
  const currentTabHeight = isTabListBeside ? Math.max(Height.get(tablist), tabviewHeight) : tabviewHeight;

  // Get the dialog height, making sure to account for any margins on the dialog
  const dialogTopMargin = parseInt(Css.get(dialog, 'margin-top'), 10) || 0;
  const dialogBottomMargin = parseInt(Css.get(dialog, 'margin-bottom'), 10) || 0;
  const dialogHeight = Height.get(dialog) + dialogTopMargin + dialogBottomMargin;

  const chromeHeight = dialogHeight - currentTabHeight;
  return maxHeight - chromeHeight;
};

const showTab = (allTabs: TabbarTypes.TabButtonWithViewSpec[], comp: AlloyComponent) => {
  Arr.head(allTabs).each((tab) => TabSection.showTab(comp, tab.value));
};

const setTabviewHeight = (tabview: SugarElement<Element>, height: number) => {
  // Set both height and flex-basis as some browsers don't support flex-basis.
  Css.set(tabview, 'height', height + 'px');
  Css.set(tabview, 'flex-basis', height + 'px');
};

const updateTabviewHeight = (dialogBody: SugarElement<HTMLElement>, tabview: SugarElement<HTMLElement>, maxTabHeight: Singleton.Value<number>) => {
  SelectorFind.ancestor<HTMLElement>(dialogBody, '[role="dialog"]').each((dialog) => {
    SelectorFind.descendant<HTMLElement>(dialog, '[role="tablist"]').each((tablist) => {
      maxTabHeight.get().map((height) => {
        // Set the tab view height to 0, so we can calculate the max tabview height, without worrying about overflows
        Css.set(tabview, 'height', '0');
        Css.set(tabview, 'flex-basis', '0');
        return Math.min(height, getMaxTabviewHeight(dialog, tabview, tablist));
      }).each((height) => {
        setTabviewHeight(tabview, height);
      });
    });
  });
};

const getTabview = (dialog: SugarElement<HTMLElement>) =>
  SelectorFind.descendant<HTMLElement>(dialog, '[role="tabpanel"]');

const smartMode = (allTabs: TabbarTypes.TabButtonWithViewSpec[]): TabHeightMode => {
  const maxTabHeight = Singleton.value<number>();

  const extraEvents = [
    AlloyEvents.runOnAttached((comp) => {
      const dialog = comp.element;
      getTabview(dialog).each((tabview) => {
        Css.set(tabview, 'visibility', 'hidden');

        // Determine the maximum heights of each tab
        comp.getSystem().getByDom(tabview).toOptional().each((tabviewComp) => {
          const heights = measureHeights(allTabs, tabview, tabviewComp);

          // Calculate the maximum tab height and store it
          const maxTabHeightOpt = getMaxHeight(heights);
          maxTabHeightOpt.fold(maxTabHeight.clear, maxTabHeight.set);
        });

        // Set an initial height, based on the current size
        updateTabviewHeight(dialog, tabview, maxTabHeight);

        // Show the tabs
        Css.remove(tabview, 'visibility');
        showTab(allTabs, comp);

        // Use a delay here and recalculate the height, as we need all the components attached
        // to be able to properly calculate the max height
        requestAnimationFrame(() => {
          updateTabviewHeight(dialog, tabview, maxTabHeight);
        });
      });
    }),
    AlloyEvents.run(SystemEvents.windowResize(), (comp) => {
      const dialog = comp.element;
      getTabview(dialog).each((tabview) => {
        updateTabviewHeight(dialog, tabview, maxTabHeight);
      });
    }),
    AlloyEvents.run(formResizeEvent, (comp, _se) => {
      const dialog = comp.element;
      getTabview(dialog).each((tabview) => {
        const oldFocus = Focus.active(SugarShadowDom.getRootNode(tabview));
        Css.set(tabview, 'visibility', 'hidden');
        const oldHeight = Css.getRaw(tabview, 'height').map((h) => parseInt(h, 10));
        Css.remove(tabview, 'height');
        Css.remove(tabview, 'flex-basis');
        const newHeight = tabview.dom.getBoundingClientRect().height;
        const hasGrown = oldHeight.forall((h) => newHeight > h);

        if (hasGrown) {
          maxTabHeight.set(newHeight);
          updateTabviewHeight(dialog, tabview, maxTabHeight);
        } else {
          oldHeight.each((h) => {
            setTabviewHeight(tabview, h);
          });
        }

        Css.remove(tabview, 'visibility');
        oldFocus.each(Focus.focus);
      });
    })
  ];

  const selectFirst = false;

  return {
    extraEvents,
    selectFirst
  };
};

// Set tab heights within a dialog to vary according to their contents
const naiveMode = (_allTabs: TabbarTypes.TabButtonWithViewSpec[]): TabHeightMode => {
  const extraEvents: AlloyEvents.AlloyEventKeyAndHandler<EventFormat>[] = [ ];

  const selectFirst = true;

  return {
    extraEvents,
    selectFirst
  };
};

export {
  smartMode,
  naiveMode
};
