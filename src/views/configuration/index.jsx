import { useMemo } from 'react'
import PropTypes from 'prop-types'

import { alpha, useTheme } from '@mui/material/styles'
import { Box, Chip, Divider, MenuItem, Paper, Stack, Switch, TextField, Typography } from '@mui/material'
import { IconBrandFacebook, IconBrandGoogle } from '@tabler/icons-react'
import { iconComponent } from '@/ui-component/icons/AppIcon'

import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import SubNav from '@/ui-component/nav/SubNav'
import { useLanguage } from '@/store/context/LanguageContext'
import useUrlTabState from '@/hooks/useUrlTabState'
import { FormField } from '@/hooks/useDialogShell'
import { ZaloOAIcon } from '@/views/omnichannel/channelBrandIcons'
import RoutingRulesTab from './RoutingRulesTab'
import ChannelAgentTab from './ChannelAgentTab'
import IntegrationsTab from './IntegrationsTab'

const SECTION_KEYS = ['connections', 'routing', 'agents', 'general', 'security', 'webhooks', 'google', 'meta', 'zalo']

const useBorder = () => {
    const theme = useTheme()
    return theme.palette.alpha?.border || alpha(theme.palette.text.primary, 0.08)
}

const SettingsView = () => {
    const { t } = useLanguage()
    const [sectionIdx, setSectionIdx] = useUrlTabState('section', SECTION_KEYS)

    const groups = useMemo(
        () => [
            {
                key: 'channels',
                label: t('Kênh'),
                items: [
                    { key: 'connections', label: t('Kết nối kênh'), icon: iconComponent('PlugsConnected') },
                    { key: 'routing', label: t('Định tuyến hội thoại'), icon: iconComponent('Path') },
                    { key: 'agents', label: t('Trả lời tự động theo kênh'), icon: iconComponent('ArrowBendUpLeft') }
                ]
            },
            {
                key: 'system',
                label: t('Hệ thống'),
                items: [
                    { key: 'general', label: t('Chung'), icon: iconComponent('Sliders') },
                    { key: 'security', label: t('Bảo mật'), icon: iconComponent('Shield') },
                    { key: 'webhooks', label: t('Webhook'), icon: iconComponent('Broadcast') }
                ]
            },
            {
                key: 'integrations',
                label: t('Tích hợp'),
                items: [
                    { key: 'google', label: t('Google Workspace'), icon: IconBrandGoogle },
                    { key: 'meta', label: t('Meta Business'), icon: IconBrandFacebook },
                    { key: 'zalo', label: t('Zalo OA'), icon: ZaloOAIcon }
                ]
            }
        ],
        [t]
    )

    const currentKey = SECTION_KEYS[sectionIdx] || 'connections'
    const gotoIndex = (key) => {
        const idx = SECTION_KEYS.indexOf(key)
        if (idx >= 0) setSectionIdx(idx)
    }

    const navItems = groups.flatMap((g) => g.items.map((it) => ({ ...it, group: g.label })))

    return (
        <MainCard>
            <ViewHeader title='Cấu hình' />
            <SubNav ariaLabel={t('Cấu hình')} items={navItems} value={currentKey} onChange={gotoIndex} />
            <Box key={currentKey}>
                {currentKey === 'connections' && (
                    <SectionShell title={t('Kết nối kênh')} summary={t('Chỉ nhận tin nhắn từ các kênh đã kết nối.')}>
                        <IntegrationsTab />
                    </SectionShell>
                )}
                {currentKey === 'routing' && (
                    <SectionShell
                        title={t('Định tuyến hội thoại')}
                        summary={t('Quyết định hội thoại mới được giao cho ai — luật khớp đầu tiên theo ưu tiên sẽ áp dụng.')}
                    >
                        <RoutingRulesTab />
                    </SectionShell>
                )}
                {currentKey === 'agents' && (
                    <SectionShell
                        title={t('Trả lời tự động theo kênh')}
                        summary={t('Agent được chọn trả lời khách trước; tắt tự động trả lời để chuyển thẳng cho nhân viên.')}
                    >
                        <ChannelAgentTab />
                    </SectionShell>
                )}
                {currentKey === 'general' && <GeneralSection />}
                {currentKey === 'security' && <SecuritySection />}
                {currentKey === 'webhooks' && <WebhooksSection />}
                {currentKey === 'google' && <PlaceholderIntegration name='Google Workspace' Icon={IconBrandGoogle} />}
                {currentKey === 'meta' && <PlaceholderIntegration name='Meta Business' Icon={IconBrandFacebook} />}
                {currentKey === 'zalo' && <PlaceholderIntegration name='Zalo OA' Icon={ZaloOAIcon} />}
            </Box>
        </MainCard>
    )
}

const SectionShell = ({ title, summary, children }) => {
    const border = useBorder()
    return (
        <Paper elevation={0} sx={{ border: `1px solid ${border}`, boxShadow: 'none', p: 3 }}>
            <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                <Typography variant='h2'>{title}</Typography>
                {summary && (
                    <Typography variant='caption' color='text.secondary'>
                        {summary}
                    </Typography>
                )}
            </Stack>
            {children}
        </Paper>
    )
}

SectionShell.propTypes = {
    title: PropTypes.node,
    summary: PropTypes.node,
    children: PropTypes.node
}

const GeneralSection = () => {
    const { t } = useLanguage()
    return (
        <SectionShell title={t('Chung')}>
            <Stack spacing={2} sx={{ maxWidth: 480 }}>
                <FormField label={t('Tên tổ chức')} htmlFor='cfg-org-name'>
                    <TextField id='cfg-org-name' fullWidth size='small' defaultValue='NEXORA JSC' />
                </FormField>
                <FormField label={t('Múi giờ')}>
                    <TextField select fullWidth size='small' defaultValue='Asia/Ho_Chi_Minh' inputProps={{ 'aria-label': t('Múi giờ') }}>
                        <MenuItem value='Asia/Ho_Chi_Minh'>Asia/Ho_Chi_Minh (GMT+7)</MenuItem>
                        <MenuItem value='Asia/Bangkok'>Asia/Bangkok (GMT+7)</MenuItem>
                        <MenuItem value='Asia/Singapore'>Asia/Singapore (GMT+8)</MenuItem>
                    </TextField>
                </FormField>
                <FormField label={t('Ngôn ngữ mặc định')}>
                    <TextField select fullWidth size='small' defaultValue='vi' inputProps={{ 'aria-label': t('Ngôn ngữ mặc định') }}>
                        <MenuItem value='vi'>{t('Tiếng Việt')}</MenuItem>
                        <MenuItem value='en'>English</MenuItem>
                    </TextField>
                </FormField>
            </Stack>
        </SectionShell>
    )
}

const SecuritySection = () => {
    const { t } = useLanguage()
    return (
        <SectionShell title={t('Bảo mật')} summary={t('Áp dụng cho mọi tài khoản trong tổ chức ở lần đăng nhập tiếp theo.')}>
            <Stack spacing={2.5} sx={{ maxWidth: 560 }}>
                <ToggleRow
                    title={t('Bắt buộc 2FA')}
                    hint={t('Tài khoản chưa bật 2FA sẽ phải thiết lập trước khi vào hệ thống.')}
                    defaultChecked
                />
                <ToggleRow title={t('Cho phép đăng nhập bằng SSO')} />
                <Divider />
                <FormField label={t('Thời gian hết phiên')} hint={t('Tự đăng xuất sau khoảng thời gian không thao tác.')}>
                    <TextField select fullWidth size='small' defaultValue='30' inputProps={{ 'aria-label': t('Thời gian hết phiên') }}>
                        <MenuItem value='15'>{t('{n} phút', { n: 15 })}</MenuItem>
                        <MenuItem value='30'>{t('{n} phút', { n: 30 })}</MenuItem>
                        <MenuItem value='60'>{t('{n} phút', { n: 60 })}</MenuItem>
                        <MenuItem value='240'>{t('{n} giờ', { n: 4 })}</MenuItem>
                    </TextField>
                </FormField>
            </Stack>
        </SectionShell>
    )
}

const EmptyState = ({ Icon, title, body }) => {
    const border = useBorder()
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                border: `1px dashed ${border}`,
                boxShadow: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                textAlign: 'center'
            }}
        >
            <Box sx={{ color: 'text.disabled', mb: 0.5, display: 'flex' }}>
                <Icon size={24} stroke={1.75} />
            </Box>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {title}
            </Typography>
            {body && (
                <Typography variant='caption' color='text.secondary'>
                    {body}
                </Typography>
            )}
        </Paper>
    )
}

EmptyState.propTypes = {
    Icon: PropTypes.elementType,
    title: PropTypes.node,
    body: PropTypes.node
}

const WebhooksSection = () => {
    const { t } = useLanguage()
    return (
        <SectionShell title={t('Webhook')}>
            <EmptyState
                Icon={iconComponent('Broadcast')}
                title={t('Sắp có')}
                body={t('Bạn sẽ có thể đăng ký endpoint để nhận sự kiện hội thoại và đơn hàng.')}
            />
        </SectionShell>
    )
}

const PlaceholderIntegration = ({ name, Icon }) => {
    const { t } = useLanguage()
    const border = useBorder()
    return (
        <SectionShell title={name}>
            <Stack spacing={2.5} sx={{ maxWidth: 560 }}>
                <Paper
                    elevation={0}
                    sx={{ p: 2, border: `1px solid ${border}`, boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 1.5 }}
                >
                    <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                        <Icon size={20} stroke={1.75} />
                    </Box>
                    <Stack sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                            {t('Chưa kết nối')}
                        </Typography>
                    </Stack>
                    <Chip size='small' variant='outlined' label={t('Sắp có')} sx={{ color: 'text.secondary', borderColor: border }} />
                </Paper>
                <FormField label={t('Client ID')} htmlFor={`cfg-${name}-client`}>
                    <TextField id={`cfg-${name}-client`} fullWidth size='small' disabled placeholder='—' />
                </FormField>
            </Stack>
        </SectionShell>
    )
}

PlaceholderIntegration.propTypes = {
    name: PropTypes.string,
    Icon: PropTypes.elementType
}

const ToggleRow = ({ title, hint, defaultChecked }) => (
    <Stack direction='row' spacing={2} alignItems='center' justifyContent='space-between'>
        <Stack sx={{ minWidth: 0 }}>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {title}
            </Typography>
            {hint && (
                <Typography variant='caption' color='text.secondary'>
                    {hint}
                </Typography>
            )}
        </Stack>
        <Switch defaultChecked={defaultChecked} size='small' inputProps={{ 'aria-label': typeof title === 'string' ? title : undefined }} />
    </Stack>
)

ToggleRow.propTypes = {
    title: PropTypes.node,
    hint: PropTypes.node,
    defaultChecked: PropTypes.bool
}

export default SettingsView
