import { Assertions, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as Icons from '@ephox/oxide-icons-default';

UnitTest.asynctest('SVG Icon tests', function (success, failure) {

  const getAllTest = Step.sync(function () {
    const allIcons = Icons.getAll();
    Assertions.assertEq('Should return an object with (some amount of) keys', true, Object.keys(allIcons).length > 0);
  });

  Pipeline.async({}, [
    getAllTest,
  ], success, failure);
});