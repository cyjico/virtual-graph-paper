import Operation from './operation.js';

class PencilDraw extends Operation {
  /**
   * Creates an instance of ArrowOperation.
   *
   * @param {import('../operation-history.js').default} operationHistory
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof ArrowOperation
   */
  constructor(operationHistory, cartesianGraph) {
    super(operationHistory, cartesianGraph);

    this.vertices = [];
    this.foregroundColor = '';
    this.strokeWidth = 0;
  }

  onMousedown({ input, env }) {
    this.foregroundColor = env.foregroundColor;
    this.strokeWidth = env.strokeWidth;
    this.vertices.push({
      x: input.relativeCursorPosition.x,
      y: input.relativeCursorPosition.y,
    });
  }

  onMousemove({ input }) {
    const dist =
      Math.pow(
        input.relativeCursorPosition.x -
          this.vertices[this.vertices.length - 1].x,
        2
      ) +
      Math.pow(
        input.relativeCursorPosition.y -
          this.vertices[this.vertices.length - 1].y,
        2
      );

    if (
      dist >
      3 * (this.cartesianGraph.baseScale / this.cartesianGraph.scale)
    ) {
      this.cursorDistanceTraveled -= this.strokeWidth * this.strokeWidth;

      if (!input.isWheelMouseDown) {
        this.vertices.push({
          x: input.relativeCursorPosition.x,
          y: input.relativeCursorPosition.y,
        });
      }

      this.operationHistory.render();
      this.render();
    }
  }

  render() {
    const context = this.operationHistory.context;
    if (this.vertices.length > 0) {
      context.beginPath();
      context.moveTo(
        this.cartesianGraph.scaleUpX(this.vertices[0].x),
        this.cartesianGraph.scaleUpY(this.vertices[0].y)
      );

      let i;
      for (i = 1; i < this.vertices.length - 2; i++) {
        const xc = (this.vertices[i].x + this.vertices[i + 1].x) / 2;
        const yc = (this.vertices[i].y + this.vertices[i + 1].y) / 2;

        context.quadraticCurveTo(
          this.cartesianGraph.scaleUpX(this.vertices[i].x),
          this.cartesianGraph.scaleUpY(this.vertices[i].y),
          this.cartesianGraph.scaleUpX(xc),
          this.cartesianGraph.scaleUpY(yc)
        );
      }

      if (this.vertices.length > 3) {
        context.quadraticCurveTo(
          this.cartesianGraph.scaleUpX(this.vertices[i].x),
          this.cartesianGraph.scaleUpY(this.vertices[i].y),
          this.cartesianGraph.scaleUpX(this.vertices[i + 1].x),
          this.cartesianGraph.scaleUpY(this.vertices[i + 1].y)
        );
      }

      context.save();

      context.lineCap = 'round';
      context.strokeStyle = this.foregroundColor;
      context.lineWidth = this.strokeWidth * this.cartesianGraph.scale;
      context.stroke();

      context.restore();
    }
  }
}

export default PencilDraw;
