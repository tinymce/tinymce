var lib = 'lib';
var run = lib + '/run';
var depend = run + '/depend';
var licenses = run + '/licenses';
var demo = lib + '/demo';
var test = lib + '/test';
var config = lib + '/config';

var cleanDirs = [ lib ];

var q = function(x) {
  return {
    name: x,
    repository: 'buildrepo2',
    version: 'latest',
    source: x + '.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  };
};
var dependencies = [
  {
    name: "wrap-jquery",
    repository: "buildrepo2",
    version: '1.4.2/1.4.2.0',
    source: "wrap-jquery.zip",
    targets: [
      { name: "compile/ephox.wrap.JQuery.js", path: lib + "/demo" }
    ]
  },

  {
    name: 'compass',
    repository: 'buildrepo2',
    source: 'compass.zip',
    targets: [
      { name: 'module/*.js', path: depend }
    ]
  },

  {
    name: "scullion",
    repository: "buildrepo2",
    source: "scullion.zip",
    targets: [
      {name: "module/*.js", path: lib + "/demo"},
      {name: "module/*.js", path: lib + "/test"},
      {name: "module/*.js", path: depend},
      {name: "depend/*.js", path: lib + "/demo"},
      {name: "depend/*.js", path: lib + "/test"},
      {name: "depend/*.js", path: depend}
    ]
  },

  {
    name: "json2",
    repository : "thirdpartyrepo",
    source: "json2.zip",
    targets : [
      { name: "json2.js", path: "lib/test"}
    ]
  },

  q('flute'),

  {
    name: 'exhibition',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'exhibition.zip',
    targets: [
      { name: 'module/*.js', path: demo },
      { name: 'depend/*.js', path: demo },
      { name: 'exhibition.js', path: config }
    ]
  }
];
