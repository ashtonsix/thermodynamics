import React, {useState} from 'react'

const useRange = (defaultValue) => {
  const [value, setValue] = useState(defaultValue)
  const [Range] = useState(() => (props) => {
    const {label, ...inputProps} = props
    return (
      <label>
        {!!label && <p>{label}</p>}
        <input
          type="range"
          style={{width: '400px'}}
          {...inputProps}
          defaultValue={defaultValue}
          onChange={(e) => {
            setValue(+e.target.value)
          }}
        />
      </label>
    )
  })

  return {
    value,
    Range,
  }
}

export default useRange
