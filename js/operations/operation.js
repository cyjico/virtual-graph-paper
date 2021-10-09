class Operation {
  static statusMessage = '[LMB] to draw';

  /**
   * Creates an instance of Operation.
   *
   * @param {import('../operation-manager.js').default} operationManager
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof Operation
   */
  constructor(operationManager, cartesianGraph) {
    /** @type {import('../operation-manager.js').default} */
    this.operationManager = operationManager;
    /** @type {import('../cartesian-graph.js').default} */
    this.cartesianGraph = cartesianGraph;

    this.bounds = {
      min: {
        x: Number.POSITIVE_INFINITY,
        y: Number.POSITIVE_INFINITY,
      },
      max: {
        x: Number.NEGATIVE_INFINITY,
        y: Number.NEGATIVE_INFINITY,
      },
    };
  }

  onMousedown() {}

  onMousemove() {}

  onMouseup() {}

  onKeydown() {}

  onKeyup() {}

  /**
   * Fired every time the camera moves or mouse moves; although, you can call it manually.
   *
   * @memberof Operation
   */
  render() {}
}

export default Operation;
