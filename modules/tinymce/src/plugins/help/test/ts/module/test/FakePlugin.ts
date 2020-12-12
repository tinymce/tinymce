import PluginManager from 'tinymce/core/api/PluginManager';

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

export default () => {};
