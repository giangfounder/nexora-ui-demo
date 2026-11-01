import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

// material-ui
import { styled } from '@mui/material/styles'
import { Box, Grid, Tooltip, Typography, useTheme } from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import MoreItemsTooltip from '../tooltip/MoreItemsTooltip'
import ScheduleStatusBadge from '@/ui-component/extended/ScheduleStatusBadge'
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

// ===========================|| CONTRACT CARD ||=========================== //

const ItemCard = ({ data, images, icons, scheduleStatus, onClick }) => {
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
                <Grid container justifyContent='space-between' direction='column' sx={{ height: '100%', gap: 3 }}>
                    <Box display='flex' flexDirection='column' sx={{ width: '100%' }}>
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                overflow: 'hidden'
                            }}
                        >
                            {data.iconSrc && (
                                <div
                                    style={{
                                        width: 35,
                                        height: 35,
                                        display: 'flex',
                                        flexShrink: 0,
                                        marginRight: 10,
                                        borderRadius: '50%',
                                        backgroundImage: `url(${data.iconSrc})`,
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center center'
                                    }}
                                ></div>
                            )}
                            {!data.iconSrc && data.color && (
                                <div
                                    style={{
                                        width: 35,
                                        height: 35,
                                        display: 'flex',
                                        flexShrink: 0,
                                        marginRight: 10,
                                        borderRadius: '50%',
                                        background: data.color
                                    }}
                                ></div>
                            )}
                            <Typography
                                variant='h4'
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden'
                                }}
                            >
                                {data.templateName || data.name}
                            </Typography>
                        </div>
                        {data.description && (
                            <span
                                style={{
                                    display: '-webkit-box',
                                    marginTop: 10,
                                    overflowWrap: 'break-word',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden'
                                }}
                            >
                                {data.description}
                            </span>
                        )}
                    </Box>
                    {(images?.length > 0 || icons?.length > 0 || scheduleStatus?.isScheduled) && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    flex: 1,
                                    minWidth: 0,
                                    overflow: 'hidden'
                                }}
                            >
                                {[
                                    ...(images || []).map((img) => ({ type: 'image', src: img.imageSrc, label: img.label })),
                                    ...(icons || []).map((ic) => ({ type: 'icon', icon: ic.icon, color: ic.color, label: ic.name }))
                                ]
                                    .slice(0, 3)
                                    .map((item, index) => (
                                        <Tooltip key={item.src || index} title={item.label} placement='top'>
                                            {item.type === 'image' ? (
                                                <Box
                                                    sx={{
                                                        width: 30,
                                                        height: 30,
                                                        borderRadius: '50%',
                                                        backgroundColor: customization.isDarkMode
                                                            ? theme.palette.common.white
                                                            : theme.palette.alpha.border
                                                    }}
                                                >
                                                    <img
                                                        style={{ width: '100%', height: '100%', padding: 5, objectFit: 'contain' }}
                                                        alt=''
                                                        src={item.src}
                                                        onError={(e) => {
                                                            e.currentTarget.parentElement.style.display = 'none'
                                                        }}
                                                    />
                                                </Box>
                                            ) : (
                                                <div
                                                    style={{
                                                        width: 30,
                                                        height: 30,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <item.icon size={25} color={item.color} />
                                                </div>
                                            )}
                                        </Tooltip>
                                    ))}

                                {(images?.length || 0) + (icons?.length || 0) > 3 && (
                                    <MoreItemsTooltip
                                        images={[
                                            ...(images?.slice(3) || []),
                                            ...(icons?.slice(Math.max(0, 3 - (images?.length || 0))) || []).map((ic) => ({
                                                label: ic.name
                                            }))
                                        ]}
                                    >
                                        <Typography
                                            sx={{
                                                alignItems: 'center',
                                                display: 'flex',
                                                fontSize: '.9rem',
                                                fontWeight: 200
                                            }}
                                        >
                                            + {(images?.length || 0) + (icons?.length || 0) - 3} {t('More')}
                                        </Typography>
                                    </MoreItemsTooltip>
                                )}
                            </Box>
                            <ScheduleStatusBadge scheduleStatus={scheduleStatus} />
                        </Box>
                    )}
                </Grid>
            </Box>
        </CardWrapper>
    )
}

ItemCard.propTypes = {
    data: PropTypes.object,
    images: PropTypes.array,
    icons: PropTypes.array,
    scheduleStatus: PropTypes.object,
    onClick: PropTypes.func
}

export default ItemCard
