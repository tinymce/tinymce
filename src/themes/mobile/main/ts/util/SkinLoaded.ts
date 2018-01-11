const fireSkinLoaded = function (editor) {
  const done = function () {
    editor._skinLoaded = true;
    editor.fire('SkinLoaded');
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