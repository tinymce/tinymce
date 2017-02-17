test(
  'UiSubstitutesTest',

  [
    'ephox.agar.api.Logger',
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.katamari.api.Option'
  ],

  function (Logger, RawAssertions, UiSubstitutes, Option) {
    Logger.sync(
      'Testing empty components',
      function () {
        var actual = UiSubstitutes.substitutePlaces(Option.some('detail'), [ ], { }, { });
        RawAssertions.assertEq('Components should stay empty', [ ], actual);
      }
    );

    Logger.sync(
      'Testing everything normal',
      function () {
        var actual = UiSubstitutes.substitutePlaces(Option.some('owner'), 'detail', [
          { uiType: 'normal' }
        ], { });
        RawAssertions.assertEq('Normal should be returned as is', [
          { uiType: 'normal', components: [ ] }
        ], actual); 
      }
    );

    Logger.sync(
      'Testing one level with a dependent',
      function () {
        var actual = UiSubstitutes.substitutePlaces(Option.some('owner'), 'detail', [
          { uiType: 'normal' },
          { uiType: 'placeholder', name: 'foo', owner: 'owner' }
        ], {
          foo: UiSubstitutes.single(true, function (detail) {
            return {
              uiType: 'foo-dependent',
              detail: detail
            };
          })
        });
        RawAssertions.assertEq('Dependent should be substituted', [
          { uiType: 'normal', components: [ ] },
          { uiType: 'foo-dependent', detail: 'detail', components: [ ] }
        ], actual);
      }
    );

    // Do a property based test once it has worked that everything returns a uiType
    // Jsc.property(
    //   'E')
    // assert.eq(1, 2);
  }
);