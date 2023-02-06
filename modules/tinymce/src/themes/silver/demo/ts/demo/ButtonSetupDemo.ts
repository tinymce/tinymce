/* eslint-disable no-console */
import { Toolbar } from '@ephox/bridge';
import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

export default {
  setup: (ed: Editor): void => {
    ed.ui.registry.addButton('basic-button-1', {
      text: 'basic-button-1',
      onAction: () => {
        console.log('basic-button-1 click');
      }
    });

    ed.ui.registry.addButton('basic-button-2', {
      icon: 'basic-icon',
      text: 'aria-label-icon-button',
      onAction: () => {
        console.log('basic-button-2 click, basic-icon');
      }
    });

    // ed.addButton('panel-button-1', {
    //   type: 'panelbutton',
    //   text: 'panel-button-1'
    //   },
    //   panel: {
    //     type: 'grid',
    //     columns: 2,
    //     items: [
    //       {
    //         // TODO: Not going through bridge yet
    //         type: 'input',
    //         name: 'panel-label-1',
    //         label: Optional.none(),

    //       }
    //     ]
    //   }
    // });

    ed.ui.registry.addButton('dialog-button', {
      type: 'button',
      text: 'Launch Dialog',
      onAction: () => {
        ed.windowManager.open({
          title: 'Dialog title',
          body: {
            type: 'panel',
            items: [
              {
                name: 'preview',
                type: 'iframe'
              }
            ]
          },
          buttons: [
            {
              type: 'cancel',
              name: 'cancel',
              text: 'Cancel'
            },
            {
              type: 'submit',
              name: 'save',
              text: 'Save',
              primary: true
            }
          ],
          initialData: {
            preview: 'some html url'
          },
          onSubmit: (_api) => {
            console.log('Preview Demo Submit');
          },
          onClose: () => {
            console.log('Preview Demo Close');
          }
        });
      }
    });

    // This fetch function is used for the MailMerge example buttons. The
    // flag passed in determines whether to collapse all the items into a single
    // menu when a search pattern is present.
    const mailMergeFetch = (collapseIfSearch: boolean): Toolbar.ToolbarMenuButton['fetch'] => (callback, fetchContext, _api) => {
      const makeMailMerge = (info: { value: string; title?: string }) => ({
        type: 'menuitem',
        text: info.title ?? info.value,
        onAction: () => {
          console.log('Triggering: ' + info.value);
        }
      });

      const makeCategory = (title: string, items: any[]) => ({
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

      const searchPattern = fetchContext !== undefined ? fetchContext.pattern : '';
      if (!collapseIfSearch || searchPattern.length === 0) {
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
        ] as any);
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
          const valueMatches = m.value.toLowerCase().indexOf(searchPattern.toLowerCase()) > -1;
          return valueMatches || (
            m.title !== undefined && (m.title.toLowerCase().indexOf(searchPattern.toLowerCase()) > -1)
          );
        });

        if (matches.length > 0) {
          callback(
            Arr.map(matches, makeMailMerge) as any
          );
        } else {
          callback([
            {
              type: 'menuitem',
              text: 'No Results',
              enabled: false,
              onAction: () => {
                console.log('No results');
              }
            }
          ]);
        }
      }

    };

    ed.ui.registry.addMenuButton('MailMerge', {
      text: 'MailMerge',
      search: true,
      fetch: mailMergeFetch(true)
    });

    ed.ui.registry.addMenuButton('MailMerge-NoCollapse', {
      text: 'MailMerge-WithMenus',
      search: {
        placeholder: 'Change my placeholder text!'
      },
      fetch: mailMergeFetch(false)
    });

    ed.ui.registry.addMenuButton('menu-button-1', {
      text: 'menu',
      fetch: (callback) => callback('menu-button-item-1 menu-button-item-2')
    });

    ed.ui.registry.addMenuItem('menu-button-item-1', {
      text: 'menu-button-item-1',
      onAction: () => {
        console.log('menu-button-item-1 click');
      }
    });

    ed.ui.registry.addNestedMenuItem('menu-button-item-2', {
      text: 'menu-button-item-2',
      getSubmenuItems: () => {
        return [
          {
            type: 'menuitem',
            text: 'submenu-1',
            onAction: () => {
              console.log('submenu1');
            }
          },
          {
            type: 'menuitem',
            text: 'submenu-2',
            getSubmenuItems: () => {
              return [
                {
                  type: 'menuitem',
                  text: 'submenu-2-a',
                  onAction: () => {
                    console.log('submenu2a');
                  }
                }
              ];
            }
          }
        ];
      }
    });
  }
};
