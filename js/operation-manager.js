/**
 * Load an image using promises.
 *
 * @param {string} url
 * @return {Promise<HTMLImageElement>}
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject(image);
    };
    image.src = url;
  });
}

/**
 * Get blob of canvas.
 *
 * @param {HTMLCanvasElement} canvas
 * @return {Promise<Blob>}
 */
function getCanvasBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob));
  });
}

class OperationManager {
  /** @type {import('./operations/operation.js').default[]} */
  #operations = [];
  #travelIndex = 0;

  /**
   * Creates an instance of OperationOverlay.
   *
   * @param {HTMLElement} viewport
   * @param {import('./cartesian-graph.js').default} cartesianGraph
   * @memberof OperationOverlay
   */
  constructor(viewport, cartesianGraph) {
    const canvas = viewport.children[1];
    canvas.width = viewport.clientWidth;
    canvas.height = viewport.clientHeight;

    /** @type {CanvasRenderingContext2D} */
    this.context = canvas.getContext('2d');
    this.cartesianGraph = cartesianGraph;
  }

  /**
   *
   * @param {import('./operations/operation.js').default} operation
   */
  addOperation(operation) {
    this.#operations.splice(this.#operations.length - this.#travelIndex);
    this.#operations.push(operation);
    this.#travelIndex = 0;
  }

  /**
   *
   * @param {number} index
   */
  removeOperation(index) {
    this.#operations.splice(index, 1);

    if (this.#travelIndex > this.#operations.length) {
      this.#travelIndex = this.#operations.length;
    }
  }

  redoOperation() {
    this.#travelIndex = Math.max(this.#travelIndex - 1, 0);
    this.render();
  }

  undoOperation() {
    this.#travelIndex = Math.min(
      this.#travelIndex + 1,
      this.#operations.length
    );
    this.render();
  }

  async saveOperation() {
    // Obtain bounds that encapsulates every operation.
    const bounds = {
      min: {
        x: 0,
        y: 0,
      },
      max: {
        x: 0,
        y: 0,
      },
    };

    for (let i = 0; i < this.#operations.length; i++) {
      const ops = this.#operations[i];

      if (ops.bounds.min.x < bounds.min.x) {
        bounds.min.x = ops.bounds.min.x;
      }

      if (ops.bounds.min.y < bounds.min.y) {
        bounds.min.y = ops.bounds.min.y;
      }

      if (ops.bounds.max.x > bounds.max.x) {
        bounds.max.x = ops.bounds.max.x;
      }

      if (ops.bounds.max.y > bounds.max.y) {
        bounds.max.y = ops.bounds.max.y;
      }
    }

    const cellWidth = this.context.canvas.width / this.cartesianGraph.scale;
    const cellHeight = this.context.canvas.height / this.cartesianGraph.scale;

    bounds.min.x =
      Math.ceil(Math.abs(bounds.min.x) / cellWidth) *
      cellWidth *
      Math.sign(bounds.min.x);
    bounds.max.x =
      Math.ceil(Math.abs(bounds.max.x) / cellWidth) *
      cellWidth *
      Math.sign(bounds.max.x);

    bounds.min.y =
      Math.ceil(Math.abs(bounds.min.y) / cellHeight) *
      cellHeight *
      Math.sign(bounds.min.y);
    bounds.max.y =
      Math.ceil(Math.abs(bounds.max.y) / cellHeight) *
      cellHeight *
      Math.sign(bounds.max.y);

    // Go through each cell and attempt to render.
    const numColumns = (bounds.max.x - bounds.min.x) / cellWidth;
    const numRows = (bounds.max.y - bounds.min.y) / cellHeight;

    const stitchingCanvas = document.createElement('canvas');
    stitchingCanvas.width = this.context.canvas.width * numColumns;
    stitchingCanvas.height = this.context.canvas.height * numRows;
    const stitchingContext = stitchingCanvas.getContext('2d', { alpha: true });

    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numColumns; x++) {
        const cellCenterX = bounds.min.x + cellWidth / 2 + cellWidth * x;
        const cellCenterY = bounds.min.y + cellHeight / 2 + cellHeight * y;

        this.cartesianGraph.offset.x = -cellCenterX;
        this.cartesianGraph.offset.y = -cellCenterY;
        this.cartesianGraph.render();
        this.render();

        // Each render will be stitched together.
        const stitchX = x * this.context.canvas.width;
        const stitchY = y * this.context.canvas.height;

        const firstLayer = await loadImage(
          this.cartesianGraph.context.canvas.toDataURL()
        );
        stitchingContext.drawImage(firstLayer, stitchX, stitchY);
        const secondLayer = await loadImage(this.context.canvas.toDataURL());
        stitchingContext.drawImage(secondLayer, stitchX, stitchY);
      }
    }

    return await getCanvasBlob(stitchingCanvas);
  }

  render() {
    const viewportBounds = this.cartesianGraph.viewportBounds;

    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );

    for (let i = 0; i <= this.#operations.length - 1 - this.#travelIndex; i++) {
      const bounds = this.#operations[i].bounds;

      if (
        bounds.min.x < viewportBounds.max.x &&
        bounds.max.x > viewportBounds.min.x &&
        bounds.min.y < viewportBounds.max.y &&
        bounds.max.y > viewportBounds.min.y
      ) {
        this.#operations[i].render();
      }
    }
  }
}

export default OperationManager;
