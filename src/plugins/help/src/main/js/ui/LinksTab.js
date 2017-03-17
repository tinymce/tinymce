define(
  'tinymce.plugins.help.ui.LinksTab',
  [
  ],
  function () {
    var linkStringer = function (href, name) {
      return '<li><a href="' + href + '" target="_blank">' + name + '</a></li>';
    };

    var makeTab = function () {
      return {
        title: 'Helpful Links',
        type: 'container',
        style: 'overflow-y: auto; overflow-x: hidden; max-height: 250px',
        items: [
          {
            type: 'container',
            html: '<div style="margin: 10px;" data-mce-tabstop="1" tabindex="-1">' +
                    '<p style="padding-bottom: 5px;">Find more info about TinyMCE and Ephox here:</p>' +
                    '<ul>' +
                      linkStringer('https://www.tinymce.com', 'TinyMCE.com') +
                      linkStringer('https://www.ephox.com', 'Ephox.com') +
                      linkStringer('https://www.github.com/tinymce/tinymce', 'Source code on GitHub') +
                    '</ul>' +
                  '</div>'
          }
        ]
      };
    };

    return {
      makeTab: makeTab
    };
  });
