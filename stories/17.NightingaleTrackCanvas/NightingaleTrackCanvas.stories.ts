import { Meta } from "@storybook/web-components";
import { rgb } from "d3";
import { html } from "lit-html";
import { range } from "../../packages/nightingale-track-canvas/src/utils/utils";
import "../../packages/nightingale-track-canvas/src/index";


export default { title: "Components/Tracks/NightingaleTrack-Canvas" } as Meta;

const N_TRACKS = 1;
const SHOW_NIGHTINGALE_TRACK = true;
const SHOW_NIGHTINGALE_TRACK_CANVAS = true;

const N_SEQ_REPEAT = 1;

const seq = "iubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASVCASFU";
const defaultSequence = repStr(seq, N_SEQ_REPEAT);
function repStr(str: string, n: number) {
  return new Array(n).fill(0).map(() => str).join("");
}

const defaultData = [
  {
    accession: "feature1",
    start: 1,
    end: 2,
    color: "pink",
  },
  {
    accession: "feature1",
    start: 49,
    end: 50,
    color: "red",
  },
  {
    accession: "feature1",
    start: 10,
    end: 20,
    color: "#342ea2",
  },
  {
    accession: "feature2",
    locations: [{ fragments: [{ start: 30, end: 45 }] }],
    color: "#A42ea2",
  },
  {
    accession: "feature3",
    locations: [
      {
        fragments: [{ start: 15, end: 15 }],
      },
      { fragments: [{ start: 18, end: 18 }] },
    ],
    color: "#A4Aea2",
  },
  {
    accession: "feature4",
    locations: [
      {
        fragments: [
          { start: 20, end: 23 },
          { start: 26, end: 32 },
        ],
      },
    ],
  },
];


const ResidueColors = ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d"];
const ResidueColorsShades = ["#eeeeff", "#ddddff", "#ccccff", "#bbbbff", "#aaaaff", "#8888ff", "#6666ff", "#4444ff", "#2222ff", "#0000ff",];
// const ResidueColors = ["#111111", "#ffeedd"];
// const ResidueColors = ["green"];
const ResidueShapes = [
  "rectangle", "roundRectangle", "line", "rectangle", "bridge",
  "discontinuosEnd", "discontinuos", "discontinuosStart",
  "helix", "strand",
  "circle", "triangle", "diamond", "pentagon", "hexagon",
  "chevron", "catFace", "arrow", "wave", "doubleBar",
];
const perResidueData = range(defaultSequence.length).map(i => ({
  accession: `feature${i}`,
  tooltipContent: `feature${i}`,
  start: i + 1,
  end: i + 1,
  // locations: [{ fragments: [{ start: i + 1, end: i + 1 }] }],
  color: rgb(ResidueColors[i % ResidueColors.length]).darker(),
  fill: ResidueColors[i % ResidueColors.length],
  // color: "#000000",
  // fill: "#00ffee",
  shape: ResidueShapes[i % ResidueShapes.length],
  opacity: 0.9,
}));

const spanLength = 10;
const spanData = range(defaultSequence.length / spanLength).map(i => ({
  accession: `feature${i}`,
  tooltipContent: `feature${i}`,
  start: i * spanLength + 1,
  end: (i + 1) * spanLength - 1,
  // locations: [{ fragments: [{ start: i * spanLength + 1, end: (i + 1) * spanLength - 1 }] }],
  color: rgb(ResidueColors[i % ResidueColors.length]).darker(),
  fill: ResidueColors[i % ResidueColors.length],
  shape: ResidueShapes[i % ResidueShapes.length],
  // shape: ResidueShapes[Math.floor(i / 2) % ResidueShapes.length],
  opacity: 0.9,
}));

const hierachicalData = [
  {
    accession: "feature_A",
    tooltipContent: "feature_A",
    color: "black", fill: ResidueColors[0], shape: "strand",
    start: 1, end: 40,
    locations: [
      { fragments: [{ start: 1, end: 40 }] }
    ],
  },
  {
    accession: "feature_B",
    tooltipContent: "feature_B",
    color: "black", fill: ResidueColors[1], shape: "strand",
    start: 54, end: 70,
    locations: [
      { fragments: [{ start: 54, end: 60 }] },
      { fragments: [{ start: 64, end: 70 }] },
    ],
  },
  {
    accession: "feature_C",
    tooltipContent: "feature_C",
    color: "black", fill: ResidueColors[2], shape: "strand",
    start: 80, end: 94,
    locations: [
      { fragments: [{ start: 80, end: 82 }, { start: 86, end: 88 }, { start: 92, end: 94 }] },
    ],
  },
  {
    accession: "feature_D",
    tooltipContent: "feature_D",
    color: "black", fill: ResidueColors[3], shape: "strand",
    start: 110, end: 138,
    locations: [
      { fragments: [{ start: 110, end: 112 }, { start: 116, end: 118 }] },
      { fragments: [{ start: 130, end: 132 }, { start: 136, end: 138 }] },
    ],
  },
  {
    accession: "feature_E",
    tooltipContent: "feature_E",
    color: "black", fill: ResidueColors[4], shape: "strand",
    start: 150, end: 176,
    locations: [
      { fragments: [{ start: 150, end: 150 }, { start: 156, end: 156 }] },
      { fragments: [{ start: 170 }, { start: 176 }] },
    ],
  },
  {
    accession: "feature_A2",
    tooltipContent: "feature_A2",
    color: "black", fill: ResidueColors[0], shape: "circle",
    start: 201, end: 240,
    locations: [
      { fragments: [{ start: 201, end: 240 }] }
    ],
  },
  {
    accession: "feature_B2",
    tooltipContent: "feature_B2",
    color: "black", fill: ResidueColors[1], shape: "circle",
    start: 254, end: 270,
    locations: [
      { fragments: [{ start: 254, end: 260 }] },
      { fragments: [{ start: 264, end: 270 }] },
    ],
  },
  {
    accession: "feature_C2",
    tooltipContent: "feature_C2",
    color: "black", fill: ResidueColors[2], shape: "circle",
    start: 280, end: 294,
    locations: [
      { fragments: [{ start: 280, end: 282 }, { start: 286, end: 288 }, { start: 292, end: 294 }] },
    ],
  },
  {
    accession: "feature_D2",
    tooltipContent: "feature_D2",
    color: "black", fill: ResidueColors[3], shape: "circle",
    start: 310, end: 338,
    locations: [
      { fragments: [{ start: 310, end: 312 }, { start: 316, end: 318 }] },
      { fragments: [{ start: 330, end: 332 }, { start: 336, end: 338 }] },
    ],
  },
  {
    accession: "feature_E2",
    tooltipContent: "feature_E2",
    color: "black", fill: ResidueColors[4], shape: "circle",
    start: 350, end: 376,
    locations: [
      { fragments: [{ start: 350, end: 350 }, { start: 356, end: 356 }] },
      { fragments: [{ start: 370 }, { start: 376 }] },
    ],
  },
];

function colors(color: string) { return { color: rgb(color).darker(), fill: color } }
const demoData = [
  ...range(70).map(i => ({
    accession: `feature${i}`,
    start: i + 5,
    end: i + 5,
    color: rgb(ResidueColorsShades[Math.floor(i / 5) % ResidueColorsShades.length]).darker(),
    fill: ResidueColorsShades[Math.floor(i / 5) % ResidueColorsShades.length],
  })),
  { start: 90, end: 130, ...colors("#4169e1"), shape: "rectangle" },
  { start: 131, end: 131, ...colors("#ff7900"), shape: "rectangle" },
  { start: 132, end: 132, ...colors("#ff7900"), shape: "rectangle" },
  { start: 133, end: 139, ...colors("#d3d3d3"), shape: "rectangle" },
  { start: 140, end: 155, ...colors("#4169e1"), shape: "rectangle" },

  { start: 170, end: 190, ...colors("#1b9e77"), shape: "roundRectangle" },
  { start: 195, end: 204, ...colors("#d95f02"), shape: "discontinuosEnd" },
  { start: 206, end: 214, ...colors("#7570b3"), shape: "discontinuos" },
  { start: 216, end: 225, ...colors("#e7298a"), shape: "discontinuosStart" },

  { start: 235, end: 244, ...colors("#9e9e9e"), shape: "line" },
  { start: 245, end: 265, ...colors("#ff64a4"), shape: "helix" },
  { start: 266, end: 269, ...colors("#9e9e9e"), shape: "line" },
  { start: 270, end: 290, ...colors("#ffcc02"), shape: "strand" },
  { start: 291, end: 295, ...colors("#9e9e9e"), shape: "line" },

  { start: 310, end: 310, ...colors("#1b9e77"), shape: "circle" },
  { start: 320, end: 320, ...colors("#d95f02"), shape: "triangle" },
  { start: 330, end: 330, ...colors("#7570b3"), shape: "diamond" },
  { start: 340, end: 340, ...colors("#e7298a"), shape: "pentagon" },
  { start: 350, end: 350, ...colors("#66a61e"), shape: "hexagon" },
  { start: 360, end: 360, ...colors("#e6ab02"), shape: "chevron" },
  { start: 370, end: 370, ...colors("#a6761d"), shape: "catFace" },
  { start: 380, end: 380, ...colors("#1b9e77"), shape: "arrow" },
  { start: 390, end: 390, ...colors("#d95f02"), shape: "wave" },
  { start: 400, end: 400, ...colors("#7570b3"), shape: "doubleBar" },
];

const data = hierachicalData;
// const data = [...spanData, ...perResidueData,];


// const HIGHLIGHT_EVENT = "onclick";
const HIGHLIGHT_EVENT = "onmouseover";

console.log("time Loading all: start")
console.time("time Loading all and rendering first")
console.time("time Loading all and rendering")
console.time("time Loading all")
export const ManyTracks = () => {
  const args = {
    "min-width": 500,
    height: 50,
    length: defaultSequence.length,
    sequence: defaultSequence,
    "display-start": 1,
    "display-end": defaultSequence.length,
    "highlight-color": "#EB3BFF22",
    // "margin-color": "transparent",
    "margin-color": "#ffffffdd",
    layout: "non-overlapping",
    // layout: "default",
    navigationHeight: 50,
    sequenceHeight: 30,
    trackHeight: 24,
  };

  const tracks = range(N_TRACKS).map(i => {
    const nightingaleTrack = html`
      <div style="line-height: 0; margin-top: 2px;">
        <nightingale-track
          id="track-${i === N_TRACKS - 1 ? "z" : i}"
          min-width="${args["min-width"]}"
          height=${args.trackHeight}
          length="${args.length}"
          display-start="${args["display-start"]}"
          display-end="${args["display-end"]}"
          highlight-event="${HIGHLIGHT_EVENT}"
          highlight-color="${args["highlight-color"]}"
          margin-color=${args["margin-color"]}
          use-ctrl-to-zoom
          layout="${args.layout}"
        >
        </nightingale-track>
      </div>`;
    const nightingaleTrackCanvas = html`
      <div style="line-height: 0; margin-top: 2px;">
        <nightingale-track-canvas
          id="canvas-track-${i === N_TRACKS - 1 ? "z" : i}"
          min-width="${args["min-width"]}"
          height=${args.trackHeight}
          length="${args.length}"
          display-start="${args["display-start"]}"
          display-end="${args["display-end"]}"
          highlight-event="${HIGHLIGHT_EVENT}"
          highlight-color="${args["highlight-color"]}"
          margin-color=${args["margin-color"]}
          use-ctrl-to-zoom
          layout="${args.layout}"
        >
        </nightingale-track-canvas>
      </div>`;
    return html`
      ${SHOW_NIGHTINGALE_TRACK ? nightingaleTrack : ""}
      ${SHOW_NIGHTINGALE_TRACK_CANVAS ? nightingaleTrackCanvas : ""}
      `;
  });

  return html`
  <nightingale-saver
    element-id="nightingale-root"
    background-color="white"
    scale-factor="2"
  ></nightingale-saver>
  Use Ctrl+scroll to zoom.
  <div id="nightingale-root">
    <nightingale-manager>
      <div style="display:flex; flex-direction: column; width: 100%;">
        <div style="line-height: 0">
          <nightingale-navigation
            id="navigation"
            min-width="${args["min-width"]}"
            height=${args.navigationHeight}
            length="${args.length}"
            display-start="${args["display-start"]}"
            display-end="${args["display-end"]}"
            highlight-color=${args["highlight-color"]}
            margin-color=${args["margin-color"]}
            show-highlight
          >
          </nightingale-navigation>
        </div>
        <div style="line-height: 0">
          <nightingale-sequence
            id="sequence"
            sequence=${args.sequence}
            min-width="${args["min-width"]}"
            height=${args.sequenceHeight}
            length="${args.length}"
            display-start="${args["display-start"]}"
            display-end="${args["display-end"]}"
            highlight-event="${HIGHLIGHT_EVENT}"
            highlight-color=${args["highlight-color"]}
            margin-color=${args["margin-color"]}
            use-ctrl-to-zoom
          >
          </nightingale-sequence>
        </div>
        ${tracks}
      </div>
    </nightingale-manager>
  </div>
`;
}

ManyTracks.play = async () => {
  console.timeEnd("time Loading all")
  console.time("play")
  await customElements.whenDefined("nightingale-track-canvas");
  console.log(`Initializing ${N_TRACKS} tracks (${N_TRACKS * data.length} items)`)
  console.time("Initializing")
  for (let i = 0; i < N_TRACKS; i++) {
    setTrackData(`track-${i === N_TRACKS - 1 ? "z" : i}`, data);
    setTrackData(`canvas-track-${i === N_TRACKS - 1 ? "z" : i}`, data);
  }
  console.timeEnd("Initializing")
  console.timeEnd("play")
};

function setTrackData(trackId: string, data: any) {
  const track = document.getElementById(trackId);
  if (track) {
    (track as any).data = data;
  }
}
