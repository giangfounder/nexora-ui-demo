// ==============================|| OMNICHANNEL - MOCK DATA ||============================== //
//
// Triage model: conversations start on auto-reply. When something needs a
// human, we tag WHAT is needed (not who failed). The tag stays terse; the
// full note only surfaces on hover / in the side panel. Never phrase this
// as the bot admitting failure in the UI.

// Reason a conversation needs a teammate. Kept as a short, action-oriented
// label — describes the work to do, not the bot's shortcoming.
export const HANDOFF_TAGS = {
    refund_dispute: { id: 'refund_dispute', label: 'Xử lý hoàn tiền', tone: 'rose' },
    bulk_pricing: { id: 'bulk_pricing', label: 'Báo giá số lượng lớn', tone: 'amber' },
    contract_review: { id: 'contract_review', label: 'Duyệt hợp đồng', tone: 'amber' },
    context_missing: { id: 'context_missing', label: 'Thiếu ngữ cảnh sản phẩm', tone: 'amber' }
}

export const CHANNELS = {
    facebook: { id: 'facebook', label: 'Facebook Messenger', color: '#0866FF' },
    zalo: { id: 'zalo', label: 'Zalo OA', color: '#0068FF' },
    zalo_personal: { id: 'zalo_personal', label: 'Zalo Personal', color: '#00A8FF' },
    whatsapp: { id: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
    instagram: { id: 'instagram', label: 'Instagram', color: '#E1306C' },
    website: { id: 'website', label: 'Website Live Chat', color: '#7C4DFF' },
    email: { id: 'email', label: 'Email', color: '#EA4335' },
    tiktok: { id: 'tiktok', label: 'TikTok Business', color: '#000000' },
    shopee: { id: 'shopee', label: 'Shopee', color: '#EE4D2D' },
    lazada: { id: 'lazada', label: 'Lazada', color: '#0F146D' }
}

export const CHANNEL_ORDER = [
    'facebook',
    'zalo',
    'zalo_personal',
    'whatsapp',
    'instagram',
    'website',
    'email',
    'tiktok',
    'shopee',
    'lazada'
]

// A conversation's place in the Pulse queue.
export const STATUS = {
    ai_handling: { id: 'ai_handling', label: 'Tự động xử lý', color: 'info' },
    escalated: { id: 'escalated', label: 'Chờ nhân viên', color: 'error' },
    resolved: { id: 'resolved', label: 'Đã xong', color: 'success' }
}

export const PRIORITY_WEIGHT = { urgent: 0, normal: 1 }
export const STATUS_WEIGHT = { escalated: 0, ai_handling: 1, resolved: 2 }

export const mockConversations = [
    {
        id: 'conv-1',
        channel: 'facebook',
        customerId: 'c1',
        customerName: 'Nguyễn Thị Lan',
        status: 'ai_handling',
        priority: 'normal',
        tag: null,
        assignedTo: null,
        waitingSince: '2 phút',
        unread: 0,
        messages: [
            { id: 'm1', sender: 'customer', text: 'Chào shop, bên mình còn hàng size M không ạ?', at: '09:12' },
            {
                id: 'm2',
                sender: 'ai',
                text: 'Dạ chào chị Lan, sản phẩm size M hiện còn hàng ạ. Chị cần đặt bao nhiêu sản phẩm?',
                at: '09:13'
            },
            { id: 'm3', sender: 'customer', text: 'Cho mình 2 cái nhé', at: '09:15' },
            {
                id: 'm4',
                sender: 'ai',
                text: 'Dạ em đã lên đơn 2 sản phẩm size M, chị vui lòng xác nhận địa chỉ giao hàng giúp em ạ.',
                at: '09:15'
            }
        ]
    },
    {
        id: 'conv-2',
        channel: 'zalo',
        customerId: 'c2',
        customerName: 'Trần Minh Khôi',
        status: 'escalated',
        priority: 'urgent',
        tag: 'Khiếu nại',
        assignedTo: 'e2',
        handoffTag: 'refund_dispute',
        handoffNote: 'Khiếu nại giao hàng trễ 3 ngày, yêu cầu hoàn tiền.',
        waitingSince: '18 phút',
        unread: 2,
        messages: [
            { id: 'm1', sender: 'customer', text: 'Đơn hàng #4521 của em trễ 3 ngày rồi, tôi muốn hoàn tiền!', at: '08:40' },
            {
                id: 'm2',
                sender: 'ai',
                text: 'Dạ em rất xin lỗi vì sự bất tiện này. Đây là trường hợp cần xử lý hoàn tiền nên em xin phép chuyển anh đến nhân viên phụ trách để hỗ trợ nhanh nhất ạ.',
                at: '08:41'
            },
            {
                id: 'm3',
                sender: 'system',
                text: 'Đã chuyển cho Trần Văn Nam',
                at: '08:41'
            },
            {
                id: 'm4',
                sender: 'agent',
                employeeId: 'e2',
                text: 'Chào anh Khôi, em là Nam bên chăm sóc khách hàng. Em đã kiểm tra và sẽ xử lý hoàn tiền cho anh trong hôm nay ạ.',
                at: '08:55'
            }
        ]
    },
    {
        id: 'conv-3',
        channel: 'whatsapp',
        customerId: 'c3',
        customerName: 'Global Traders Co.',
        status: 'escalated',
        priority: 'urgent',
        tag: 'VIP',
        assignedTo: null,
        handoffTag: 'bulk_pricing',
        handoffNote: 'Khách VIP hỏi báo giá 5.000 sản phẩm.',
        waitingSince: '32 phút',
        unread: 1,
        messages: [
            { id: 'm1', sender: 'customer', text: 'Can you send the latest price list for 5,000 units?', at: 'Yesterday' },
            {
                id: 'm2',
                sender: 'ai',
                text: 'Thank you for reaching out. This is a bulk pricing request, so I am routing it to our sales team for a custom quote.',
                at: 'Yesterday'
            },
            { id: 'm3', sender: 'system', text: 'Đang chờ nhân viên nhận', at: 'Yesterday' }
        ]
    },
    {
        id: 'conv-4',
        channel: 'instagram',
        customerId: 'c4',
        customerName: 'thao.pham',
        status: 'resolved',
        priority: 'normal',
        tag: null,
        assignedTo: 'e4',
        waitingSince: '—',
        unread: 0,
        messages: [
            { id: 'm1', sender: 'customer', text: 'Sản phẩm trong ảnh có màu trắng không shop?', at: 'Mon' },
            { id: 'm2', sender: 'agent', employeeId: 'e4', text: 'Dạ hiện tại chỉ còn màu đen và be thôi ạ.', at: 'Mon' },
            { id: 'm3', sender: 'customer', text: 'Ok cảm ơn shop', at: 'Mon' }
        ]
    },
    {
        id: 'conv-5',
        channel: 'website',
        customerId: 'c5',
        customerName: 'Khách vãng lai #8823',
        status: 'ai_handling',
        priority: 'normal',
        tag: null,
        assignedTo: null,
        waitingSince: '1 phút',
        unread: 0,
        messages: [
            { id: 'm1', sender: 'customer', text: 'Bên mình có hỗ trợ trả góp không?', at: '10 phút trước' },
            { id: 'm2', sender: 'ai', text: 'Dạ shop hỗ trợ trả góp 0% qua thẻ tín dụng cho đơn từ 3 triệu đồng ạ.', at: '10 phút trước' }
        ]
    },
    {
        id: 'conv-6',
        channel: 'email',
        customerId: 'c6',
        customerName: 'contact@brightsteel.com',
        status: 'escalated',
        priority: 'normal',
        tag: null,
        assignedTo: 'e1',
        handoffTag: 'contract_review',
        handoffNote: 'Yêu cầu báo giá theo hợp đồng dài hạn, cần duyệt điều khoản.',
        waitingSince: '3 giờ',
        unread: 0,
        messages: [
            { id: 'm1', sender: 'customer', text: 'We would like to request a formal quotation for a bulk order.', at: '2 days ago' },
            {
                id: 'm2',
                sender: 'system',
                text: 'Đã chuyển cho Nguyễn Thu Hương',
                at: '2 days ago'
            }
        ]
    },
    {
        id: 'conv-7',
        channel: 'facebook',
        customerId: null,
        customerName: 'Đức Anh',
        status: 'ai_handling',
        priority: 'normal',
        tag: null,
        assignedTo: null,
        waitingSince: '5 phút',
        unread: 0,
        messages: [
            { id: 'm1', sender: 'customer', text: 'Shop cho hỏi giờ mở cửa?', at: '11:02' },
            { id: 'm2', sender: 'ai', text: 'Dạ shop mở cửa từ 8h đến 21h tất cả các ngày trong tuần ạ.', at: '11:02' }
        ]
    },
    {
        id: 'conv-8',
        channel: 'zalo',
        customerId: null,
        customerName: 'Mai Anh',
        status: 'resolved',
        priority: 'normal',
        tag: null,
        assignedTo: 'e2',
        waitingSince: '—',
        unread: 0,
        messages: [
            { id: 'm1', sender: 'customer', text: 'Cảm ơn shop đã hỗ trợ nhiệt tình', at: 'Sun' },
            { id: 'm2', sender: 'agent', employeeId: 'e2', text: 'Dạ cảm ơn chị đã ủng hộ shop ạ!', at: 'Sun' }
        ]
    },
    {
        id: 'conv-9',
        channel: 'zalo_personal',
        customerId: 'c7',
        customerName: 'Hoàng Bảo Long',
        status: 'ai_handling',
        priority: 'normal',
        tag: null,
        assignedTo: null,
        waitingSince: '4 phút',
        unread: 0,
        messages: [
            { id: 'm1', sender: 'customer', text: 'Anh ơi cho em xin bảng giá sỉ với ạ', at: '13:20' },
            { id: 'm2', sender: 'ai', text: 'Dạ đây là bảng giá sỉ áp dụng cho đơn từ 50 sản phẩm trở lên ạ [đính kèm].', at: '13:21' }
        ]
    },
    {
        id: 'conv-10',
        channel: 'tiktok',
        customerId: null,
        customerName: 'tiktoker.linh',
        status: 'escalated',
        priority: 'normal',
        tag: null,
        assignedTo: null,
        handoffTag: 'context_missing',
        handoffNote: 'Khách hỏi giá sản phẩm trong video livestream, cần nhân viên xác định video.',
        waitingSince: '2 giờ',
        unread: 2,
        messages: [
            { id: 'm1', sender: 'customer', text: 'Video live hôm qua sản phẩm này giá bao nhiêu vậy shop?', at: '2 giờ trước' },
            {
                id: 'm2',
                sender: 'system',
                text: 'Đang chờ nhân viên nhận',
                at: '2 giờ trước'
            }
        ]
    },
    {
        id: 'conv-11',
        channel: 'shopee',
        customerId: 'c8',
        customerName: 'nguyenvan_shopee',
        status: 'ai_handling',
        priority: 'normal',
        tag: null,
        assignedTo: null,
        waitingSince: '8 phút',
        unread: 0,
        messages: [
            { id: 'm1', sender: 'customer', text: 'Đơn SPX123456789 khi nào tới nơi vậy ạ?', at: '30 phút trước' },
            {
                id: 'm2',
                sender: 'ai',
                text: 'Dạ đơn hàng của bạn dự kiến giao vào ngày mai, hiện đang ở kho trung chuyển ạ.',
                at: '30 phút trước'
            }
        ]
    },
    {
        id: 'conv-12',
        channel: 'lazada',
        customerId: null,
        customerName: 'buyer_lazada2024',
        status: 'resolved',
        priority: 'normal',
        tag: null,
        assignedTo: 'e2',
        waitingSince: '—',
        unread: 0,
        messages: [
            { id: 'm1', sender: 'customer', text: 'Sản phẩm bị lỗi, mình muốn đổi trả', at: 'Fri' },
            { id: 'm2', sender: 'agent', employeeId: 'e2', text: 'Dạ shop đã tạo yêu cầu đổi trả cho đơn hàng của bạn ạ.', at: 'Fri' }
        ]
    }
]
