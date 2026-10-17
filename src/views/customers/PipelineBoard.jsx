import PropTypes from 'prop-types'
import { useState } from 'react'

// material-ui
import { alpha, useTheme } from '@mui/material/styles'
import { Box, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'

// project imports
import { useLanguage } from '@/store/context/LanguageContext'
import { getStageIcon, tintBg, tintText } from './utils'
import PersonAvatar from '@/ui-component/avatar/PersonAvatar'

// ==============================|| CUSTOMERS — PIPELINE BOARD (KANBAN, 2026) ||============================== //
// Monday-inspired: arrow-shaped spectrum column headers, per-column sum, card with
// priority chip + deal value + avatar + counts + optional AI recommendation nested card.
// No card-in-card noise beyond the deliberate AI callout on high-value cards.

// Spectrum hue mapped by stage progress (early → active → win)
const STAGE_TONES = ['teal', 'orange', 'emerald', 'amber', 'rose']
const stageTone = (idx, total) => {
    if (total <= 1) return 'orange'
    const ratio = idx / (total - 1)
    if (ratio === 0) return 'teal'
    if (ratio >= 1) return 'emerald'
    if (ratio >= 0.66) return 'orange'
    if (ratio >= 0.33) return 'amber'
    return 'teal'
}

// Derive deal value + priority from existing attributes so we don't touch mockCustomers.
const dealValue = (c) => c.attributes?.budget || 0
const priorityOf = (c) => {
    if (c.tags?.includes('Khiếu nại')) return { key: 'critical', label: 'Critical', tone: 'rose', icon: 'WarningOctagon' }
    if (c.tags?.includes('VIP')) return { key: 'high', label: 'High', tone: 'orange', icon: 'CaretDoubleUp' }
    if ((c.attributes?.budget || 0) >= 5_000_000) return { key: 'high', label: 'High', tone: 'orange', icon: 'CaretDoubleUp' }
    if ((c.attributes?.budget || 0) >= 1_000_000) return { key: 'medium', label: 'Medium', tone: 'amber', icon: 'Equals' }
    return { key: 'low', label: 'Low', tone: 'teal', icon: 'CaretDown' }
}

// Tiny mock: one AI recommendation attached to the first card of each column.
const aiRecommend = (stageLabel) => {
    const m = {
        'Mới hỏi': 'Gọi trong 4h tới, tỷ lệ chốt cao khi phản hồi nhanh',
        'Đang tư vấn': 'Gửi báo giá kèm case study — tăng 22% chốt đơn',
        'Đã chốt đơn': 'Chuyển sang đội chăm sóc + upsell dịch vụ đi kèm',
        'Đã mua': 'Gợi ý upsell sản phẩm bổ trợ trong 30 ngày',
        'Khách thân thiết': 'Mời tham gia chương trình loyalty tier vàng'
    }
    return m[stageLabel] || null
}

// Vietnamese-style thousand-separated integer + compact suffix
const formatVND = (n, locale = 'vi-VN') => {
    if (!n) return '—'
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return n.toLocaleString(locale)
}

const PipelineBoard = ({ customers, customerTypes, onMoveCustomer, onOpenCustomer }) => {
    const { t, locale } = useLanguage()
    const theme = useTheme()
    const [typeId, setTypeId] = useState(customerTypes[0]?.id)
    const [draggingId, setDraggingId] = useState(null)
    const [dragOverStage, setDragOverStage] = useState(null)

    const type = customerTypes.find((ct) => ct.id === typeId)
    const customersInType = customers.filter((c) => c.typeId === typeId)
    const alphaBorder = theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
    const teal = theme.palette.spectrum?.teal || theme.palette.info

    return (
        <Stack spacing={2.5}>
            {/* Toolbar: type switch */}
            <Stack direction='row' alignItems='center' spacing={2}>
                <TextField
                    select
                    size='small'
                    label={t('Loại khách hàng')}
                    value={typeId}
                    onChange={(e) => setTypeId(e.target.value)}
                    sx={{ width: 260 }}
                >
                    {customerTypes.map((ct) => (
                        <MenuItem key={ct.id} value={ct.id}>
                            {t(ct.name)}
                        </MenuItem>
                    ))}
                </TextField>
                <Typography variant='caption' color='text.secondary'>
                    {t('{n} khách trong pipeline này', { n: customersInType.length })}
                </Typography>
            </Stack>

            {/* Kanban columns — arrow-shaped spectrum headers */}
            <Box sx={{ display: 'flex', gap: 0.5, overflowX: 'auto', pb: 2, alignItems: 'stretch' }}>
                {type?.stages.map((stage, stageIndex) => {
                    const stageCustomers = customersInType.filter((c) => c.stageId === stage.id)
                    const tone = stageTone(stageIndex, type.stages.length)
                    const palette = theme.palette.spectrum?.[tone] || theme.palette.primary
                    const isDragOver = dragOverStage === stage.id
                    const isFirst = stageIndex === 0

                    // All columns keep the right chevron (pointy head).
                    // Only the first column has a flat left edge; every other column has a left notch.
                    const clip = isFirst
                        ? 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)'
                        : 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)'

                    return (
                        <Box
                            key={stage.id}
                            onDragOver={(e) => {
                                e.preventDefault()
                                if (dragOverStage !== stage.id) setDragOverStage(stage.id)
                            }}
                            onDragLeave={() => setDragOverStage(null)}
                            onDrop={() => {
                                if (draggingId) onMoveCustomer(draggingId, stage.id)
                                setDraggingId(null)
                                setDragOverStage(null)
                            }}
                            sx={{
                                minWidth: 300,
                                width: 300,
                                flexShrink: 0,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {/* Arrow-shaped header — notch left + chevron right */}
                            <Box
                                sx={{
                                    position: 'relative',
                                    height: 38,
                                    bgcolor: palette.main,
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    pl: isFirst ? 2 : 3.5,
                                    pr: 3.5, // every column ends with a chevron head
                                    clipPath: clip,
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.01em'
                                }}
                            >
                                <AppIcon name={getStageIcon(stage.id)} size={16} style={{ marginRight: 6, flexShrink: 0 }} />
                                <span>{t(stage.label)}</span>
                                <Box
                                    component='span'
                                    sx={{
                                        ml: 1,
                                        px: 0.75,
                                        height: 20,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        borderRadius: 0.75,
                                        bgcolor: alpha('#fff', 0.25),
                                        fontSize: '0.6875rem',
                                        fontWeight: 700
                                    }}
                                >
                                    /{stageCustomers.length}
                                </Box>
                            </Box>

                            {/* Column body */}
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 1.25,
                                    minHeight: 120,
                                    bgcolor: isDragOver ? alpha(palette.main, 0.05) : alpha(palette.main, 0.02),
                                    borderLeft: 'none', // no colored left strip (project rule)
                                    borderRight: `1px solid ${alphaBorder}`,
                                    borderBottom: `1px solid ${alphaBorder}`,
                                    borderTop: 'none',
                                    transition: 'background-color 120ms ease-out'
                                }}
                            >
                                {/* Cards */}
                                <Stack spacing={1}>
                                    {stageCustomers.map((c, cardIdx) => {
                                        const pri = priorityOf(c)
                                        const priTone = theme.palette.spectrum?.[pri.tone] || theme.palette.primary
                                        const ai = cardIdx === 0 ? aiRecommend(stage.label) : null
                                        return (
                                            <Box key={c.id}>
                                                <Box
                                                    draggable
                                                    role='button'
                                                    tabIndex={0}
                                                    aria-label={t('Mở {name}', { name: c.name })}
                                                    onDragStart={() => setDraggingId(c.id)}
                                                    onDragEnd={() => setDraggingId(null)}
                                                    onClick={() => onOpenCustomer(c.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault()
                                                            onOpenCustomer(c.id)
                                                        }
                                                    }}
                                                    sx={{
                                                        p: 1.75,
                                                        borderRadius: '10px',
                                                        border: `1px solid ${alphaBorder}`,
                                                        bgcolor: theme.palette.background.paper,
                                                        cursor: 'grab',
                                                        transition: 'border-color 160ms ease-out, background-color 160ms ease-out',
                                                        '&:hover': {
                                                            borderColor: alpha(palette.main, 0.4),
                                                            bgcolor: alpha(theme.palette.text.primary, 0.02)
                                                        },
                                                        '&:active': { cursor: 'grabbing' },
                                                        '&:focus-visible': {
                                                            outline: 'none',
                                                            boxShadow: theme.customShadows?.focusRing
                                                        }
                                                    }}
                                                >
                                                    {/* Row 1: name + kebab */}
                                                    <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 1.25 }}>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 600,
                                                                fontSize: '0.9375rem',
                                                                lineHeight: 1.35,
                                                                flex: 1,
                                                                minWidth: 0
                                                            }}
                                                            noWrap
                                                        >
                                                            {c.name}
                                                        </Typography>
                                                        <IconButton
                                                            size='small'
                                                            onClick={(e) => e.stopPropagation()}
                                                            aria-label={t('Thao tác thêm')}
                                                            sx={{ p: 0.5, opacity: 0.4, '&:hover': { opacity: 1 }, ml: -0.5 }}
                                                        >
                                                            <AppIcon name='DotsThreeVertical' size={16} />
                                                        </IconButton>
                                                    </Stack>

                                                    {/* Row 2: priority pill (Monday-style: color bar + label) */}
                                                    <Stack direction='row' spacing={0.75} alignItems='center' sx={{ mb: 1.25 }}>
                                                        <Box
                                                            component='span'
                                                            sx={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                height: 26,
                                                                pl: 0.5,
                                                                pr: 1.25,
                                                                borderRadius: 0.75,
                                                                bgcolor: tintBg(theme, priTone.main, 0.14, 0.22),
                                                                color: tintText(theme, priTone),
                                                                fontSize: '0.75rem',
                                                                fontWeight: 600,
                                                                gap: 0.75
                                                            }}
                                                        >
                                                            <AppIcon name={pri.icon} size={14} color={priTone.main} />
                                                            {t(pri.label)}
                                                        </Box>
                                                    </Stack>

                                                    {/* Row 3: deal value — bigger, Monday-style layout (value bold + subtle label) */}
                                                    <Box
                                                        sx={{
                                                            display: 'inline-flex',
                                                            alignItems: 'baseline',
                                                            gap: 0.75,
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 0.75,
                                                            bgcolor: alpha(theme.palette.text.primary, 0.05),
                                                            mb: 1.5
                                                        }}
                                                    >
                                                        <Typography
                                                            component='span'
                                                            sx={{
                                                                fontSize: '0.875rem',
                                                                fontWeight: 700,
                                                                fontVariantNumeric: 'tabular-nums',
                                                                lineHeight: 1
                                                            }}
                                                        >
                                                            ₫{formatVND(dealValue(c), locale)}
                                                        </Typography>
                                                        <Typography
                                                            component='span'
                                                            sx={{
                                                                fontSize: '0.6875rem',
                                                                color: 'text.secondary',
                                                                fontWeight: 500,
                                                                lineHeight: 1
                                                            }}
                                                        >
                                                            {t('Deal value')}
                                                        </Typography>
                                                    </Box>

                                                    {/* Row 4: avatar + counts */}
                                                    <Stack direction='row' alignItems='center' spacing={1}>
                                                        <PersonAvatar name={c.name} size={28} />
                                                        <Box sx={{ flex: 1 }} />
                                                        <Tooltip title={t('Bình luận')}>
                                                            <Stack
                                                                direction='row'
                                                                spacing={0.5}
                                                                alignItems='center'
                                                                sx={{ color: 'text.secondary' }}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 500,
                                                                        fontVariantNumeric: 'tabular-nums'
                                                                    }}
                                                                >
                                                                    {c.attributes?.commentCount ?? c.id.length + 2}
                                                                </Typography>
                                                                <AppIcon name='ChatCircle' size={14} />
                                                            </Stack>
                                                        </Tooltip>
                                                        <Tooltip title={t('Công việc con')}>
                                                            <Stack
                                                                direction='row'
                                                                spacing={0.5}
                                                                alignItems='center'
                                                                sx={{ color: 'text.secondary' }}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 500,
                                                                        fontVariantNumeric: 'tabular-nums'
                                                                    }}
                                                                >
                                                                    {c.attributes?.subitemCount ?? 3}
                                                                </Typography>
                                                                <AppIcon name='TreeView' size={14} />
                                                            </Stack>
                                                        </Tooltip>
                                                    </Stack>
                                                </Box>

                                                {/* Nested AI recommendation card — first card only per column */}
                                                {ai && (
                                                    <Box
                                                        onClick={(e) => e.stopPropagation()}
                                                        sx={{
                                                            mt: 0.75,
                                                            ml: 1.5,
                                                            p: 1,
                                                            borderRadius: 1,
                                                            bgcolor: tintBg(theme, teal.main, 0.08, 0.14),
                                                            border: `1px solid ${tintBg(theme, teal.main, 0.2, 0.3)}`
                                                        }}
                                                    >
                                                        <Stack direction='row' spacing={0.75} alignItems='flex-start'>
                                                            <AppIcon
                                                                name='TrendUp'
                                                                size={13}
                                                                style={{
                                                                    color: tintText(theme, teal),
                                                                    marginTop: 2,
                                                                    flexShrink: 0
                                                                }}
                                                            />
                                                            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                                                                <Typography
                                                                    variant='caption'
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        color: tintText(theme, teal),
                                                                        fontSize: '0.625rem',
                                                                        letterSpacing: '0.03em'
                                                                    }}
                                                                >
                                                                    {t('Gợi ý')}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>{ai}</Typography>
                                                            </Stack>
                                                        </Stack>
                                                    </Box>
                                                )}
                                            </Box>
                                        )
                                    })}

                                    {stageCustomers.length === 0 && (
                                        <Stack alignItems='center' spacing={0.5} sx={{ py: 4, color: 'text.disabled' }}>
                                            <AppIcon name='Tray' size={22} style={{ opacity: 0.5 }} />
                                            <Typography variant='caption' sx={{ fontSize: '0.75rem', textAlign: 'center' }}>
                                                {t('Kéo thẻ vào đây')}
                                            </Typography>
                                        </Stack>
                                    )}
                                </Stack>
                            </Box>
                        </Box>
                    )
                })}
            </Box>
        </Stack>
    )
}

PipelineBoard.propTypes = {
    customers: PropTypes.array,
    customerTypes: PropTypes.array,
    onMoveCustomer: PropTypes.func,
    onOpenCustomer: PropTypes.func
}

export default PipelineBoard
