import Operation from './operation.js';

class PencilDraw extends Operation {
  /**
   * Creates an instance of ArrowOperation.
   *
   * @param {import('../operation-history.js').default} operationManager
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof ArrowOperation
   */
  constructor(operationManager, cartesianGraph) {
    super(operationManager, cartesianGraph);

    this.vertices = [];
    this.foregroundColor = '#000000';
    this.strokeWidth = 0;
  }

  mousedown({ input, env }) {
    this.foregroundColor = env.foregroundColor;
    this.strokeWidth = env.strokeWidth;
    this.vertices.push([
      input.relativeCursorPosition.x,
      input.relativeCursorPosition.y,
    ]);
  }

  mousemove({ input }) {
    const dist =
      Math.pow(
        input.relativeCursorPosition.x -
          this.vertices[this.vertices.length - 1][0],
        2
      ) +
      Math.pow(
        input.relativeCursorPosition.y -
          this.vertices[this.vertices.length - 1][1],
        2
      );
    if (dist > 0.25 * 0.25 * this.strokeWidth) {
      if (!input.isWheelMouseDown) {
        this.vertices.push([
          input.relativeCursorPosition.x,
          input.relativeCursorPosition.y,
        ]);
      }

      this.operationManager.render();
      this.render();
    }
  }

  render() {
    const context = this.operationManager.context;
    if (this.vertices.length > 0) {
      context.beginPath();
      context.moveTo(
        this.cartesianGraph.scaleUpX(this.vertices[0][0]),
        this.cartesianGraph.scaleUpY(this.vertices[0][1])
      );
      for (let i = 1; i < this.vertices.length; i++) {
        context.lineTo(
          this.cartesianGraph.scaleUpX(this.vertices[i][0]),
          this.cartesianGraph.scaleUpY(this.vertices[i][1])
        );
      }
      context.strokeStyle = this.foregroundColor;
      context.lineWidth =
        this.strokeWidth *
        (this.cartesianGraph.scale / this.cartesianGraph.baseScale);
      context.stroke();
    }
  }
}

export default PencilDraw;
