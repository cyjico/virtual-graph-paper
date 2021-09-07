import Operation from './operation.js';

// Offset for taking account the anti-aliasing in caching images.
const OFFSET_X = 5;
const OFFSET_Y = 5;
const OFFSET_HALF_X = OFFSET_X / 2;
const OFFSET_HALF_Y = OFFSET_Y / 2;

class DrawPencil extends Operation {
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
    /** @type {null|number} */
    this.cachedScale = null;
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
      0.5 * (this.cartesianGraph.baseScale / this.cartesianGraph.scale)
    ) {
      if (!input.isWheelMouseDown) {
        this.vertices.push({
          x: input.relativeCursorPosition.x,
          y: input.relativeCursorPosition.y,
        });
      }

      this.operationManager.render();
      this.renderVertices(this.operationManager.context);
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

    const strokeWidth = this.strokeWidth * 0.5;
    this.bounds.min.x -= strokeWidth;
    this.bounds.min.y -= strokeWidth;
    this.bounds.max.x += strokeWidth;
    this.bounds.max.y += strokeWidth;

    const canvas = document.createElement('canvas');
    const minX = this.cartesianGraph.scaleUpX(this.bounds.min.x);
    const minY = this.cartesianGraph.scaleUpY(this.bounds.min.y);

    canvas.width =
      this.cartesianGraph.scaleUpX(this.bounds.max.x) - minX + OFFSET_X;
    canvas.height =
      this.cartesianGraph.scaleUpY(this.bounds.max.y) - minY + OFFSET_Y;
    const context = canvas.getContext('2d');

    context.translate(-minX + OFFSET_HALF_X, -minY + OFFSET_HALF_Y);
    this.renderVertices(context);
    this.cachedScale = this.cartesianGraph.scale;
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
      this.renderVertices(this.operationManager.context);
    } else if (
      this.cachedDrawing.complete &&
      this.cachedDrawing.src.length > 0
    ) {
      const context = this.operationManager.context;
      const minX = this.cartesianGraph.scaleUpX(this.bounds.min.x);
      const minY = this.cartesianGraph.scaleUpY(this.bounds.min.y);
      const scalar = this.cartesianGraph.scale / this.cachedScale;

      context.drawImage(
        this.cachedDrawing,
        minX - OFFSET_HALF_X * scalar,
        minY - OFFSET_HALF_Y * scalar,
        this.cartesianGraph.scaleUpX(this.bounds.max.x) -
          minX +
          OFFSET_X * scalar,
        this.cartesianGraph.scaleUpY(this.bounds.max.y) -
          minY +
          OFFSET_Y * scalar
      );
    }
  }
}

export default DrawPencil;
