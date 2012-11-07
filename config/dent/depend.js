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
    name: 'phoenix',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'phoenix.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  },

  {
    name: 'compass',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'compass.zip',
    targets: [
      { name: 'module/*.js', path: depend }
    ]
  },

  {
    name: 'peanut',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'peanut.zip',
    targets: [
      { name: 'module/*.js', path: depend }
    ]
  },

  {
    name: 'violin',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'violin.zip',
    targets: [
      { name: 'module/*.js', path: test }
    ]
  },

  {
    name: 'wrap-json',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'wrap-json.zip',
    targets: [
      { name: 'module/*.js', path: test }
    ]
  },

  /**** demo dependencies ****/
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

