import Operation from './operation.js';

class DrawArc extends Operation {
  /**
   * Creates an instance of DrawArc.
   *
   * @param {import('../operation-history.js').default} operationManager
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof DrawArc
   */
  constructor(operationManager, cartesianGraph) {
    super(operationManager, cartesianGraph);

    this.center = {
      x: 0,
      y: 0,
    };
    this.radius = 0;
    this.endRad = 0;

    this.strokeWidth = 0;
  }

  mousedown({ input, env }) {
    this.strokeWidth = env.getStrokeWidth();
    this.center.x = input.relativeCursorPosition.x;
    this.center.y = input.relativeCursorPosition.y;
  }

  mousemove({ input }) {
    const x = input.relativeCursorPosition.x - this.center.x;
    const y = input.relativeCursorPosition.y - this.center.y;
    this.radius = Math.sqrt(x * x + y * y);
    this.endRad = Math.atan2(y, x);

    this.operationManager.render();
    this.render();
  }

  render() {
    const context = this.operationManager.context;

    context.beginPath();
    context.arc(
      this.cartesianGraph.scaleUpX(this.center.x),
      this.cartesianGraph.scaleUpY(this.center.y),
      this.radius * this.cartesianGraph.scale,
      0,
      this.endRad,
      true
    );
    context.lineWidth = this.strokeWidth;
    context.stroke();
  }
}

export default DrawArc;
