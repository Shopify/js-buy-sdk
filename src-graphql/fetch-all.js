export default function fetchAll(type, list, lastResult, client) {
  if (!lastResult.data.node[type].pageInfo.hasNextPage) {
    return list;
  }

  return client.send(lastResult.model.node[type].nextPageQuery()).then((response) => {
    list.push(...response.model.node[type]);

    return fetchAll(type, list, response, client);
  });
}
