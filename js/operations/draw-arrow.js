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
  }

  mousedown(e, input) {
    super.mousedown.call(this);
    this.start.x = input.relativeCursorPosition.x;
    this.start.y = input.relativeCursorPosition.y;
  }

  mousemove() {
    super.mousemove.call(this);
  }

  mouseup(e, input) {
    super.mouseup.call(this);
    this.end.x = input.relativeCursorPosition.x;
    this.end.y = input.relativeCursorPosition.y;

    const heading = Math.atan2(
      this.start.y - this.end.y,
      this.start.x - this.end.x
    );

    const rad = 45 * (Math.PI / 180);
    this.left.x = Math.cos(heading + rad) + this.end.x;
    this.left.y = Math.sin(heading + rad) + this.end.y;
    this.right.x = Math.cos(heading - rad) + this.end.x;
    this.right.y = Math.sin(heading - rad) + this.end.y;
    this.render();
  }

  render() {
    super.render.call(this);
    const context = this.operationManager.context;
    context.beginPath();
    context.moveTo(
      this.cartesianGraph.scaleUpX(this.start.x),
      this.cartesianGraph.scaleUpY(this.start.y)
    );
    context.lineTo(
      this.cartesianGraph.scaleUpX(this.end.x),
      this.cartesianGraph.scaleUpY(this.end.y)
    );
    context.lineTo(
      this.cartesianGraph.scaleUpX(this.left.x),
      this.cartesianGraph.scaleUpY(this.left.y)
    );
    context.moveTo(
      this.cartesianGraph.scaleUpX(this.end.x),
      this.cartesianGraph.scaleUpY(this.end.y)
    );
    context.lineTo(
      this.cartesianGraph.scaleUpX(this.right.x),
      this.cartesianGraph.scaleUpY(this.right.y)
    );
    context.stroke();
  }
}

export default DrawArrow;
