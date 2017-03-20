export default function fetchAllPages(paginatedModels, client) {
  return client.fetchNextPage(paginatedModels).then(({model}) => {
    paginatedModels.push(...model);

    if (!model[model.length - 1].hasNextPage) {
      return paginatedModels;
    }

    return fetchAllPages(paginatedModels, client);
  });
}
