asynctest(
  'browser.tinymce.plugins.stripnbsp.StripnbspPluginTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.plugins.stripnbsp.Plugin',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, LegacyUnit, Plugin, TinyLoader, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();
    Theme();

    suite.test("Strip nbsp", function (editor) {
      var data = {
        '<p>A&nbsp;B</p>': '<p>A B</p>',
        '<p>A&nbsp;<span class="a">B</span></p>': '<p>A <span class="a">B</span></p>',
        '<p>A<span class="a">&nbsp;B</span></p>': '<p>A<span class="a"> B</span></p>',
        '<p>A<span class="a">B&nbsp;</span></p>': '<p>A<span class="a">B </span></p>',
        '<p>A<span class="a">B</span>&nbsp;</p>': '<p>A<span class="a">B</span> </p>'
      };

      Object.keys(data).forEach(function (before) {
        editor.setContent(before);

        LegacyUnit.equal(
          editor.getContent(),
          data[before]
        );
      });
    });

    suite.test("Keep nbsp", function (editor) {
      var data = [
        '<p>A&nbsp;&nbsp;B</p>',
        '<p>A &nbsp;B</p>',
        '<p>A&nbsp; B</p>',
        '<p>A</p>\n<p>&nbsp;</p>\n<p>B</p>',
        '<table>\n<tbody>\n<tr>\n<td>&nbsp;</td>\n</tr>\n</tbody>\n</table>'
      ];

      data.forEach(function (content) {
        editor.setContent(content);

        LegacyUnit.equal(
          editor.getContent(),
          content
        );
      });
    });

    suite.test("Force strip nbsp", function (editor) {
      editor.settings.stripnbsp_force = true;

      var data = {
        '<p>A&nbsp;&nbsp;B</p>': '<p>A  B</p>',
        '<p>A &nbsp;B</p>': '<p>A  B</p>',
        '<p>A&nbsp; B</p>': '<p>A  B</p>',
        '<p>A</p>\n<p>&nbsp;</p>\n<p>B</p>': '<p>A</p>\n<p> </p>\n<p>B</p>',
        '<table>\n<tbody>\n<tr>\n<td>&nbsp;</td>\n</tr>\n</tbody>\n</table>': '<table>\n<tbody>\n<tr>\n<td> </td>\n</tr>\n</tbody>\n</table>'
      };

      Object.keys(data).forEach(function (before) {
        editor.setContent(before);

        LegacyUnit.equal(
          editor.getContent(),
          data[before]
        );
      });
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
    }, {
      plugins: 'stripnbsp',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
