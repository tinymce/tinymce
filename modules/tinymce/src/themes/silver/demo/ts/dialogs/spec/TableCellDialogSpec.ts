import { console } from '@ephox/dom-globals';

export default {
  title: 'Cell properties',
  body: {
    type: 'tabpanel',
    tabs: [
      {
        title: 'General',
        name: 'general',
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
                name: 'celltype',
                type: 'selectbox',
                label: 'Cell type',
                items: [
                  {
                    text: 'Cell',
                    value: 'td'
                  },
                  {
                    text: 'Header cell',
                    value: 'th'
                  }
                ]
              },
              {
                name: 'scope',
                type: 'selectbox',
                label: 'Scope',
                items: [
                  {
                    text: 'none',
                    value: ''
                  }
                ]
              },
              {
                name: 'halign',
                type: 'selectbox',
                label: 'H Align',
                items: [
                  {
                    text: 'none',
                    value: ''
                  },
                  {
                    text: 'left',
                    value: ''
                  }
                ]
              },
              {
                name: 'valign',
                type: 'selectbox',
                label: 'V Align',
                items: [
                  {
                    text: 'none',
                    value: ''
                  },
                  {
                    text: 'top',
                    value: ''
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        title: 'Advanced',
        name: 'advanced',
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
      },
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

    // tslint:disable-next-line:no-console
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
};