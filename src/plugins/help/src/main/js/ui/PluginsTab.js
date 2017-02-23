define(
'tinymce.plugins.help.ui.PluginsTab',
  [
    'tinymce.core.EditorManager',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Strings',
    'tinymce.plugins.help.data.PluginUrls'
  ],
function (tinymce, Obj, Arr, Fun, Strings, PluginUrls) {
  var maybeUrlize = function (name) {
    return Arr.find(PluginUrls.urls, function (x) {
      return x === name;
    }).fold(Fun.constant(name), function (pluginName) {
      return Strings.supplant('<a href="${url}" target="_blank">${name}</a>', {
        name: pluginName,
        url: 'https://www.tinymce.com/docs/plugins/' + pluginName
      });
    });
  };

  var pluginLister = function (editor) {
    var plugins = Obj.mapToArray(editor.plugins, function (plugin, key) {
      return '<li>' + maybeUrlize(key) + '</li>';
    });
    var count = plugins.length;
    var pluginsString = plugins.join('');

    return '<p><b>Plugins installed (' + count + '):</b></p>' +
            '<ul>' + pluginsString + '</ul>';
  };

  var makeTab = function (editor) {
    var pluginsList = pluginLister(editor);

    return {
      title: 'Plugins',
      type: 'container',
      style: 'overflow-y: auto; overflow-x: hidden; max-height: 250px',
      layout: 'flex',
      align: 'stretch',
      items:	[
        {
          type: 'container',
          html: '<div style="margin: 10px;">' +
                  pluginsList +
                '</div>',
          flex: 1
        },
        {
          type: 'container',
          html: '<div style="margin: 10px; background: blue;">' +
                  '<p>test</p>' +
                '</div>',
          flex: 1
        }
      ]
    };
  };

  return {
    makeTab: makeTab
  };
});
