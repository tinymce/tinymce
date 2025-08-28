import { TestStore } from '@ephox/agar';
import { Menu, Toolbar } from '@ephox/bridge';
import { Arr } from '@ephox/katamari';

export const fetchMailMergeData = (settings: { collapseSearchResults: boolean }, store: TestStore): Toolbar.ToolbarMenuButtonSpec['fetch'] => (callback, fetchContext) => {
  const makeMailMerge = (info: { value: string; title?: string }): Menu.MenuItemSpec => ({
    type: 'menuitem',
    text: info.title ?? info.value,
    onAction: () => {
      store.adder('Triggering: ' + info.value)();
    }
  });

  const makeCategory = (title: string, items: Menu.NestedMenuItemContents[]): Menu.NestedMenuItemSpec => ({
    type: 'nestedmenuitem',
    text: title,
    getSubmenuItems: () => items
  });

  const currentDateMerge = {
    value: 'Current.Date',
    title: 'Current date in DD/MM/YYYY format'
  };

  const tocMerge = {
    value: 'Campaign.Toc',
    title: 'Linked table of contents in your campaign'
  };

  const phoneHomeMerge = { value: 'Phone.Home' };
  const phoneWorkMerge = { value: 'Phone.Work' };

  const personFirstnameMerge = { value: 'Person.Name.First' };
  const personSurnameMerge = { value: 'Person.Name.Last' };
  const personFullnameMerge = { value: 'Person.Name.Full' };

  const personWorkEmail = { value: 'Person.Email.Work' };
  const personHomeEmail = { value: 'Person.Email.Home' };

  const hasNoSearchPattern = !fetchContext || (fetchContext && fetchContext.pattern.length === 0);

  if (!settings.collapseSearchResults || hasNoSearchPattern) {
    callback([
      makeMailMerge(currentDateMerge),
      makeMailMerge(tocMerge),
      makeCategory(
        'Phone',
        [
          makeMailMerge(phoneHomeMerge),
          makeMailMerge(phoneWorkMerge)
        ]
      ),
      makeCategory(
        'Person',
        [
          makeMailMerge(personFirstnameMerge),
          makeMailMerge(personSurnameMerge),
          makeMailMerge(personFullnameMerge),
          makeCategory(
            'Email',
            [
              makeMailMerge(personWorkEmail),
              makeMailMerge(personHomeEmail)
            ]
          )
        ]
      )
    ]);
  } else {
    const allMerges: Array<{ value: string; title?: string }> = [
      currentDateMerge,
      tocMerge,
      phoneHomeMerge,
      phoneWorkMerge,
      personFirstnameMerge,
      personSurnameMerge,
      personFullnameMerge,
      personWorkEmail,
      personHomeEmail
    ];

    const matches = Arr.filter(allMerges, (m): boolean => {
      const valueMatches = m.value.toLowerCase().indexOf(fetchContext.pattern.toLowerCase()) > -1;
      return valueMatches || (
        m.title !== undefined && (m.title.toLowerCase().indexOf(fetchContext.pattern.toLowerCase()) > -1)
      );
    });

    if (matches.length > 0) {
      callback(
        Arr.map(matches, makeMailMerge)
      );
    } else {
      callback([
        {
          type: 'menuitem',
          text: 'No Results',
          enabled: false,
          onAction: () => {
            // eslint-disable-next-line no-console
            console.log('No results');
          }
        }
      ]);
    }
  }
};
