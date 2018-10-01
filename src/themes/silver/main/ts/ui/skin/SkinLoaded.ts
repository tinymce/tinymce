import Events from '../../api/Events';

const fireSkinLoaded = function (editor) {
  const done = function () {
    editor._skinLoaded = true;
    Events.fireSkinLoaded(editor);
  };

  return function () {
    if (editor.initialized) {
      done();
    } else {
      editor.on('init', done);
    }
  };
};

export default {
  fireSkinLoaded
};