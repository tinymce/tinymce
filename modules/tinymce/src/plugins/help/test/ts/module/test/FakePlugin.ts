import Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';

export default () => {
  const Plugin = (_editor: Editor, _url: string) => {
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
