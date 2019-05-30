import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import DemoContainer from 'ephox/agar/demo/DemoContainer';
import { Element } from '@ephox/sugar';



export default <any> function () {
  DemoContainer.init(
    'General Steps Demo',
    function (success, failure) {
      var outcome = Element.fromTag('div');
    
      Pipeline.async({}, [
        Step.wait(1000),
        Step.fail('I am an error')
      ], success, failure);

      return [ outcome ];
    }
  );      
};