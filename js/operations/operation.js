class Operation {
  /** @type {import('../operation-history.js').default} */
  operationHistory;
  /** @type {import('../cartesian-graph.js').default} */
  cartesianGraph;

  static statusMessage = '[LMB] to draw';

  /**
   * Creates an instance of Operation.
   *
   * @param {import('../operation-history.js').default} operationHistory
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof Operation
   */
  constructor(operationHistory, cartesianGraph) {
    this.operationHistory = operationHistory;
    this.cartesianGraph = cartesianGraph;
  }

  mousedown() {}

  mousemove() {}

  mouseup() {}

  keydown() {}

  keyup() {}

  render() {}
}

export default Operation;
