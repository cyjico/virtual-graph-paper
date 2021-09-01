import Operation from './operation.js';

class DrawLine extends Operation {
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
  }

  mousedown({ input }) {
    super.mousedown.call(this);
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
    if (env.isDegreeSnapping()) {
      const rad = 15 * (Math.PI / 180);

      const headingX = input.relativeCursorPosition.x - this.start.x;
      const headingY = input.relativeCursorPosition.y - this.start.y;
      const headingRad = Math.round(Math.atan2(headingY, headingX) / rad) * rad;
      const headingMag = Math.sqrt(headingX * headingX + headingY * headingY);

      context.lineTo(
        this.cartesianGraph.scaleUpX(
          Math.cos(headingRad) * headingMag + this.start.x
        ),
        this.cartesianGraph.scaleUpY(
          Math.sin(headingRad) * headingMag + this.start.y
        )
      );
    } else {
      context.lineTo(
        this.cartesianGraph.scaleUpX(input.relativeCursorPosition.x),
        this.cartesianGraph.scaleUpY(input.relativeCursorPosition.y)
      );
    }
    context.stroke();
  }

  mouseup({ input, env }) {
    super.mouseup.call(this);
    if (env.isDegreeSnapping()) {
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
    context.stroke();
  }
}

export default DrawLine;
