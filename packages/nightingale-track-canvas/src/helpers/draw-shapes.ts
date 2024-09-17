import { Shapes } from "@nightingale-elements/nightingale-track";


export function drawLine(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number): void {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

export function drawUnknown(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  ctx.arc(cx, cy - 0.5 * r, 0.2 * r, 0.25 * Math.PI, 1 * Math.PI, true);
  ctx.arc(cx - 0.35 * r, cy - 0.5 * r, 0.15 * r, 0, 1 * Math.PI, false);
  ctx.arc(cx, cy - 0.5 * r, 0.5 * r, 1 * Math.PI, 0.25 * Math.PI, false);
  ctx.arc(cx + 0.25 * r, cy + 0.3 * r, 0.2 * r, 1.25 * Math.PI, 1 * Math.PI, true);
  ctx.arc(cx + 0.25 * r - 0.35 * r, cy + 0.3 * r, 0.15 * r, 0, 1 * Math.PI, false);
  ctx.arc(cx + 0.25 * r, cy + 0.3 * r, 0.5 * r, 1 * Math.PI, 1.25 * Math.PI, false);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx + 0.25 * r - 0.35 * r, cy + 0.85 * r, 0.15 * r, 0, 2 * Math.PI, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/** Try to draw a symbol and return true. Draw nothing and return false if `shape` is not supported. */
export function drawSymbol(ctx: CanvasRenderingContext2D, shape: Shapes, cx: number, cy: number, r: number): boolean {
  const drawer = DrawSymbol[shape];
  if (drawer) {
    drawer(ctx, cx, cy, r);
    return true;
  } else {
    return false;
  }
}

/** Try to draw a range and return true. Draw nothing and return false if `shape` is not supported. */
export function drawRange(ctx: CanvasRenderingContext2D, shape: Shapes, x: number, y: number, width: number, height: number): boolean {
  const drawer = DrawRange[shape];
  if (drawer) {
    drawer(ctx, x, y, width, height);
    return true;
  } else {
    return false;
  }
}


type SymbolDrawer = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => void;

const DrawSymbol: Partial<Record<Shapes, SymbolDrawer>> = {
  circle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  },

  /** This is actually not an equilateral triangle, therefore not using `drawPolygon` */
  triangle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy + r);
    ctx.lineTo(cx - r, cy + r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },

  diamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },

  pentagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    return drawPolygon(ctx, 5, cx, cy, r);
  },

  hexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    return drawPolygon(ctx, 6, cx, cy, r);
  },

  chevron(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.lineTo(cx - r, cy - r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },

  catFace(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    const r02 = 0.2 * r;
    const r04 = 0.4 * r;
    const r10 = r;
    ctx.beginPath();
    ctx.moveTo(cx + r04, cy - r02);
    ctx.lineTo(cx + r10, cy - r10);
    ctx.lineTo(cx + r10, cy + r02);
    ctx.lineTo(cx + r04, cy + r10);
    ctx.lineTo(cx - r04, cy + r10);
    ctx.lineTo(cx - r10, cy + r02);
    ctx.lineTo(cx - r10, cy - r10);
    ctx.lineTo(cx - r04, cy - r02);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },

  arrow(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    const r01 = 0.1 * r;
    const r04 = 0.4 * r;
    const r08 = 0.8 * r;
    const r12 = 1.2 * r;
    ctx.beginPath();
    ctx.moveTo(cx - r01, cy - r12);
    ctx.lineTo(cx - r08, cy - r04);
    ctx.lineTo(cx - r01, cy + r12);
    ctx.lineTo(cx + r01, cy + r12);
    ctx.lineTo(cx + r08, cy - r04);
    ctx.lineTo(cx + r01, cy - r12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },

  wave(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    const r05 = 0.5 * r;
    ctx.beginPath();
    ctx.ellipse(cx - r05, cy, r05, r, 0, Math.PI, 0, false);
    ctx.ellipse(cx + r05, cy, r05, r, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },

  doubleBar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy + r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },
};


type RangeDrawer = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => void;

const DrawRange: Partial<Record<Shapes, RangeDrawer>> = {
  rectangle(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
  }
};


function drawPolygon(ctx: CanvasRenderingContext2D, n: number, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(cx + r, cy);
  for (let i = 1; i < n; i++) {
    const phase = 2 * Math.PI * i / n;
    const x = cx + r * Math.cos(phase);
    const y = cy + r * Math.sin(phase);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
