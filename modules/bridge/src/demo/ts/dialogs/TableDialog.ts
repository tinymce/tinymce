import { openDemoDialog } from './DemoDialogHelpers';

export const createTableDialog = (): void => {
  openDemoDialog(
    {
      title: 'Table properties',
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
                  {
                    name: 'width',
                    type: 'input',
                    label: 'Width'
                  },
                  {
                    name: 'height',
                    type: 'input',
                    label: 'Height'
                  },
                  {
                    name: 'cellspacing',
                    type: 'input',
                    label: 'Cell spacing',
                    inputMode: 'numeric'
                  },
                  {
                    name: 'cellpadding',
                    type: 'input',
                    label: 'Cell padding',
                    inputMode: 'numeric'
                  },
                  {
                    name: 'border',
                    type: 'input',
                    label: 'Border',
                    inputMode: 'numeric'
                  },
                  {
                    name: 'caption',
                    type: 'checkbox',
                    label: 'Caption'
                  },
                  {
                    name: 'align',
                    type: 'selectbox',
                    label: 'Alignment',
                    items: [
                      {
                        text: 'none',
                        value: ''
                      },
                      {
                        text: 'Left',
                        value: 'left'
                      }
                    ]
                  }
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
        cellspacing: '0',
        cellpadding: '1',
        align: 'left',
        border: '0',
        caption: 'unchecked',
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
          cellspacing: data.cellspacing,
          cellpadding: data.cellpadding,
          border: data.border,
          caption: data.caption,
          borderstyle: data.borderstyle,
          bordercolor: data.bordercolor,
          backgroundcolor: data.backgroundcolor
        });

        api.close();
      }
    }
  );
};
