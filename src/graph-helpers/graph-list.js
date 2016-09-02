export default class GraphList extends Array {
  constructor(elements, pageInfo = { hasNextPage: false, hasPreviousPage: false }) {
    super(...elements);

    this.hasNextPage = pageInfo.hasNextPage;
    this.hasPreviousPage = pageInfo.hasPreviousPage;
  }
}
