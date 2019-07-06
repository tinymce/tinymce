/* tslint:disable:no-console */
import { console } from '@ephox/dom-globals';

export default {
  title: 'Insert/edit image',
  body: {
    type: 'tabpanel',
    tabs: [
      {
        title: 'General',
        name: 'general',
        items: [
          {
            name: 'source',
            type: 'urlinput', // TODO: Change to input
            filetype: 'image'
          },
          {
            name: 'description',
            type: 'input'
          },
          {
            name: 'size',
            type: 'sizeinput'
          }
        ]
      },
      {
        title: 'Advanced',
        name: 'advanced',
        items: [
          {
            name: 'vspace',
            type: 'input'
          },
          {
            name: 'hspace',
            type: 'input'
          },
          {
            name: 'borderwidth',
            type: 'input'
          },
          {
            name: 'borderstyle',
            type: 'selectbox',
            items: [
              {
                text: 'dotted',
                value: 'dotted'
              }
            ]
          }
        ]
      },
      {
        title: 'Upload',
        items: [
          {
            name: 'file',
            type: 'dropzone'
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
    source: {
      value: 'my.gif',
      text: 'my.gif'
    },
    description: '',
    size: { width: '200', height: '200' },
    vspace: '0',
    hspace: '0',
    borderwidth: '10px',
    borderstyle: 'dotted',
    file: '' // Inconsistent types. Bridge expects string, Dropzone uses [ ]
  },
  onChange: (api, details) => {
    const data = api.getData();
    console.log('changing to ', data.file);

    if (details.name === 'file') {
      // When a file is selected then update the source field, complexity around file pickers, auto complete etc is within that component
      api.setData({
        source: data.file
      });
    } else if (details.name === 'size') {
      // Notice that the size has a more complex json output separating
      // width/height the constrain logic should be done at implementation level
      const value = details.value as { width: string, height: string };
      console.log(value.width, value.height);
    }
  },
  onSubmit: (api) => {
    const data = api.getData();
    console.log('Dialog data', data);
    api.close();
  }
};
