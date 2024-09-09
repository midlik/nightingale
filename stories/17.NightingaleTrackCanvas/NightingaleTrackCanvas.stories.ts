import { Meta } from "@storybook/web-components";
import { html } from "lit-html";
import "../../packages/nightingale-track-canvas/src/index.ts";


export default { title: "Components/Tracks/NightingaleTrack-Canvas" } as Meta;

const seq = "iubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASViubcbcIUENACBPAOUBCASFUBRUABBRWOAUVBISVBAISBVDOASVCASFU";
const defaultSequence = repStr(seq, 1);
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
const perResidueData = Array.from(defaultSequence).map((aa, i) => ({
  accession: `feature${i}`,
  start: i + 1,
  end: i + 1,
  // locations: [{ fragments: [{ start: i + 1, end: i + 1 }] }],
  color: ResidueColors[i % ResidueColors.length],
}));


const N_TRACKS = 1;
// const N_TRACKS = 2000;
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
    navigationHeight: 50,
    sequenceHeight: 30,
    trackHeight: 10,
    foo: "track features refresh",
  };

  const tracks = new Array(N_TRACKS).fill(0).map((_, i) =>
    html`
    <div style="line-height: 0; padding-top: 2px;">
      <nightingale-track-canvas
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
        foo=${args.foo + " track-" + i}
      >
      </nightingale-track-canvas>
    </div>`
  );

  return html`
  <nightingale-saver
  element-id="root"
  background-color="white"
  scale-factor="2"
  ></nightingale-saver>
  Use Ctrl+scroll to zoom.
  <div id="root">
    <nightingale-manager>
      <div style="display:flex; flex-direction: column;    width: 100%;">
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
  console.log(`Initializing ${N_TRACKS} tracks (${N_TRACKS * perResidueData.length} items)`)
  console.time("Initializing")
  for (let i = 0; i < N_TRACKS; i++) {
    const track = document.getElementById(`track-${i}`);
    if (track) {
      (track as any).data = perResidueData;
    }
  }
  console.timeEnd("Initializing")
  console.timeEnd("play")
};
