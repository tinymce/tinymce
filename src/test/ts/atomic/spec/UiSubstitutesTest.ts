import { Logger } from '@ephox/agar';
import { RawAssertions } from '@ephox/agar';
import UiSubstitutes from 'ephox/alloy/spec/UiSubstitutes';
import { Option } from '@ephox/katamari';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('UiSubstitutesTest', function() {
  Logger.sync(
    'Testing empty components',
    function () {
      var actual = UiSubstitutes.substitutePlaces(Option.some('detail'), { }, [ ], { });
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
});

