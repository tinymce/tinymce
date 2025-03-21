/* eslint-disable no-console */
import { Toolbar } from '@ephox/bridge';
import { Arr, Fun } from '@ephox/katamari';

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
      tooltip: 'MailMerge tooltip',
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

    // eslint-disable-next-line max-len
    const logoUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NDAiIGhlaWdodD0iMjA5IiB2aWV3Qm94PSIwIDAgNjQwIDIwOSI+CiAgICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGZpbGw9IiNGRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNNTUyLjUzNSA0OS43TDU3My4zNSAxMDhsNS45MDQgMjEuMSA3LjAwNi0yMS4xIDIwLjgxNS01OC4zSDYzOGwtNTQuNDQyIDE1MS43LTMzLjQyNSA2LjYgMTQuMzEtNDAuMy00Mi42MzItMTE4aDMwLjcyNHpNMTMyLjI0NyAyLjAxNWMzNC4wNDUuMjAzIDY3LjU4NCAyOC40MzMgNjcuNTg0IDY5LjYxNCAwIDAgLjE2NCAxMC40MDkuMTY5IDIyLjk3NHYxLjY4N2MtLjAwMiAyLjU0OC0uMDExIDUuMTY4LS4wMyA3Ljc5M2wtLjAxMyAxLjc1Yy0uMTA2IDEyLjI0OC0uNDMxIDI0LjI5OC0xLjIzNyAyOS40NC00Ljg1IDMxLjQ2OC0yOC4yODYgNTMuMTIxLTYwLjYxNCA1OC42ODYtMjkuMTk1IDUuNjY2LTQ2LjU3MSA5LjEwNy01Mi4xMjcgMTAuMTE5LTEuNDA3LjI5My01LjU2Ni44OTMtOS42OTggMS4zNDVsLS44NTQuMDkxYy0yLjY5Ni4yODEtNS4yOTkuNDg2LTcuMDI2LjQ4NkMzMi44NCAyMDYgLjQxMiAxNzkuMjg4LjAwOCAxMzYuMzg2di0uMzQyLS4xNDhsLS4wMDEtLjM3di0uMjIzbC0uMDAxLS41MTQtLjAwMy0xLjY3NnYtLjgxNS0uNDM3TDAgMTI5LjQwNnYtNC43NDgtLjY1NGwuMDAxLTIuMDNjLjAwMy00LjE1OC4wMTItOC44Ny4wMy0xMy42NWwuMDA1LTEuNTk2Yy4wNDgtMTEuNzEuMTUzLTIzLjUxMS4zNzUtMjguMzIgMS43MTgtMzEuNDY4IDIyLjkzMi01Ni44NjUgNjQuMjUtNjQuOTYgMCAwIDQ3Ljg4Ni05LjMwOCA1Mi42MzQtMTAuMjE5IDQuODQ5LS45MSAxMC4xMDItMS4zMTUgMTQuOTUtMS4yMTR6bTI0Ljg1MiAzNS4zMTNMNzYuMjggNTMuMDExdjMyLjQ4bC0zMy4zMzcgNi40NzZ2NzguODIxbDgwLjkyLTE1Ljc4NHYtMzIuMzc5bDMzLjIzNi02LjQ3NVYzNy4zMjh6TTI5Ni4wMzkgMTh2MzEuOGgzMC4wMjN2MjdoLTMwLjAyM3Y1MS40Yy4yIDguOCA2LjQwNSAxNC4zIDEzLjAxIDE0LjYgNS4xMDQuMTUgOS40NzYtLjkzOCAxMS4zNDMtMS40OWwuMjUtLjA3NmMuNDY0LS4xNDIuNzE2LS4yMzQuNzE2LS4yMzRsNi41MDUgMjEuM2MtNi45MDUgNC4zLTE2LjExMiA2LjQtMjcuODIxIDYuNC0xOC4yMTQgMC0zMy42MjYtMTQuMS0zNC4wMjYtMzR2LTU4SDI0NXYtMjdoMjEuMDE2VjIzLjhsMzAuMDIzLTUuOHpNNDY3Ljk3IDQ2LjdjMjYuNjUyIDAgNDcuNjE0IDIxLjY2IDQ4LjIyNSA0OS4xNjVsLjAxMi44MzV2NzBoLTMwLjAyM3YtNjUuNWMtLjMtMTUuNS0xMS42MDktMjcuNS0yNy41Mi0yNy41LTE1LjA2IDAtMjguMzU0IDEyLjY0My0yOC41MjIgMjcuNTQ4VjE2Ni43aC0zMC4wMjR2LTExN2gyNy4xMjFMNDI4LjQ0IDY1YzEwLjcwOC0xMi40IDI0LjYxOS0xOC4zIDM5LjUzLTE4LjN6bS04OS44NjggM3YxMTdoLTMwLjAyM3YtMTE3aDMwLjAyM3ptLTI1NC4yNCAyNi40ODJ2NDYuMzQybC00Ny41ODIgOS4zMDlWODUuNDlsNDcuNTgyLTkuMzA5ek0zNzguMTAyIDJ2MjkuMWwtMzAuMDIzIDUuOFY3LjhMMzc4LjEwMiAyeiIvPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg==';

    ed.ui.registry.addMenuButton('image-selector-button', {
      buttonType: 'bordered',
      icon: 'color-swatch-remove-color',
      tooltip: 'something',
      onSetup: (api) => {
        api.setTooltip('NEW TOOLTIP');
        return Fun.noop;
      },
      fetch: (callback, _fetchContext, _api) => callback([{
        type: 'fancymenuitem',
        fancytype: 'imageselect',
        onAction: (data) => {
          console.log('data onAction: ', data.value);
        },
        select: (value) => {
          return value === 'first-img';
        },
        initData: {
          columns: 3,
          items: [
            {
              url: logoUrl,
              type: 'imageitem',
              text: 'Logo',
              label: 'Label',
              tooltip: 'Logo tooltip',
              value: 'first-img'
            }, {
              url: logoUrl,
              type: 'imageitem',
              text: 'Logo',
              label: 'Label',
              tooltip: 'Logo tooltip',
              value: 'second-img'
            }, {
              icon: 'color-swatch-remove-color',
              type: 'resetimage',
              tooltip: 'None',
              label: 'None',
              value: 'none'
            }
          ]
        }
      }])
    });
  }
};
