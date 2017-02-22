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

    return '<p>Plugins installed (' + count + '):</p>' +
            '<ul>' + pluginsString + '</ul>';
  };

  var makeTab = function (editor, url) {
    var version = [tinymce.majorVersion, tinymce.minorVersion].join('.');
    var releaseDate = tinymce.releaseDate;
    var pluginsList = pluginLister(editor);

    return {
      title: 'Plugins',
      type: 'container',
      style: 'overflow-y: auto; overflow-x: hidden; max-height: 250px',
      display: 'flex',
      items:	[
        {
          type: 'container',
          html: '<div style="margin: 10px;">' +
                  '<img src="' + url + '/img/logo.png" alt="TinyMCE Logo" style="margin: 25px auto; display: block;">' +
                  '<p><b>Version: </b>' + version + '</p>' +
                  '<p>' +
                    '<b>Release date:</b> ' + releaseDate +
                  '</p>' +
                  pluginsList +
                '</div>'
        },
        {
          type: 'container',
          html: '<div style="margin: 10px;">' +
                  '<p>test</p>' +
                '</div>'
        }
      ]
    };
  };

  return {
    makeTab: makeTab
  };
});
