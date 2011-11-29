var lib = 'lib';
var cleanDirs = [ lib ];

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
    name: "flute",
    repository: "buildrepo2",
    version: "latest",
    source: "flute.zip",
    targets: [
      { name: "module/*.js", path: lib + "/run/depend" }
    ]
  },

  {
    name: "wrap-underscore",
    repository: "buildrepo2",
    version: "1.0.0/1.0.0.1",
    source: "wrap-underscore.zip",
    targets: [
      { name: "compile/ephox.wrap._.js", path: lib + "/run/depend" },
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
  }
];
