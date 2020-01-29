import * as DemoContainer from 'ephox/agar/demo/DemoContainer';
import { Element } from '@ephox/sugar';

export const demo = (): void => {
  DemoContainer.init(
    'Keyboard testing',
    (success, failure) => {

      const container = Element.fromTag('div');

      failure('Not implemented.');

      return [ ];
    }
  );
};
