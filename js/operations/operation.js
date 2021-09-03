class Operation {
  /** @type {import('../operation-history.js').default} */
  operationManager;
  /** @type {import('../cartesian-graph.js').default} */
  cartesianGraph;

  static statusMessage = '[LMB] to draw';

  /**
   * Creates an instance of Operation.
   *
   * @param {import('../operation-history.js').default} operationManager
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof Operation
   */
  constructor(operationManager, cartesianGraph) {
    this.operationManager = operationManager;
    this.cartesianGraph = cartesianGraph;
  }

  mousedown() {}

  mousemove() {}

  mouseup() {}

  keydown() {}

  render() {}
}

export default Operation;
