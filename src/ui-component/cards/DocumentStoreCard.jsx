import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

// material-ui
import { styled } from '@mui/material/styles'
import { Box, Grid, Typography, useTheme } from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import DocumentStoreStatus from '@/views/docstore/DocumentStoreStatus'

import { kFormatter } from '@/utils/genericHelper'
import { useLanguage } from '@/store/context/LanguageContext'

const CardWrapper = styled(MainCard)(({ theme }) => ({
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    overflow: 'auto',
    position: 'relative',
    cursor: 'pointer',
    height: '100%',
    minHeight: '160px',
    maxHeight: '300px',
    width: '100%',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-line'
}))

// ===========================|| DOC STORE CARD ||=========================== //

const DocumentStoreCard = ({ data, images, onClick, hasActions }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const { t } = useLanguage()

    return (
        <CardWrapper
            content={false}
            onClick={onClick}
            sx={{
                border: 1,
                borderColor: theme.palette.alpha.border,
                borderRadius: '10px',
                boxShadow: theme.customShadows.card,
                transition: 'box-shadow 150ms ease-out, border-color 150ms ease-out, background-color 150ms ease-out',
                '&:hover': {
                    borderColor: theme.palette.alpha.borderStrong,
                    backgroundColor: theme.palette.alpha.hover,
                    boxShadow: theme.customShadows.cardHover
                }
            }}
        >
            <Box sx={{ height: '100%', p: 2.25 }}>
                <Grid container justifyContent='space-between' direction='column' sx={{ height: '100%' }} gap={2}>
                    <Box display='flex' flexDirection='column' sx={{ flex: 1, width: '100%' }}>
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                overflow: 'hidden',
                                paddingRight: hasActions ? '30px' : 0
                            }}
                        >
                            <Typography
                                variant='h4'
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    flex: 1,
                                    mr: 1
                                }}
                            >
                                {data.name}
                            </Typography>
                            <DocumentStoreStatus status={data.status} />
                        </div>
                        <span
                            style={{
                                display: '-webkit-box',
                                marginTop: 10,
                                overflowWrap: 'break-word',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden'
                            }}
                        >
                            {data.description || ' '}
                        </span>
                    </Box>
                    {/* Usage stats as one quiet line of text, not three pills competing with the status badge */}
                    <Typography variant='caption' sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                        {[
                            `${data.whereUsed?.length ?? 0} ${t(data.whereUsed?.length <= 1 ? 'flow' : 'flows')}`,
                            `${kFormatter(data.totalChars ?? 0)} ${t('chars')}`,
                            `${kFormatter(data.totalChunks ?? 0)} ${t('chunks')}`
                        ].join(' · ')}
                    </Typography>
                    {images && images.length > 0 && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'start',
                                gap: 1
                            }}
                        >
                            {images.slice(0, images.length > 3 ? 3 : images.length).map((img) => (
                                <Box
                                    key={img}
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: '50%',
                                        backgroundColor: customization.isDarkMode ? theme.palette.common.white : theme.palette.alpha.border
                                    }}
                                >
                                    <img
                                        style={{ width: '100%', height: '100%', padding: 5, objectFit: 'contain' }}
                                        alt=''
                                        src={img}
                                        // A missing node icon would show the browser's broken-image glyph: drop the bubble instead
                                        onError={(e) => {
                                            e.currentTarget.parentElement.style.display = 'none'
                                        }}
                                    />
                                </Box>
                            ))}
                            {images.length > 3 && (
                                <Typography sx={{ alignItems: 'center', display: 'flex', fontSize: '.9rem', fontWeight: 200 }}>
                                    + {images.length - 3} {t('More')}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Grid>
            </Box>
        </CardWrapper>
    )
}

DocumentStoreCard.propTypes = {
    data: PropTypes.object,
    images: PropTypes.array,
    onClick: PropTypes.func,
    hasActions: PropTypes.bool
}

export default DocumentStoreCard
