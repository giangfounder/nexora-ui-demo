// ==============================|| CUSTOMERS / ATLAS AI - MOCK DATA ||============================== //
// Insight and CRM auxiliary data — files, notes, staff interaction log,
// aggregate trends and per-customer analyses. All demo/prototype.

// Signals: measurable shifts detected in conversations + CRM data.
// `impact` says whether the move is good or bad for the business (drives colour, not direction).
export const atlasSignals = [
    {
        id: 'sig-complaints-shopee',
        title: 'Khiếu nại trên Shopee',
        metric: 'Ca khiếu nại / tuần',
        before: 14,
        after: 42,
        unit: '',
        impact: 'bad',
        series: [12, 14, 13, 15, 19, 26, 35, 42],
        scope: 'Shopee',
        detail: 'Chủ yếu "giao trễ" (61%) và "sai mô tả" (27%). Tăng mạnh trong 2 tuần gần nhất.',
        source: '42 phiếu khiếu nại, 14 ngày'
    },
    {
        id: 'sig-b2b-close',
        title: 'Tỉ lệ chốt đơn B2B',
        metric: 'Chốt / tổng deal',
        before: 34,
        after: 28,
        unit: '%',
        impact: 'bad',
        series: [35, 34, 33, 34, 31, 30, 29, 28],
        scope: 'B2B · Đàm phán',
        detail: '85 deal rớt ở bước Đàm phán; giá đề xuất lệch 12–15% so với đối thủ.',
        source: '118 deal B2B trong quý'
    },
    {
        id: 'sig-b2c-new',
        title: 'Khách lẻ mới',
        metric: 'Khách mới / 30 ngày',
        before: 233,
        after: 284,
        unit: '',
        impact: 'good',
        series: [212, 221, 233, 240, 251, 262, 270, 284],
        scope: 'Facebook · Instagram',
        detail: '68% khách mới đến từ Facebook và Instagram, đa số hỏi ngành Thời trang.',
        source: '1.284 hội thoại, 30 ngày'
    },
    {
        id: 'sig-vip-night',
        title: 'Khách VIP nhắn sau 22h',
        metric: 'Tin nhắn / tối',
        before: 5.1,
        after: 6.0,
        unit: '',
        impact: 'neutral',
        series: [4.8, 5.0, 5.1, 5.3, 5.5, 5.6, 5.8, 6.0],
        scope: 'VIP · mọi kênh',
        detail: 'Tự động trả lời xử lý được ~70%; phần còn lại chờ đến sáng hôm sau.',
        source: '187 tin nhắn VIP, 30 ngày'
    },
    {
        id: 'sig-dealer-wait',
        title: 'Thời gian duyệt hồ sơ đại lý',
        metric: 'Ngày chờ trung bình',
        before: 5,
        after: 8,
        unit: ' ngày',
        impact: 'bad',
        series: [4, 5, 5, 6, 6, 7, 8, 8],
        scope: 'Đại lý · miền Trung, ĐBSCL',
        detail: '4 hồ sơ đang thẩm định, mục tiêu phản hồi ≤ 3 ngày.',
        source: '4 hồ sơ đại lý đang mở'
    }
]

// Decisions queue: each action is traceable to the signals behind it and can be owned + tracked.
export const atlasActions = [
    {
        id: 'act-shopee-faq',
        title: 'Bổ sung kịch bản trả lời "đơn Shopee giao trễ"',
        why: 'Để trả lời tự động tra đơn và đề xuất bồi thường thay vì chuyển nhân viên.',
        signalIds: ['sig-complaints-shopee'],
        priority: 'high',
        impact: 'Giảm ~40% ca chuyển nhân viên',
        affected: 68,
        effort: 'Thấp',
        owner: 'e2',
        status: 'doing',
        due: '2026-09-30'
    },
    {
        id: 'act-b2b-discount',
        title: 'Xem lại bậc chiết khấu B2B 12%',
        why: 'Khoảng lệch giá 12–15% là lý do rớt deal phổ biến nhất ở bước Đàm phán.',
        signalIds: ['sig-b2b-close'],
        priority: 'high',
        impact: 'Kỳ vọng +4–6 điểm tỉ lệ chốt',
        affected: 85,
        effort: 'Vừa',
        owner: null,
        status: 'new',
        due: '2026-10-04'
    },
    {
        id: 'act-dealer-sla',
        title: 'Duyệt sớm 4 hồ sơ đại lý miền Trung',
        why: 'Ứng viên đã chờ 8 ngày, vượt xa mục tiêu 3 ngày.',
        signalIds: ['sig-dealer-wait'],
        priority: 'medium',
        impact: 'Giữ chân 4 đại lý tiềm năng',
        affected: 4,
        effort: 'Thấp',
        owner: 'e1',
        status: 'new',
        due: '2026-09-29'
    },
    {
        id: 'act-loyalty',
        title: 'Chạy ưu đãi tái mua tháng 10 cho khách B2C đã mua',
        why: 'Nhóm này mua lại 3,2 đơn/khách mỗi quý — phản hồi tốt với ưu đãi.',
        signalIds: ['sig-b2c-new'],
        priority: 'medium',
        impact: 'Ước tính +18M doanh thu',
        affected: 24,
        effort: 'Vừa',
        owner: 'e4',
        status: 'new',
        due: '2026-10-10'
    },
    {
        id: 'act-vip-night',
        title: 'Mở ca trực tối cho khách VIP (22h–24h)',
        why: '30% tin VIP sau 22h chưa được trả lời đến sáng.',
        signalIds: ['sig-vip-night'],
        priority: 'low',
        impact: 'Phản hồi VIP < 15 phút cả buổi tối',
        affected: 38,
        effort: 'Cao',
        owner: null,
        status: 'done',
        due: '2026-09-20'
    }
]

// Per-customer files attached by staff.
export const mockCustomerFiles = {
    c1: [
        { id: 'f1', name: 'Hoá đơn đặt cọc.pdf', size: '128 KB', uploadedBy: 'e2', uploadedAt: '2026-09-15' },
        { id: 'f2', name: 'Ảnh CMND khách.jpg', size: '2.1 MB', uploadedBy: 'e2', uploadedAt: '2026-09-15' }
    ],
    c4: [
        { id: 'f3', name: 'Hợp đồng khung nội thất v2.docx', size: '340 KB', uploadedBy: 'e1', uploadedAt: '2026-09-14' },
        { id: 'f4', name: 'Bảng báo giá gửi Gia Bảo.xlsx', size: '55 KB', uploadedBy: 'e1', uploadedAt: '2026-09-14' }
    ],
    c5: [{ id: 'f5', name: 'MOU Phương Linh - draft.pdf', size: '210 KB', uploadedBy: 'e1', uploadedAt: '2026-09-16' }]
}

// Per-customer freeform notes staff pin to a profile.
export const mockCustomerNotes = {
    c1: [
        {
            id: 'n1',
            authorId: 'e2',
            at: '2026-09-15 10:22',
            text: 'Khách chốt 2 áo thun size M màu be. Cần giao trước 20/9. Đã báo thu hộ 100k.'
        }
    ],
    c4: [
        {
            id: 'n2',
            authorId: 'e1',
            at: '2026-09-14 15:03',
            text: 'Gia Bảo muốn thêm điều khoản bảo hành 24 tháng. Đã escalate cho pháp chế.'
        },
        { id: 'n3', authorId: 'e1', at: '2026-09-16 09:10', text: 'Pháp chế phản hồi OK — cần soạn phụ lục.' }
    ],
    c5: [
        {
            id: 'n4',
            authorId: 'e1',
            at: '2026-09-16 14:40',
            text: 'Phương Linh yêu cầu giảm 8% cho lô đầu. Sếp đã duyệt 6% — cần soạn phản đề nghị.'
        }
    ]
}

// Per-customer staff activity timeline.
export const mockInteractionLog = {
    c1: [
        { id: 'l1', at: '2026-09-15 10:22', actorId: 'e2', action: 'note', summary: 'Ghi chú đơn hàng size M' },
        { id: 'l2', at: '2026-09-15 09:15', actorId: 'e2', action: 'reply', summary: 'Trả lời tin nhắn Facebook — chốt 2 sản phẩm' },
        { id: 'l3', at: '2026-09-12 16:00', actorId: 'e4', action: 'stage', summary: 'Chuyển giai đoạn: Đang tư vấn sang Đã chốt đơn' },
        { id: 'l4', at: '2026-08-20 08:00', actorId: null, action: 'created', summary: 'Pulse tạo hồ sơ khách từ tin nhắn Facebook' }
    ],
    c4: [
        { id: 'l5', at: '2026-09-16 09:10', actorId: 'e1', action: 'note', summary: 'Cập nhật ghi chú: phụ lục bảo hành' },
        { id: 'l6', at: '2026-09-14 15:03', actorId: 'e1', action: 'file', summary: 'Upload Hợp đồng khung nội thất v2.docx' },
        { id: 'l7', at: '2026-09-14 11:20', actorId: 'e1', action: 'stage', summary: 'Chuyển giai đoạn: Đã liên hệ sang Đã báo giá' },
        { id: 'l8', at: '2026-08-01 08:00', actorId: null, action: 'created', summary: 'Pulse tạo hồ sơ khách từ tin nhắn Email' }
    ],
    c5: [
        { id: 'l9', at: '2026-09-16 14:40', actorId: 'e1', action: 'note', summary: 'Ghi chú phản đề nghị 6%' },
        { id: 'l10', at: '2026-09-16 09:00', actorId: 'e1', action: 'reply', summary: 'Gửi email MOU draft cho Phương Linh' },
        { id: 'l11', at: '2026-07-15 08:00', actorId: null, action: 'created', summary: 'Pulse tạo hồ sơ khách từ giới thiệu' }
    ]
}

// Per-customer Atlas insight (mock, deterministic based on typeId).
export const getAtlasCustomerInsight = (customer) => {
    if (!customer) return null

    if (customer.typeId === 'b2c') {
        return {
            ltv: '4.8M VNĐ',
            churnRisk: 'Thấp',
            purchasePattern: 'Mua theo mùa (2 mùa/năm), ưa chuộng size M, thanh toán COD.',
            upsell: [
                'Combo Thu-Đông đang khuyến mãi phù hợp phân khúc giá của khách.',
                'Đề xuất chương trình sinh nhật (khách sinh tháng 4).'
            ],
            nextBestAction: 'Gửi ưu đãi tái mua kèm freeship trong 14 ngày tới.'
        }
    }

    if (customer.typeId === 'b2b') {
        return {
            ltv: '480M VNĐ (dự kiến năm đầu)',
            churnRisk: 'Trung bình',
            purchasePattern: 'Đàm phán dài, nhạy về điều khoản bảo hành + timeline giao hàng.',
            upsell: ['Gói bảo trì định kỳ có thể tăng biên lợi nhuận 8-12%.', 'Đề xuất mở rộng hạng mục nội thất văn phòng.'],
            nextBestAction: 'Soạn phụ lục điều khoản đúng yêu cầu và gửi trong 48h.'
        }
    }

    return {
        ltv: '—',
        churnRisk: 'Chưa đủ dữ liệu',
        purchasePattern: 'Đại lý đang trong giai đoạn đầu — chưa có mẫu mua đủ để phân tích.',
        upsell: ['Đề xuất onboarding bộ tài liệu sản phẩm mới.'],
        nextBestAction: 'Hoàn tất thẩm định hồ sơ và ký hợp đồng phân phối.'
    }
}
