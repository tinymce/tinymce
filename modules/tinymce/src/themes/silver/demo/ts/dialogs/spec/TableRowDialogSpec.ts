export default {
  title: 'Row properties',
  body: {
    type: 'tabpanel',
    tabs: [
      {
        title: 'General',
        name: 'general',
        items: [
          {
            name: 'rowtype',
            type: 'listbox',
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
            type: 'listbox',
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
        name: 'advanced',
        items: [
          {
            name: 'borderstyle',
            type: 'listbox',
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
};
