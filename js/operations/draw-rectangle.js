import Operation from './operation.js';

class DrawRectangle extends Operation {
  /**
   * Creates an instance of DrawRectangle.
   *
   * @param {import('../operation-manager.js').default} operationManager
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof DrawRectangle
   */
  constructor(operationManager, cartesianGraph) {
    super(operationManager, cartesianGraph);

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

    this.operationManager.render();
    this.render();
  }

  #setBounds(x, y) {
    if (x < this.bounds.min.x) {
      this.bounds.min.x = x;
    }

    if (x > this.bounds.max.x) {
      this.bounds.max.x = x;
    }

    if (y < this.bounds.min.y) {
      this.bounds.min.y = y;
    }

    if (y > this.bounds.max.y) {
      this.bounds.max.y = y;
    }
  }

  onMouseup() {
    this.#setBounds(this.x, this.y);
    this.#setBounds(this.x + this.width, this.y + this.height);

    const halfWidth = this.strokeWidth / 2;
    this.bounds.min.x -= halfWidth;
    this.bounds.min.y -= halfWidth;
    this.bounds.max.x += halfWidth;
    this.bounds.max.y += halfWidth;
  }

  render() {
    const context = this.operationManager.context;

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
