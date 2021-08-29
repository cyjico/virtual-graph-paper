import Operation from './operation.js';

class PencilDraw extends Operation {
  /**
   * Creates an instance of ArrowOperation.
   *
   * @param {import('../operation-manager.js').default} operationManager
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof ArrowOperation
   */
  constructor(operationManager, cartesianGraph) {
    super(operationManager, cartesianGraph);

    this.vertices = [];
  }

  mousedown(e) {
    super.mousedown.call(this);
    this.vertices.push([
      this.operationManager.relativeCursorPosition.x,
      this.operationManager.relativeCursorPosition.y,
    ]);
  }

  mousemove(e) {
    super.mousemove.call(this);
    const dist =
      Math.pow(
        this.operationManager.relativeCursorPosition.x -
          this.vertices[this.vertices.length - 1][0],
        2
      ) +
      Math.pow(
        this.operationManager.relativeCursorPosition.y -
          this.vertices[this.vertices.length - 1][1],
        2
      );
    if (dist > 0.25 * 0.25) {
      this.vertices.push([
        this.operationManager.relativeCursorPosition.x,
        this.operationManager.relativeCursorPosition.y,
      ]);
      const context = this.operationManager.context;
      context.beginPath();
      context.moveTo(
        this.cartesianGraph.scaleUpX(
          this.vertices[this.vertices.length - 2][0]
        ),
        this.cartesianGraph.scaleUpY(this.vertices[this.vertices.length - 2][1])
      );
      context.lineTo(
        this.cartesianGraph.scaleUpX(
          this.vertices[this.vertices.length - 1][0]
        ),
        this.cartesianGraph.scaleUpY(this.vertices[this.vertices.length - 1][1])
      );
      context.stroke();
    }
  }

  mouseup(e) {
    super.mouseup.call(this);
  }

  render() {
    super.render.call(this);
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
      context.stroke();
    }
  }
}

export default PencilDraw;
