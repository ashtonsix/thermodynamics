import React from 'react'
import standardModelSVG from './standardModel.svg'

export default Epistimology

function Epistimology() {
  return (
    <div className="epistimology">
      <style>{`
        .epistimology .dull {
          filter: saturate(0%);
        }
        .epistimology {
          display: grid;
          grid-template-columns: 150px 120px 120px;
          grid-template-rows: 50px 120px 120px 120px;
          gap: 0px 0px;
          grid-template-areas:
            ". Holistic Reductive"
            "Scientific DS OS"
            "Conceptual DC OC"
            "Aesthetic DA OA";
        }
        .epistimology div {
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .epistimology .Holistic { grid-area: Holistic; }
        .epistimology .Reductive { grid-area: Reductive; }
        .epistimology .Scientific { grid-area: Scientific; }
        .epistimology .Conceptual { grid-area: Conceptual; }
        .epistimology .Aesthetic { grid-area: Aesthetic; }
        .epistimology .DS { grid-area: DS; background-color: hsl(248, 40%, 50%); }
        .epistimology .DC { grid-area: DC; background-color: hsl(248, 70%, 40%); }
        .epistimology .DA { grid-area: DA; background-color: hsl(248, 100%, 30%); }
        .epistimology .OS { grid-area: OS; background-color: hsl(20, 40%, 50%); }
        .epistimology .OC { grid-area: OC; background-color: hsl(20, 70%, 40%); }
        .epistimology .OA { grid-area: OA; background-color: hsl(20, 100%, 30%); }
        
      `}</style>
      <div className="Holistic">Holistic</div>
      <div className="Reductive">Reductive</div>
      <div className="Scientific">
        Scientific
        <br />
        (Predicting)
      </div>
      <div className="Conceptual">
        Conceptual
        <br />
        (Thinking)
      </div>
      <div className="Aesthetic">
        Aesthetic
        <br />
        (Feeling)
      </div>
      <div className="DS"></div>
      <div className="OS"></div>
      <div className="DC"></div>
      <div className="OC"></div>
      <div className="DA"></div>
      <div className="OA"></div>
    </div>
  )
}

function StandardModel() {
  const scale = 5.8
  return (
    <>
      <style>{`
        .standardModel svg {
          width: ${139 * scale}px;
          height: ${133 * scale}px;
          filter: invert(1);
        }
        .standardModel svg .tilefade {
          opacity: 0.25;
        }
        .standardModel svg .textfade {
          opacity: 0.25;
        }
      `}</style>
      <div
        className="standardModel"
        dangerouslySetInnerHTML={{__html: standardModelSVG}}
      ></div>
    </>
  )
}

function PredictabilityComparison() {
  const gradient = 'rgba(33,35,36,1) 0%, rgba(170,212,233,1) 100%'
  const scale = 3
  const height = 150

  return (
    <div style={{width: 400 * scale}}>
      <div
        style={{
          height,
          background: `rgba(170,212,233,1)`,
        }}
      ></div>
      <div
        style={{
          height,
          background: `linear-gradient(270deg, ${gradient})`,
        }}
      ></div>
      <div style={{background: 'black', height: 5}}></div>
      <div
        style={{
          height,
          background: `linear-gradient(90deg, ${gradient})`,
        }}
      ></div>
      <div style={{background: 'black', height: 5}}></div>
      <div
        style={{
          height,
          background: 'rgba(33,35,36,1)',
          position: 'relative',
        }}
      >
        {[
          {left: 0, width: 30},
          {left: 28, width: 5},
          {left: 50, width: 5},
          {left: 70, width: 10},
          {left: 135, width: 5},
          {left: 165, width: 10},
          {left: 245, width: 30},
          {left: 312, width: 5},
          {left: 360, width: 5},
        ].map(({left, width}, i) => {
          return (
            <div
              key={i}
              style={{
                height: '100%',
                background: `linear-gradient(270deg, ${gradient})`,
                position: 'absolute',
                left: left * scale,
                width: width * scale,
              }}
            ></div>
          )
        })}
      </div>
    </div>
  )
}

function ScholarTimeline() {
  const greekScholars = [
    {name: 'Socrates', born: -470, died: -399},
    {name: 'Plato', born: -424, died: -348},
    {name: 'Aristotle', born: -384, died: -322},
    {name: 'Euclid', born: -325, died: -270},
    {name: 'Archimedes', born: -287, died: -212},
  ]
  const mechanicalScholars = [
    {name: 'Aristotle', born: -384, died: -322},
    {name: 'Jesus', born: -4, died: 30},
    {name: 'Thomas Aquinas', born: 1225, died: 1274},
    {name: 'Francis Bacon', born: 1561, died: 1626},
    {name: 'Issac Newton', born: 1643, died: 1727},
    {name: 'Pierre-Simon Laplace', born: 1749, died: 1827},
    {name: 'Karl Popper', born: 1902, died: 1994},
  ]
  const data = greekScholars

  const min = Math.min(...data.map((d) => d.born))
  const max = Math.max(...data.map((d) => d.died))

  return (
    <svg style={{width: 1200, padding: 30}} viewBox="0 0 200 100">
      {data.map(({name, born, died}, i) => {
        const bornScaled = ((born - min) / Math.abs(max - min)) * 194 + 3
        const diedScaled = ((died - min) / Math.abs(max - min)) * 194 + 3
        const y = i * 12 + 3
        const h = 10

        const textPosition =
          diedScaled - bornScaled > 15
            ? 'inside'
            : bornScaled > 50
            ? 'left'
            : 'right'

        return (
          <g>
            <rect
              stroke="white"
              strokeWidth={0.3}
              fill="#333"
              x={bornScaled}
              y={y}
              width={diedScaled - bornScaled}
              height={h}
            ></rect>
            <foreignObject
              x={
                textPosition === 'inside'
                  ? bornScaled + 1.5
                  : textPosition === 'right'
                  ? diedScaled + 1.5
                  : bornScaled - 101.5
              }
              y={y + 0.8}
              width={100}
              height={h}
            >
              <body>
                <div
                  style={{
                    color: 'white',
                    fontSize: 4.7,
                    textAlign: textPosition === 'left' ? 'right' : 'left',
                  }}
                >
                  {name}
                </div>
                <div
                  style={{
                    color: 'white',
                    fontSize: 3.2,
                    textAlign: textPosition === 'left' ? 'right' : 'left',
                  }}
                >
                  {born < 0
                    ? died < 0
                      ? `${-born} to ${-died} BC`
                      : `${-born} BC to ${died} AD`
                    : `${born} to ${died}`}
                </div>
              </body>
            </foreignObject>
          </g>
        )
      })}
    </svg>
  )
}

function ChaosComparison() {
  return (
    <div className="chaosComparison">
      <style>{`
        .chaosComparison {
          padding-left: 80px;
          padding-top: 160px;
        }

        .chaosComparison .logisticMapTitle {
          width: 800px;
          text-align: center;
          font-size: 30px;
          position: relative;
          bottom: 80px;
        }
        .chaosComparison .flowTitle {
          width: 800px;
          text-align: center;
          font-size: 30px;
          position: relative;
          top: 80px;
        }

        .chaosComparison .logisticMapBar {
          width: 800px;
          height: 30px;
          display: flex;
        }
        .chaosComparison .logisticMapBar > div {
          height: 100%;
          flex-grow: 1;
          position: relative;
        }
        .chaosComparison .logisticMapBar > div > span {
          position: absolute;
          bottom: 50px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 24px;
          white-space: nowrap;
        }
        .chaosComparison .logisticMapBar1 {
          background: red;
        }
        .chaosComparison .logisticMapBar2 {
          background: purple;
        }
        .chaosComparison .logisticMapBar3 {
          background: linear-gradient(90deg, rgba(13,47,194,1) 0%, rgba(0,255,248,1) 100%);
        }
        .chaosComparison .logisticMapBar4 {
          background: green;
        }

        .chaosComparison .flowMapBar {
          padding-top: 50px;
          padding-left: 200px;
          width: 400px;
          height: 30px;
          display: flex;
        }
        .chaosComparison .flowMapBar > div {
          height: 100%;
          flex-grow: 1;
          position: relative;
        }
        .chaosComparison .flowMapBar > div > span {
          position: absolute;
          top: 50px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 24px;
          white-space: nowrap;
        }
        .chaosComparison .flowMapBar1 {
          background: purple;
        }
        .chaosComparison .flowMapBar2 {
          background: linear-gradient(90deg, rgba(13,47,194,1) 0%, rgba(0,255,248,1) 100%);
        }
      `}</style>
      <div className="logisticMapTitle">Logistic Map</div>
      <div className="logisticMapBar">
        <div className="logisticMapBar1">
          <span>0–1</span>
        </div>
        <div className="logisticMapBar2">
          <span>1–2</span>
        </div>
        <div className="logisticMapBar3">
          <span>2–3</span>
        </div>
        <div className="logisticMapBar4">
          <span>3–4</span>
        </div>
      </div>
      <div className="flowMapBar">
        <div className="flowMapBar1">
          <span>0–50%</span>
        </div>
        <div className="flowMapBar2">
          <span>50–100%</span>
        </div>
      </div>
      <div className="flowTitle">2-Part Diffusion</div>
    </div>
  )
}
