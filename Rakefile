require 'mime/types'
require 'aws-sdk'
require 'json'

module Secrets
  extend self

  def load
    return if @loaded
    @loaded = true

    config_path = File.expand_path('config/secrets.json')
    unless File.exist?(config_path)
      STDERR.puts "Missing AWS secrets. You must decrypt the ejson first."
      exit 1
    end

    config = JSON.load(File.read(config_path))
    @bucket = config['bucket']
    Aws.config.update({
      region: 'us-east-1',
      credentials: Aws::Credentials.new(config['access_key_id'], config['secret_access_key'])
    })
  end

  def bucket
    load unless @bucket
    @bucket
  end
end

module Uploader
  DEFAULT_CONTENT_TYPE = 'application/octet-stream'
  DEFAULT_CACHE_CONTROL = "public, max-age=31557600" # 1 year

  extend self

  def upload_file(local_path, s3_path)
    s3.put_object(
      bucket: Secrets.bucket,
      key: s3_path,
      content_type: content_type(local_path),
      cache_control: DEFAULT_CACHE_CONTROL,
      body: File.open(local_path),
      acl: 'public-read',
    )
  end

  def content_type(path)
    if mime = MIME::Types.of(path.downcase).first
      mime.content_type
    else
      DEFAULT_CONTENT_TYPE
    end
  end

  def s3
    @s3 ||= begin
      Secrets.load
      Aws::S3::Client.new(region: 'us-east-1')
    end
  end
end


task :upload do
  Uploader.upload_file('./test.js', 'test/foo.js')
end
