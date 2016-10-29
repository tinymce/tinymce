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
    name: 'dragster',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'dragster.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  },

  {
    name: 'boulder',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'boulder.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  },

  {
    name: 'repartee',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'repartee.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  },

  {
    name: 'oath',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'oath.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  },

  {
    name: 'fussy',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'fussy.zip',
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
    name: 'polaris',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'polaris.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
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
  },

  {
    name: 'wrap-jsbeautify',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'wrap-jsbeautify.zip',
    targets: [
      { name: 'compile/*.js', path: demo }
    ]
  },

  {
    name: 'modulator-text',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'modulator-text.zip',
    targets: [
      { name: 'module/*.js', path: depend }
    ]
  }
];

