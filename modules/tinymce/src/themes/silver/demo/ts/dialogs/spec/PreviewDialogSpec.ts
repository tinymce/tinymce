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
    preview: 'some html url'
  }
};