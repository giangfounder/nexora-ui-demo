// ==============================|| CUSTOMERS - MOCK DATA ||============================== //
// Toàn bộ dữ liệu ở đây là MOCK (UI/UX prototype) — chưa nối API thật.

export const ATTRIBUTE_TYPES = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Select (single value)' },
    { value: 'multiselect', label: 'Select (multiple values)' },
    { value: 'checkbox', label: 'Yes / No' }
]

export const mockAttributeDefs = [
    { id: 'source', label: 'Nguồn khách', type: 'select', options: ['Facebook', 'Website', 'Giới thiệu', 'Khác'] },
    { id: 'industry', label: 'Ngành hàng quan tâm', type: 'multiselect', options: ['Thời trang', 'Điện tử', 'Nội thất', 'Mỹ phẩm'] },
    { id: 'budget', label: 'Ngân sách dự kiến (VNĐ)', type: 'number' },
    { id: 'birthday', label: 'Ngày sinh', type: 'date' },
    { id: 'nda', label: 'Đã ký NDA', type: 'checkbox' }
]

export const mockCustomerTypes = [
    {
        id: 'b2c',
        name: 'Khách lẻ (B2C)',
        stages: [
            { id: 'new', label: 'Tiếp nhận mới' },
            { id: 'consulting', label: 'Đang tư vấn' },
            { id: 'ordered', label: 'Đã đặt hàng' },
            { id: 'purchased', label: 'Đã mua' },
            { id: 'loyal', label: 'Khách hàng trung thành' }
        ]
    },
    {
        id: 'b2b',
        name: 'Doanh nghiệp (B2B)',
        stages: [
            { id: 'lead', label: 'Tiềm năng' },
            { id: 'contacted', label: 'Đã liên hệ' },
            { id: 'quoted', label: 'Đã báo giá' },
            { id: 'negotiating', label: 'Đàm phán' },
            { id: 'signed', label: 'Đã ký hợp đồng' }
        ]
    },
    {
        id: 'agency',
        name: 'Đại lý',
        stages: [
            { id: 'candidate', label: 'Ứng viên' },
            { id: 'review', label: 'Đang thẩm định' },
            { id: 'onboarding', label: 'Đang ký kết' },
            { id: 'active', label: 'Đang hợp tác' }
        ]
    }
]

export const mockCustomers = [
    {
        id: 'c1',
        name: 'Nguyễn Thị Ngọc Anh',
        typeId: 'b2c',
        stageId: 'ordered',
        email: 'ngocanh@example.com',
        phone: '0901 234 567',
        tags: ['VIP'],
        attributes: { source: 'Facebook', industry: ['Thời trang'], budget: 2000000, birthday: '1996-04-12', nda: false },
        createdAt: '2026-08-20',
        lastContactAt: '2026-09-15'
    },
    {
        id: 'c2',
        name: 'Trần Minh Quân',
        typeId: 'b2c',
        stageId: 'consulting',
        email: 'minhquan@example.com',
        phone: '0912 345 678',
        tags: [],
        attributes: { source: 'Website', industry: ['Điện tử'], budget: 5000000, birthday: '1990-11-02', nda: false },
        createdAt: '2026-09-01',
        lastContactAt: '2026-09-17'
    },
    {
        id: 'c3',
        name: 'Lê Thu Hà',
        typeId: 'b2c',
        stageId: 'loyal',
        email: 'thuha@example.com',
        phone: '0987 654 321',
        tags: ['Khách hàng trung thành'],
        attributes: { source: 'Giới thiệu', industry: ['Mỹ phẩm', 'Thời trang'], budget: 1500000, birthday: '1993-02-18', nda: false },
        createdAt: '2026-05-10',
        lastContactAt: '2026-09-10'
    },
    {
        id: 'c4',
        name: 'Công ty TNHH Gia Bảo',
        typeId: 'b2b',
        stageId: 'quoted',
        email: 'contact@giabao.vn',
        phone: '028 3822 1234',
        tags: [],
        attributes: { source: 'Website', industry: ['Nội thất'], budget: 150000000, birthday: '', nda: true },
        createdAt: '2026-08-01',
        lastContactAt: '2026-09-14'
    },
    {
        id: 'c5',
        name: 'Công ty CP Phương Linh',
        typeId: 'b2b',
        stageId: 'negotiating',
        email: 'sales@phuonglinh.vn',
        phone: '024 3933 4455',
        tags: ['Ưu tiên'],
        attributes: { source: 'Giới thiệu', industry: ['Điện tử'], budget: 320000000, birthday: '', nda: true },
        createdAt: '2026-07-15',
        lastContactAt: '2026-09-16'
    },
    {
        id: 'c6',
        name: 'Công ty TNHH Đức Thịnh',
        typeId: 'b2b',
        stageId: 'lead',
        email: 'info@ducthinh.vn',
        phone: '0243 555 6677',
        tags: [],
        attributes: { source: 'Khác', industry: ['Thời trang'], budget: 80000000, birthday: '', nda: false },
        createdAt: '2026-09-10',
        lastContactAt: '2026-09-12'
    },
    {
        id: 'c7',
        name: 'Đại lý Hoàng Gia - Đà Nẵng',
        typeId: 'agency',
        stageId: 'active',
        email: 'hoanggia.dn@example.com',
        phone: '0236 388 9900',
        tags: ['Đại lý cấp 1'],
        attributes: { source: 'Giới thiệu', industry: ['Thời trang', 'Mỹ phẩm'], budget: 0, birthday: '', nda: true },
        createdAt: '2026-01-05',
        lastContactAt: '2026-09-08'
    },
    {
        id: 'c8',
        name: 'Đại lý Minh Phát - Cần Thơ',
        typeId: 'agency',
        stageId: 'review',
        email: 'minhphat.ct@example.com',
        phone: '0292 377 8899',
        tags: [],
        attributes: { source: 'Website', industry: ['Điện tử'], budget: 0, birthday: '', nda: false },
        createdAt: '2026-09-05',
        lastContactAt: '2026-09-11'
    }
]
