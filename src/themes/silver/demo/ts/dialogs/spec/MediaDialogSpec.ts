import { console } from '@ephox/dom-globals';

export default {
  title: 'Insert/edit media',
  body: {
    type: 'tabpanel',
    tabs: [
      {
        title: 'General',
        name: 'general',
        items: [
          {
            type: 'input',
            name: 'source',
            label: 'Source'
          },
          {
            type: 'sizeinput',
            name: 'size',
            label: 'Dimensions'
          }
        ]
      },
      {
        title: 'Embed',
        items: [
          {
            type: 'textarea',
            name: 'source',
            label: 'Paste your embed code below:'
          }
        ]
      },
      {
        title: 'Advanced',
        name: 'advanced',
        items: [
          {
            type: 'input',
            name: 'altsource',
            label: 'Alternative source'
          },
          {
            type: 'input',
            name: 'poster',
            label: 'Poster'
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
    source: 'my.mp4',
    size: { width: '200', height: '200' },
    embed: '<video ...>',
    altsource: 'my.webm',
    poster: 'some.jpg'
  },
  onSubmit: (api) => {
    const data = api.getData();

    // tslint:disable-next-line:no-console
    console.log({
      source: data.source,
      width: data.size.width,
      height: data.size.height,
      embed: data.embed,
      altsource: data.altsource,
      poster: data.poster
    });

    api.close();
  }
};