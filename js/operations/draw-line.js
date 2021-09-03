import Operation from './operation.js';

class DrawLine extends Operation {
  /**
   * Creates an instance of ArrowOperation.
   *
   * @param {import('../operation-history.js').default} operationHistory
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof ArrowOperation
   */
  constructor(operationHistory, cartesianGraph) {
    super(operationHistory, cartesianGraph);

    this.start = {
      x: 0,
      y: 0,
    };
    this.end = {
      x: 0,
      y: 0,
    };
    this.foregroundColor = '#000000';
    this.strokeWidth = 0;
  }

  mousedown({ input, env }) {
    this.foregroundColor = env.foregroundColor;
    this.strokeWidth = env.strokeWidth;
    this.start.x = input.relativeCursorPosition.x;
    this.start.y = input.relativeCursorPosition.y;
  }

  mousemove({ input, env }) {
    if (env.isDegreeSnapping) {
      const rad = 15 * (Math.PI / 180);

      const headingX = input.relativeCursorPosition.x - this.start.x;
      const headingY = input.relativeCursorPosition.y - this.start.y;
      const headingRad = Math.round(Math.atan2(headingY, headingX) / rad) * rad;
      const headingMag = Math.sqrt(headingX * headingX + headingY * headingY);

      this.end.x = Math.cos(headingRad) * headingMag + this.start.x;
      this.end.y = Math.sin(headingRad) * headingMag + this.start.y;
    } else {
      this.end.x = input.relativeCursorPosition.x;
      this.end.y = input.relativeCursorPosition.y;
    }

    this.operationHistory.render();
    this.render();
  }

  render() {
    const context = this.operationHistory.context;
    context.beginPath();
    context.moveTo(
      this.cartesianGraph.scaleUpX(this.start.x),
      this.cartesianGraph.scaleUpY(this.start.y)
    );
    context.lineTo(
      this.cartesianGraph.scaleUpX(this.end.x),
      this.cartesianGraph.scaleUpY(this.end.y)
    );
    context.strokeStyle = this.foregroundColor;
    context.lineWidth =
      this.strokeWidth *
      (this.cartesianGraph.scale / this.cartesianGraph.baseScale);
    context.stroke();
  }
}

export default DrawLine;
