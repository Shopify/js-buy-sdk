# How to contribute
We ❤️ pull requests. If you'd like to fix a bug, contribute a feature or
just correct a typo, please feel free to do so, as long as you follow
our [Code of Conduct](https://github.com/Shopify/js-buy-sdk/blob/master/CODE_OF_CONDUCT.md).

If you're thinking of adding a big new feature, consider opening an
issue first to discuss it to ensure it aligns to the direction of the
project (and potentially save yourself some time!).

## Getting Started
To start working on the codebase, first fork the repo, then clone it:
```
git clone git@github.com:your-username/js-buy-sdk.git
```
*Note: replace "your-username" with your Github handle*

Install the project's dependencies:
```
npm install
```

To see documentation about npm scripts used in this project run:
```
npm run info
```

While developing the following command will run tests in browser at http://localhost:4200. It also watches the src/ and tests/ directory and rebuilds as needed:
```
npm start
```

If you'd simply like to manually run tests do:
```
npm run test
```

## Folder Structure

The following documents the folder structure for this project and what the purpose of each folder is:
```
 +-- docs/ ** API docs that live at http://shopify.github.io/js-buy-sdk
 +-- scripts/ ** Scripts used for development such as build and CI scripts
 | +-- ci/ ** Scripts used to setup/run CI
 +-- src/ ** Contains all JS used by the JS buy SDK
 | +-- adapters/
 | +-- metal/
 | +-- models/
 | +-- serializers/
 +-- tests/ ** Contains tests used to ensure the js-buy-sdk works as intended
   +-- fixtures/
   +-- helpers/
   +-- integration/
   +-- shims/
   +-- unit/
     +-- adapters/
     +-- api/
     +-- lint/
     +-- metal/
     +-- models/
     +-- serializers/
```

## Examples
See [here](https://github.com/Shopify/storefront-api-examples) for our examples.

## Documentation
Please do not update documentation, as this may cause
merge conflicts. After a pull request has been merged, the
maintainers will update documentation and release a new version.

The docs live inside the `docs/` folder and are hosted
at `http://shopify.github.io/js-buy-sdk`.

To generate docs run the following:
```
npm run doc:build
```

To preview the built docs run:
```
npm run doc:serve
```

The documentation will then be visible at:
`http://127.0.0.1:4000/js-buy-sdk/`

If ever you'd like to view API docs for a specific version of the `js-buy-sdk` run the following command (replace `*VERSION NUMBER*` with a proper version such as `v0.3.2`):
```
npm run doc:build -- --references *VERSION NUMBER*
```

When serving you should now be able to view:
`http://127.0.0.1:4000/js-buy-sdk/api/v0.3.2/`
