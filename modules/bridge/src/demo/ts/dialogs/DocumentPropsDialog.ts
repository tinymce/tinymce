import { console } from '@ephox/dom-globals';
import { openDemoDialog } from './DemoDialogHelpers';

export const createDocumentPropsDialog = () => {
  openDemoDialog(
    {
      title: 'Document properties',
      body: {
        type: 'panel',
        items: [
          {
            name: 'title',
            type: 'input',
            label: 'Title'
          },
          {
            name: 'keywords',
            type: 'input',
            label: 'Keywords'
          },
          {
            name: 'description',
            type: 'input',
            label: 'Description'
          },
          {
            name: 'robots',
            type: 'input',
            label: 'Robots'
          },
          {
            name: 'author',
            type: 'input',
            label: 'Author'
          },
          {
            name: 'encoding',
            type: 'input',
            label: 'Encoding'
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
        title: 'My document',
        keywords: 'jada, jada',
        description: 'Some text',
        robots: 'noindex',
        author: 'some author',
        encoding: 'utf-8'
      },
      onSubmit: (api) => {
        const data = api.getData();

        // tslint:disable-next-line:no-console
        console.log({
          title: data.title,
          keywords: data.keywords,
          description: data.description,
          robots: data.robots,
          author: data.author,
          encoding: data.encoding
        });

        api.close();
      }
    }
  );

};
