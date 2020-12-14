import PluginManager from 'tinymce/core/api/PluginManager';

export default () => {
  const Plugin = (_editor, _url) => {
    return {
      getMetadata: () => {
        return {
          name: 'Fake',
          url: 'http://www.fake.com'
        };
      }
    };
  };

  PluginManager.add('fake', Plugin);
};
