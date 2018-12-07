import { UnitTest } from '@ephox/bedrock';
import { IconProvider, getDefault, get } from '../../../../main/ts/ui/icons/Icons';
import { Assertions, Pipeline, Step } from '@ephox/agar';
import { getAll as getAllOxide } from '@ephox/oxide-icons-default';

UnitTest.asynctest('SVG Icon tests', function (success, failure) {
  const iconIndent = getAllOxide().indent;
  const iconProvider: IconProvider = () => ({ indent: `<svg data-mce-name='indent'></svg>` });
  const emptyIconProvider: IconProvider = () => ({ });

  const getDefaultTest = Step.sync(function () {
    const iconIndentResult = getDefault('indent');
    Assertions.assertEq('When an icon exists as a default icon it should return the correct SVG data', iconIndentResult, iconIndent);
  });

  const getTest = Step.sync(function () {
    const providedIconIndent = get('indent', iconProvider);
    Assertions.assertEq('When an icon exist both as a default and as a provided icon it should return the provided icon', providedIconIndent, iconProvider().indent);

    const defaultIconIndent = get('indent', emptyIconProvider);
    Assertions.assertEq('When an icon only exist as a default icon it should return the default icon', defaultIconIndent, iconIndent);
  });

  Pipeline.async({}, [
    getDefaultTest,
    getTest,
  ], function () {
    success();
  }, failure);
});