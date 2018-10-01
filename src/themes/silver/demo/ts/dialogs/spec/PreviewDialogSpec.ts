export default {
  title: 'Preview',
  size: 'large',
  body: {
    type: 'panel',
    items: [
      {
        name: 'preview',
        type: 'iframe'
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
    preview: 'some html url'
  }
};