import { useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { IconChartBar, IconHeadset, IconMessageCheck, IconTrendingUp, IconUserStar } from '@tabler/icons-react'

import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import SubNav from '@/ui-component/nav/SubNav'
import { useLanguage } from '@/store/context/LanguageContext'
import useUrlTabState from '@/hooks/useUrlTabState'
import ExportMenu from '@/ui-component/export/ExportMenu'

import FilterBar, { TEAM_OPTIONS } from './FilterBar'
import { exportReport } from './reportExport'
import CustomersOverview from './sections/CustomersOverview'
import CustomersSegments from './sections/CustomersSegments'
import CustomersLifecycle from './sections/CustomersLifecycle'
import CustomersCohort from './sections/CustomersCohort'
import ChatAIQuality from './sections/ChatAIQuality'
import ChatTopics from './sections/ChatTopics'
import ChatSentiment from './sections/ChatSentiment'
import ChatHandoff from './sections/ChatHandoff'
import ChannelsCompare from './sections/ChannelsCompare'
import ChannelsFunnel from './sections/ChannelsFunnel'
import ChannelsCost from './sections/ChannelsCost'
import ChannelsSLA from './sections/ChannelsSLA'

const REPORTS = [
    {
        key: 'growth',
        label: 'Tăng trưởng',
        question: 'Khách hàng đang tăng hay giảm?',
        icon: IconTrendingUp,
        sections: [CustomersOverview, CustomersLifecycle]
    },
    {
        key: 'value',
        label: 'Giá trị khách',
        question: 'Ai là khách giá trị?',
        icon: IconUserStar,
        sections: [CustomersSegments, CustomersCohort]
    },
    {
        key: 'ai-quality',
        label: 'Chất lượng trả lời',
        question: 'Trả lời tự động tốt đến đâu?',
        icon: IconMessageCheck,
        sections: [ChatAIQuality, ChatTopics, ChatSentiment]
    },
    {
        key: 'handoff',
        label: 'Bàn giao & SLA',
        question: 'Việc nào cần người xử lý?',
        icon: IconHeadset,
        sections: [ChatHandoff, ChannelsSLA]
    },
    {
        key: 'channels',
        label: 'Hiệu quả kênh',
        question: 'Kênh nào hiệu quả?',
        icon: IconChartBar,
        sections: [ChannelsCompare, ChannelsFunnel, ChannelsCost]
    }
]

const REPORT_KEYS = REPORTS.map((r) => r.key)

const ReportsView = () => {
    const { t } = useLanguage()
    const [reportIdx, setReportIdx] = useUrlTabState('report', REPORT_KEYS)

    const [range, setRange] = useState('30d')
    const [channel, setChannel] = useState('all')
    const [team, setTeam] = useState('all')

    const report = REPORTS[reportIdx] || REPORTS[0]
    const items = useMemo(() => REPORTS.map((r) => ({ ...r, label: t(r.label) })), [t])

    const handleExport = (format) =>
        exportReport({
            reportKey: report.key,
            reportLabel: t(report.label),
            format,
            filters: { range, channel, team },
            teamLabel: t(TEAM_OPTIONS.find((o) => o.id === team)?.label || team)
        })

    return (
        <MainCard>
            <ViewHeader title='Báo cáo'>
                <ExportMenu caption={`${t('Xuất')} · ${t(report.label)}`} onExport={handleExport} />
            </ViewHeader>
            <SubNav ariaLabel={t('Báo cáo')} items={items} value={report.key} onChange={(key) => setReportIdx(REPORT_KEYS.indexOf(key))} />
            <FilterBar
                range={range}
                onRangeChange={setRange}
                channel={channel}
                onChannelChange={setChannel}
                team={team}
                onTeamChange={setTeam}
            />
            <Box key={report.key} sx={{ minHeight: 'calc(100vh - 320px)' }}>
                <Typography variant='h2' component='h2' sx={{ mb: 3 }}>
                    {t(report.question)}
                </Typography>
                {report.sections.map((Section, i) => (
                    <Section key={`${report.key}-${i}`} />
                ))}
            </Box>
        </MainCard>
    )
}

export default ReportsView
