import { openDemoDialog } from './DemoDialogHelpers';

export const createTableRowDialog = (): void => {
  openDemoDialog(
    {
      title: 'Row properties',
      body: {
        type: 'tabpanel',
        tabs: [
          {
            title: 'General',
            items: [
              {
                name: 'rowtype',
                type: 'selectbox',
                label: 'Row type',
                items: [
                  {
                    text: 'Body',
                    value: 'tbody'
                  },
                  {
                    text: 'Head',
                    value: 'thead'
                  },
                  {
                    text: 'Foot',
                    value: 'tfoot'
                  }
                ]
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
                  },
                  {
                    text: 'Center',
                    value: 'center'
                  },
                  {
                    text: 'Right',
                    value: 'right'
                  }
                ]
              },
              {
                name: 'height',
                type: 'input',
                label: 'Height'
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
        rowtype: 'tfoot',
        align: 'center',
        height: '20px',
        borderstyle: 'dotted',
        bordercolor: '#FF0000',
        backgroundcolor: '#00FF00'
      },
      onSubmit: (api) => {
        const data = api.getData();

        // eslint-disable-next-line no-console
        console.log({
          type: data.rowtype,
          align: data.align,
          height: data.height,
          borderstyle: data.borderstyle,
          bordercolor: data.bordercolor,
          backgroundcolor: data.backgroundcolor
        });

        api.close();
      }
    }
  );
};
