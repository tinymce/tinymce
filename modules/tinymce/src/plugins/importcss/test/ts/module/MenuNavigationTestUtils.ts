import { FocusTools, Keyboard, Keys, Waiter } from '@ephox/agar';
import { SugarElement } from '@ephox/sugar';

export interface Navigation {
  readonly item: string;
  readonly subitems: string[];
}

const pAssertFocusOnItem = (doc: SugarElement<Document>, text: string): Promise<SugarElement<HTMLElement>> =>
  FocusTools.pTryOnSelector(
    'Focus should be on: ' + text,
    doc,
    `.tox-collection__item:contains(${text})`
  );

const pDelay = () => Waiter.pWait(0);

const pProcessNavigation = async (doc: SugarElement<Document>, navigation: Navigation[]): Promise<void> => {
  if (navigation.length === 0) {
    return;
  }

  // Note: Can't use Arr.foldl here as we need the index and also need to sequence promises
  const navItems = navigation.concat(navigation.slice(0, 1));
  for (let i = 0; i < navItems.length; i++) {
    const nav = navItems[i];
    await pAssertFocusOnItem(doc, nav.item);

    if (nav.subitems.length > 0) {
      Keyboard.activeKeydown(doc, Keys.right());
      await pAssertFocusOnItem(doc, nav.subitems[0]);

      for (const si of nav.subitems.slice(1).concat(nav.subitems.slice(0, 1))) {
        Keyboard.activeKeydown(doc, Keys.down());
        await pDelay();
        await pAssertFocusOnItem(doc, si);
      }

      Keyboard.activeKeyup(doc, Keys.escape());
    } else {
      // Should do nothing
      Keyboard.activeKeydown(doc, Keys.right());
    }

    await pAssertFocusOnItem(doc, nav.item);
    await pDelay();

    // Move to the next one if not the last item
    if (i < navigation.length) {
      Keyboard.activeKeydown(doc, Keys.down());
    }
  }
};

export {
  pAssertFocusOnItem,
  pProcessNavigation
};
