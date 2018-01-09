import PluginManager from 'tinymce/core/PluginManager';

var Plugin = function (editor, url) {
  return {
    getMetadata: function () {
      return {
        name: 'Fake',
        url: 'http://www.fake.com'
      };
    }
  };
};

PluginManager.add('fake', Plugin);

export default function () {};