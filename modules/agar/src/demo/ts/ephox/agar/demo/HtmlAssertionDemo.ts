import * as Assertions from 'ephox/agar/api/Assertions';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import DemoContainer from 'ephox/agar/demo/DemoContainer';



export default <any> function () {
  DemoContainer.init(
    'HTML Assertions',
    function (success, failure) {

      Pipeline.async({}, [
        Assertions.sAssertHtml('Testing HTML', '<p>This sentence is slightly wrong</p>', '<p>This sentence is sightly wrng</p>')

      ], success, function (err) {
        failure(err);
      });

      return [ ];
    }
  );
};