import PropTypes from 'prop-types'
import { alpha, useTheme } from '@mui/material/styles'
import { Box, Stack, Typography } from '@mui/material'

const ChartFrame = ({ title, right, height = 320, children }) => {
    const theme = useTheme()
    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    return (
        <Box
            sx={{
                border: `1px solid ${alphaBorder}`,
                borderRadius: 2,
                p: 2,
                bgcolor: 'background.paper',
                mb: 2,
                minWidth: 0,
                boxShadow: theme.customShadows?.xs
            }}
        >
            {(title || right) && (
                <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 1.5 }}>
                    {title ? (
                        <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
                            {title}
                        </Typography>
                    ) : (
                        <Box />
                    )}
                    {right}
                </Stack>
            )}
            <Box sx={{ height, width: '100%' }}>{children}</Box>
        </Box>
    )
}

ChartFrame.propTypes = {
    title: PropTypes.string,
    right: PropTypes.node,
    height: PropTypes.number,
    children: PropTypes.node
}

export default ChartFrame
