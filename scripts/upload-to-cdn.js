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
const DIST_DIR = './build';

/**
 * Generates the S3 path for a given file.
 * 
 * @param {string} folderPrefix - The prefix to be added to the S3 path.
 * @param {string} localPath - The local path of the file.
 * @returns {string} - The complete S3 path for the file.
 */
function s3PathForFile(folderPrefix, localPath) {
  return path.join(S3_DIR, folderPrefix, localPath);
}

/**
 * Determines the content type of a file based on its filename.
 * 
 * @param {string} filename - The name of the file.
 * @returns {string} - The MIME type of the file or the default content type if not found.
 */
function contentType(filename) {
  return mime.lookup(filename) || DEFAULT_CONTENT_TYPE;
}

/**
 * Uploads a file to an S3 bucket.
 * 
 * @param {Object} s3Instance - The S3 instance to use for uploading.
 * @param {string} bucket - The name of the S3 bucket.
 * @param {string} localPath - The local file path of the file to upload.
 * @param {string} s3Path - The S3 path where the file will be uploaded.
 */
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

/**
 * Class representing the secrets required for AWS S3 operations.
 */
class Secrets {
  /**
   * Creates an instance of Secrets.
   */
  constructor() {
    this.bucket = null;
  }

  /**
   * Loads the secrets from the 'secrets.json' file.
   * If the file is missing or cannot be parsed, logs an error and exits the process.
   */
  load() {

    let secretsJsonPath
    try {
      if (!fs.existsSync('secrets.json')) {
        secretsJsonPath = fs.readFileSync(path.join('..', 'secrets.json'))
      } else {
        secretsJsonPath = fs.readFileSync('secrets.json')
      }

      const config = JSON.parse(secretsJsonPath);
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

/**
 * Class representing an uploader for assets to AWS S3.
 */
class Uploader {
  /**
   * Creates an instance of Uploader.
   * Initializes AWS credentials, S3 instance, and filters the assets to be uploaded.
   */
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

  /**
   * Uploads the filtered assets to the S3 bucket.
   * Uploads each asset to both the versioned path and the latest path.
   */
  uploadAssets() {
    this.assets.forEach((file) => {
      const major = VERSION.split('.')[0];
      const filePath = path.join(DIST_DIR, file);

      const outputVersion = s3PathForFile(VERSION, file)
      const outputLatest = s3PathForFile(`/v${major}/latest`, file)
      const s3 = this.s3;
      const bucket = this.secrets.bucket;

      console.log({ s3, bucket, major, filePath, outputVersion, outputLatest })

      // uploadFile(this.s3, this.secrets.bucket, filePath, s3PathForFile(VERSION, file));
      // uploadFile(this.s3, this.secrets.bucket, filePath, s3PathForFile(`/v${major}/latest`, file));
    });
  }
}

new Uploader().uploadAssets();
