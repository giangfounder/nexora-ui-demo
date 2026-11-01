import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Link as RouterLink } from 'react-router-dom'

import { alpha, useTheme } from '@mui/material/styles'
import { Box, Button, Stack, Typography } from '@mui/material'
import { AppIcon } from '@/ui-component/icons/AppIcon'

import logo from '@/assets/images/nexora_logo_primary.svg'
import logoDark from '@/assets/images/nexora_logo_white.svg'
import { getLegalDocs, LEGAL_ENTITY, LEGAL_ORDER, LEGAL_UPDATED_DATE } from './legalContent'
import { useLanguage } from '@/store/context/LanguageContext'
import { LanguageInline } from '@/ui-component/preferences/DisplayPreferences'

// ==============================|| LEGAL PAGE ||============================== //
// Public (no sign-in) page for /terms, /privacy, /cookies. Reads like a document: one column of text,
// a quiet rail to switch documents and jump between sections.

const LegalPage = ({ doc }) => {
    const theme = useTheme()
    const { t, language, locale } = useLanguage()
    const isDark = theme.palette.mode === 'dark'
    const LEGAL_DOCS = getLegalDocs(language)
    const page = LEGAL_DOCS[doc]
    const updated = LEGAL_UPDATED_DATE.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    const [active, setActive] = useState(page.sections[0]?.id)
    const hairline = alpha(theme.palette.text.primary, isDark ? 0.12 : 0.08)

    useEffect(() => {
        document.title = `${page.title} · ${LEGAL_ENTITY.brand}`
        window.scrollTo(0, 0)
        setActive(page.sections[0]?.id)
    }, [page])

    // Highlight the section being read in the rail
    useEffect(() => {
        if (!window.IntersectionObserver) return undefined
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
                if (visible[0]) setActive(visible[0].target.id)
            },
            { rootMargin: '-80px 0px -65% 0px' }
        )
        page.sections.forEach((s) => {
            const el = document.getElementById(s.id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [page])

    const railLink = (selected) => ({
        display: 'block',
        py: 0.75,
        pl: 1.5,
        ml: '-1px',
        borderLeft: `2px solid ${selected ? theme.palette.primary.main : 'transparent'}`,
        color: selected ? 'text.primary' : 'text.secondary',
        fontWeight: selected ? 600 : 400,
        fontSize: 13.5,
        lineHeight: 1.45,
        textDecoration: 'none',
        transition: 'color 120ms, border-color 120ms',
        '&:hover': { color: 'text.primary' }
    })

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: isDark ? 'background.default' : 'background.paper', color: 'text.primary' }}>
            {/* Top bar */}
            <Box
                component='header'
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    borderBottom: `1px solid ${hairline}`,
                    bgcolor: alpha(isDark ? theme.palette.background.default : theme.palette.background.paper, 0.85),
                    backdropFilter: 'blur(10px)',
                    '@media print': { display: 'none' }
                }}
            >
                <Stack
                    direction='row'
                    alignItems='center'
                    justifyContent='space-between'
                    sx={{ maxWidth: 1120, mx: 'auto', px: { xs: 2, md: 4 }, height: 64 }}
                >
                    <Box
                        component={RouterLink}
                        to='/signin'
                        aria-label={t('{brand} — trang đăng nhập', { brand: LEGAL_ENTITY.brand })}
                        sx={{ display: 'flex' }}
                    >
                        <Box component='img' src={isDark ? logoDark : logo} alt={LEGAL_ENTITY.brand} sx={{ height: 36 }} />
                    </Box>
                    <Stack direction='row' spacing={1} alignItems='center'>
                        <LanguageInline sx={{ mr: 0.5 }} />
                        <Button
                            size='small'
                            color='inherit'
                            onClick={() => window.print()}
                            startIcon={<AppIcon name='Printer' size={16} />}
                            sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'inline-flex' } }}
                        >
                            {t('In')}
                        </Button>
                        <Button
                            component={RouterLink}
                            to='/signin'
                            size='small'
                            variant='outlined'
                            startIcon={<AppIcon name='ArrowLeft' size={16} />}
                            sx={{ borderColor: hairline, color: 'text.primary' }}
                        >
                            {t('Về trang đăng nhập')}
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            <Box
                sx={{
                    maxWidth: 1120,
                    mx: 'auto',
                    px: { xs: 2, md: 4 },
                    py: { xs: 4, md: 7 },
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '232px minmax(0, 1fr)' },
                    columnGap: 8
                }}
            >
                {/* Rail: documents + sections */}
                <Box component='nav' aria-label={t('Tài liệu pháp lý')} sx={{ '@media print': { display: 'none' } }}>
                    <Box sx={{ position: { md: 'sticky' }, top: { md: 104 } }}>
                        <Stack
                            direction={{ xs: 'row', md: 'column' }}
                            spacing={{ xs: 1, md: 0.5 }}
                            sx={{ mb: { xs: 4, md: 4 }, overflowX: { xs: 'auto', md: 'visible' } }}
                        >
                            {LEGAL_ORDER.map((key) => {
                                const selected = key === doc
                                return (
                                    <Box
                                        key={key}
                                        component={RouterLink}
                                        to={LEGAL_DOCS[key].path}
                                        aria-current={selected ? 'page' : undefined}
                                        sx={{
                                            flexShrink: 0,
                                            px: 1.5,
                                            py: 1,
                                            borderRadius: '8px',
                                            fontSize: 14,
                                            fontWeight: selected ? 600 : 500,
                                            textDecoration: 'none',
                                            color: selected ? 'primary.main' : 'text.secondary',
                                            bgcolor: selected ? alpha(theme.palette.primary.main, isDark ? 0.16 : 0.07) : 'transparent',
                                            '&:hover': {
                                                color: selected ? 'primary.main' : 'text.primary',
                                                bgcolor: selected ? undefined : alpha(theme.palette.text.primary, 0.04)
                                            }
                                        }}
                                    >
                                        {LEGAL_DOCS[key].label}
                                    </Box>
                                )
                            })}
                        </Stack>
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Typography
                                sx={{
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    color: 'text.disabled',
                                    mb: 1.25,
                                    pl: 1.5
                                }}
                            >
                                {t('Trong trang này')}
                            </Typography>
                            <Box sx={{ borderLeft: `1px solid ${hairline}` }}>
                                {page.sections.map((s) => (
                                    <Box key={s.id} component='a' href={`#${s.id}`} sx={railLink(active === s.id)}>
                                        {s.heading}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Document */}
                <Box component='article' sx={{ maxWidth: 700 }}>
                    <Typography
                        sx={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            color: 'primary.main',
                            mb: 1.5
                        }}
                    >
                        {t('Pháp lý')}
                    </Typography>
                    <Typography
                        component='h1'
                        sx={{
                            fontFamily: `'Barlow Semi Condensed', 'Be Vietnam Pro', 'Segoe UI', sans-serif`,
                            fontSize: { xs: 30, md: 40 },
                            fontWeight: 600,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.15,
                            mb: 1.5
                        }}
                    >
                        {page.title}
                    </Typography>
                    <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mb: 4 }}>
                        {t('Cập nhật lần cuối: {date}', { date: updated })}
                    </Typography>
                    <Typography
                        sx={{ fontSize: 17, lineHeight: 1.7, color: 'text.primary', pb: 4, mb: 5, borderBottom: `1px solid ${hairline}` }}
                    >
                        {page.intro}
                    </Typography>

                    <Stack spacing={5}>
                        {page.sections.map((s, i) => (
                            <Box key={s.id} component='section' id={s.id} sx={{ scrollMarginTop: 96 }}>
                                <Typography
                                    component='h2'
                                    sx={{ fontSize: 19, fontWeight: 600, lineHeight: 1.35, mb: 1.5, display: 'flex', gap: 1.5 }}
                                >
                                    <Box component='span' sx={{ color: 'text.disabled', fontVariantNumeric: 'tabular-nums', minWidth: 22 }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </Box>
                                    {s.heading}
                                </Typography>
                                <Box
                                    sx={{ pl: { sm: '34px' }, '& p, & li': { fontSize: 15.5, lineHeight: 1.75, color: 'text.secondary' } }}
                                >
                                    {s.body?.map((p) => (
                                        <Typography key={p} component='p' sx={{ mb: 1.25 }}>
                                            {p}
                                        </Typography>
                                    ))}
                                    {s.list && (
                                        <Box
                                            component='ul'
                                            sx={{
                                                m: 0,
                                                mb: 1.25,
                                                pl: 2.5,
                                                '& li': { mb: 0.75, pl: 0.5 },
                                                '& li::marker': { color: theme.palette.primary.main }
                                            }}
                                        >
                                            {s.list.map((li) => (
                                                <li key={li}>{li}</li>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Stack>

                    <Box
                        sx={{
                            mt: 7,
                            p: 3,
                            borderRadius: '12px',
                            border: `1px solid ${hairline}`,
                            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.03)
                        }}
                    >
                        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{t('Cần giải đáp thêm?')}</Typography>
                        <Typography sx={{ fontSize: 14.5, color: 'text.secondary', lineHeight: 1.6 }}>
                            {t('Liên hệ bộ phận pháp chế và quyền riêng tư qua')}{' '}
                            <Box component='a' href={`mailto:${LEGAL_ENTITY.privacyEmail}`} sx={{ color: 'primary.main', fontWeight: 500 }}>
                                {LEGAL_ENTITY.privacyEmail}
                            </Box>
                            .
                        </Typography>
                    </Box>

                    <Typography sx={{ mt: 5, fontSize: 12.5, color: 'text.disabled' }}>
                        © {new Date().getFullYear()} {LEGAL_ENTITY.brand}. {t('Bảo lưu mọi quyền.')}
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

LegalPage.propTypes = { doc: PropTypes.oneOf(LEGAL_ORDER).isRequired }

export default LegalPage
