import { SugarElement } from '@ephox/sugar';

import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import * as DemoContainer from 'ephox/agar/demo/DemoContainer';

export const demo = (): void => {
  DemoContainer.init(
    'General Steps Demo',
    (success, failure) => {
      const outcome = SugarElement.fromTag('div');

      Pipeline.async({}, [
        Step.wait(1000),
        Step.fail('I am an error')
      ], success, failure);

      return [ outcome ];
    }
  );
};
