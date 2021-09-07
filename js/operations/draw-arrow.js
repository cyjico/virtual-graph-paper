import Operation from './operation.js';

const RAD_15 = 15 * (Math.PI / 180);
const RAD_45 = 45 * (Math.PI / 180);

class DrawArrow extends Operation {
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
      headingRad = Math.round(headingRad / RAD_15) * RAD_15;
      const headingMag = Math.sqrt(headingX * headingX + headingY * headingY);

      this.end.x = Math.cos(headingRad) * headingMag + this.start.x;
      this.end.y = Math.sin(headingRad) * headingMag + this.start.y;
    } else {
      this.end.x = input.relativeCursorPosition.x;
      this.end.y = input.relativeCursorPosition.y;
    }

    const scalar = this.strokeWidth * 3;
    headingRad += Math.PI;
    this.left.x = Math.cos(headingRad + RAD_45) * scalar + this.end.x;
    this.left.y = Math.sin(headingRad + RAD_45) * scalar + this.end.y;
    this.right.x = Math.cos(headingRad - RAD_45) * scalar + this.end.x;
    this.right.y = Math.sin(headingRad - RAD_45) * scalar + this.end.y;

    this.operationManager.render();
    this.render();
  }

  render() {
    const context = this.operationManager.context;
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
