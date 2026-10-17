// ==============================|| MIRA ASSISTANT - MOCK DATA ||============================== //

export const MIRA_QUICK_PROMPTS = [
    'Chính sách đổi trả hiện tại là gì?',
    'Tồn kho sản phẩm áo thun trắng size M?',
    'Tóm tắt hội thoại đang mở của tôi',
    'Tỷ giá USD/VND hôm nay?'
]

const KNOWLEDGE_REPLIES = [
    {
        match: ['đổi trả', 'return'],
        reply: 'Theo tài liệu chính sách nội bộ: khách được đổi/trả trong 7 ngày nếu sản phẩm còn nguyên tem, chưa qua sử dụng. (Nguồn: Chính-sách-đổi-trả.pdf, mục 2.1)'
    },
    {
        match: ['tồn kho', 'stock', 'size'],
        reply: 'Áo thun trắng size M hiện còn 42 sản phẩm trong kho trung tâm. (Nguồn: Bảng tồn kho — cập nhật 08:00 sáng nay)'
    },
    {
        match: ['tóm tắt', 'summar'],
        reply: 'Bạn đang có 3 hội thoại mở: 1 trên Facebook (chờ phản hồi giá), 1 trên Zalo (đã hứa giao trong 2 ngày), 1 trên Shopee (hỏi thời gian giao hàng).'
    },
    {
        match: ['tỷ giá', 'usd', 'exchange'],
        reply: 'Đây là thông tin tra cứu bên ngoài — mình cần kết nối nguồn dữ liệu tỷ giá thực tế để trả lời chính xác. Hiện tại demo chưa bật tính năng này.'
    }
]

export const getMiraReply = (question) => {
    const q = question.toLowerCase()
    const found = KNOWLEDGE_REPLIES.find((k) => k.match.some((m) => q.includes(m)))
    if (found) return found.reply
    return 'Mình đã ghi nhận câu hỏi này. Trong bản demo, Mira chỉ trả lời được vài chủ đề mẫu — hãy thử một trong các gợi ý nhanh bên dưới nhé.'
}

export const mockMiraMessages = [
    {
        id: 'mira-welcome',
        sender: 'mira',
        text: 'Chào bạn! Mình là Mira — trợ lý nội bộ. Bạn có thể hỏi mình thông tin trong hệ thống (chính sách, tồn kho, hội thoại...) hoặc nhờ mình tra cứu thông tin bên ngoài.',
        at: 'now'
    }
]
