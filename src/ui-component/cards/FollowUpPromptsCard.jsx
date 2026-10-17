import Box from '@mui/material/Box'
import PropTypes from 'prop-types'
import { Chip } from '@mui/material'
import './StarterPromptsCard.css'
import { alpha, useTheme } from '@mui/material/styles'

const FollowUpPromptsCard = ({ isGrid, followUpPrompts, sx, onPromptClick }) => {
    const theme = useTheme()

    return (
        <Box
            className={'button-container'}
            sx={{ width: '100%', maxWidth: isGrid ? 'inherit' : '400px', p: 1.5, display: 'flex', gap: 1, ...sx }}
        >
            {Array.isArray(followUpPrompts) &&
                followUpPrompts.map((fp, index) => (
                    <Chip
                        label={fp}
                        className={'button'}
                        key={index}
                        onClick={(e) => onPromptClick(fp, e)}
                        sx={{
                            backgroundColor: 'transparent',
                            border: '1px solid',
                            boxShadow: theme.customShadows?.xs,
                            color: '#2196f3',
                            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.12 : 0.05),
                                border: '1px solid'
                            }
                        }}
                    />
                ))}
        </Box>
    )
}

FollowUpPromptsCard.propTypes = {
    isGrid: PropTypes.bool,
    followUpPrompts: PropTypes.array,
    sx: PropTypes.object,
    onPromptClick: PropTypes.func
}

export default FollowUpPromptsCard
