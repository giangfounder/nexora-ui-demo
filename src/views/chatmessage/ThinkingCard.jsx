import { useState, useEffect, memo } from 'react'
import PropTypes from 'prop-types'
import { Box, Collapse, Typography, CircularProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { AppIcon } from '@/ui-component/icons/AppIcon'
import { useLanguage } from '@/store/context/LanguageContext'

const ThinkingCard = ({ thinking, thinkingDuration, isThinking }) => {
    const theme = useTheme()
    const { t } = useLanguage()
    const [isExpanded, setIsExpanded] = useState(false)

    // Auto-expand when thinking is active
    useEffect(() => {
        if (isThinking) {
            setIsExpanded(true)
        }
    }, [isThinking])

    if (!thinking) return null

    // Parse thinking content into bullet points
    const parseThinkingContent = (content) => {
        if (!content) return []
        // Split by newlines and filter out empty lines
        const lines = content.split('\n').filter((line) => line.trim())
        return lines
    }

    const thinkingLines = parseThinkingContent(thinking)

    // Determine header text
    const getHeaderText = () => {
        if (isThinking) {
            return t('Thinking...')
        }
        if (thinkingDuration !== undefined && thinkingDuration !== null) {
            return thinkingDuration !== 1
                ? t('Thought for {count} seconds', { count: thinkingDuration })
                : t('Thought for {count} second', { count: thinkingDuration })
        }
        return t('Thinking...')
    }

    return (
        <Box
            sx={{
                width: '100%',
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.alpha.border,
                backgroundColor: theme.palette.background.paper
            }}
        >
            {/* Header */}
            <Box
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    borderRadius: isExpanded ? '8px 8px 0 0' : 2,
                    '&:hover': {
                        backgroundColor: theme.palette.alpha.hover
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {isExpanded ? (
                        <AppIcon name='CaretDown' size={16} color={theme.palette.text.secondary} />
                    ) : (
                        <AppIcon name='CaretRight' size={16} color={theme.palette.text.secondary} />
                    )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {isThinking ? (
                        <CircularProgress size={14} thickness={5} sx={{ color: theme.palette.primary.main }} />
                    ) : (
                        <AppIcon name='Hourglass' size={16} color={theme.palette.primary.main} />
                    )}
                </Box>
                <Typography
                    variant='body2'
                    noWrap
                    sx={{
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                        whiteSpace: 'nowrap'
                    }}
                >
                    {getHeaderText()}
                </Typography>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={isExpanded} unmountOnExit>
                <Box
                    sx={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        px: 2,
                        pb: 2,
                        borderTop: '1px solid',
                        borderColor: theme.palette.alpha.divider
                    }}
                >
                    {thinkingLines.length > 0 ? (
                        <Box component='ul' sx={{ m: 0, mt: 1.5, pl: 2.5, listStyleType: 'disc' }}>
                            {thinkingLines.map((line, index) => (
                                <Box
                                    component='li'
                                    key={index}
                                    sx={{
                                        mb: 0.5,
                                        color: theme.palette.text.secondary,
                                        '&::marker': {
                                            color: theme.palette.text.secondary
                                        }
                                    }}
                                >
                                    <Typography
                                        variant='body2'
                                        sx={{
                                            fontStyle: 'italic',
                                            color: theme.palette.text.secondary,
                                            lineHeight: 1.5,
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {line}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography
                            variant='body2'
                            sx={{
                                mt: 1.5,
                                fontStyle: 'italic',
                                color: theme.palette.text.secondary,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}
                        >
                            {thinking}
                        </Typography>
                    )}
                </Box>
            </Collapse>
        </Box>
    )
}

ThinkingCard.propTypes = {
    thinking: PropTypes.string,
    thinkingDuration: PropTypes.number,
    isThinking: PropTypes.bool,
    customization: PropTypes.object
}

export default memo(ThinkingCard)
