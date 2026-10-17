import { CHANNEL_ORDER } from '@/views/omnichannel/mockConversations'

const rand = (min, max, seed) => {
    const x = Math.sin(seed) * 10000
    const r = x - Math.floor(x)
    return Math.floor(min + r * (max - min))
}

export const generateHourlyChannelData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    return hours.map((h) => {
        const row = { hour: `${String(h).padStart(2, '0')}h` }
        CHANNEL_ORDER.forEach((ch, idx) => {
            const base = h >= 8 && h <= 21 ? 6 : 1
            row[ch] = rand(base, base + 12 + idx, h * 31 + idx * 7)
        })
        return row
    })
}

export const generateSparkline = (seed, len = 14, min = 20, max = 90) =>
    Array.from({ length: len }, (_, i) => ({ x: i, y: rand(min, max, seed + i) }))

export const kpiSparklines = {
    open: generateSparkline(11, 14, 40, 90),
    pulse: generateSparkline(23, 14, 55, 82),
    response: generateSparkline(41, 14, 60, 95),
    newCustomers: generateSparkline(67, 14, 20, 70)
}

// Activity text is a template (translated at render) + data vars; `task` is a UI label and is translated too.
export const feedEvents = [
    {
        id: 1,
        kind: 'customer_new',
        tone: 'orange',
        text: 'Khách mới: {name} đăng ký qua {channel}',
        vars: { name: 'Lê Bảo Trân', channel: 'Facebook' },
        ago: { n: 2, unit: 'minute' }
    },
    {
        id: 2,
        kind: 'escalate',
        tone: 'rose',
        text: 'Chuyển ca: {task} – {name}',
        vars: { task: 'Xử lý hoàn tiền', name: 'Trần Minh Khôi' },
        ago: { n: 5, unit: 'minute' }
    },
    {
        id: 3,
        kind: 'pulse_handoff',
        tone: 'amber',
        text: 'Pulse chuyển tiếp: {task} – {name}',
        vars: { task: 'Báo giá số lượng lớn', name: 'Global Traders' },
        ago: { n: 8, unit: 'minute' }
    },
    {
        id: 4,
        kind: 'deal_closed',
        tone: 'emerald',
        text: 'Chốt đơn {amount} – {name}',
        vars: { amount: 12500000, name: 'Nguyễn Thị Ngọc Anh' },
        ago: { n: 14, unit: 'minute' }
    },
    {
        id: 5,
        kind: 'review',
        tone: 'teal',
        text: 'Đánh giá {stars} sao trên {channel} – {name}',
        vars: { stars: 5, channel: 'Shopee', name: 'nguyenvan_shopee' },
        ago: { n: 22, unit: 'minute' }
    },
    {
        id: 6,
        kind: 'pulse_handoff',
        tone: 'amber',
        text: 'Pulse chuyển tiếp: {task} – {name}',
        vars: { task: 'Duyệt hợp đồng', name: 'Brightsteel' },
        ago: { n: 31, unit: 'minute' }
    },
    {
        id: 7,
        kind: 'customer_new',
        tone: 'orange',
        text: 'Khách mới: {name} qua {channel}',
        vars: { name: 'Đỗ Hoàng Anh', channel: 'Zalo OA' },
        ago: { n: 45, unit: 'minute' }
    },
    {
        id: 8,
        kind: 'deal_closed',
        tone: 'emerald',
        text: 'Chốt đơn {amount} – {name}',
        vars: { amount: 3800000, name: 'Hoàng Bảo Long' },
        ago: { n: 1, unit: 'hour' }
    }
]

// Render helpers — pass `t` / `locale` from useLanguage().
export const feedText = (t, ev, locale) =>
    t(ev.text, {
        ...ev.vars,
        task: ev.vars?.task ? t(ev.vars.task) : undefined,
        amount: typeof ev.vars?.amount === 'number' ? `${ev.vars.amount.toLocaleString(locale)}₫` : undefined
    })

export const feedAgo = (t, ev) => t(ev.ago?.unit === 'hour' ? '{n} giờ trước' : '{n} phút trước', { n: ev.ago?.n })

export const watchlistScores = {
    c3: { score: 92, reason: 'VIP chờ báo giá {n} phút', reasonVars: { n: 32 } },
    c2: { score: 88, reason: 'Khiếu nại hoàn tiền chưa xử lý' },
    c6: { score: 74, reason: 'Yêu cầu hợp đồng chờ {n} giờ', reasonVars: { n: 3 } },
    c1: { score: 62, reason: 'Đơn chờ xác nhận địa chỉ' },
    c7: { score: 48, reason: 'Hỏi bảng giá sỉ, chưa follow-up' }
}

export const teamStats = {
    e1: { conversations: 24, rating: 5 },
    e2: { conversations: 31, rating: 4 },
    e4: { conversations: 18, rating: 5 },
    e5: { conversations: 12, rating: 4 },
    e6: { conversations: 9, rating: 3 }
}
