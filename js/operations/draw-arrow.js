import Operation from './operation.js';

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
    this.leftHook = {
      x: 0,
      y: 0,
    };
    this.rightHook = {
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

    const headingRad = Math.atan2(
      this.start.y - this.end.y,
      this.start.x - this.end.x
    );

    const rad = 45 * (Math.PI / 180);
    this.leftHook.x = Math.cos(headingRad + rad) + this.end.x;
    this.leftHook.y = Math.sin(headingRad + rad) + this.end.y;
    this.rightHook.x = Math.cos(headingRad - rad) + this.end.x;
    this.rightHook.y = Math.sin(headingRad - rad) + this.end.y;
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
      this.cartesianGraph.scaleUpX(this.leftHook.x),
      this.cartesianGraph.scaleUpY(this.leftHook.y)
    );
    context.moveTo(
      this.cartesianGraph.scaleUpX(this.end.x),
      this.cartesianGraph.scaleUpY(this.end.y)
    );
    context.lineTo(
      this.cartesianGraph.scaleUpX(this.rightHook.x),
      this.cartesianGraph.scaleUpY(this.rightHook.y)
    );
    context.stroke();
  }
}

export default DrawArrow;
