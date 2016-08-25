var lib = 'lib';
var run = lib + '/run';
var depend = run + '/depend';
var licenses = run + '/licenses';
var demo = lib + '/demo';
var test = lib + '/test';
var config = lib + '/config';

var cleanDirs = [ lib ];

var dependencies = [
  {
    name: 'sugar',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'sugar.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  },

  {
    name: 'katamari',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'katamari.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  },

  // Test dependencies
  {
    name: 'agar',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'agar.zip',
    targets: [
      { name: 'module/*.js', path: test },
      { name: 'depend/*.js', path: test }
    ]
  },
  
  {
    name: 'numerosity',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'numerosity.zip',
    targets: [
      { name: 'module/*.js', path: test }
    ]
  },

  {
    name: 'wrap-jquery',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'wrap-jquery.zip',
    targets: [
      { name: 'compile/*.js', path: test }
    ]
  }
];

