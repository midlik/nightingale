import { customElementOnce } from "@nightingale-elements/nightingale-new-core";
import NightingaleTrack, { FeatureLocation, Shapes } from "@nightingale-elements/nightingale-track";
import { select, Selection } from "d3";
import { html } from "lit";
import { drawRange, drawSymbol, drawUnknown } from "./helpers/draw-shapes";
import { RangeCollection, Refresher } from "./helpers/utils";


type ExtendedFragment = FeatureLocation["fragments"][number] & { featureIndex: number, location: FeatureLocation };


@customElementOnce("nightingale-track-canvas")
export default class NightingaleTrackCanvas extends NightingaleTrack {
  private canvas?: Selection<HTMLCanvasElement, unknown, HTMLElement, unknown>;
  private canvasCtx?: CanvasRenderingContext2D;
  /** Ratio of canvas logical size versus canvas display size */
  private canvasScale: number = 1;


  override connectedCallback(): void {
    super.connectedCallback();
    select(window).on('resize.NightingaleTrackCanvas', () => {
      const devicePixelRatio = getDevicePixelRatio();
      if (devicePixelRatio !== this.canvasScale) {
        this.canvasScale = devicePixelRatio;
        this.refresh();
      }
    });
  }
  override disconnectedCallback(): void {
    select(window).on('resize.NightingaleTrackCanvas', null);
    super.disconnectedCallback();
  }

  override onDimensionsChange(): void {
    super.onDimensionsChange();
    if (this.canvas && !this.canvas.empty()) {
      this.canvas.style("width", `${this.width}px`);
      this.canvas.style("height", `${this.height}px`);
      this.canvasScale = getDevicePixelRatio();
    }
  }

  protected override createTrack() {
    console.log('createTrack')
    if (!this.data) return;
    this.layoutObj?.init(this.data);
    this.svg = select(this).selectAll<SVGSVGElement, unknown>("svg");
    this.canvas = select(this).selectAll<HTMLCanvasElement, unknown>("canvas");
    this.canvasCtx = this.canvas.node()?.getContext("2d") ?? undefined;
    this.onDimensionsChange();
    this.createFeatures();
  }

  protected override createFeatures() {
    // this.allFragments = this.getAllFragments();
    this.fragmentCollection = this.getFragmentCollection();
  }

  override refresh() {
    super.refresh();
    this.requestDraw();
  }

  override render() {
    return html`
      <div class="container">
        <div style="position: relative;">
          <canvas style="position: absolute; left: 0; top: 0; z-index: -1;"></canvas>
          <svg></svg>
        </div>
      </div>
    `;
  }


  // private allFragments?: ExtendedFragment[];
  private getAllFragments(): ExtendedFragment[] {
    const allFragments: ExtendedFragment[] = [];
    const nFeatures = this.data.length;
    for (let i = 0; i < nFeatures; i++) {
      const feature = this.data[i];
      if (!feature.locations) continue;
      for (const location of feature.locations) {
        for (const fragment of location.fragments) {
          allFragments.push({ ...fragment, featureIndex: i, location });
        }
      }
    }
    // allFragments.sort((a, b) => a.start - b.start);
    return allFragments;
  }
  private fragmentCollection?: RangeCollection<ExtendedFragment>;
  private getFragmentCollection(): RangeCollection<ExtendedFragment> {
    const fragments = this.getAllFragments();
    return new RangeCollection(fragments, { start: f => f.start, stop: f => (f.end ?? f.start) + 1 });
  }

  private requestDraw = () => this._drawer.requestRefresh();
  private readonly _drawer = Refresher(() => {
    this.adjustCanvasLogicalSize();
    this.canvasDrawFeatures();
  });

  private adjustCanvasLogicalSize() {
    if (!this.canvasCtx) return;
    const newWidth = Math.floor(this.width * this.canvasScale);
    const newHeight = Math.floor(this.height * this.canvasScale);
    if (this.canvasCtx.canvas.width !== newWidth) {
      this.canvasCtx.canvas.width = newWidth;
    }
    if (this.canvasCtx.canvas.height !== newHeight) {
      this.canvasCtx.canvas.height = newHeight;
    }
  }

  private canvasDrawFeatures() {
    const ctx = this.canvasCtx;
    if (!ctx) return;
    // console.time("canvasDrawFeatures") // ~0.025-0.1 ms without manipulating canvas, ~0.2 ms with drawing rects individually (sequence length 400)
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (!this.fragmentCollection) return;

    const scale = this.canvasScale;
    ctx.lineWidth = scale * 1;
    const baseWidth = scale * this.getSingleBaseWidth();
    const height = scale * (this.layoutObj?.getFeatureHeight() ?? 0);
    const optXPadding = Math.min(scale * 1.5, 0.25 * baseWidth); // to avoid overlap/touch for certain shapes (line, bridge, helix, strand)
    const featureYs: Record<number, number> = {};
    const featureStrokeColors: Record<number, string> = {};
    const featureFillColors: Record<number, string> = {};
    const featureOpacities: Record<number, number> = {};
    const featureShapes: Record<number, Shapes> = {};
    // const leftEdgeSeq = this.xScale?.invert(0) ?? -Infinity; // debug
    // const rightEdgeSeq = this.xScale?.invert((canvasWidth / scale) - 2 * this["margin-left"]) ?? Infinity; // debug
    const leftEdgeSeq = this.xScale?.invert(-this["margin-left"]) ?? -Infinity;
    const rightEdgeSeq = this.xScale?.invert(canvasWidth - this["margin-left"]) ?? Infinity;
    // This is better than this["display-start"], this["display-end"]+1, because it contains margins

    for (const fragment of this.fragmentCollection.overlappingItems(leftEdgeSeq, rightEdgeSeq)) {
      const iFeature = fragment.featureIndex;
      const endExcl = (fragment.end ?? fragment.start) + 1;
      const fragmentLength = endExcl - fragment.start;
      const x = scale * this.getXFromSeqPosition(fragment.start); // TODO try calculate from this["margin-left"], this.xScale.domain, this.xScale.range?
      const width = fragmentLength * baseWidth;
      const y = featureYs[iFeature] ??= scale * (this.layoutObj?.getFeatureYPos(this.data[iFeature]) ?? 0);
      const shape = featureShapes[iFeature] ??= this.getShape(this.data[iFeature]);
      ctx.fillStyle = featureFillColors[iFeature] ??= this.getFeatureFillColor(this.data[iFeature]);
      ctx.strokeStyle = featureStrokeColors[iFeature] ??= this.getFeatureColor(this.data[iFeature]);
      ctx.globalAlpha = featureOpacities[iFeature] ??= (this.data[iFeature].opacity ?? 0.9);

      const rangeDrawn = drawRange(ctx, shape, x, y, width, height, optXPadding, fragmentLength);
      if (!rangeDrawn) {
        const cx = x + 0.5 * width;
        const cy = y + 0.5 * height;
        const r = scale * 0.5 * SYMBOL_SIZE;
        const symbolDrawn = drawSymbol(ctx, shape, cx, cy, r);
        if (!symbolDrawn) {
          this.printUnknownShapeWarning(shape);
          drawUnknown(ctx, cx, cy, r);
        }
        if (fragmentLength > 1) {
          drawRange(ctx, 'line', x, y, width, height, optXPadding, fragmentLength);
        }
      }
    }
    // console.timeEnd("canvasDrawFeatures")
  }
  private _unknownShapeWarningPrinted = new Set<Shapes>();
  private printUnknownShapeWarning(shape: Shapes): void {
    if (!this._unknownShapeWarningPrinted.has(shape)) {
      console.warn(`NightingaleTrackCanvas: Drawing shape '${shape}' is not implemented. Will draw question marks instead ¯\\_(ツ)_/¯`);
      this._unknownShapeWarningPrinted.add(shape);
    }
  }
}


function getDevicePixelRatio(): number {
  return window?.devicePixelRatio ?? 1;
}


// Magic number from packages/nightingale-track/src/FeatureShape.ts:
const SYMBOL_SIZE = 10;