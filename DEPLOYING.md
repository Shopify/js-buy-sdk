# Deploying JS Buy SDK

### 1. Make your desired changes


### 2. Then run

```
npx changeset add
```

### 3. Also add an equivalent message to `CHANGELOG.md` to reflect the changes you are making

### 4. Commit your changes (manually) using git. 

**Do NOT bump the version manually in `package.json`.**

### 5. Push your changes
```
git push
```

### 6. Create a PR and merge it into `main`

This will automatically:
- Bump the version in `package.json`
- Create the tag in GitHub for the new version
- Publish the new version to npm

### 7. Deploy via [Shipit](https://shipit.shopify.io/shopify/js-buy-sdk/upload)

Merging the PR will automatically publish the new version to npm, but the Shipit deploy is necessary to publish the new version to Shopify's CDN.

Press "Deploy" next to your changes once CI has passed, read and tick off the checkbox once you have read and verified the instructions, and create the deploy. Monitor it and verify it succeeds.


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
3. Merge your branch into main
