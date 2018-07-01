var dots_div = document.getElementById("dots");
var lines_div = document.getElementById("lines");

/* current mouse position */
var mouse = {x: 0, y: 0};
document.addEventListener("mousemove", event => {
  mouse.x = event.pageX;
  mouse.y = event.pageY;
});

/* draw a line between two points p1 and p2 if less than threshold apart */
function draw_line(p1, p2, threshold) {
  let dist = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x)
                       + (p1.y - p2.y) * (p1.y - p2.y));
  if (dist < threshold) {
    let line = document.createElement("div");
    line.className = "line";
    line.style.width = dist + "px";
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

/* move all dots sequentially */
var move = [];
setInterval(() => {
  /* clear all old lines */
  while (lines_div.firstChild)
    lines_div.removeChild(lines_div.firstChild);

  /* execute all move functions */
  let pos = move.map(m => m());

  /* draw any new lines */
  for (let i = 0; i < pos.length; i++) {
    draw_line(pos[i], mouse, 100);
    for (let j = i+1; j < pos.length; j++)
      draw_line(pos[i], pos[j], 100);
  }
}, 5);

/* initialize a dot */
function init_dot(dot) {
  /* provide random x, y, direction, and speed */
  let x = Math.random() * (window.innerWidth - 5);
  let y = Math.random() * (window.innerHeight - 5);
  let ang = Math.random() * 2 * Math.PI;
  let speed = Math.random() * 0.3 + 0.3;

  dot.className = "circle";
  dots_div.appendChild(dot);

  /* tell this dot to move
     yay for closures! */
  move.push(() => {
    x += speed * Math.cos(ang);
    y += speed * Math.sin(ang);

    if (x < 0 || x > window.innerWidth - 5)
      ang = Math.PI - ang;
    if (y < 0 || y > window.innerHeight - 5)
      ang = 2 * Math.PI - ang;

    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;

    /* return this dot's current position */
    return {x: x, y: y};
  });
}

/* init div with a bunch of random dots */
for (let i = 0; i < 50; i++)
  init_dot(document.createElement("div"));
