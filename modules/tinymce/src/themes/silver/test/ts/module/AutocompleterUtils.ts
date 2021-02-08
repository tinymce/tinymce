import { ApproxStructure, Assertions, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { Arr, Type } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';

interface AutocompleterListStructure {
  type: 'list';
  hasIcons?: boolean;
  groups: Array<{ title: string; text: string; icon?: string; boldText?: string} | ((s, str, arr) => StructAssert)>[];
}

interface AutocompleterGridStructure {
  type: 'grid';
  groups: Array<{ title: string; icon?: string; boldText?: string } | ((s, str, arr) => StructAssert)>[];
}

type AutocompleterStructure = AutocompleterListStructure | AutocompleterGridStructure;

const structWithTitleAndIconAndText = (d) => (s, str, arr) => s.element('div', {
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

const structWithTitleAndText = (d) => (s, str, arr) => s.element('div', {
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

const structWithTitleAndIcon = (d) => (s, str, arr) => s.element('div', {
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

const pWaitForAutocompleteToOpen = () => UiFinder.pWaitForVisible(
  'Wait for autocompleter to appear',
  SugarBody.body(),
  '.tox-autocompleter div[role="menu"]'
);

const pWaitForAutocompleteToClose = () => Waiter.pTryUntil(
  'Autocompleter should disappear',
  () => UiFinder.notExists(SugarBody.body(), '.tox-autocompleter div[role="menu"]'),
  50
);

const pAssertAutocompleterStructure = async (structure: AutocompleterStructure) => {
  const autocompleter = UiFinder.findIn(SugarBody.body(), '.tox-autocompleter').getOrDie();
  await Waiter.pTryUntil(
    'Waiting for autocompleter structure to match',
    () => Assertions.assertStructure(
      'Checking the autocompleter',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-autocompleter') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-menu'), arr.has(`tox-collection--${structure.type}`), arr.has('tox-collection') ],
            children: Arr.map(structure.groups, (group) => s.element('div', {
              classes: [ arr.has('tox-collection__group') ],
              children: Arr.map(group, (d) => {
                if (structure.type === 'list') {
                  if (Type.isFunction(d)) {
                    return d(s, str, arr);
                  } else if (structure.hasIcons) {
                    return structWithTitleAndIconAndText(d)(s, str, arr);
                  } else {
                    return structWithTitleAndText(d)(s, str, arr);
                  }
                } else {
                  return structWithTitleAndIcon(d)(s, str, arr);
                }
              })
            }))
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
