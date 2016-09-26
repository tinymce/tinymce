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
    name: 'perhaps',
    repository: 'buildrepo2',
    source: 'perhaps.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  },

  {
    name: 'scullion',
    repository: 'buildrepo2',
    source: 'scullion.zip',
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
      { name: 'module/*.js', path: depend }
    ]
  },

  {
    name: 'wrap-json',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'wrap-json.zip',
    targets: [
      { name: 'compile/*.js', path: test }
    ]
  },

  {
    name: 'sugar',
    repository: 'buildrepo2',
    source: 'sugar.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  },

  {
    name: 'boss',
    repository: 'buildrepo2',
    source: 'boss.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  },

  {
    name: 'polaris',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'polaris.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  },

  /*** test dependencies */
  {
    name: 'agar',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'agar.zip',
    targets: [
      { name: 'module/*.js', path: test },
      { name: 'depend/*.js', path: test }
    ]
  }
];

