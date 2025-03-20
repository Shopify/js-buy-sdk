# Deploying JS Buy SDK

1. Create a changeset in your branch by running `npx changeset add`
1. Merge your branch into main to trigger a Github action that will publish to npm using changeset. Do not update package.json version manually.
1. Deploy built scripts to the CDN via the upload [shipit](https://shipit.shopify.io/shopify/js-buy-sdk/upload) workflow

# Updating Documentation

If your change affects how people use the project (i.e. adding or
changing arguments to a function, adding a new function, changing the
return value, etc), please ensure the documentation is also updated to
reflect this. The docs live inside the `docs/` folder and are hosted
at `http://shopify.github.io/js-buy-sdk`.

Please update the docs in a separate PR from the code change. When the two are
updated together, the diff will be huge and it will be difficult to review.

1. Generate documentation using `npm run doc:build`

2. Update the [Changelog](https://github.com/Shopify/js-buy-sdk/CHANGELOG.md) with details about the release.
3. Merge your branch into main
