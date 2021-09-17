const NUM_COLUMNS = 2;
const NUM_ROWS = 2;
const BOUNDS_SKIN = 2;

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

function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
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
    const firstCanvas = this.cartesianGraph.context.canvas;
    const secondCanvas = this.context.canvas;

    // Create bounds that encapsulates the operations.
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

    bounds.min.x -= BOUNDS_SKIN;
    bounds.min.y -= BOUNDS_SKIN;
    bounds.max.x += BOUNDS_SKIN;
    bounds.max.y += BOUNDS_SKIN;

    // Save values.
    const boundsWidthDS = Math.abs(bounds.max.x - bounds.min.x);
    const boundsHeightDS = Math.abs(bounds.max.y - bounds.min.y);
    const scale = Math.max(
      15,
      4.5 + 75.825 * ((boundsWidthDS * boundsHeightDS) / 1073676289)
    );

    const cellWidthDS = boundsWidthDS / NUM_COLUMNS;
    const cellHeightDS = boundsHeightDS / NUM_ROWS;
    const cellWidth = cellWidthDS * scale;
    const cellHeight = cellHeightDS * scale;

    const canvasWidth = firstCanvas.width;
    const canvasHeight = firstCanvas.height;
    const graphScale = this.cartesianGraph.scale;
    const graphMarkerLine = this.cartesianGraph.markerLine;

    // Set values.
    firstCanvas.width = cellWidth;
    firstCanvas.height = cellHeight;
    this.cartesianGraph.context = firstCanvas.getContext('2d');
    secondCanvas.width = cellWidth;
    secondCanvas.height = cellHeight;
    this.context = secondCanvas.getContext('2d');
    this.cartesianGraph.scale = scale;
    this.cartesianGraph.markerLine =
      graphMarkerLine * (scale / this.cartesianGraph.baseScale);

    // Stitch canvas.
    const stitchingCanvas = createCanvas(
      boundsWidthDS * scale,
      boundsHeightDS * scale
    );
    const stitchingContext = stitchingCanvas.getContext('2d', { alpha: true });

    for (let y = 0; y < NUM_ROWS; y++) {
      for (let x = 0; x < NUM_COLUMNS; x++) {
        const cellCenterX = bounds.min.x + cellWidthDS * x + cellWidthDS / 2;
        const cellCenterY = bounds.min.y + cellHeightDS * y + cellHeightDS / 2;

        this.cartesianGraph.offset.x = -cellCenterX;
        this.cartesianGraph.offset.y = -cellCenterY;
        this.cartesianGraph.render();
        this.render();

        const stitchX = x * firstCanvas.width;
        const stitchY = y * firstCanvas.height;

        const firstLayer = await loadImage(firstCanvas.toDataURL());
        stitchingContext.drawImage(firstLayer, stitchX, stitchY);
        const secondLayer = await loadImage(secondCanvas.toDataURL());
        stitchingContext.drawImage(secondLayer, stitchX, stitchY);
      }
    }

    // Reset values.
    firstCanvas.width = canvasWidth;
    firstCanvas.height = canvasHeight;
    this.cartesianGraph.context = firstCanvas.getContext('2d');
    secondCanvas.width = canvasWidth;
    secondCanvas.height = canvasHeight;
    this.context = secondCanvas.getContext('2d');
    this.cartesianGraph.scale = graphScale;
    this.cartesianGraph.markerLine = graphMarkerLine;

    // Render for the current resolution.
    this.cartesianGraph.render();
    this.render();

    return stitchingCanvas;
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
