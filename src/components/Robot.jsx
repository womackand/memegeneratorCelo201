import React from 'react'

export default function Robot({ sparks }) {
  return (
    <div className="robot">
        <div className={"robot-sparks " + sparks}>
          <div className="spark"></div>
          <div className="spark"></div>
        </div>
    </div>
  )
}
