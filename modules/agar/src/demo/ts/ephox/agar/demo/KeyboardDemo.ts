import DemoContainer from 'ephox/agar/demo/DemoContainer';
import { Element } from '@ephox/sugar';

export default <any> function () {
  DemoContainer.init(
    'Keyboard testing',
    function (success, failure) {

      const container = Element.fromTag('div');

      failure('Not implemented.');

      return [ ];
    }
  );
};
