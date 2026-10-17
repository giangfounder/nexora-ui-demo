import { translate } from '@/i18n'
import { exportTables } from '@/utils/tableExport'
import { CHANNELS } from '@/views/omnichannel/mockConversations'
import {
    aiQualityByDay,
    channelCostRoi,
    channelFunnel,
    channelRoiTrend,
    channelSla,
    channelsMatrix,
    cohortRetention,
    customersGrowth90d,
    handoffByTag,
    lifecycleFunnel,
    RANGE_OPTIONS,
    segmentsBreakdown,
    segmentsByStage,
    segmentsByType,
    sentimentByChannel,
    sentimentByDay,
    slaTrend,
    topSpendCustomers,
    topTopics
} from './mockReports'

// ==============================|| REPORTS — EXPORT ||============================== //
// Every report exports the tables behind its charts, filtered the same way the screen is.

const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90 }

const table = (name, rows, columns) => ({ name: translate(name), columns, rows })
const col = (key, label, vars) => ({ key, label: translate(label, vars) })

// Translated when the export runs, so files follow the active language.
const tr = (rows, ...keys) => rows.map((r) => ({ ...r, ...Object.fromEntries(keys.map((k) => [k, translate(r[k])])) }))

// Build the report's tables for the current filters.
const buildTables = (reportKey, { range, channel }) => {
    const channelCols = [col('channel', 'Kênh')]
    const dayCol = col('day', 'Ngày')
    const days = RANGE_DAYS[range] || 30
    const lastDays = (rows) => rows.slice(-days)
    const byChannel = (rows) => (channel === 'all' ? rows : rows.filter((r) => r.channelId === channel))
    const channelKeys = (row) => Object.keys(row).filter((k) => k !== 'day' && (channel === 'all' || k === channel))
    const trendCols = (rows) => [dayCol, ...channelKeys(rows[0] || {}).map((k) => col(k, CHANNELS[k]?.label || k))]

    switch (reportKey) {
        case 'growth':
            return [
                table('Tăng trưởng khách hàng', lastDays(customersGrowth90d), [
                    dayCol,
                    col('total', 'Tổng khách'),
                    col('active', 'Đang hoạt động'),
                    col('new', 'Khách mới')
                ]),
                table('Vòng đời khách hàng', tr(lifecycleFunnel, 'stage'), [col('stage', 'Giai đoạn'), col('count', 'Số khách')]),
                table('Khách chi tiêu cao', topSpendCustomers, [
                    col('name', 'Khách hàng'),
                    col('orders', 'Số đơn'),
                    col('spend', 'Chi tiêu'),
                    col('lastAt', 'Mua gần nhất')
                ])
            ]
        case 'value':
            return [
                table('Phân khúc theo loại', tr(segmentsByType, 'name'), [col('name', 'Loại khách'), col('value', 'Số khách')]),
                table('Phân khúc theo giai đoạn', tr(segmentsByStage, 'stage'), [col('stage', 'Giai đoạn'), col('count', 'Số khách')]),
                table('Chi tiết phân khúc', tr(segmentsBreakdown, 'segment'), [
                    col('segment', 'Phân khúc'),
                    col('count', 'Số khách'),
                    col('share', 'Tỉ trọng'),
                    col('ltv', 'LTV')
                ]),
                table(
                    'Giữ chân theo tuần',
                    cohortRetention.map((r) => ({
                        cohort: translate('Tuần {n}', { n: r.week }),
                        size: r.size,
                        ...Object.fromEntries(r.values.map((v, i) => [`w${i}`, `${v}%`]))
                    })),
                    [
                        col('cohort', 'Nhóm'),
                        col('size', 'Số khách'),
                        ...Array.from({ length: cohortRetention.length }, (_, i) => col(`w${i}`, 'Tuần {n}', { n: i }))
                    ]
                )
            ]
        case 'ai-quality':
            return [
                table('Chất lượng theo ngày', lastDays(aiQualityByDay), [
                    dayCol,
                    col('rating', 'Đánh giá TB'),
                    col('thumbsUp', 'Tích cực (%)'),
                    col('handoffRate', 'Chuyển nhân viên (%)')
                ]),
                table('Chủ đề hàng đầu', tr(topTopics, 'topic'), [
                    col('topic', 'Chủ đề'),
                    col('count', 'Số lượt'),
                    col('trend', 'Xu hướng (%)')
                ]),
                table('Cảm xúc theo ngày', lastDays(sentimentByDay), [
                    dayCol,
                    col('positive', 'Tích cực (%)'),
                    col('neutral', 'Trung lập (%)'),
                    col('negative', 'Tiêu cực (%)')
                ]),
                table('Cảm xúc theo kênh', byChannel(sentimentByChannel), [
                    ...channelCols,
                    col('positive', 'Tích cực (%)'),
                    col('neutral', 'Trung lập (%)'),
                    col('negative', 'Tiêu cực (%)')
                ])
            ]
        case 'handoff':
            return [
                table('Bàn giao theo lý do', tr(handoffByTag, 'label'), [
                    col('label', 'Lý do'),
                    col('count', 'Số lượt'),
                    col('avgResolveHours', 'Xử lý TB (giờ)')
                ]),
                table('SLA theo kênh', byChannel(channelSla), [
                    ...channelCols,
                    col('slaMet', 'Đạt SLA (%)'),
                    col('avgRespSec', 'Phản hồi TB (giây)'),
                    col('breached', 'Vi phạm (%)')
                ]),
                table('Xu hướng SLA', lastDays(slaTrend), trendCols(slaTrend))
            ]
        case 'channels':
        default:
            return [
                table('So sánh kênh', byChannel(channelsMatrix), [
                    ...channelCols,
                    col('conversations', 'Cuộc thoại'),
                    col('conversion', 'Chuyển đổi (%)'),
                    col('responseSec', 'Phản hồi TB (giây)')
                ]),
                table(
                    'Phễu chuyển đổi',
                    Object.entries(channelFunnel)
                        .filter(([key]) => channel === 'all' || key === channel)
                        .flatMap(([key, stages]) =>
                            stages.map((s) => ({ channel: CHANNELS[key]?.label || key, ...s, stage: translate(s.stage) }))
                        ),
                    [...channelCols, col('stage', 'Giai đoạn'), col('count', 'Số lượt')]
                ),
                table('Chi phí & ROI', byChannel(channelCostRoi), [
                    ...channelCols,
                    col('cpa', 'CPA (nghìn ₫)'),
                    col('spend', 'Chi phí (nghìn ₫)'),
                    col('revenue', 'Doanh thu (nghìn ₫)'),
                    col('roi', 'ROI')
                ]),
                table('Xu hướng ROI', lastDays(channelRoiTrend), trendCols(channelRoiTrend))
            ]
    }
}

/**
 * Download the current report.
 * @param {object} opts { reportKey, reportLabel, format, filters: { range, channel, team }, teamLabel }
 * @returns {string|null} the file name that was saved
 */
export const exportReport = ({ reportKey, reportLabel, format, filters, teamLabel }) =>
    exportTables({
        title: translate('Báo cáo NEXORA — {name}', { name: reportLabel }),
        slug: `bao-cao-${reportKey}`,
        key: reportKey,
        format,
        tables: buildTables(reportKey, filters),
        info: [
            [translate('Khoảng thời gian'), translate(RANGE_OPTIONS.find((r) => r.id === filters.range)?.label || filters.range)],
            [translate('Kênh'), filters.channel === 'all' ? translate('Tất cả kênh') : CHANNELS[filters.channel]?.label || filters.channel],
            [translate('Nhóm'), teamLabel || filters.team]
        ]
    })

export { EXPORT_FORMATS, __toHtml } from '@/utils/tableExport'

// exposed for tests / previews
export const __buildTables = buildTables
