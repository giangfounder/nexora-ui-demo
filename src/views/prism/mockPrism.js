export const mockPrismCriteria = [
    {
        id: 'crit-greeting',
        name: 'Chào hỏi & xưng danh',
        weight: 10,
        version: 'v2.1',
        owner: 'e1',
        effectiveDate: '2026-08-01',
        status: 'active',
        description: 'Nhân viên chào khách, xưng tên/nhóm phụ trách trong 2 tin nhắn đầu.'
    },
    {
        id: 'crit-empathy',
        name: 'Đồng cảm với vấn đề',
        weight: 20,
        version: 'v2.0',
        owner: 'e1',
        effectiveDate: '2026-06-15',
        status: 'active',
        description: 'Ghi nhận cảm xúc/vấn đề khách trước khi đi vào giải quyết. Đặc biệt quan trọng với ca khiếu nại.'
    },
    {
        id: 'crit-accuracy',
        name: 'Đúng chính sách / thông tin',
        weight: 25,
        version: 'v3.0',
        owner: 'e6',
        effectiveDate: '2026-09-01',
        status: 'active',
        description: 'Câu trả lời phù hợp với bảng giá, chính sách đổi trả, tồn kho hiện tại. Không suy diễn.'
    },
    {
        id: 'crit-resolution',
        name: 'Đề xuất giải pháp rõ ràng',
        weight: 25,
        version: 'v2.2',
        owner: 'e1',
        effectiveDate: '2026-07-20',
        status: 'active',
        description: 'Kết ca có phương án cụ thể + timeline; không để khách "treo".'
    },
    {
        id: 'crit-tone',
        name: 'Giọng điệu & chuẩn mực',
        weight: 20,
        version: 'v1.4',
        owner: 'e1',
        effectiveDate: '2026-05-01',
        status: 'active',
        description: 'Lịch sự, đúng tone thương hiệu; không viết tắt quá đà, không đổ lỗi cho bộ phận khác.'
    },
    {
        id: 'crit-upsell',
        name: 'Gợi mở bán thêm/bán chéo',
        weight: 10,
        version: 'v0.9',
        owner: 'e6',
        effectiveDate: '2026-10-01',
        status: 'draft',
        description: 'Đề xuất phù hợp sản phẩm bổ trợ khi khách đã đồng ý mua chính.'
    }
]

export const DEFAULT_AI_PROMPT = `Bạn là chuyên gia QA chăm sóc khách hàng của NEXORA. Với mỗi hội thoại, hãy chấm 5 tiêu chí theo mô tả bên dưới trên thang 0–10 và giải thích ngắn gọn (1-2 câu) tại sao cho điểm đó. Ưu tiên tính chính xác so với thiện cảm — nếu nhân viên trả lời sai chính sách, phải trừ điểm dù thái độ tốt.`

export const mockScoredConversations = [
    {
        id: 'sc-1',
        conversationId: 'conv-2',
        employeeId: 'e2',
        customerName: 'Trần Minh Khôi',
        channel: 'zalo',
        completedAt: '2026-09-17',
        overallScore: 8.6,
        scores: { 'crit-greeting': 9, 'crit-empathy': 9, 'crit-accuracy': 8, 'crit-resolution': 9, 'crit-tone': 8 },
        aiComment: 'Xử lý ca khiếu nại chuyên nghiệp, đồng cảm và cam kết timeline rõ ràng.',
        reviewedBy: null
    },
    {
        id: 'sc-2',
        conversationId: 'conv-4',
        employeeId: 'e4',
        customerName: 'thao.pham',
        channel: 'instagram',
        completedAt: '2026-09-15',
        overallScore: 6.2,
        scores: { 'crit-greeting': 7, 'crit-empathy': 5, 'crit-accuracy': 8, 'crit-resolution': 6, 'crit-tone': 6 },
        aiComment: 'Trả lời ngắn gọn nhưng chưa gợi mở phương án thay thế khi hết màu trắng.',
        reviewedBy: null
    },
    {
        id: 'sc-3',
        conversationId: 'conv-8',
        employeeId: 'e2',
        customerName: 'Mai Anh',
        channel: 'zalo',
        completedAt: '2026-09-13',
        overallScore: 9.1,
        scores: { 'crit-greeting': 10, 'crit-empathy': 9, 'crit-accuracy': 9, 'crit-resolution': 9, 'crit-tone': 10 },
        aiComment: 'Phản hồi ngắn nhưng ấm áp, đúng tone brand.',
        reviewedBy: 'e1'
    },
    {
        id: 'sc-4',
        conversationId: 'conv-12',
        employeeId: 'e2',
        customerName: 'buyer_lazada2024',
        channel: 'lazada',
        completedAt: '2026-09-12',
        overallScore: 7.4,
        scores: { 'crit-greeting': 6, 'crit-empathy': 8, 'crit-accuracy': 8, 'crit-resolution': 8, 'crit-tone': 7 },
        aiComment: 'Đồng cảm tốt với đơn lỗi, đã tạo request đổi trả. Thiếu xưng danh nhân viên.',
        reviewedBy: null
    },
    {
        id: 'sc-5',
        conversationId: 'conv-15',
        employeeId: 'e4',
        customerName: 'Ngô Bảo Trân',
        channel: 'facebook',
        completedAt: '2026-09-11',
        overallScore: 5.5,
        scores: { 'crit-greeting': 5, 'crit-empathy': 4, 'crit-accuracy': 7, 'crit-resolution': 6, 'crit-tone': 5 },
        aiComment: 'Trả lời thẳng, thiếu đồng cảm khi khách phàn nàn về giao hàng chậm.',
        reviewedBy: 'e1'
    },
    {
        id: 'sc-6',
        conversationId: 'conv-18',
        employeeId: 'e6',
        customerName: 'Phạm Quốc Hưng',
        channel: 'zalo',
        completedAt: '2026-09-10',
        overallScore: 8.2,
        scores: { 'crit-greeting': 8, 'crit-empathy': 8, 'crit-accuracy': 9, 'crit-resolution': 8, 'crit-tone': 8 },
        aiComment: 'Tư vấn combo phù hợp, hoàn tất đơn hàng rõ ràng.',
        reviewedBy: null
    },
    {
        id: 'sc-7',
        conversationId: 'conv-20',
        employeeId: 'e6',
        customerName: 'linh.tran',
        channel: 'shopee',
        completedAt: '2026-09-09',
        overallScore: 7.0,
        scores: { 'crit-greeting': 7, 'crit-empathy': 7, 'crit-accuracy': 7, 'crit-resolution': 7, 'crit-tone': 7 },
        aiComment: 'Ca chuẩn, không nổi bật.',
        reviewedBy: null
    },
    {
        id: 'sc-8',
        conversationId: 'conv-22',
        employeeId: 'e2',
        customerName: 'Đặng Hà My',
        channel: 'instagram',
        completedAt: '2026-09-08',
        overallScore: 9.4,
        scores: { 'crit-greeting': 10, 'crit-empathy': 10, 'crit-accuracy': 9, 'crit-resolution': 9, 'crit-tone': 9 },
        aiComment: 'Xử lý cực tốt, khách hài lòng và để lại đánh giá 5 sao.',
        reviewedBy: 'e1'
    },
    {
        id: 'sc-9',
        conversationId: 'conv-25',
        employeeId: 'e4',
        customerName: 'user_fb_9231',
        channel: 'facebook',
        completedAt: '2026-09-07',
        overallScore: 4.8,
        scores: { 'crit-greeting': 4, 'crit-empathy': 4, 'crit-accuracy': 6, 'crit-resolution': 5, 'crit-tone': 5 },
        aiComment: 'Trả lời quá ngắn, không xưng danh, không đóng ca.',
        reviewedBy: null
    },
    {
        id: 'sc-10',
        conversationId: 'conv-28',
        employeeId: 'e6',
        customerName: 'Bùi Minh Khoa',
        channel: 'zalo',
        completedAt: '2026-09-06',
        overallScore: 8.8,
        scores: { 'crit-greeting': 9, 'crit-empathy': 9, 'crit-accuracy': 9, 'crit-resolution': 8, 'crit-tone': 9 },
        aiComment: 'Ca dài, xử lý kiên nhẫn và chuyên nghiệp.',
        reviewedBy: null
    }
]

export const getScoreDistribution = (scores) => {
    const bins = []
    for (let i = 0; i < 10; i++) {
        bins.push({ label: `${i}–${i + 1}`, min: i, max: i + 1, count: 0 })
    }
    scores.forEach((s) => {
        const idx = Math.min(9, Math.max(0, Math.floor(s.overallScore)))
        bins[idx].count += 1
    })
    return bins
}
