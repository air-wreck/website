/* constellation.js

   draw random point constellations whenever the page reloads */

/** PARAMETERS **/
const DENSITY = 0.0001;      // stars per square pixel
const MAX_LINE_LEN = 100.0;  // line threshold, in pixels

var dots_div = document.getElementById("dots");
var lines_div = document.getElementById("lines");


function draw_dots() {
  // clear old dots and lines
  while (dots_div.firstChild)
    dots_div.removeChild(dots_div.firstChild);
  while (lines_div.firstChild)
    lines_div.removeChild(lines_div.firstChild);

  // draw a bunch of random dots
  let dots = [];
  let no_dots = DENSITY * window.innerWidth * window.innerHeight;
  for (let i = 0; i < no_dots; i++) {
    let dot = document.createElement("div");
    let x = Math.random() * (window.innerWidth - 5);
    let y = Math.random() * (window.innerHeight - 5);
    dot.className = "circle";
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    dots_div.appendChild(dot)
    dots.push({x: x, y: y});
  }

  // draw a line between nearby dots
  for (let i = 0; i < dots.length; i++) {
    for (let j = i+1; j < dots.length; j++) {
      draw_line(dots[i], dots[j], MAX_LINE_LEN);
    }
  }
}

/* draw a line between two points p1 and p2 if less than threshold apart */
function draw_line(p1, p2, threshold) {
  let dist = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x)
                       + (p1.y - p2.y) * (p1.y - p2.y));
  if (dist < threshold) {
    let line = document.createElement("div");
    line.className = "line";
    line.style.width = dist + "px";
    let color = Math.trunc(255 - 255 * dist / MAX_LINE_LEN).toString(16);
    let digit = ("0" + color).slice(-2);
    line.style.backgroundColor = `#${digit}${digit}${digit}`;
    lines_div.appendChild(line);

    /* get slope m between two points and inverse tangent of m */
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
}

window.addEventListener("load", draw_dots);
window.addEventListener("resize", draw_dots);
window.addEventListener("wheel", draw_dots);
