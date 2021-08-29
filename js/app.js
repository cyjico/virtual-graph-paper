import CartesianGraph from './cartesian-graph.js';

window.addEventListener('load', () => {
  // Setting up the toolbox.

  const operations = document.querySelectorAll(
    '#toolbox div.button-set input[type="button"]'
  );
  let active = operations[0];
  for (let i = 0; i < operations.length; i++) {
    operations[i].addEventListener('click', (e) => {
      active.classList.remove('button--active-state');
      active = e.currentTarget;
      active.classList.add('button--active-state');
    });
  }

  // Setting up the viewport.
  const viewport = document.getElementsByTagName('main')[0];

  const cartesianGraph = new CartesianGraph(viewport);

  cartesianGraph.offset.x -= 10;
  cartesianGraph.offset.y += 10;
  cartesianGraph.render();
});
