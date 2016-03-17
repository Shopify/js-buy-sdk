#!/usr/bin/env node

var AWS = require('aws-sdk');
var fs = require('fs');
var path = require('path');
var mime = require('mime-types');
var exec = require('child_process').exec;
var DEFAULT_CONTENT_TYPE = 'application/octet-stream';
var DEFAULT_CACHE_CONTROL = "public, max-age=86400";
var FILENAME_FILTER = 'shopify-buy';
var DIST_DIR = 'dist';

var Secrets = function() {
  this.bucket = null;
};

Secrets.prototype.load = function () {
  var config = fs.readFileSync('config/secrets.json');
  if (config) {
    config = JSON.parse(config);
    this.bucket = config.bucket;
    AWS.config.credentials = new AWS.Credentials(config.access_key_id, config.secret_access_key);
    AWS.config.region = 'us-east-1';
  } else {
    console.log('Missing AWS secrets. You must decrypt the ejson first.')
  }
};

var Uploader = function () {
  this.secrets = new Secrets();
  this.secrets.load();
  this.s3 = new AWS.S3();
  this.distAssets = fs.readdirSync(DIST_DIR);
};

Uploader.prototype.uploadFile = function(localPath, s3Path) {
  this.s3.putObject({
    Bucket: this.secrets.bucket,
    Key: s3Path,
    ContentType: this.contentType(localPath),
    CacheControl: DEFAULT_CACHE_CONTROL,
    Body: fs.readFileSync(localPath),
    ACL: 'public-read'
  }, function (err, data) {
    if (err) {
      console.log(err, err.stack);
    }
    else {
      console.log('successfully uploaded ' + s3Path);
    }
  });
};

Uploader.prototype.uploadDistAssets = function () {
  this.getCurrentTag(function (tag) {
    this.distAssets.forEach(function (file) {
      if (file.indexOf(FILENAME_FILTER) > -1) {
        this.uploadFile(path.join(DIST_DIR, file), this.s3PathForFile(file, tag));
      }
    }.bind(this));
  }.bind(this));
};

Uploader.prototype.getCurrentTag = function (cb) {
  exec('git describe --always --tag --abbrev=0', (err, stdout) => {
    if (err) {
      console.error(err);
      cb();
    }
    cb(stdout);
  });
};

Uploader.prototype.s3PathForFile = function (localPath, tag) {
  return tag + '/' + localPath;
};

Uploader.prototype.contentType = function(path) {
  return mime.lookup(path) || DEFAULT_CONTENT_TYPE;
};

new Uploader().uploadDistAssets();
