import PropTypes from 'prop-types'
import { alpha, useTheme } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'

const TableCard = ({ title, children }) => {
    const theme = useTheme()
    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    return (
        <Box sx={{ border: `1px solid ${alphaBorder}`, borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
            {title && (
                <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alphaBorder}` }}>
                    <Typography variant='h4' component='h4'>
                        {title}
                    </Typography>
                </Box>
            )}
            {children}
        </Box>
    )
}

TableCard.propTypes = {
    title: PropTypes.string,
    children: PropTypes.node
}

export default TableCard
