import { UnitTest } from '@ephox/bedrock';
import { Fun } from '@ephox/katamari';
import { IconProvider, getDefault, getDefaultOr, get, getOr } from '../../../../main/ts/ui/icons/Icons';
import { Assertions, Pipeline, Step } from '@ephox/agar';
import { getAll as getAllOxide } from '@ephox/oxide-icons-default';

UnitTest.asynctest('SVG Icon tests', function (success, failure) {
  const iconIndent = getAllOxide()['icon-indent'];
  const fallBackSVG = `<svg data-mce-name='test-svg'>`;
  const iconProvider: IconProvider = () => ({ 'icon-indent': `<svg data-mce-name='icon-indent'>` });
  const emptyIconProvider: IconProvider = () => ({ });

  const getDefaultTest = Step.sync(function () {
    const iconIndentResult = getDefault('icon-indent');
    Assertions.assertEq('When an icon exists as a default icon it should return the correct SVG data', iconIndentResult, iconIndent);
  });

  const getDefaultOrTest = Step.sync(function () {
    const result = getDefaultOr('nadda', Fun.constant(fallBackSVG));
    Assertions.assertEq('When an icon does not exist it should return the fallback', result, fallBackSVG);

    const iconIndentResult = getDefaultOr('icon-indent', Fun.constant(fallBackSVG));
    Assertions.assertEq('When an icon exists it should return the correct SVG element', iconIndentResult, iconIndent);
  });

  const getTest = Step.sync(function () {
    const providedIconIndent = get('icon-indent', iconProvider);
    Assertions.assertEq('When an icon exist both as a default and as a provided icon it should return the provided icon', providedIconIndent, `<svg data-mce-name='icon-indent'>`);

    const defaultIconIndent = get('icon-indent', emptyIconProvider);
    Assertions.assertEq('When an icon only exist as a default icon it should return the default icon', defaultIconIndent, iconIndent);
  });

  const getOrTest = Step.sync(function () {
    const result = getOr('nadda', iconProvider, Fun.constant(fallBackSVG));
    Assertions.assertEq('When an icon does not exist it should return the fallback', result, fallBackSVG);

    const providedIconIndent = get('icon-indent', iconProvider);
    Assertions.assertEq('When an icon exist both as a default and as a provided icon it should return the provided icon', providedIconIndent, `<svg data-mce-name='icon-indent'>`);

    const defaultIconIndent = get('icon-indent', emptyIconProvider);
    Assertions.assertEq('When an icon only exist as a default icon it should return the default icon', defaultIconIndent, iconIndent);
  });

  Pipeline.async({}, [
    getDefaultTest,
    getDefaultOrTest,
    getTest,
    getOrTest
  ], function () {
    success();
  }, failure);
});