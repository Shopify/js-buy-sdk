# Deploying JS Buy SDK

1. Merge your branch into master
2. Run `npm version [patch|minor|major]` which will do the following:
  * write new version to package.json
  * create a commit with a commit message matching the version number
  * create a new tag matching the version number
3. Push the new commit and tags to master with `git push origin master --tags`
4. Run `npm update` to update the package on npm
5. Create a release on Github. Include changelog in description
6. Deploy built scripts to s3 via [shipit](https://shipit.shopify.io/shopify/js-buy-sdk/production)
