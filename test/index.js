'use strict';
var Promise = require('bluebird');
var path = require('path');
var fs = require('fs-extra');
var spawnCommand = require('yeoman-generator/lib/actions/spawn_command').spawnCommand;
var helpers = require('yeoman-test');

function install(answers, done, generateApis) {
  return helpers.run(path.join(__dirname, '../generators/app'))
    .withPrompts(answers)
    .toPromise()
    .then(function (dir) {
      var promise = Promise.resolve(dir);

      if (generateApis) {
        console.log('Generating APIs...');
        promise = defaultApi(dir).then(function (dir) {
          return apiWithDifferentEndpointName(dir);
        }).then(function (dir) {
          return apiWithNoMethods(dir);
        }).then(function (dir) {
          return apiWithAllMasterMethods(dir);
        }).then(function (dir) {
          return apiWithAllAdminMethods(dir);
        }).then(function (dir) {
          return apiWithAllUserMethods(dir);
        }).then(function (dir) {
          return apiWithoutModel(dir);
        }).then(function (dir) {
          return apiWithModelFields(dir);
        });
      }

      promise.then(function (dir) {
        console.log('Copying node_modules folder...');
        fs.copySync(path.join(__dirname, '../node_modules'), path.join(dir, 'node_modules'));
        spawnCommand('npm', ['run', 'lint']).on('exit', function (err) {
          if (err) {
            return done(err);
          }
          spawnCommand('npm', ['test']).on('exit', done);
        });
      }).catch(done);
    });
}

function defaultApi(dir) {
  return api({
    kebab: 'default-api'
  }, dir);
}

function apiWithDifferentEndpointName(dir) {
  return api({
    kebab: 'different-endpoint',
    kebabs: 'tests'
  }, dir);
}

function apiWithNoMethods(dir) {
  return api({
    kebab: 'no-method',
    methods: []
  }, dir);
}

function apiWithAllMasterMethods(dir) {
  return api({
    kebab: 'all-master',
    masterMethods: ['POST', 'GET LIST', 'GET ONE', 'PUT', 'DELETE']
  }, dir);
}

function apiWithAllAdminMethods(dir) {
  return api({
    kebab: 'all-admin',
    adminMethods: ['POST', 'GET LIST', 'GET ONE', 'PUT', 'DELETE']
  }, dir);
}

function apiWithAllUserMethods(dir) {
  return api({
    kebab: 'all-user',
    userMethods: ['POST', 'GET LIST', 'GET ONE', 'PUT', 'DELETE']
  }, dir);
}

function apiWithoutModel(dir) {
  return api({
    kebab: 'no-model',
    generateModel: false
  }, dir);
}

function apiWithModelFields(dir) {
  return api({
    kebab: 'field',
    modelFields: ['title', 'content']
  }, dir);
}

function api(answers, dir) {
  return helpers.run(path.join(__dirname, '../generators/api'))
    .inTmpDir(function (tmpDir) {
      fs.copySync(dir, tmpDir);
    })
    .withPrompts(answers)
    .toPromise();
}

describe('generator-rest', function () {
  describe('full install', function () {
    before(function (done) {
      install({
        https: true,
        passwordReset: true,
        sendgridKey: 'sendgridKey'
      }, done, true);
    });
    it('should install and pass tests', function () {});
  });

  describe('default install', function () {
    before(function (done) {
      install({}, done, true);
    });
    it('should install and pass tests', function () {});
  });

  describe('install with different src and api directories', function () {
    before(function (done) {
      install({srcDir: 'server', apiDir: 'endpoints'}, done, true);
    });
    it('should install and pass tests', function () {});
  });

  describe('install without facebook auth', function () {
    before(function (done) {
      install({authMethods: ['email']}, done);
    });
    it('should install and pass tests', function () {});
  });

  describe('install without email auth', function () {
    before(function (done) {
      install({authMethods: ['facebook']}, done);
    });
    it('should install and pass tests', function () {});
  });

  describe('install without auth API', function () {
    before(function (done) {
      install({generateAuthApi: false}, done, true);
    });
    it('should install and pass tests', function () {});
  });
});