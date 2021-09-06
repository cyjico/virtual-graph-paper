import Operation from './operation.js';

class DrawRectangle extends Operation {
  /**
   * Creates an instance of DrawRectangle.
   *
   * @param {import('../operation-manager/operation-manager.js').default} operationHistory
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof DrawRectangle
   */
  constructor(operationHistory, cartesianGraph) {
    super(operationHistory, cartesianGraph);

    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;

    this.foregroundColor = '';
    this.backgroundColor = '';
    this.strokeWidth = 0;
  }

  onMousedown({ env, input }) {
    this.foregroundColor = env.foregroundColor;
    this.backgroundColor = env.backgroundColor;
    this.strokeWidth = env.strokeWidth;
    this.x = input.relativeCursorPosition.x;
    this.y = input.relativeCursorPosition.y;
  }

  onMousemove({ input }) {
    this.width = input.relativeCursorPosition.x - this.x;
    this.height = input.relativeCursorPosition.y - this.y;

    this.operationHistory.render();
    this.render();
  }

  render() {
    const context = this.operationHistory.context;

    const x = this.cartesianGraph.scaleUpX(this.x);
    const xw = this.cartesianGraph.scaleUpX(this.x + this.width);
    const y = this.cartesianGraph.scaleUpY(this.y);
    const yh = this.cartesianGraph.scaleUpY(this.y + this.height);

    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(xw, y);
    context.lineTo(xw, yh);
    context.lineTo(x, yh);
    context.closePath();

    context.fillStyle = this.backgroundColor;
    context.fill();

    if (this.strokeWidth > 0) {
      context.strokeStyle = this.foregroundColor;
      context.lineWidth = this.strokeWidth * this.cartesianGraph.scale;
      context.stroke();
    }
  }
}

export default DrawRectangle;
