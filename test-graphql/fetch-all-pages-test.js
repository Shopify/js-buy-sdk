import assert from 'assert';
import fetchAllPages from '../src-graphql/fetch-all-pages';

suite('fetch-all-pages-test', () => {
  const client = {
    count: 0,
    fetchNextPage() {
      ++this.count;

      return new Promise((resolve) => {
        const model = {
          model: [
            {
              hasNextPage: !(this.count === 2)
            }
          ]
        };

        resolve(model);
      });
    }
  };

  test('it fetches until hasNextPage is false', () => {
    const models = [{hasNextPage: true}];

    return fetchAllPages(models, client).then(() => {
      assert.equal(models.length, 3);
      assert.equal(models[2].hasNextPage, false, 'last model has no more pages');
      assert.ok(models.slice(0, 2).every((model) => {
        return model.hasNextPage;
      }), 'models before the last model have next pages');
    });
  });
});
