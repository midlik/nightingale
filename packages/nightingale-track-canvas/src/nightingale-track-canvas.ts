import NightingaleElement, { customElementOnce } from "@nightingale-elements/nightingale-new-core";
import NightingaleTrack, { FeatureLocation } from "@nightingale-elements/nightingale-track";
import { select, Selection } from "d3";
import { html } from "lit";
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
          <svg style="background-color: rgb(255,200,0,0.2);"></svg>
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
    if (!this.canvasCtx) return;
    // console.time("canvasDrawFeatures") // ~0.025-0.1 ms without manipulating canvas, ~0.2 ms with drawing rects individually (sequence length 400)
    const canvasWidth = this.canvasCtx.canvas.width;
    const canvasHeight = this.canvasCtx.canvas.height;
    this.canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.canvasCtx.lineWidth = this.canvasScale * 1;//0.5;
    if (!this.fragmentCollection) return;
    const baseWidth = this.getSingleBaseWidth();
    const height = this.canvasScale * (this.layoutObj?.getFeatureHeight() ?? 0);
    const featureYs: Record<number, number> = {};
    const featureStrokeColors: Record<number, string> = {};
    const featureFillColors: Record<number, string> = {};
    const featureOpacities: Record<number, number> = {};
    // const leftEdgeSeq = this.xScale?.invert(0) ?? -Infinity; // debug
    // const rightEdgeSeq = this.xScale?.invert((canvasWidth / this.canvasScale) - 2 * this["margin-left"]) ?? Infinity; // debug
    const leftEdgeSeq = this.xScale?.invert(-this["margin-left"]) ?? -Infinity;
    const rightEdgeSeq = this.xScale?.invert(canvasWidth - this["margin-left"]) ?? Infinity;
    // This is better than this["display-start"], this["display-end"]+1, because it contains margins

    for (const fragment of this.fragmentCollection.overlappingItems(leftEdgeSeq, rightEdgeSeq)) {
      const iFeature = fragment.featureIndex;
      const endExcl = (fragment.end ?? fragment.start) + 1;
      const x = this.canvasScale * this.getXFromSeqPosition(fragment.start); // TODO try calculate from this["margin-left"], this.xScale.domain, this.xScale.range?
      const fragmentLength = endExcl - fragment.start;
      const width = this.canvasScale * fragmentLength * baseWidth;
      const y = featureYs[iFeature] ??= this.canvasScale * (this.layoutObj?.getFeatureYPos(this.data[iFeature]) ?? 0);
      this.canvasCtx.fillStyle = featureFillColors[iFeature] ??= this.getFeatureFillColor(this.data[iFeature]);
      this.canvasCtx.strokeStyle = featureStrokeColors[iFeature] ??= this.getFeatureColor(this.data[iFeature]);
      this.canvasCtx.globalAlpha = featureOpacities[iFeature] ??= (this.data[iFeature].opacity ?? 0.9);
      this.canvasCtx.fillRect(x, y, width, height);
      this.canvasCtx.strokeRect(x, y, width, height);
    }
    // console.timeEnd("canvasDrawFeatures")
  }
}


function getDevicePixelRatio(): number {
  return window?.devicePixelRatio ?? 1;
}
