import { Meta } from "@storybook/web-components";
import { rgb } from "d3";
import { html } from "lit-html";
import { range } from "../../packages/nightingale-track-canvas/src/helpers/utils";
import "../../packages/nightingale-track-canvas/src/index";


export default { title: "Components/Tracks/NightingaleTrack-Canvas" } as Meta;

const N_TRACKS = 1;
const SHOW_NIGHTINGALE_TRACK = true;
const SHOW_NIGHTINGALE_TRACK_CANVAS = true;

const N_SEQ_REPEAT = 1;

const seq = "iubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASVCASFU";
const defaultSequence = repStr(seq, N_SEQ_REPEAT);
function repStr(str: string, n: number) {
  return new Array(n).fill(0).map(() => str).join('');
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
// const ResidueColors = ["#eeeeff", "#ddddff", "#ccccff", "#bbbbff", "#aaaaff", "#8888ff", "#6666ff", "#4444ff", "#2222ff", "#0000ff",];
// const ResidueColors = ['#111111', '#ffeedd'];
// const ResidueColors = ['green'];
const ResidueShapes = [
  "rectangle", "roundRectangle", "line", "rectangle", "bridge",
  "discontinuosEnd", "discontinuos", "discontinuosStart",
  "helix", "strand",
  "circle", "triangle", "diamond", "pentagon", "hexagon",
  "chevron", "catFace", "arrow", "wave", "doubleBar",
];
const perResidueData = range(defaultSequence.length).map(i => ({
  accession: `feature${i}`,
  start: i + 1,
  end: i + 1,
  // locations: [{ fragments: [{ start: i + 1, end: i + 1 }] }],
  color: rgb(ResidueColors[i % ResidueColors.length]).darker(),
  fill: ResidueColors[i % ResidueColors.length],
  // color: '#000000',
  // fill: '#00ffee',
  shape: ResidueShapes[i % ResidueShapes.length],
  opacity: 0.9,
}));

const spanLength = 10;
const spanData = range(defaultSequence.length / spanLength).map(i => ({
  accession: `feature${i}`,
  start: i * spanLength + 1,
  end: (i + 1) * spanLength - 1,
  // locations: [{ fragments: [{ start: i + 1, end: i + 1 }] }],
  color: rgb(ResidueColors[i % ResidueColors.length]).darker(),
  fill: ResidueColors[i % ResidueColors.length],
  shape: ResidueShapes[Math.floor(i / 2) % ResidueShapes.length],
  opacity: 0.9,
}));

const data = spanData;
// const data = [...spanData, ...perResidueData,];


console.time("Loading all")
export const ManyTracks = () => {
  const args = {
    "min-width": 500,
    height: 50,
    length: defaultSequence.length,
    sequence: defaultSequence,
    "display-start": 1,
    "display-end": defaultSequence.length,
    "highlight-color": "#EB3BFF22",
    "margin-color": "transparent",
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
          id="track-${i}"
          min-width="${args["min-width"]}"
          height=${args.trackHeight}
          length="${args.length}"
          display-start="${args["display-start"]}"
          display-end="${args["display-end"]}"
          highlight-event="onmouseover"
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
          id="canvas-track-${i}"
          min-width="${args["min-width"]}"
          height=${args.trackHeight}
          length="${args.length}"
          display-start="${args["display-start"]}"
          display-end="${args["display-end"]}"
          highlight-event="onmouseover"
          highlight-color="${args["highlight-color"]}"
          margin-color=${args["margin-color"]}
          use-ctrl-to-zoom
          layout="${args.layout}"
        >
        </nightingale-track-canvas>
      </div>`;
    return html`
      ${SHOW_NIGHTINGALE_TRACK ? nightingaleTrack : ''}
      ${SHOW_NIGHTINGALE_TRACK_CANVAS ? nightingaleTrackCanvas : ''}
      `;
  });

  return html`
  <nightingale-saver
  element-id="root"
  background-color="white"
  scale-factor="2"
  ></nightingale-saver>
  Use Ctrl+scroll to zoom.
  <div id="root">
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
            highlight-event="onmouseover"
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
  console.timeEnd("Loading all")
  console.time("play")
  await customElements.whenDefined("nightingale-track-canvas");
  console.log(`Initializing ${N_TRACKS} tracks (${N_TRACKS * data.length} items)`)
  console.time("Initializing")
  for (let i = 0; i < N_TRACKS; i++) {
    setTrackData(`track-${i}`, data);
    setTrackData(`canvas-track-${i}`, data);
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
