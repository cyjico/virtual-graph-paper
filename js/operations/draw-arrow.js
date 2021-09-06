import Operation from './operation.js';

class DrawArrow extends Operation {
  /**
   * Creates an instance of ArrowOperation.
   *
   * @param {import('../operations-manager.js').default} operationHistory
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
    this.left = {
      x: 0,
      y: 0,
    };
    this.right = {
      x: 0,
      y: 0,
    };
    this.foregroundColor = '';
    this.strokeWidth = 0;
  }

  onMousedown({ input, env }) {
    this.foregroundColor = env.foregroundColor;
    this.strokeWidth = env.strokeWidth;
    this.start.x = input.relativeCursorPosition.x;
    this.start.y = input.relativeCursorPosition.y;
  }

  onMousemove({ input, env }) {
    const headingX = input.relativeCursorPosition.x - this.start.x;
    const headingY = input.relativeCursorPosition.y - this.start.y;
    let headingRad = Math.atan2(headingY, headingX);

    if (env.isDegreeSnapping) {
      const rad15 = 15 * (Math.PI / 180);
      headingRad = Math.round(headingRad / rad15) * rad15;
      const headingMag = Math.sqrt(headingX * headingX + headingY * headingY);

      this.end.x = Math.cos(headingRad) * headingMag + this.start.x;
      this.end.y = Math.sin(headingRad) * headingMag + this.start.y;
    } else {
      this.end.x = input.relativeCursorPosition.x;
      this.end.y = input.relativeCursorPosition.y;
    }

    headingRad += Math.PI;
    const rad45 = 45 * (Math.PI / 180);

    const scalar = this.strokeWidth * 3;
    this.left.x = Math.cos(headingRad + rad45) * scalar + this.end.x;
    this.left.y = Math.sin(headingRad + rad45) * scalar + this.end.y;
    this.right.x = Math.cos(headingRad - rad45) * scalar + this.end.x;
    this.right.y = Math.sin(headingRad - rad45) * scalar + this.end.y;

    this.operationHistory.render();
    this.render();
  }

  render() {
    const context = this.operationHistory.context;
    const ex = this.cartesianGraph.scaleUpX(this.end.x);
    const ey = this.cartesianGraph.scaleUpY(this.end.y);

    context.save();

    context.beginPath();
    context.moveTo(
      this.cartesianGraph.scaleUpX(this.start.x),
      this.cartesianGraph.scaleUpY(this.start.y)
    );
    context.lineTo(ex, ey);
    context.moveTo(
      this.cartesianGraph.scaleUpX(this.left.x),
      this.cartesianGraph.scaleUpY(this.left.y)
    );
    context.lineTo(ex, ey);
    context.lineTo(
      this.cartesianGraph.scaleUpX(this.right.x),
      this.cartesianGraph.scaleUpY(this.right.y)
    );
    context.lineCap = 'round';
    context.strokeStyle = this.foregroundColor;
    context.lineWidth = this.strokeWidth * this.cartesianGraph.scale;
    context.stroke();

    context.restore();
  }
}

export default DrawArrow;
