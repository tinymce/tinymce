export default {
  title: 'Insert link',
  body: {
    type: 'panel',
    items: [
      {
        name: 'url',
        type: 'urlinput',
        filetype: 'file',
        label: 'Url'
      },
      {
        name: 'text',
        type: 'input',
        label: 'Text to display'
      },
      {
        name: 'title',
        type: 'input',
        label: 'Title'
      },
      {
        name: 'target',
        type: 'selectbox',
        label: 'Target',
        items: [
          {
            text: 'None',
            value: ''
          },
          {
            text: 'Blank',
            value: '_blank'
          },
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
    url: { value: 'my.html', text: 'my.html', meta: { } },
    text: 'Some text',
    title: 'Some title',
    target: '_blank'
  },
  onSubmit: (api) => {
    const data = api.getData();

    console.log({
      url: data.url,
      text: data.text,
      title: data.title,
      target: data.target
    });

    api.close();
  }
};