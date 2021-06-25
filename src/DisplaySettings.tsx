import React, {useEffect, useRef, useState} from 'react'
import {Controller, useForm} from 'react-hook-form'
import {SketchPicker, CirclePicker} from 'react-color'
import {
  hexToHpluv,
  hexToHsluv,
  hpluvToHex,
  hpluvToRgb,
  hsluvToHex,
  hsluvToRgb,
} from 'hsluv'
import jsonStringify from 'json-stable-stringify'

export const defaultValues = {
  magnification: 1,
  iterationsPerSecond: 500,
  brightness: 0,
  contrast: 18,
  scheme: 'gradient', // gradient, softmax
  // energy, direction, change in energy, similarity to neighbours (direction only), similarity to neighbours (direction and energy)
  quantity: 'energy',
  chroma: 'HPLuv',
  dynamicRange: 'logarithmic',
  gradient: {
    interpolation: 'palette',
    palette: {
      toneA: {hex: '#00070E'},
      toneB: {hex: '#ffa600'},
    },
    monochrome: {
      tone: {hex: '#004c6d'},
      shiftLuminance: 90,
      shiftSaturation: 20,
    },
    divergent: {
      toneA: {hex: '#31408F'},
      toneB: {hex: '#de425b'},
      midpointLuminance: 80,
      midpointSaturation: 0,
    },
  },
  softmax: {
    saturation: 'checkbox', // checkbox, radio
  },
  substances: new Array(9).fill(null).map((_, i) => ({
    active: true,
    relativeBrightness: 1 / 4,
    alpha: false,
    hot: true,
    softmaxHue: [0, 3, 6, 1, 4, 7, 2, 8, 10][i],
  })),
}

defaultValues.substances[1].active = false
defaultValues.substances[2].alpha = true

const mix = (a, b, m) => a * (1 - m) + b * m
const mixRing = (a, b, m, r) => {
  if (Math.abs(a + r - b) < Math.abs(a - b)) a += r
  else if (Math.abs(b + r - a) < Math.abs(a - b)) b += r
  const c = a * (1 - m) + b * m
  return c % r
}
const mixColors = (a, b, m): [number, number, number] => {
  const e = 0.01
  const h = a[1] < e ? b[0] : b[1] < e ? a[0] : mixRing(a[0], b[0], m, 360)
  return [h, mix(a[1], b[1], m), mix(a[2], b[2], m)]
}
const mixColorGradient = (colors, m) => {
  const i = Math.floor(m * 4)
  const a = colors[i]
  const b = colors[i + 1]
  return mixColors(a, b, (m * 4) % 1)
}

export const gradientToColors = ({chroma, gradient}) => {
  const hexToHsl =
    chroma === 'HSLuv'
      ? hexToHsluv
      : (hex: string) => {
          const [h, s, l] = hexToHpluv(hex)
          return [h, Math.min(s, 100), l]
        }

  return {
    palette: () => {
      const a = hexToHsl(gradient.palette.toneA.hex)
      const b = hexToHsl(gradient.palette.toneB.hex)
      return [
        a,
        mixColors(a, b, 1 / 4),
        mixColors(a, b, 2 / 4),
        mixColors(a, b, 3 / 4),
        b,
      ]
    },
    monochrome: () => {
      const a = hexToHsl(gradient.monochrome.tone.hex)
      const b = [
        a[0],
        gradient.monochrome.shiftSaturation,
        gradient.monochrome.shiftLuminance,
      ]
      return [
        a,
        mixColors(a, b, 1 / 4),
        mixColors(a, b, 2 / 4),
        mixColors(a, b, 3 / 4),
        b,
      ]
    },
    divergent: () => {
      const a = hexToHsl(gradient.divergent.toneA.hex)
      const b = hexToHsl(gradient.divergent.toneB.hex)
      const mid = [
        mixRing(a[0], b[0], 0.5, 360),
        gradient.divergent.midpointSaturation,
        gradient.divergent.midpointLuminance,
      ]
      return [a, mixColors(a, mid, 1 / 2), mid, mixColors(mid, b, 1 / 2), b]
    },
    greyscale: () => {
      return [
        [0, 0, 0 / 4],
        [0, 0, 100 / 4],
        [0, 0, 200 / 4],
        [0, 0, 300 / 4],
        [0, 0, 400 / 4],
      ]
    },
    hue: () => {
      const s = 100
      const l = 70
      return [
        [0, s, l],
        [90, s, l],
        [180, s, l],
        [270, s, l],
        [360, s, l],
      ]
    },
  }[gradient.interpolation]()
}

const ColorPicker = React.forwardRef((props: any, ref) => {
  const {onChange, onBlur, name, value, ...inputProps} = props
  const [shortValue, setShortValue] = useState(value)
  const [showPicker, setShowPicker] = useState(false)
  const rgb = [
    parseInt(shortValue.hex.slice(1, 3), 16),
    parseInt(shortValue.hex.slice(3, 5), 16),
    parseInt(shortValue.hex.slice(5, 7), 16),
  ]

  return (
    <div>
      <div
        style={{
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        }}
        onClick={() => setShowPicker(!showPicker)}
      >
        <div
          style={{
            width: '36px',
            height: '14px',
            borderRadius: '2px',
            background: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 255)`,
          }}
        />
      </div>
      {showPicker ? (
        <div
          style={{
            position: 'absolute',
            zIndex: 2,
          }}
        >
          <div
            style={{
              position: 'fixed',
              top: '0px',
              right: '0px',
              bottom: '0px',
              left: '0px',
            }}
            onClick={() => setShowPicker(false)}
          />
          <SketchPicker
            color={shortValue}
            onChange={setShortValue}
            onChangeComplete={onChange}
            presetColors={[]}
            {...inputProps}
            disableAlpha
          />
        </div>
      ) : null}
    </div>
  )
})

const HuePicker = React.forwardRef((props: any, ref) => {
  const {onChange, onBlur, name, value, chroma, ...inputProps} = props
  const colors = new Array(11)
    .fill(null)
    .map((_, i) => {
      const hsl = [(i * 360) / 11, 100, 70] as [number, number, number]
      const toHex = chroma === 'HSLuv' ? hsluvToHex : hpluvToHex
      return toHex(hsl)
    })
    .concat('transparent')
  const [shortValue, setShortValue] = useState({hex: colors[value]})
  const [showPicker, setShowPicker] = useState(false)
  const rgb =
    shortValue.hex === 'transparent'
      ? 'transparent'
      : [
          parseInt(shortValue.hex.slice(1, 3), 16),
          parseInt(shortValue.hex.slice(3, 5), 16),
          parseInt(shortValue.hex.slice(5, 7), 16),
        ]

  useEffect(() => {
    setShortValue({hex: colors[value]})
  }, [chroma])

  return (
    <div>
      <div
        style={{
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        }}
        onClick={() => setShowPicker(!showPicker)}
      >
        <div
          style={{
            width: '36px',
            height: '14px',
            borderRadius: '2px',
            background: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 255)`,
          }}
        />
      </div>
      {showPicker ? (
        <div
          style={{
            position: 'absolute',
            zIndex: 2,
          }}
        >
          <div
            style={{
              position: 'fixed',
              top: '0px',
              right: '0px',
              bottom: '0px',
              left: '0px',
            }}
            onClick={() => setShowPicker(false)}
          />
          <style>
            {`
              .circle-picker div[title="#00000000"] {
                background-position: 0px 0px, 10px 10px !important;
                background-size: 20px 20px !important;
                background-image: linear-gradient(45deg, #999 25%, transparent 25%, transparent 75%, #999 75%, #999 100%),linear-gradient(45deg, #999 25%, #f6f6f6 25%, #f6f6f6 75%, #999 75%, #999 100%) !important;
              }
            `}
          </style>
          <div style={{borderRadius: 2, background: '#fff', padding: 8}}>
            <CirclePicker
              color={shortValue}
              onChange={setShortValue}
              onChangeComplete={(value) => onChange(colors.indexOf(value.hex))}
              colors={colors}
              {...inputProps}
              disableAlpha
            />
          </div>
        </div>
      ) : null}
    </div>
  )
})

const ColorBar = ({chroma, colors}) => {
  const ref = useRef(null)
  const w = 250

  useEffect(() => {
    const hslToRgb = chroma === 'HSLuv' ? hsluvToRgb : hpluvToRgb
    for (let i = 0; i < w; i++) {
      const ctx = ref.current.getContext('2d')
      const img = ctx.getImageData(0, 0, w, 1)
      const hsl = mixColorGradient(colors, i / w)
      const [r, g, b] = hslToRgb(hsl)
      img.data[i * 4 + 0] = r * 255
      img.data[i * 4 + 1] = g * 255
      img.data[i * 4 + 2] = b * 255
      img.data[i * 4 + 3] = 255
      ctx.putImageData(img, 0, 0)
    }
  }, [chroma, colors])

  return (
    <canvas
      ref={ref}
      width={w + 'px'}
      height={1 + 'px'}
      style={{width: w, height: 50}}
    />
  )
}

const GradientDisplaySettings = (props) => {
  const {
    form: {control, register},
    values,
  } = props

  const colors = gradientToColors(values)

  return (
    <div>
      <ColorBar chroma={values.chroma} colors={colors} />
      <label style={{display: 'block'}}>
        <div>Interpolation</div>
        <select name="gradient.interpolation" ref={register}>
          <option value="palette">Palette</option>
          <option value="monochrome">Monochrome</option>
          <option value="divergent">Divergent</option>
          <option value="hue">Hue (full spectrum)</option>
          <option value="greyscale">Greyscale</option>
        </select>
      </label>
      <div
        style={{
          display:
            values.gradient.interpolation === 'palette' ? 'block' : 'none',
        }}
      >
        <label style={{display: 'block'}}>
          <div>Color #1</div>
          <Controller
            control={control}
            name="gradient.palette.toneA"
            as={<ColorPicker />}
          />
        </label>
        <label style={{display: 'block'}}>
          <div>Color #2</div>
          <Controller
            control={control}
            name="gradient.palette.toneB"
            as={<ColorPicker />}
          />
        </label>
      </div>
      <div
        style={{
          display:
            values.gradient.interpolation === 'monochrome' ? 'block' : 'none',
        }}
      >
        <label style={{display: 'block'}}>
          Luminance Shift
          <input
            name="gradient.monochrome.shiftLuminance"
            type="range"
            min={0}
            max={100}
            step={1 / 1000}
            ref={register}
          />
        </label>
        <label style={{display: 'block'}}>
          Saturation Shift
          <input
            name="gradient.monochrome.shiftSaturation"
            type="range"
            min={0}
            max={100}
            step={1 / 1000}
            ref={register}
          />
        </label>
        <label style={{display: 'block'}}>
          <div>Color</div>
          <Controller
            control={control}
            name="gradient.monochrome.tone"
            as={<ColorPicker />}
          />
        </label>
      </div>
      <div
        style={{
          display:
            values.gradient.interpolation === 'divergent' ? 'block' : 'none',
        }}
      >
        <label style={{display: 'block'}}>
          <div>Midpoint Luminance</div>
          <input
            name="gradient.divergent.midpointLuminance"
            type="range"
            min={0}
            max={100}
            step={1 / 1000}
            ref={register}
          />
        </label>
        <label style={{display: 'block'}}>
          <div>Midpoint Saturation</div>
          <input
            name="gradient.divergent.midpointSaturation"
            type="range"
            min={0}
            max={100}
            step={1 / 1000}
            ref={register}
          />
        </label>
        <label style={{display: 'block'}}>
          <div>Color #1</div>
          <Controller
            control={control}
            name="gradient.divergent.toneA"
            as={<ColorPicker />}
          />
        </label>
        <label style={{display: 'block'}}>
          <div>Color #2</div>
          <Controller
            control={control}
            name="gradient.divergent.toneB"
            as={<ColorPicker />}
          />
        </label>
      </div>
    </div>
  )
}

const SoftmaxDisplaySettings = (props) => {
  const {
    form: {register},
  } = props

  return (
    <div>
      <label style={{display: 'block'}}>
        <div>Saturation</div>
        <select name="saturation" ref={register}>
          <option value="oneHot">One-Hot (radio)</option>
          <option value="multiHot">Multi-Hot (checkbox)</option>
        </select>
      </label>
    </div>
  )
}

const DisplaySettings = (props) => {
  // const {substances = []} = props
  const form = useForm({defaultValues})
  const {watch, register, control} = form
  const values = watch()

  useEffect(() => {
    if (props.onChange) props.onChange({...defaultValues, ...values})
  }, [jsonStringify(values)])

  return (
    <form>
      <label style={{display: 'block'}}>
        <div>Magnification</div>
        <input
          name="magnification"
          type="number"
          min={0}
          max={32}
          step={1}
          ref={register}
        />
      </label>
      <label style={{display: 'block'}}>
        <div>Iterations Per Second</div>
        <input
          name="iterationsPerSecond"
          type="number"
          min={1}
          max={1000}
          step={10}
          ref={register}
        />
      </label>
      <label style={{display: 'block'}}>
        <div>Scheme</div>
        <select name="scheme" ref={register}>
          <option value="gradient">Single-Substance (gradient)</option>
          <option value="softmax">Multi-Substance (softmax)</option>
        </select>
      </label>
      <label style={{display: 'block'}}>
        <div>Quantity</div>
        <select name="quantity" ref={register}>
          <option value="energy">Energy</option>
          <option value="direction">Direction</option>
          <option value="energyDelta">Change in Energy</option>
          <option value="cosineNormalised">
            Similarity to Neighbours (direction only)
          </option>
          <option value="cosine">
            Similarity to Neighbours (direction and energy)
          </option>
        </select>
      </label>
      <label style={{display: 'block'}}>
        <div>Chroma</div>
        <select name="chroma" ref={register}>
          <option value="HPLuv">Accurate (HPLuv)</option>
          <option value="HSLuv">Vivid (HSLuv)</option>
        </select>
      </label>
      <label style={{display: 'block'}}>
        <div>Dynamic Range</div>
        <select name="dynamicRange" ref={register}>
          <option value="linear">Accurate (linear)</option>
          <option value="logarithmic">HDR highlights (logarithmic)</option>
          <option value="sigmoid">HDR shadows and highlights (sigmoid)</option>
        </select>
      </label>
      <div
        style={{
          display: values.scheme === 'gradient' ? 'block' : 'none',
        }}
      >
        <GradientDisplaySettings form={form} values={values} />
      </div>
      <div
        style={{
          display: values.scheme === 'softmax' ? 'block' : 'none',
        }}
      >
        <SoftmaxDisplaySettings form={form} values={values} />
      </div>
      <label style={{display: 'block'}}>
        Brightness
        <input
          name="brightness"
          type="range"
          min={-8}
          max={8}
          step={1 / 1000}
          ref={register}
        />
      </label>
      <label style={{display: 'block'}}>
        Contrast
        <input
          name="contrast"
          type="range"
          min={1}
          max={31}
          step={1 / 1000}
          ref={register}
        />
      </label>
      {new Array(9).fill(null).map((_, i) => (
        <div
          key={i}
          style={{
            display: true ? 'block' : 'none',
          }}
        >
          <p style={{marginBottom: 0}}>Substance {i}</p>
          <label style={{display: 'block'}}>
            Relative Brightness
            <input
              name={`substances[${i}].relativeBrightness`}
              type="range"
              min={0}
              max={1}
              step={1 / 1000}
              ref={register}
            />
          </label>
          <label style={{display: 'block'}}>
            Active
            <input
              name={`substances[${i}].active`}
              type="checkbox"
              ref={register}
            />
          </label>
          <label style={{display: 'block'}}>
            Alpha
            <input
              name={`substances[${i}].alpha`}
              type="checkbox"
              ref={register}
            />
          </label>
          <div
            style={{display: values.scheme === 'softmax' ? 'block' : 'none'}}
          >
            <label style={{display: 'block'}}>
              Hot
              <input
                name={`substances[${i}].hot`}
                type="checkbox"
                ref={register}
              />
            </label>
            <label style={{display: 'block'}}>
              <div>Hue</div>
              <Controller
                control={control}
                name={`substances[${i}].softmaxHue`}
                chroma={values.chroma}
                as={<HuePicker />}
              />
            </label>
          </div>
        </div>
      ))}
    </form>
  )
}

export default DisplaySettings
