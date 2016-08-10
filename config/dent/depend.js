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
    name: 'peanut',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'peanut.zip',
    targets: [
      { name: 'module/*.js', path: depend }
    ]
  },

  {
    name: 'perhaps',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'perhaps.zip',
    targets: [
      { name: 'module/*.js', path: depend }
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
    name: 'scullion',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'scullion.zip',
    targets: [
      { name: 'module/*.js', path: depend }
    ]
  },

  {
    name: 'classify',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'classify.zip',
    targets: [
      { name: 'module/*.js', path: depend }
    ]
  },

  {
    name: 'numerosity',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'numerosity.zip',
    targets: [
      { name: 'module/*.js', path: depend }
    ]
  },

  {
    name: 'epithet',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'epithet.zip',
    targets: [
      { name: 'module/*.js', path: depend }
    ]
  },

  {
    name: 'highway',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'highway.zip',
    targets: [
      { name: 'module/*.js', path: depend }
    ]
  },

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

