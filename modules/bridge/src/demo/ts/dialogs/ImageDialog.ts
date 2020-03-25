import { console } from '@ephox/dom-globals';
import { openDemoDialog } from './DemoDialogHelpers';

// tslint:disable:no-console

export const createImageDialog = () => {
  openDemoDialog(
    {
      title: 'Insert/edit image',
      body: {
        type: 'tabpanel',
        tabs: [
          {
            title: 'General',
            items: [
              {
                name: 'source',
                type: 'urlinput',
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
        source: { value: 'my.gif', text: 'my,gif' },
        description: '',
        size: { width: '200', height: '200' },
        vspace: '0',
        hspace: '0',
        borderwidth: '10px',
        borderstyle: 'dotted',
        file: ''
      },
      onChange: (api, details) => {
        const data = api.getData();

        if (details.name === 'file') {
          // When a file is selected then update the source field, complexity around file pickers, auto complete etc is within that component
          api.setData({
            source: {
              value: data.file,
              text: data.file
            }
          });
        } else if (details.name === 'size') {
          // Notice that the size has a more complex json output separating
          // width/height the constrain logic should be done at implementation level
          const value = data.size as { width: string; height: string };
          console.log(value.width, value.height);
        }
      },
      onSubmit: (api) => {
        const data = api.getData();

        console.log({
          source: data.source,
          width: data.size.width,
          height: data.size.height,
          vspace: data.vspace,
          hspace: data.hspace,
          borderwidth: data.borderwidth,
          borderstyle: data.borderstyle
        });

        api.close();
      }
    }
  );
};
