define(
  'tinymce.plugins.textpattern.test.Utils',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keys'
  ],
  function (GeneralSteps, Keys) {
    var sSetContentAndPressKey = function (key) {
      return function (tinyApis, tinyActions, content) {
        var padding = key === Keys.space() ? '\u00a0' : '';
        var extraOffset = padding === '' ? 0 : 1;
        return GeneralSteps.sequence([
          tinyApis.sSetContent('<p>' + content + padding + '</p>'),
          tinyApis.sFocus,
          tinyApis.sSetCursor(
            [0, 0],
            content.length + extraOffset
          ),
          tinyActions.sContentKeystroke(key, {})
        ]);
      };
    };


    return {
      sSetContentAndPressSpace: sSetContentAndPressKey(Keys.space()),
      sSetContentAndPressEnter: sSetContentAndPressKey(Keys.enter())
    };
  }
);