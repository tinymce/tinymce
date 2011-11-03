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

  {
    name: "wrap-d",
    repository: "buildrepo2",
    version: "latest",
    source: "wrap-d.zip",
    targets: [
      { name: "compile/ephox.wrap.D.js", path: lib + "/compile" }
    ]
  },

  // Only used by demo.html
  {
    name: "wrap-jquery",
    repository: "buildrepo2",
    version: "latest",
    source: "wrap-jquery.zip",
    targets: [
      { name: "compile/ephox.wrap.JQuery.js", path: lib + "/compile" }
    ]
  }
];
