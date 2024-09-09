import NightingaleElement, {
  bindEvents,
  customElementOnce,
  withDimensions,
  withHighlight,
  withManager,
  withMargin,
  withPosition,
  withResizable,
  withZoom,
} from "@nightingale-elements/nightingale-new-core";
import { select, Selection } from "d3";

// import _includes from "lodash-es/includes";
// import _groupBy from "lodash-es/groupBy";
// import _union from "lodash-es/union";
// import _intersection from "lodash-es/intersection";

import { html } from "lit";
import { property } from "lit/decorators.js";

import { getColorByType, getShapeByType } from "./ConfigHelper";
import DefaultLayout from "./DefaultLayout";
import FeatureShape, { Shapes } from "./FeatureShape";
import { findPredecessorIndex, Refresher } from "./helpers";
import NonOverlappingLayout from "./NonOverlappingLayout";


export type FeatureLocation = {
  fragments: Array<{
    start: number;
    end: number;
  }>;
};
export type Feature = {
  accession: string;
  color?: string;
  fill?: string;
  shape?: Shapes;
  tooltipContent?: string;
  type?: string;
  locations?: Array<FeatureLocation>;
  feature?: Feature;
  start?: number;
  end?: number;
  opacity?: number;
};
type ExtendedFragment = FeatureLocation["fragments"][number] & { featureIndex: number, location: FeatureLocation };

// TODO: height is not triggering a full redrawn when is changed after first render
const ATTRIBUTES_THAT_TRIGGER_REFRESH = ["length", "width", "height"];

@customElementOnce("nightingale-track-canvas")
class NightingaleTrackCanvas extends withManager(
  withZoom(
    withResizable(
      withMargin(
        withPosition(withDimensions(withHighlight(NightingaleElement))),
      ),
    ),
  ),
) {
  @property({ type: String })
  color?: string | null;
  @property({ type: String })
  shape?: string | null;
  @property({ type: String })
  layout?: "non-overlapping" | "default";
  @property({ type: String })
  foo?: string;

  protected featureShape = new FeatureShape();
  protected layoutObj?: DefaultLayout | NonOverlappingLayout;
  #originalData: Feature[] = [];
  #data: Feature[] = [];
  filters = null;
  protected canvasCtx?: CanvasRenderingContext2D;

  protected seqG?: Selection<
    SVGGElement,
    unknown,
    HTMLElement | SVGElement | null,
    unknown
  >;
  #highlighted?: Selection<
    SVGGElement,
    unknown,
    HTMLElement | SVGElement | null,
    unknown
  >;
  protected margins?: Selection<
    SVGGElement,
    unknown,
    HTMLElement | SVGElement | null,
    unknown
  >;

  getLayout() {
    if (String(this.layout).toLowerCase() === "non-overlapping")
      return new NonOverlappingLayout({
        layoutHeight: this.height,
      });
    return new DefaultLayout({
      layoutHeight: this.height,
      margin: {
        top: this["margin-top"],
        bottom: this["margin-bottom"],
        left: this["margin-left"],
        right: this["margin-right"],
      },
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.layoutObj = this.getLayout();
    if (this.#data) this.createTrack();

    // TODO: re-enable when the dataloadre is implemented
    // this.addEventListener("load", (e) => {
    //   if (_includes(this.children, e.target)) {
    //     this.data = e.detail.payload;
    //   }
    // });
  }

  static normalizeLocations(data: Feature[]) {
    return data.map((obj) => {
      const { locations, start, end } = obj;
      return locations
        ? obj
        : Object.assign(obj, {
          locations: [
            {
              fragments: [
                {
                  start,
                  end,
                },
              ],
            },
          ],
        });
    });
  }

  processData(data: Feature[]) {
    this.#originalData = NightingaleTrackCanvas.normalizeLocations(data);
  }

  set data(data: Feature[]) {
    this.processData(data);
    this.applyFilters();
    this.layoutObj = this.getLayout();
    this.createTrack();
  }
  get data() {
    return this.#data;
  }
  // TODO: re-enable filters
  // set filters(filters) {
  //   this._filters = filters;
  //   this.applyFilters();
  //   this.createTrack();
  // }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (
      ATTRIBUTES_THAT_TRIGGER_REFRESH.includes(name) ||
      name.startsWith("margin-")
    ) {
      this.applyFilters();
      this.layoutObj = this.getLayout();
      this.createTrack();
    }
  }

  protected getFeatureColor(f: Feature | { feature: Feature }): string {
    const defaultColor = "gray";
    if ((f as Feature).color) {
      return (f as Feature).color || defaultColor;
    }
    if ((f as { feature: Feature })?.feature?.color) {
      return (f as { feature: Feature })?.feature?.color || defaultColor;
    }
    if (this.color) {
      return this.color;
    }
    if ((f as Feature).type) {
      return getColorByType((f as Feature).type as string);
    }
    if ((f as { feature: Feature })?.feature?.type) {
      return getColorByType((f as { feature: Feature }).feature.type as string);
    }
    return defaultColor;
  }

  protected getFeatureFillColor(f: Feature | { feature: Feature }) {
    const defaultColor = "gray";
    if ((f as Feature).fill) {
      return (f as Feature).fill || defaultColor;
    }
    if ((f as { feature: Feature })?.feature?.fill) {
      return (f as { feature: Feature }).feature.fill || defaultColor;
    }
    return this.getFeatureColor(f);
  }

  protected getShape(f: Feature | { feature: Feature }): Shapes {
    const defaultShape = "rectangle";
    if ((f as Feature).shape) {
      return (f as Feature).shape || defaultShape;
    }
    if ((f as { feature: Feature })?.feature?.shape) {
      return (f as { feature: Feature }).feature.shape || defaultShape;
    }
    if (this.shape) {
      return this.shape as Shapes;
    }
    if ((f as Feature).type) {
      return getShapeByType((f as Feature).type as string) as Shapes;
    }
    if ((f as { feature: Feature }).feature?.type) {
      return getShapeByType(
        (f as { feature: Feature }).feature.type as string,
      ) as Shapes;
    }
    return defaultShape;
  }

  private readonly SVG_TAG: "svg" | "canvas" = "canvas";

  protected createTrack() {
    // console.log(`NightingaleTrackCanvas.createTrack`)
    if (!this.#data) {
      return;
    }
    this.layoutObj?.init(this.#data);

    this.svg?.selectAll("g").remove();

    select(this).selectAll("svg").style("background-color", "#ddddff");
    select(this).selectAll("canvas").style("background-color", "#bbeecc");

    this.svg = select(this as unknown as NightingaleElement)
      .selectAll<SVGSVGElement, unknown>(this.SVG_TAG)
      .attr("width", this.width)
      .attr("height", this.height);

    if (!this.svg) return;
    if (this.foo?.includes("no-track")) return;
    if (this.SVG_TAG === "svg") {
      this.seqG = this.svg.append("g").attr("class", "sequence-features");
      this.#highlighted = this.svg.append("g").attr("class", "highlighted");
      this.margins = this.svg.append("g").attr("class", "margin");
    }
    if (this.SVG_TAG === "canvas") {
      const ctx = (this.svg as unknown as Selection<HTMLCanvasElement, unknown, HTMLElement, unknown>).node()?.getContext("2d");
      // console.log("getting canvas ctx", ctx)
      if (ctx) {
        ctx.canvas.width = this.width;
        ctx.canvas.height = this.height;
        this.canvasCtx = ctx;
      }
    }
    this.createFeatures();
  }

  private allFragments?: ExtendedFragment[];
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
    allFragments.sort((a, b) => a.start - b.start);
    return allFragments;
  }

  protected createFeatures() {
    if (this.foo?.includes("no-features")) return;

    this.allFragments = this.getAllFragments();

    if (!this.seqG) return;
    const featuresG = this.seqG.selectAll("g.feature-group").data(this.#data);

    const locationsG = featuresG
      .enter()
      .append("g")
      .attr("class", "feature-group")
      .attr("id", (d) => `g_${d.accession}`)
      .selectAll("g.location-group")
      .data((d) =>
        (d.locations || []).map((loc) =>
          Object.assign({}, loc, {
            feature: d,
          }),
        ),
      )
      .enter()
      .append("g")
      .attr("class", "location-group");

    const fragmentGroup = locationsG
      .selectAll("g.fragment-group")
      .data((d) =>
        d.fragments.map((loc) =>
          Object.assign({}, loc, {
            feature: d.feature,
          }),
        ),
      )
      .enter()
      .append("g")
      .attr("class", "fragment-group");

    fragmentGroup
      .append("path")
      .attr("class", (f) => `${this.getShape(f)} feature`)
      .attr("d", (f) =>
        this.featureShape.getFeatureShape(
          this.getSingleBaseWidth(),
          this.layoutObj?.getFeatureHeight() || 0,
          f.end ? f.end - f.start + 1 : 1,
          this.getShape(f),
        ),
      )
      .attr(
        "transform",
        (f) =>
          `translate(${this.getXFromSeqPosition(f.start)},${this.layoutObj?.getFeatureYPos(f.feature) || 0
          })`,
      )
      .style("fill", (f) => this.getFeatureFillColor(f))
      .attr("stroke", (f) => this.getFeatureColor(f))
      .style("fill-opacity", ({ feature }) =>
        feature.opacity ? feature.opacity : 0.9,
      )
      .style("stroke-opacity", ({ feature }) =>
        feature.opacity ? feature.opacity : 0.9,
      );

    fragmentGroup
      .append("rect")
      .attr("class", "outer-rectangle feature")
      .attr("width", (f) =>
        Math.max(
          0,
          this.getSingleBaseWidth() * (f.end ? f.end - f.start + 1 : 1),
        ),
      )
      .attr("height", this.layoutObj?.getFeatureHeight() || 0)
      .attr(
        "transform",
        (f) =>
          `translate(${this.getXFromSeqPosition(f.start)},${this.layoutObj?.getFeatureYPos(f.feature) || 0
          })`,
      )
      .style("fill", "transparent")
      .attr("stroke", "transparent")
      .call(bindEvents, this);
  }

  private applyFilters() {
    if ((this.filters || []).length <= 0) {
      this.#data = this.#originalData;
      return;
    }
    // TODO: re-enable filters
    //   // Filters are OR-ed within a category and AND-ed between categories
    //   const groupedFilters = _groupBy(this._filters, "category");
    //   const filteredGroups = Object.values(groupedFilters).map((filterGroup) => {
    //     const filteredData = filterGroup.map((filterItem) =>
    //       filterItem.filterFn(this.#originalData)
    //     );
    //     return _union(...filteredData);
    //   });
    //   const intersection = _intersection(...filteredGroups);
    //   this._data = intersection;
  }

  private requestDraw = () => this._drawer.requestRefresh();
  private readonly _drawer = Refresher(() => {
    this.canvasDrawFeatures();
  });

  private canvasDrawFeatures() {
    if (!this.canvasCtx) return;
    // console.time("canvasDrawFeatures") // ~0.025-0.1 ms without manipulating canvas, ~0.2 ms with drawing rects individually (sequence length 400)
    const canvasWidth = this.canvasCtx.canvas.width;
    const canvasHeight = this.canvasCtx.canvas.height;
    this.canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (!this.allFragments) return;
    const baseWidth = this.getSingleBaseWidth();
    const height = this.layoutObj?.getFeatureHeight() ?? 0;
    const featureYs: Record<number, number> = {};
    const featureColors: Record<number, string> = {};
    const leftEdgeSeq = this.xScale?.invert(-this["margin-left"]) ?? -Infinity;
    const rightEdgeSeq = this.xScale?.invert(canvasWidth - this["margin-left"]) ?? Infinity;
    // This is better than this["display-start"], this["display-end"]+1, because it contains margins

    const start = 0, end = this.allFragments.length;
    // This assumes all fragments have length 1!:
    // const start = findPredecessorIndex(this.allFragments, Math.ceil(leftEdgeSeq), f => f.start + 1);
    // const end = findPredecessorIndex(this.allFragments, Math.floor(rightEdgeSeq) + 1, f => f.start);
    // TODO store fragments in a smart structure to filter visible quickly without 
    for (let i = start; i < end; i++) {
      const fragment: ExtendedFragment = this.allFragments[i];
      const iFeature = fragment.featureIndex;
      const endExcl = (fragment.end ?? fragment.start) + 1;
      if (endExcl < leftEdgeSeq || fragment.start > rightEdgeSeq) continue;
      const x = this.getXFromSeqPosition(fragment.start); // TODO try calculate from this["margin-left"], this.xScale.domain, this.xScale.range?
      const fragmentLength = endExcl - fragment.start;
      const width = fragmentLength * baseWidth;
      const y = featureYs[iFeature] ??= (this.layoutObj?.getFeatureYPos(this.data[iFeature]) ?? 0);
      this.canvasCtx.fillStyle = featureColors[iFeature] ??= this.getFeatureFillColor(this.data[iFeature]);
      this.canvasCtx.fillRect(x, y, width, height);
    }
    // console.timeEnd("canvasDrawFeatures")
  }

  refresh() {
    if (this.foo?.includes("no-refresh")) return;
    this.requestDraw();
    if (this.xScale && this.seqG) {
      const fragmentG = this.seqG.selectAll("g.fragment-group").data(
        this.#data.reduce(
          (acc: unknown[], f) =>
            acc.concat(
              (f.locations || []).reduce(
                (acc2: unknown[], e) =>
                  acc2.concat(
                    e.fragments.map((loc) =>
                      Object.assign({}, loc, {
                        feature: f,
                      }),
                    ),
                  ),
                [],
              ),
            ),
          [],
        ),
      );

      fragmentG
        .selectAll<SVGPathElement, Feature>("path.feature")
        .attr("d", (f) =>
          this.featureShape.getFeatureShape(
            this.getSingleBaseWidth(),
            this.layoutObj?.getFeatureHeight() || 0,
            f?.end && f?.start ? f.end - f.start + 1 : 1,
            this.getShape(f),
          ),
        )
        .attr(
          "transform",
          (f) =>
            `translate(${this.getXFromSeqPosition(
              f.start || 0,
            )},${this.layoutObj?.getFeatureYPos(f.feature as Feature)})`,
        );

      fragmentG
        .selectAll<SVGRectElement, Feature>("rect.outer-rectangle")
        .attr("width", (f) =>
          Math.max(
            0,
            this.getSingleBaseWidth() *
            (f?.end && f?.start ? f.end - f.start + 1 : 1),
          ),
        )
        .attr("height", this.layoutObj?.getFeatureHeight() || 0)
        .attr(
          "transform",
          (f) =>
            `translate(${this.getXFromSeqPosition(f.start || 0)},${this.layoutObj?.getFeatureYPos(f.feature as Feature) || 0
            })`,
        );
    }
    this.updateHighlight();

    this.renderMarginOnGroup(this.margins);
  }

  protected updateHighlight() {
    if (!this.#highlighted) return;
    const highlighs = this.#highlighted
      .selectAll<
        SVGRectElement,
        {
          start: number;
          end: number;
        }[]
      >("rect")
      .data(this.highlightedRegion.segments);

    highlighs
      .enter()
      .append("rect")
      .style("pointer-events", "none")
      .merge(highlighs)
      .attr("fill", this["highlight-color"])
      .attr("height", this.height)
      .attr("x", (d) => this.getXFromSeqPosition(d.start))
      .attr("width", (d) =>
        Math.max(0, this.getSingleBaseWidth() * (d.end - d.start + 1)),
      );

    highlighs.exit().remove();
  }

  zoomRefreshed() {
    if (this.getWidthWithMargins() > 0) this.refresh();
  }

  firstUpdated() {
    this.createTrack();
  }

  render() {
    if (this.SVG_TAG === "svg")
      return html`<svg class="container"></svg>`;
    if (this.SVG_TAG === "canvas")
      return html`<canvas class="container"></canvas>`;
  }
}

export default NightingaleTrackCanvas;

export { DefaultLayout, getColorByType };

