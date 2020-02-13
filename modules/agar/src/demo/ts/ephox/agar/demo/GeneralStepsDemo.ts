import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import * as DemoContainer from 'ephox/agar/demo/DemoContainer';
import { Element } from '@ephox/sugar';

export const demo = (): void => {
  DemoContainer.init(
    'General Steps Demo',
    (success, failure) => {
      const outcome = Element.fromTag('div');

      Pipeline.async({}, [
        Step.wait(1000),
        Step.fail('I am an error')
      ], success, failure);

      return [ outcome ];
    }
  );
};
