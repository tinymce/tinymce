import { ApproxStructure, Assertions, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { Arr, Type } from '@ephox/katamari';
import { SugarBody, SugarElement } from '@ephox/sugar';

interface TitleWithTextItem {
  readonly title: string;
  readonly text: string;
}

interface TitleWithIconItem {
  readonly title: string;
  readonly icon: string;
}

interface TitleWithTextAndIconItem extends TitleWithTextItem, TitleWithIconItem {}

type GroupItem = TitleWithTextAndIconItem | TitleWithTextItem | TitleWithIconItem | ApproxStructure.Builder<StructAssert>;

interface AutocompleterListStructure {
  readonly type: 'list';
  readonly hasIcons: false;
  readonly groups: Array<TitleWithTextItem | ApproxStructure.Builder<StructAssert>>[];
}

interface AutocompleterIconListStructure {
  readonly type: 'list';
  readonly hasIcons: true;
  readonly groups: Array<TitleWithTextAndIconItem | ApproxStructure.Builder<StructAssert>>[];
}

interface AutocompleterGridStructure {
  readonly type: 'grid';
  readonly groups: Array<TitleWithIconItem | ApproxStructure.Builder<StructAssert>>[];
}

type AutocompleterStructure = AutocompleterListStructure | AutocompleterIconListStructure | AutocompleterGridStructure;

const structWithTitleAndIconAndText = (d: TitleWithTextAndIconItem): ApproxStructure.Builder<StructAssert> =>
  (s, str, arr) => s.element('div', {
    classes: [ arr.has('tox-collection__item') ],
    attrs: {
      title: str.is(d.title)
    },
    children: [
      s.element('div', {
        classes: [ arr.has('tox-collection__item-icon') ],
        children: [
          s.text(str.is(d.icon))
        ]
      }),
      s.element('div', {
        classes: [ arr.has('tox-collection__item-label') ],
        html: str.is(d.text)
      })
    ]
  });

const structWithTitleAndText = (d: TitleWithTextItem): ApproxStructure.Builder<StructAssert> =>
  (s, str, arr) => s.element('div', {
    classes: [ arr.has('tox-collection__item') ],
    attrs: {
      title: str.is(d.title)
    },
    children: [
      s.element('div', {
        classes: [ arr.has('tox-collection__item-label') ],
        html: str.is(d.text)
      })
    ]
  });

const structWithTitleAndIcon = (d: TitleWithIconItem): ApproxStructure.Builder<StructAssert> =>
  (s, str, arr) => s.element('div', {
    classes: [ arr.has('tox-collection__item') ],
    attrs: {
      title: str.is(d.title)
    },
    children: [
      s.element('div', {
        classes: [ arr.has('tox-collection__item-icon') ],
        children: [
          s.text(str.is(d.icon))
        ]
      })
    ]
  });

const pWaitForAutocompleteToOpen = (): Promise<SugarElement<HTMLElement>> => UiFinder.pWaitForVisible(
  'Wait for autocompleter to appear',
  SugarBody.body(),
  '.tox-autocompleter div[role="menu"]'
);

const pWaitForAutocompleteToClose = (): Promise<void> => Waiter.pTryUntil(
  'Autocompleter should disappear',
  () => UiFinder.notExists(SugarBody.body(), '.tox-autocompleter div[role="menu"]'),
  50
);

const pAssertAutocompleterStructure = async (structure: AutocompleterStructure): Promise<void> => {
  const autocompleter = UiFinder.findIn(SugarBody.body(), '.tox-autocompleter').getOrDie();
  await Waiter.pTryUntil(
    'Waiting for autocompleter structure to match',
    () => Assertions.assertStructure(
      'Checking the autocompleter',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-autocompleter') ],
        children: [
          s.element('div', {
            children: [
              s.element('div', {
                classes: [ arr.has('tox-menu'), arr.has(`tox-collection--${structure.type}`), arr.has('tox-collection') ],
                styles: {
                  // TINY-6476: Ensure the menu is positioned not the wrapper
                  position: str.is('absolute')
                },
                children: Arr.map<GroupItem[], StructAssert>(structure.groups, (group) => s.element('div', {
                  classes: [ arr.has('tox-collection__group') ],
                  children: Arr.map(group, (d) => {
                    if (Type.isFunction(d)) {
                      return d(s, str, arr);
                    } else if (structure.type === 'list') {
                      if (structure.hasIcons) {
                        return structWithTitleAndIconAndText(d as TitleWithTextAndIconItem)(s, str, arr);
                      } else {
                        return structWithTitleAndText(d as TitleWithTextItem)(s, str, arr);
                      }
                    } else {
                      return structWithTitleAndIcon(d as TitleWithIconItem)(s, str, arr);
                    }
                  })
                }))
              })
            ]
          })
        ]
      })),
      autocompleter
    )
  );
};

export {
  AutocompleterGridStructure,
  AutocompleterListStructure,
  AutocompleterStructure,
  pAssertAutocompleterStructure,
  structWithTitleAndIcon,
  structWithTitleAndIconAndText,
  structWithTitleAndText,
  pWaitForAutocompleteToClose,
  pWaitForAutocompleteToOpen
};
