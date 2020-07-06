/* constellation.js

   draw random point constellations whenever the page reloads
   note to self: compile with 'tsc constellation.ts --lib dom,es2015' */

/** PARAMETERS **/
const FOREGROUND_DENSITY = 0.00007;      // stars per square pixel
const BACKGROUND_DENSITY = 0.0001;
const MAX_LINE_LEN = 110.0;  // line threshold, in pixels
const CONNECTEDNESS = 0.17;  // from 0 (disconnected) to 0.5 (quite connected)

var dots_div = document.getElementById("dots");
var lines_div = document.getElementById("lines");

interface Point {
  x: number;
  y: number;
}

interface Edge {
  u: Point;
  v: Point;
}

// angle (in radians) between points u and v
// more precisely, CCW angle the vector (u,v) makes with positive x-axis
// given in radians from (0, 2pi)
function angle(u: Point, v: Point): number {
  var dx: number = v.x - u.x;
  var dy: number = v.y - u.y
  var mag: number = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  return v.y >= u.y ? Math.acos(dx / mag) : 2 * Math.PI - Math.acos(dx / mag);
}

// CCW angle between vectors (a,b) and (c,d)
// given in radians from (0, 2pi)
function angleCCW(a: Point, b: Point, c: Point, d: Point): number {
  var ang1: number = angle(a, b);
  var ang2: number = angle(c, d);
  var delta: number = ang2 - ang1;
  if (delta >= 0)
    return delta
  else
    return 2 * Math.PI + delta;
}

// determinant of the 3x3 matrix A, which is described by
// concatenating its rows
// we just compute with row 1 cofactor expansion,
// since I can't be bothered to implement Gaussian elimination
function det3d(A: number[]): number {
  var col1: number = A[0] * (A[4] * A[8] - A[5] * A[7]);
  var col2: number = A[1] * (A[3] * A[8] - A[5] * A[6]);
  var col3: number = A[2] * (A[3] * A[7] - A[4] * A[6]);
  return col1 - col2 + col3;
}

// returns true if the target point t is inside the circle
//         circumscribing the triangle with vertices (a,b,c)
//         in counterclockwise order
// returns false otherwise
// derived from lemma 8.1 of https://dl.acm.org/doi/pdf/10.1145/282918.282923
function incircle(a: Point, b: Point, c: Point, t: Point): boolean {
  var sA: number = Math.pow(a.x, 2) + Math.pow(a.y, 2);
  var sB: number = Math.pow(b.x, 2) + Math.pow(b.y, 2);
  var sC: number = Math.pow(c.x, 2) + Math.pow(c.y, 2);
  var sT: number = Math.pow(t.x, 2) + Math.pow(t.y, 2);

  var row1: number = det3d([b.x, b.y, sB, c.x, c.y, sC, t.x, t.y, sT]);
  var row2: number = det3d([a.x, a.y, sA, c.x, c.y, sC, t.x, t.y, sT]);
  var row3: number = det3d([a.x, a.y, sA, b.x, b.y, sB, t.x, t.y, sT]);
  var row4: number = det3d([a.x, a.y, sA, b.x, b.y, sB, c.x, c.y, sC]);
  return (-row1 + row2 - row3 + row4) > 0;
}

// computes signed area of triangle ABC
function area(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
}

// returns true if the edges intersect
// returns false otherwise
// we will assume that the edges are not collinear
// this is a very clever trick from https://stackoverflow.com/a/3842240
function intersect(e1: Edge, e2: Edge): boolean {
  return (area(e1.u, e1.v, e2.u) > 0 && area(e1.u, e1.v, e2.v) < 0)
      || (area(e1.u, e1.v, e2.u) < 0 && area(e1.u, e1.v, e2.v) > 0);
}

// sneaky sneaky...intentionally modifies the argument array R!
function candidateR(base: Edge, right: Point[], R: Edge[]): Point | null {
  var incident: Edge[] =
    R.filter(edge => edge.u === base.v || edge.v === base.v)
     .sort((e1, e2) => {
       var c1: Point = e1.u === base.v ? e1.v : e1.u;
       var c2: Point = e2.u === base.v ? e2.v : e2.u;
       var d1: number = 2 * Math.PI - angleCCW(base.v, base.u, base.v, c1);
       var d2: number = 2 * Math.PI - angleCCW(base.v, base.u, base.v, c2);
       return d1 - d2;
     });

  for (let i = 0; i < incident.length; i++) {
    let edge: Edge = incident[i];
    let endpoint: Point = edge.u === base.v ? edge.v : edge.u;

    // criterion 1: clockwise angle from base must not exceed pi
    if (2 * Math.PI - angleCCW(base.v, base.u, base.v, endpoint) > Math.PI)
      return null;

    // criterion 2: next candidate must not be incircle with base
    //              if no next candidate, then vacuously true
    if (i + 1 === incident.length)
      return endpoint;
    let next: Point =
      incident[i+1].u === base.v ? incident[i+1].v : incident[i+1].u;
    if (!incircle(base.u, base.v, endpoint, next))
      return endpoint;
    else
      R.splice(R.indexOf(edge), 1);
  }
  return null;
}
function candidateL(base: Edge, left: Point[], L: Edge[]): Point | null {
  var incident: Edge[] =
    L.filter(edge => edge.u === base.u || edge.v === base.u)
     .sort((e1, e2) => {
       var c1: Point = e1.u === base.u ? e1.v : e1.u;
       var c2: Point = e2.u === base.u ? e2.v : e2.u;
       var d1: number = angleCCW(base.u, base.v, base.u, c1);
       var d2: number = angleCCW(base.u, base.v, base.u, c2);
       return d1 - d2;
     });

  for (let i = 0; i < incident.length; i++) {
    let edge: Edge = incident[i];
    let endpoint: Point = edge.u === base.u ? edge.v : edge.u;

    // criterion 1: counterclockwise angle from base must not exceed pi
    if (angleCCW(base.u, base.v, base.u, endpoint) > Math.PI)
      return null;

    // criterion 2: next candidate must not be incircle with base
    //              if no next candidate, then vacuously true
    if (i + 1 === incident.length)
      return endpoint;
    let next: Point =
      incident[i+1].u === base.u ? incident[i+1].v : incident[i+1].u;
    if (!incircle(base.u, base.v, endpoint, next))
      return endpoint;
    else
      L.splice(L.indexOf(edge), 1);
  }
  return null;
}

// compute a Delaunay triangulation of the given points
// we require that the input list be sorted by increasing x,
// with ties broken by increasing y
// we take a divide-and-conquer approach from
// http://www.geom.uiuc.edu/~samuelp/del_project.html
function delaunay(points: Point[]): Edge[] {
  if (points.length === 0 || points.length === 1)
    return [];
  if (points.length === 2)
    return [{u: points[0], v: points[1]}];
  if (points.length === 3)
    return [{u: points[0], v: points[1]},
            {u: points[0], v: points[2]},
            {u: points[1], v: points[2]}];

  // recurse on left and right point partitions
  var split: number = Math.floor(points.length / 2);
  var left:  Point[] = points.slice(0, split);
  var right: Point[] = points.slice(split);
  var L: Edge[] = delaunay(left);
  var R: Edge[] = delaunay(right);

  // merge left and right solutions
  // the initial base selection is not as fast as it could be
  // (actually, it might be slower than the incremental flipping algorithm!)
  var base: Edge =  // lowest crossing edge not intersecting existing edge
    left.map(u => right.map(v => {return {u: u, v: v};}))
    .reduce((acc, x) => acc.concat(x), [])
    .filter(e1 => L.concat(R).every(e2 => !intersect(e1, e2)))
    .sort((e1, e2) => Math.min(e1.u.y, e1.v.y) - Math.min(e2.u.y, e2.v.y))[0];
  var solution: Edge[] = [base];
  var cL: Point = candidateL(base, left, L);
  var cR: Point = candidateR(base, right, R);
  while (cL || cR) {
    if (!cR || (cL && !incircle(base.u, base.v, cL, cR))) {
      base = {u: cL, v: base.v};

      if (R.some(edge => intersect(base, edge)))
        console.log("oops! L");
    }
    else {
      base = {u: base.u, v: cR};

      if (L.some(edge => intersect(base, edge)))
        console.log("oops! R");
    }
    solution.push(base);
    cL = candidateL(base, left, L);
    cR = candidateR(base, right, R);
  }

  return solution.concat(L).concat(R);
}

// return list of vertices visited
function dfs(adj_list, v) {
  var vertex = adj_list[v];
  var V: number[] = [v];

  vertex.visited = true;
  for (let i = 0; i < vertex.neighbors.length; i++) {
    let neighbor = vertex.neighbors[i];
    if (!adj_list[neighbor].visited)
      V = V.concat(dfs(adj_list, neighbor));
  }
  return V;
}

function constellate() {
  // clear old dots and lines
  while (dots_div.firstChild)
    dots_div.removeChild(dots_div.firstChild);
  while (lines_div.firstChild)
    lines_div.removeChild(lines_div.firstChild);

  // draw some background stars
  // these don't participate in the constellations, but they look cool
  for (let i = 0; i < BACKGROUND_DENSITY * window.innerWidth * window.innerHeight; i++) {
    let v = document.createElement("div");
    let x = Math.random() * (window.innerWidth - 7);
    let y = Math.random() * (window.innerHeight - 7);
    let radius = Math.random() * 3 + 2;
    v.className = "circle";
    v.style.left = `${x}px`;
    v.style.top = `${y}px`;
    v.style.width = `${radius}px`;
    v.style.height = `${radius}px`;;
    v.style.borderRadius = `${radius / 2}`;
    v.style.backgroundColor = "#dddddd";

    dots_div.appendChild(v)
  }

  // draw a bunch of random vertices
  var V: Point[] = []
  var fg: number = FOREGROUND_DENSITY * window.innerWidth * window.innerHeight;
  for (let i = 0; i < fg; i++) {
    let v = document.createElement("div");
    let x = Math.random() * (window.innerWidth - 7);
    let y = Math.random() * (window.innerHeight - 7);
    let radius = Math.random() * 4 + 3;
    v.className = "circle";
    v.style.left = `${x}px`;
    v.style.top = `${y}px`;
    v.style.width = `${radius}px`;
    v.style.height = `${radius}px`;;
    v.style.borderRadius = `${radius / 2}`;

    dots_div.appendChild(v)
    V.push({x: x, y: y});
  }

  // sort vertices by increasing x, breaking ties by increasing y
  // it is almost impossible for two vertices to be tied
  V.sort((u, v) => {
    if (u.x - v.x != 0)
      return u.x - v.x
    else
      return u.y - v.y  // this will almost never happen
  });

  // compute a Delaunay triangulation of the vertices
  // var E: Edge[] = delaunay(V);

  // console.log(E.length);
  // for (let i = 0; i < E.length; i++) {
  //   draw_line(E[i].u, E[i].v, MAX_LINE_LEN);
  // }
  
  // @ts-ignore
  var triangles = Delaunator.from(V, p => p.x, p => p.y).triangles;
  var E = [];
  for (let i = 0; i < triangles.length; i += 3) {
    let a: number = triangles[i];
    let b: number = triangles[i+1];
    let c: number = triangles[i+2];
    E.push([a,b]);
    E.push([a,c]);
    E.push([b,c]);
  }

  // generate spanning tree on adjacency list
  // var T: Edge[] = dfs(adj_list, 0);
  // for (let i = 0; i < T.length; i++)
  //  draw_line(T[i].u, T[i].v, MAX_LINE_LEN);

  // probabilistically generate some connected components
  // we store this as an adjacency list so that it's easy
  // to reject small components
  var A = V.map((v,i) => {
    return {idx: i, vertex: v, neighbors: [], visited: false};
  });
  for (let i = 0; i < E.length; i++) {
    let u = E[i][0];
    let v = E[i][1];
    let edge = {u: V[u], v: V[v]};
    let dist = Math.sqrt(Math.pow(edge.u.x - edge.v.x, 2)
                       + Math.pow(edge.u.y - edge.v.y, 2));
    if (dist < MAX_LINE_LEN
      && Math.abs(Math.random() - dist / MAX_LINE_LEN) < CONNECTEDNESS)
    {
      A[u].neighbors.push(v);
      A[v].neighbors.push(u);
    }
  }

  // draw the larger connected components
  while (A.some(vertex => !vertex.visited)) {
    var next = A.filter(vertex => !vertex.visited)[0].idx;
    var component = dfs(A, next);
    if (component.length > 3) {
      component.forEach(u => {
        A[u].neighbors.forEach(v => {
          draw_line(A[u].vertex, A[v].vertex);
        });
      });
    }
  }
}

// draw a line between two points p1 and p2
function draw_line(p1: Point, p2: Point) {
  let dist = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x)
                       + (p1.y - p2.y) * (p1.y - p2.y));
  let line = document.createElement("div");
  line.className = "line";
  line.style.width = dist + "px";
  line.style.backgroundColor = "#bbbbbb";
  lines_div.appendChild(line);

  let m = (p1.y - p2.y) / (p1.x - p2.x);
  let ang = Math.atan(m);
  let ps = [p1, p2];
  let left = ps[0].x < ps[1].x ? 0 : 1;
  let top = ps[0].y < ps[1].y ? 0 : 1;

  if (left == top) {
    line.style.transformOrigin = "top left";
    line.style.left = `${ps[left].x + 2.5}px`;
    line.style.top = `${ps[top].y + 2.5}px`;
    line.style.transform = `rotate(${ang}rad)`;
  } else {
    line.style.transformOrigin = "bottom left";
    line.style.left = `${ps[left].x + 2.5}px`;
    line.style.top = `${ps[1-top].y + 2.5}px`;
    line.style.transform = `rotate(${ang}rad)`;
  }
}

window.addEventListener("load", constellate);
window.addEventListener("resize", constellate);
window.addEventListener("wheel", constellate);
