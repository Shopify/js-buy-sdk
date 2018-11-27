# Deploying JS Buy SDK

1. Merge your branch into master
2. Run `npm version [patch|minor|major]` which will do the following:
  * write new version to package.json
  * create a commit with a commit message matching the version number
  * create a new tag matching the version number
3. Push the new commit and tags to master with `git push && git push --tags`
4. Deploy built scripts to s3 via [shipit](https://shipit.shopify.io/shopify/js-buy-sdk/production)

# Updating Documentation

If your change affects how people use the project (i.e. adding or
changing arguments to a function, adding a new function, changing the
return value, etc), please ensure the documentation is also updated to
reflect this. The docs live inside the `docs/` folder and are hosted
at `http://shopify.github.io/js-buy-sdk`.

Please update the docs in a separate PR from the code change. When the two are
updated together, the diff will be huge and it will be difficult to review.

1. Generate documentation using `npm run doc:build` or `yarn doc:build`
2. Update the [Changelog](https://github.com/Shopify/js-buy-sdk/CHANGELOG.md) with details about the release.
3. Merge your branch into master
