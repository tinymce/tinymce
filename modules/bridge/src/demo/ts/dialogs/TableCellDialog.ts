import { openDemoDialog } from './DemoDialogHelpers';

export const createTableCellDialog = (): void => {
  openDemoDialog(
    {
      title: 'Cell properties',
      body: {
        type: 'tabpanel',
        tabs: [
          {
            title: 'General',
            items: [
              {
                type: 'grid',
                columns: 2,
                items: [
                  // {
                  //   name: 'width',
                  //   type: 'input',
                  //   label: 'Width'
                  // },
                  // {
                  //   name: 'height',
                  //   type: 'input',
                  //   label: 'Height'
                  // },
                  // {
                  //   name: 'celltype',
                  //   type: 'selectbox',
                  //   label: 'Cell type',
                  //   items: [
                  //     {
                  //       text: 'Cell',
                  //       value: 'td'
                  //     },
                  //     {
                  //       text: 'Header cell',
                  //       value: 'th'
                  //     }
                  //   ]
                  // },
                  // {
                  //   name: 'scope',
                  //   type: 'selectbox',
                  //   label: 'Scope',
                  //   items: [
                  //     {
                  //       text: 'none',
                  //       value: ''
                  //     }
                  //   ]
                  // },
                  // {
                  //   name: 'halign',
                  //   type: 'selectbox',
                  //   label: 'Horizontal align',
                  //   items: [
                  //     {
                  //       text: 'none',
                  //       value: ''
                  //     },
                  //     {
                  //       text: 'left',
                  //       value: ''
                  //     }
                  //   ]
                  // },
                  // {
                  //   name: 'valign',
                  //   type: 'selectbox',
                  //   label: 'Vertical align',
                  //   items: [
                  //     {
                  //       text: 'none',
                  //       value: ''
                  //     },
                  //     {
                  //       text: 'top',
                  //       value: ''
                  //     }
                  //   ]
                  // }
                ]
              }
            ]
          },
          {
            title: 'Advanced',
            items: [
              {
                name: 'borderstyle',
                type: 'selectbox',
                label: 'Border style',
                items: [
                  {
                    text: 'Dotted',
                    value: 'dotted'
                  }
                ]
              },
              {
                name: 'bordercolor',
                type: 'colorinput',
                label: 'Border color'
              },
              {
                name: 'backgroundcolor',
                type: 'colorinput',
                label: 'Background color'
              }
            ]
          }
        ]
      },
      buttons: [
        {
          type: 'submit',
          name: 'ok',
          text: 'Ok',
          primary: true
        },
        {
          type: 'cancel',
          name: 'cancel',
          text: 'Cancel'
        }
      ],
      initialData: {
        width: '100%',
        height: '100px',
        celltype: 'td',
        scope: '',
        halign: 'left',
        valign: 'top',
        borderstyle: 'dotted',
        bordercolor: '#FF0000',
        backgroundcolor: '#00FF00'
      },
      onSubmit: (api) => {
        const data = api.getData();

        // eslint-disable-next-line no-console
        console.log({
          width: data.width,
          height: data.height,
          celltype: data.celltype,
          scope: data.scope,
          halign: data.halign,
          valign: data.valign,
          borderstyle: data.borderstyle,
          bordercolor: data.bordercolor,
          backgroundcolor: data.backgroundcolor
        });

        api.close();
      }
    }
  );
};
