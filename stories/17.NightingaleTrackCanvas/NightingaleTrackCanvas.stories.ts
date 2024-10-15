import { Meta, Story } from "@storybook/web-components";
import { range, rgb } from "d3";
import { html } from "lit-html";
import "../../packages/nightingale-track-canvas/src/index";


export default { title: "Components/Tracks/NightingaleTrack-Canvas" } as Meta;


const baseSequence = "iubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASVCASFU";

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
const ResidueShapes = [
  "rectangle", "roundRectangle", "line", "rectangle", "bridge",
  "discontinuosEnd", "discontinuos", "discontinuosStart",
  "helix", "strand",
  "circle", "triangle", "diamond", "pentagon", "hexagon",
  "chevron", "catFace", "arrow", "wave", "doubleBar",
];


/** Create a sequence of given `length` */
function makeSequence(length: number) {
  const n = Math.ceil(length / baseSequence.length);
  return range(n).map(() => baseSequence).join("").slice(0, length);
}

/** Create dummy data with one feature per residue */
function makeResidueData(start: number, end: number) {
  return range(start, end + 1).map(i => ({
    accession: `feature${i}`,
    tooltipContent: `feature${i}`,
    start: i,
    end: i,
    color: rgb(ResidueColors[i % ResidueColors.length]).darker(),
    fill: ResidueColors[i % ResidueColors.length],
    shape: ResidueShapes[i % ResidueShapes.length],
    opacity: 0.9,
  }));
}

/** Create dummy data with one feature a span of residues (e.g. 1-9, 11-19, 21-29...) */
function makeSpanData(start: number, end: number, spanLength: number = 10) {
  return range(start, end + 1, spanLength).map((start_, i) => ({
    accession: `feature${i}`,
    tooltipContent: `feature${i}`,
    start: start_,
    end: start_ + spanLength - 2,
    color: rgb(ResidueColors[i % ResidueColors.length]).darker(),
    fill: ResidueColors[i % ResidueColors.length],
    shape: ResidueShapes[i % ResidueShapes.length],
    opacity: 0.9,
  }));
}

/** Create dummy data with examples of multiple features, multiple locations within a feature, and multiple fragments within a location. */
function makeHierachicalData() {
  return [
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
}

/** Create dummy data with real-life examples. */
function makeDemoData() {
  function colors(color: string) { return { color: rgb(color).darker(), fill: color }; }
  return [
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
}



const DefaultArgs = {
  "N_TRACKS": 1,
  "SHOW_NIGHTINGALE_TRACK": true,
  "SHOW_NIGHTINGALE_TRACK_CANVAS": true,
  "min-width": 500,
  "height": 24,
  "length": baseSequence.length,
  "highlight-event": "onmouseover", // "onmouseover"|"onclick"
  "highlight-color": "#EB3BFF22",
  "margin-color": "#ffffffdd", // "transparent"
  "layout": "non-overlapping", // "default"|"non-overlapping"
};
type Args = typeof DefaultArgs;

function nightingaleNavigation(args: Args) {
  return html`
    <div class="row">
      <div class="label"></div>
      <nightingale-navigation
        id="navigation"
        min-width="${args["min-width"]}"
        height="50"
        length="${args["length"]}"
        highlight-color=${args["highlight-color"]}
        margin-color=${args["margin-color"]}
        show-highlight
      >
      </nightingale-navigation>
    </div>`;
}

function nightingaleSequence(args: Args) {
  const sequence = makeSequence(args["length"]);
  return html`
    <div class="row">
      <div class="label"></div>
      <nightingale-sequence
        id="sequence"
        sequence=${sequence}
        min-width="${args["min-width"]}"
        height="30"
        length="${args["length"]}"
        highlight-event="${args["highlight-event"]}"
        highlight-color=${args["highlight-color"]}
        margin-color=${args["margin-color"]}
        use-ctrl-to-zoom
      >
      </nightingale-sequence>
    </div>`;
}

function nightingaleTrack(args: Args, id: number) {
  if (!args.SHOW_NIGHTINGALE_TRACK) return undefined;

  return html`
    <div class="row">
      <div class="label">SVG</div>
      <nightingale-track
        id="track-${id}"
        min-width="${args["min-width"]}"
        height=${args["height"]}
        length="${args["length"]}"
        highlight-event="${args["highlight-event"]}"
        highlight-color="${args["highlight-color"]}"
        margin-color=${args["margin-color"]}
        use-ctrl-to-zoom
        layout="${args["layout"]}"
      >
      </nightingale-track>
    </div>`;
}

function nightingaleTrackCanvas(args: Args, id: number) {
  if (!args.SHOW_NIGHTINGALE_TRACK_CANVAS) return undefined;

  return html`
    <div class="row">
      <div class="label">Canvas</div>
      <nightingale-track-canvas
        id="canvas-track-${id}"
        min-width="${args["min-width"]}"
        height=${args["height"]}
        length="${args["length"]}"
        highlight-event="${args["highlight-event"]}"
        highlight-color="${args["highlight-color"]}"
        margin-color=${args["margin-color"]}
        use-ctrl-to-zoom
        layout="${args["layout"]}"
      >
      </nightingale-track-canvas>
    </div>`;
}



const Template = (args: Args) => {
  const tracks = range(args.N_TRACKS).map(i => html`
    ${nightingaleTrack(args, i)}
    ${nightingaleTrackCanvas(args, i)}
  `);

  return html`
    <style>
      .row { line-height: 0; margin-top: 2px; display: flex; align-items: center; }
      .label { width: 40px; line-height: initial; font-size: 0.8rem; text-align: center; }
    </style>
    <nightingale-saver element-id="nightingale-root" background-color="white" scale-factor="2"></nightingale-saver>
    <div>Use Ctrl+scroll to zoom.</div>
    <div id="nightingale-root">
      <nightingale-manager>
        <div style="display:flex; flex-direction: column; width: 100%;">
          ${nightingaleNavigation(args)}
          ${nightingaleSequence(args)}
          ${tracks}
        </div>
      </nightingale-manager>
    </div>`;
}

export const ManyTracks: Story<Args> = Template.bind({});
ManyTracks.args = { ...DefaultArgs };

// export const ManyTracks = () => {
//   const args = DefaultArgs;

//   const tracks = range(args.N_TRACKS).map(i => html`
//     ${nightingaleTrack(args, i)}
//     ${nightingaleTrackCanvas(args, i)}
//   `);

//   return html`
//     <nightingale-saver element-id="nightingale-root" background-color="white" scale-factor="2"></nightingale-saver>
//     Use Ctrl+scroll to zoom.
//     <div id="nightingale-root">
//       <nightingale-manager>
//         <div style="display:flex; flex-direction: column; width: 100%;">
//           ${nightingaleNavigation(args)}
//           ${nightingaleSequence(args)}
//           ${tracks}
//         </div>
//       </nightingale-manager>
//     </div>
//   `;
// }


ManyTracks.play = async () => {
  const seqLength = (document.getElementById("sequence") as any)?.length ?? 0;
  // const data = makeResidueData(seqLength);
  const data = makeSpanData(1, seqLength);
  await customElements.whenDefined("nightingale-track");
  await customElements.whenDefined("nightingale-track-canvas");
  for (const track of document.getElementsByTagName("nightingale-track")) {
    (track as any).data = data;
  }
  for (const track of document.getElementsByTagName("nightingale-track-canvas")) {
    (track as any).data = data;
  }
};
