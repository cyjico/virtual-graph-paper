import Operation from './operation.js';

class DrawArrow extends Operation {
  /**
   * Creates an instance of ArrowOperation.
   *
   * @param {import('../operation-history.js').default} operationManager
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
    this.strokeWidth = 0;
  }

  mousedown({ input, env }) {
    super.mousedown.call(this);

    this.strokeWidth = env.getStrokeWidth();
    this.start.x = input.relativeCursorPosition.x;
    this.start.y = input.relativeCursorPosition.y;
  }

  mousemove({ input, env }) {
    super.mousemove.call(this);
    const context = this.operationManager.context;
    this.operationManager.render();
    context.beginPath();
    context.moveTo(
      this.cartesianGraph.scaleUpX(this.start.x),
      this.cartesianGraph.scaleUpY(this.start.y)
    );

    const headingX = input.relativeCursorPosition.x - this.start.x;
    const headingY = input.relativeCursorPosition.y - this.start.y;
    let headingRad = Math.atan2(headingY, headingX);
    let rx = 0;
    let ry = 0;

    if (env.isDegreeSnapping()) {
      const rad = 15 * (Math.PI / 180);
      headingRad = Math.round(headingRad / rad) * rad;
      const headingMag = Math.sqrt(headingX * headingX + headingY * headingY);

      rx = Math.cos(headingRad) * headingMag + this.start.x;
      ry = Math.sin(headingRad) * headingMag + this.start.y;
    } else {
      rx = input.relativeCursorPosition.x;
      ry = input.relativeCursorPosition.y;
    }

    context.lineTo(
      this.cartesianGraph.scaleUpX(rx),
      this.cartesianGraph.scaleUpY(ry)
    );

    const rad = 45 * (Math.PI / 180);
    headingRad += Math.PI;

    context.moveTo(
      this.cartesianGraph.scaleUpX(Math.cos(headingRad + rad) + rx),
      this.cartesianGraph.scaleUpY(Math.sin(headingRad + rad) + ry)
    );
    context.lineTo(
      this.cartesianGraph.scaleUpX(rx),
      this.cartesianGraph.scaleUpY(ry)
    );
    context.lineTo(
      this.cartesianGraph.scaleUpX(Math.cos(headingRad - rad) + rx),
      this.cartesianGraph.scaleUpY(Math.sin(headingRad - rad) + ry)
    );
    context.lineWidth = this.strokeWidth;
    context.stroke();
  }

  mouseup({ input, env }) {
    super.mouseup.call(this);

    const headingX = input.relativeCursorPosition.x - this.start.x;
    const headingY = input.relativeCursorPosition.y - this.start.y;
    let headingRad = Math.atan2(headingY, headingX);

    if (env.isDegreeSnapping()) {
      const rad = 15 * (Math.PI / 180);
      headingRad = Math.round(headingRad / rad) * rad;
      const headingMag = Math.sqrt(headingX * headingX + headingY * headingY);

      this.end.x = Math.cos(headingRad) * headingMag + this.start.x;
      this.end.y = Math.sin(headingRad) * headingMag + this.start.y;
    } else {
      this.end.x = input.relativeCursorPosition.x;
      this.end.y = input.relativeCursorPosition.y;
    }

    const rad = 45 * (Math.PI / 180);
    headingRad += Math.PI;

    this.left.x = Math.cos(headingRad + rad) + this.end.x;
    this.left.y = Math.sin(headingRad + rad) + this.end.y;
    this.right.x = Math.cos(headingRad - rad) + this.end.x;
    this.right.y = Math.sin(headingRad - rad) + this.end.y;
  }

  render() {
    super.render.call(this);
    const context = this.operationManager.context;
    const ex = this.cartesianGraph.scaleUpX(this.end.x);
    const ey = this.cartesianGraph.scaleUpY(this.end.y);

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
    context.lineWidth = this.strokeWidth;
    context.stroke();
  }
}

export default DrawArrow;
