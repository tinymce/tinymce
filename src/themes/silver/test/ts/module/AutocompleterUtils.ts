import { ApproxStructure, Assertions, Chain, Guard, UiFinder, Waiter } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { Body } from '@ephox/sugar';

interface AutocompleterListStructure {
  type: 'list';
  hasIcons: boolean;
  groups: { title: string; text: string; icon?: string; boldText?: string}[][];
}

interface AutocompleterGridStructure {
  type: 'grid';
  groups: { title: string; icon?: string; boldText?: string }[][];
}

type AutocompleterStructure = AutocompleterListStructure | AutocompleterGridStructure;

const structWithTitleAndIconAndText = (d) => (s, str, arr) => {
  return s.element('div', {
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
};

const structWithTitleAndText = (d) => (s, str, arr) => {
  return s.element('div', {
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
};

const structWithTitleAndIcon = (d) => (s, str, arr) => {
  return s.element('div', {
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
};

const sWaitForAutocompleteToClose = Waiter.sTryUntil(
  'Autocompleter should disappear',
  UiFinder.sNotExists(Body.body(), '.tox-autocompleter'),
  100,
  1000
);

const sAssertAutocompleterStructure = (structure: AutocompleterStructure) => {
  return Chain.asStep(Body.body(), [
    UiFinder.cFindIn('.tox-autocompleter'),
    Chain.control(
      Assertions.cAssertStructure(
        'Checking the autocompleter',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [ arr.has('tox-autocompleter') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-menu'), arr.has(`tox-collection--${structure.type}`), arr.has('tox-collection') ],
                children: Arr.map(structure.groups, (group) => {
                  return s.element('div', {
                    classes: [ arr.has('tox-collection__group') ],
                    children: Arr.map(group, (d) => {
                      if (structure.type === 'list') {
                        if (structure.hasIcons) {
                          return structWithTitleAndIconAndText(d)(s, str, arr);
                        } else {
                          return structWithTitleAndText(d)(s, str, arr);
                        }
                      } else {
                        return structWithTitleAndIcon(d)(s, str, arr);
                      }
                    })
                  });
                })
              })
            ]
          });
        })
      ),
      Guard.tryUntil('Waiting for autocompleter structure to match' , 100, 1000)
    )
  ]);
};

export {
  AutocompleterGridStructure,
  AutocompleterListStructure,
  AutocompleterStructure,
  sAssertAutocompleterStructure,
  structWithTitleAndIcon,
  structWithTitleAndIconAndText,
  structWithTitleAndText,
  sWaitForAutocompleteToClose
};
