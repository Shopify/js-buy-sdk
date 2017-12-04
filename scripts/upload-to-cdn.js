#!/usr/bin/env node

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const VERSION = require('../package.json').version;

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';
const S3_DIR = 'js-buy-sdk';
const DEFAULT_CACHE_CONTROL = 'public, max-age=86400';
const FILENAME_FILTER = 'index';
const DIST_DIR = '.';


function s3PathForFile(folderPrefix, localPath) {
  return path.join(S3_DIR, folderPrefix, localPath);
}

function contentType(filename) {
  return mime.lookup(filename) || DEFAULT_CONTENT_TYPE;
}

function uploadFile(s3Instance, bucket, localPath, s3Path) {
  const s3Instructions = {
    Bucket: bucket,
    Key: s3Path,
    ContentType: contentType(localPath),
    CacheControl: DEFAULT_CACHE_CONTROL,
    Body: fs.readFileSync(localPath),
    ACL: 'public-read'
  };

  s3Instance.putObject(s3Instructions, (error) => {
    if (error) {
      console.error(error, error.stack);
    } else {
      console.log(`Successfully uploaded ${s3Path}.`);
    }
  });
}

class Secrets {
  constructor() {
    this.bucket = null;
  }

  load() {
    try {
      const config = JSON.parse(fs.readFileSync('secrets.json'));

      this.bucket = config.bucket;
      this.accessKeyId = config.access_key_id;
      this.secretAccessKey = config.secret_access_key;
    } catch (error) {
      console.error(error);
      console.error('Missing AWS secrets. You must decrypt the ejson first.');
      process.exit(1);
    }
  }
}
class Uploader {
  constructor() {
    this.secrets = new Secrets();

    this.secrets.load();

    AWS.config.credentials = new AWS.Credentials(this.secrets.accessKeyId, this.secrets.secretAccessKey);
    AWS.config.region = 'us-east-1';

    this.s3 = new AWS.S3();

    this.assets = fs.readdirSync(DIST_DIR).filter((filename) => {
      return filename.includes(FILENAME_FILTER);
    });
  }


  uploadAssets() {
    this.assets.forEach((file) => {
      const major = VERSION.split('.')[0];
      const filePath = path.join(DIST_DIR, file);

      uploadFile(this.s3, this.secrets.bucket, filePath, s3PathForFile(VERSION, file));
      uploadFile(this.s3, this.secrets.bucket, filePath, s3PathForFile(`/v${major}/latest`, file));
    });
  }

}

new Uploader().uploadAssets();
