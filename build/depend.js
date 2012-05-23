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
      { name: 'module/*.js', path: depend }
    ]
  };
};
var dependencies = [
  {
    name: "bolt",
    repository: "buildrepo2",
    version : "latest",
    source: "bolt.zip",
    targets: [
      { name: "jsc", path: lib + "/bolt" },
      { name: "bolt", path: lib + "/bolt" },
      { name: "*.js", path: lib + "/bolt" }
    ],
    executables: [
      lib + "/bolt/jsc",
      lib + "/bolt/bolt"
    ]
  },

  {
    name: "wrap-jquery",
    repository: "buildrepo2",
    version: "latest",
    source: "wrap-jquery.zip",
    targets: [
      { name: "compile/ephox.wrap.JQuery.js", path: lib + "/demo" }
    ]
  },

  {
    name: "wrap-underscore",
    repository: "buildrepo2",
    version: "latest",
    source: "wrap-underscore.zip",
    targets: [
      { name: "compile/ephox.wrap.Underscore.js", path: lib + "/run/depend" },
      { name: "licenses/underscore/license.txt", path: "lib/run/licenses/underscore"}
    ]
  },

  {
    name: "scullion",
    repository: "buildrepo2",
    source: "scullion.zip",
    targets: [
      {name: "module/*.js", path: lib + "/demo"},
      {name: "module/*.js", path: lib + "/test"},
      {name: "depend/*.js", path: lib + "/demo"},
      {name: "depend/*.js", path: lib + "/test"}
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

  { name: "jssert",
    repository: "buildrepo2",
    source: "jssert.zip",
    targets: [
      {name: "jssert.js", path: "lib/test"}
    ]
  },

  q('flute'),
  q('nuggets')
];
