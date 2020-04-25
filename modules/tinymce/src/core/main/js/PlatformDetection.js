var envGlobal = tinymce.util.Tools.resolve('tinymce.Env');
export var detect = function () { return envGlobal; };
// Note: Don't implement override, as it shouldn't be used in production
// so excluding it here will prevent that
