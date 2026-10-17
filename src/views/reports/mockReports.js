import { CHANNELS, CHANNEL_ORDER, HANDOFF_TAGS } from '@/views/omnichannel/mockConversations'

const DAY_LABELS_90 = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(2026, 5, 22)
    d.setDate(d.getDate() + i)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
})

const seeded = (seed) => {
    let s = seed
    return () => {
        s = (s * 9301 + 49297) % 233280
        return s / 233280
    }
}

const rnd = seeded(97)

export const RANGE_OPTIONS = [
    { id: '7d', label: '7 ngày' },
    { id: '30d', label: '30 ngày' },
    { id: '90d', label: '90 ngày' }
]

export const customersGrowth90d = DAY_LABELS_90.map((day, i) => {
    const base = 1240 + Math.round(i * 4.1 + Math.sin(i / 6) * 22 + rnd() * 18)
    const active = Math.round(base * (0.62 + rnd() * 0.06))
    return { day, total: base, active, new: 6 + Math.round(rnd() * 12) }
})

export const customersKpi = {
    total: { label: 'Tổng khách hàng', value: '1.842', delta: 12.4, tone: 'orange', icon: 'UsersThree' },
    new: { label: 'Khách mới (30 ngày)', value: '284', delta: 8.7, tone: 'teal', icon: 'UserPlus' },
    churn: { label: 'Churn (30 ngày)', value: '3,2%', delta: -1.4, tone: 'rose', icon: 'UserMinus' },
    ltv: { label: 'LTV trung bình', value: '4,2M', delta: 6.1, tone: 'emerald', icon: 'Coins' }
}

export const topSpendCustomers = [
    { id: 'c-vip-01', name: 'Công ty TNHH Gia Bảo', orders: 42, spend: '182,4M', lastAt: '2026-09-19' },
    { id: 'c-vip-02', name: 'Nguyễn Thị Ngọc Anh', orders: 28, spend: '96,1M', lastAt: '2026-09-18' },
    { id: 'c-vip-03', name: 'Global Traders Co.', orders: 19, spend: '78,3M', lastAt: '2026-09-17' },
    { id: 'c-vip-04', name: 'Lê Thu Hà', orders: 34, spend: '62,7M', lastAt: '2026-09-18' },
    { id: 'c-vip-05', name: 'Trần Minh Quân', orders: 22, spend: '54,9M', lastAt: '2026-09-16' },
    { id: 'c-vip-06', name: 'BrightSteel Corp', orders: 11, spend: '48,2M', lastAt: '2026-09-14' },
    { id: 'c-vip-07', name: 'Hoàng Bảo Long', orders: 17, spend: '41,5M', lastAt: '2026-09-15' }
]

export const segmentsByType = [
    { name: 'Khách lẻ (B2C)', value: 1024, tone: 'orange' },
    { name: 'Doanh nghiệp (B2B)', value: 512, tone: 'teal' },
    { name: 'Đại lý', value: 218, tone: 'amber' },
    { name: 'Khách vãng lai', value: 88, tone: 'rose' }
]

export const segmentsByStage = [
    { stage: 'Mới hỏi', count: 312 },
    { stage: 'Đang tư vấn', count: 264 },
    { stage: 'Đã báo giá', count: 198 },
    { stage: 'Đã chốt đơn', count: 402 },
    { stage: 'Đã mua', count: 486 },
    { stage: 'Khách thân thiết', count: 180 }
]

export const segmentsBreakdown = [
    { segment: 'B2C · Thời trang', count: 412, share: '22,4%', ltv: '2,1M' },
    { segment: 'B2C · Mỹ phẩm', count: 286, share: '15,5%', ltv: '1,8M' },
    { segment: 'B2B · Nội thất', count: 214, share: '11,6%', ltv: '18,4M' },
    { segment: 'B2B · Điện tử', count: 178, share: '9,7%', ltv: '22,1M' },
    { segment: 'Đại lý · Khu vực HCM', count: 132, share: '7,2%', ltv: '12,6M' },
    { segment: 'Đại lý · Khu vực HN', count: 86, share: '4,7%', ltv: '9,8M' }
]

export const lifecycleFunnel = [
    { stage: 'Mới', count: 2480, tone: 'teal' },
    { stage: 'Tiềm năng', count: 1420, tone: 'orange' },
    { stage: 'Thương lượng', count: 812, tone: 'amber' },
    { stage: 'Khách hàng', count: 486, tone: 'emerald' },
    { stage: 'VIP', count: 132, tone: 'rose' }
]

export const cohortRetention = (() => {
    const weeks = 8
    const rows = []
    for (let cohort = 0; cohort < weeks; cohort++) {
        const row = { cohort: `Tuần ${cohort + 1}`, week: cohort + 1, size: 120 + Math.round(rnd() * 80), values: [] }
        for (let w = 0; w < weeks - cohort; w++) {
            const base = w === 0 ? 100 : Math.max(6, Math.round(96 - w * 11 - rnd() * 6))
            row.values.push(base)
        }
        rows.push(row)
    }
    return rows
})()

export const aiQualityKpi = {
    rating: { label: 'Đánh giá TB', value: '4,6/5', delta: 2.1, tone: 'emerald', icon: 'Star' },
    thumbsUp: { label: 'Phản hồi tích cực', value: '87%', delta: 3.4, tone: 'teal', icon: 'ThumbsUp' },
    handoff: { label: 'Chuyển nhân viên', value: '11,2%', delta: -0.8, tone: 'amber', icon: 'ArrowBendUpRight' },
    firstResponse: { label: 'Phản hồi đầu (giây)', value: '3,4s', delta: -12.5, tone: 'orange', icon: 'Timer' }
}

export const aiQualityByDay = DAY_LABELS_90.slice(-30).map((day, i) => ({
    day,
    rating: +(4.2 + Math.sin(i / 4) * 0.25 + rnd() * 0.15).toFixed(2),
    thumbsUp: 78 + Math.round(Math.sin(i / 3) * 6 + rnd() * 5),
    handoffRate: +(9 + Math.sin(i / 5) * 2 + rnd() * 1.5).toFixed(1)
}))

export const topTopics = [
    { topic: 'Kiểm tra tình trạng đơn', count: 486, trend: 8.2 },
    { topic: 'Hỏi giá & khuyến mãi', count: 412, trend: 12.4 },
    { topic: 'Tư vấn size / phiên bản', count: 318, trend: -3.1 },
    { topic: 'Chính sách đổi trả', count: 264, trend: 5.8 },
    { topic: 'Hướng dẫn thanh toán', count: 218, trend: 2.6 },
    { topic: 'Bảo hành & sửa chữa', count: 182, trend: -6.4 },
    { topic: 'Yêu cầu hoàn tiền', count: 148, trend: 14.1 },
    { topic: 'Báo giá số lượng lớn', count: 126, trend: 22.6 },
    { topic: 'Trạng thái tài khoản', count: 96, trend: -1.8 },
    { topic: 'Khiếu nại giao hàng', count: 84, trend: 9.4 }
]

export const sentimentByDay = DAY_LABELS_90.slice(-14).map((day, i) => {
    const pos = 55 + Math.round(Math.sin(i / 2) * 8 + rnd() * 6)
    const neu = 26 + Math.round(rnd() * 6)
    const neg = 100 - pos - neu
    return { day, positive: pos, neutral: neu, negative: Math.max(4, neg) }
})

export const sentimentTotals = [
    { name: 'Tích cực', value: 61, tone: 'emerald' },
    { name: 'Trung lập', value: 28, tone: 'teal' },
    { name: 'Tiêu cực', value: 11, tone: 'rose' }
]

export const sentimentByChannel = CHANNEL_ORDER.map((key) => {
    const pos = 45 + Math.round(rnd() * 30)
    const neu = 20 + Math.round(rnd() * 20)
    const neg = 100 - pos - neu
    return {
        channelId: key,
        channel: CHANNELS[key].label,
        positive: pos,
        neutral: neu,
        negative: Math.max(4, neg)
    }
})

export const handoffByTag = Object.values(HANDOFF_TAGS).map((tag, i) => ({
    id: tag.id,
    label: tag.label,
    tone: tag.tone,
    count: [148, 96, 72, 54][i] || 40,
    avgResolveHours: [3.2, 5.8, 8.1, 2.4][i] || 4
}))

export const channelsMatrix = CHANNEL_ORDER.map((key, i) => {
    const conv = [1240, 986, 412, 782, 512, 648, 328, 214, 486, 292][i]
    const conversion = +(12 + rnd() * 14).toFixed(1)
    const responseSec = Math.round(3 + rnd() * 18)
    return {
        channelId: key,
        channel: CHANNELS[key].label,
        color: CHANNELS[key].color,
        conversations: conv,
        conversion,
        responseSec
    }
})

export const channelFunnel = {
    facebook: [
        { stage: 'Tin nhắn mới', count: 1240 },
        { stage: 'Có phản hồi', count: 1104 },
        { stage: 'Tư vấn', count: 728 },
        { stage: 'Chốt đơn', count: 312 },
        { stage: 'Thanh toán', count: 264 }
    ],
    zalo: [
        { stage: 'Tin nhắn mới', count: 986 },
        { stage: 'Có phản hồi', count: 892 },
        { stage: 'Tư vấn', count: 604 },
        { stage: 'Chốt đơn', count: 248 },
        { stage: 'Thanh toán', count: 206 }
    ],
    website: [
        { stage: 'Tin nhắn mới', count: 648 },
        { stage: 'Có phản hồi', count: 612 },
        { stage: 'Tư vấn', count: 384 },
        { stage: 'Chốt đơn', count: 172 },
        { stage: 'Thanh toán', count: 148 }
    ],
    shopee: [
        { stage: 'Tin nhắn mới', count: 486 },
        { stage: 'Có phản hồi', count: 462 },
        { stage: 'Tư vấn', count: 296 },
        { stage: 'Chốt đơn', count: 142 },
        { stage: 'Thanh toán', count: 128 }
    ]
}

export const channelCostRoi = CHANNEL_ORDER.map((key, i) => {
    const cpa = [62, 48, 55, 76, 84, 42, 96, 128, 38, 52][i]
    const roi = +(2.4 + rnd() * 3.6).toFixed(2)
    return {
        channelId: key,
        channel: CHANNELS[key].label,
        color: CHANNELS[key].color,
        cpa,
        spend: cpa * 40,
        revenue: Math.round(cpa * 40 * roi),
        roi
    }
})

export const channelRoiTrend = DAY_LABELS_90.slice(-30).map((day, i) => ({
    day,
    facebook: +(2.6 + Math.sin(i / 3) * 0.4 + rnd() * 0.2).toFixed(2),
    zalo: +(3.1 + Math.sin(i / 4) * 0.5 + rnd() * 0.2).toFixed(2),
    website: +(2.2 + Math.sin(i / 5) * 0.3 + rnd() * 0.2).toFixed(2),
    shopee: +(1.8 + Math.sin(i / 6) * 0.4 + rnd() * 0.2).toFixed(2)
}))

export const channelSla = CHANNEL_ORDER.map((key, i) => {
    const slaMet = [96.2, 94.1, 88.4, 92.6, 89.8, 97.3, 82.4, 76.8, 91.2, 85.4][i]
    const avgResp = [4, 6, 12, 8, 14, 3, 42, 68, 22, 18][i]
    const breached = +(100 - slaMet).toFixed(1)
    return {
        channelId: key,
        channel: CHANNELS[key].label,
        color: CHANNELS[key].color,
        slaMet,
        avgRespSec: avgResp,
        breached
    }
})

export const slaTrend = DAY_LABELS_90.slice(-30).map((day, i) => ({
    day,
    facebook: +(94 + Math.sin(i / 3) * 3 + rnd() * 1.5).toFixed(1),
    zalo: +(92 + Math.sin(i / 4) * 3 + rnd() * 1.5).toFixed(1),
    website: +(96 + Math.sin(i / 5) * 2 + rnd() * 1).toFixed(1),
    email: +(82 + Math.sin(i / 6) * 4 + rnd() * 2).toFixed(1)
}))
