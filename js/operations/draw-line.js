import Operation from './operation.js';

class DrawLine extends Operation {
  /**
   * Creates an instance of ArrowOperation.
   *
   * @param {import('../operation-manager.js').default} operationManager
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof ArrowOperation
   */
  constructor(operationManager, cartesianGraph) {
    super(operationManager, cartesianGraph);

    this.start = {
      x: 0,
      y: 0,
    };
    this.end = {
      x: 0,
      y: 0,
    };
  }

  mousedown() {
    super.mousedown.call(this);
    this.start.x = this.operationManager.relativeCursorPosition.x;
    this.start.y = this.operationManager.relativeCursorPosition.y;
  }

  mousemove() {
    super.mousemove.call(this);
  }

  mouseup() {
    super.mouseup.call(this);
    this.end.x = this.operationManager.relativeCursorPosition.x;
    this.end.y = this.operationManager.relativeCursorPosition.y;
  }

  render() {
    super.render.call(this);
    const context = this.operationManager.context;
    context.beginPath();
    context.moveTo(
      this.cartesianGraph.scaleUpX(this.start.x),
      this.cartesianGraph.scaleUpY(this.start.y, false)
    );
    context.lineTo(
      this.cartesianGraph.scaleUpX(this.end.x),
      this.cartesianGraph.scaleUpY(this.end.y, false)
    );
    context.stroke();
  }
}

export default DrawLine;
