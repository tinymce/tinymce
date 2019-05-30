export default {
  title: 'Redial',
  body: {
    type: 'panel',
    items: [ ]
  },
  buttons: [
    {
      type: 'custom',
      name: 'change',
      text: 'Change'
    }
  ],
  onAction: (dialogApi, actionData) => {
    if (actionData.name === 'change') {
      dialogApi.redial({
        title: 'v2',
        body: {
          type: 'tabpanel',
          tabs: [
            {
              title: 'Alpha',
              name: 'alpha',
              items: [
                { type: 'input', name: 'alpha.1' }
              ]
            },
            {
              title: 'Beta',
              name: 'beta',
              items: [ ]
            }
          ]
        },
        buttons: [

        ],
        initialData: {
          'alpha.1': 'A'
        }
      });
    }
  }
};