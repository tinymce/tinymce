import DemoContainer from 'ephox/agar/demo/DemoContainer';

export default <any> function () {
  DemoContainer.init(
    'Mouse testing',
    function (success, failure) {
      failure('Not implemented.');

      return [ ];
    }
  );
};
