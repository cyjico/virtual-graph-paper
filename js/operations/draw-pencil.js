import Operation from './operation.js';

class DrawPencil extends Operation {
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
    /** @type {null|HTMLImageElement} */
    this.cachedDrawing = null;

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
      1 * (this.cartesianGraph.baseScale / this.cartesianGraph.scale)
    ) {
      if (!input.isWheelMouseDown) {
        this.vertices.push({
          x: input.relativeCursorPosition.x,
          y: input.relativeCursorPosition.y,
        });
      }

      this.operationHistory.render();
      this.renderVertices(this.operationHistory.context);
    }
  }

  #setBounds(x, y) {
    if (x < this.bounds.min.x) {
      this.bounds.min.x = x;
    }

    if (x > this.bounds.max.x) {
      this.bounds.max.x = x;
    }

    if (y < this.bounds.min.y) {
      this.bounds.min.y = y;
    }

    if (y > this.bounds.max.y) {
      this.bounds.max.y = y;
    }
  }

  onMouseup() {
    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];

      this.#setBounds(vertex.x, vertex.y);
    }

    this.bounds.min.x -= this.strokeWidth;
    this.bounds.min.y -= this.strokeWidth;
    this.bounds.max.x += this.strokeWidth;
    this.bounds.max.y += this.strokeWidth;

    const canvas = document.createElement('canvas');
    const minX = this.cartesianGraph.scaleUpX(this.bounds.min.x);
    const minY = this.cartesianGraph.scaleUpY(this.bounds.min.y);

    canvas.width = this.cartesianGraph.scaleUpX(this.bounds.max.x) - minX;
    canvas.height = this.cartesianGraph.scaleUpY(this.bounds.max.y) - minY;
    const context = canvas.getContext('2d');

    context.translate(-minX, -minY);
    this.renderVertices(context);
    this.cachedDrawing = new Image(canvas.width, canvas.height);
    this.cachedDrawing.src = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    this.vertices = [];
  }

  renderVertices(context) {
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

  render() {
    if (this.vertices.length > 0) {
      this.renderVertices(this.operationHistory.context);
    } else if (
      this.cachedDrawing.complete &&
      this.cachedDrawing.src.length > 0
    ) {
      const context = this.operationHistory.context;
      const minX = this.cartesianGraph.scaleUpX(this.bounds.min.x);
      const minY = this.cartesianGraph.scaleUpY(this.bounds.min.y);

      context.drawImage(
        this.cachedDrawing,
        minX,
        minY,
        this.cartesianGraph.scaleUpX(this.bounds.max.x) - minX,
        this.cartesianGraph.scaleUpY(this.bounds.max.y) - minY
      );
    }
  }
}

export default DrawPencil;
