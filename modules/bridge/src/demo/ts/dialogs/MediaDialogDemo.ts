import { openDemoDialog } from './DemoDialogHelpers';

export const createMediaDialog = (): void => {
  openDemoDialog(
    {
      title: 'Insert/edit media',
      body: {
        type: 'tabpanel',
        tabs: [
          {
            title: 'General',
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
        source: 'my.mp4',
        size: { width: '200', height: '200' },
        embed: '<video ...>',
        altsource: 'my.webm',
        poster: 'some.jpg'
      },
      onSubmit: (api) => {
        const data = api.getData();

        // eslint-disable-next-line no-console
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
    }
  );
};
