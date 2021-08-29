import CartesianGraph from './cartesian-graph.js';

window.addEventListener('load', () => {
  // Setting up the viewport.
  const viewport = document.getElementsByTagName('main')[0];

  const cartesianGraph = new CartesianGraph(viewport);

  cartesianGraph.offset.x -= 10;
  cartesianGraph.offset.y += 10;
  cartesianGraph.render();
});
