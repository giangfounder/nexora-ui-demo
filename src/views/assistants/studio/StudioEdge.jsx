import PropTypes from 'prop-types'
import { memo } from 'react'
import { getBezierPath } from 'reactflow'
import { useTheme } from '@mui/material'
import { alpha, keyframes } from '@mui/material/styles'
import { Box } from '@mui/material'

const flow = keyframes`to { stroke-dashoffset: -16; }`

// Neutral by default; only the path the agent just used lights up in brand color.
const StudioEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) => {
    const theme = useTheme()
    const [path] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, curvature: 0.35 })
    const active = data?.active
    return (
        <Box
            component='path'
            id={id}
            d={path}
            fill='none'
            sx={{
                stroke: active
                    ? theme.palette.primary.main
                    : alpha(theme.palette.text.primary, data?.muted ? 0.14 : theme.palette.mode === 'dark' ? 0.26 : 0.22),
                strokeWidth: active ? 2 : 1.5,
                strokeDasharray: active ? '6 10' : data?.muted ? '4 4' : 'none',
                animation: active ? `${flow} 0.6s linear infinite` : 'none',
                transition: 'stroke 200ms ease-out'
            }}
        />
    )
}

StudioEdge.propTypes = {
    id: PropTypes.string,
    sourceX: PropTypes.number,
    sourceY: PropTypes.number,
    targetX: PropTypes.number,
    targetY: PropTypes.number,
    sourcePosition: PropTypes.any,
    targetPosition: PropTypes.any,
    data: PropTypes.object
}

export default memo(StudioEdge)
