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
    name: 'flour',
    repository: 'buildrepo2',
    source: 'flour.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
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
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
    ]
  },

  {
    name: 'porkbun',
    repository: 'buildrepo2',
    version: 'latest',
    source: 'porkbun.zip',
    targets: [
      { name: 'module/*.js', path: depend },
      { name: 'depend/*.js', path: depend }
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

