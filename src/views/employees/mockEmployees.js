// ==============================|| EMPLOYEES & ROLES - MOCK DATA ||============================== //

export const PERMISSION_MODULES = [
    { id: 'chatflows', label: 'Chatflows' },
    { id: 'agentflows', label: 'Agentflows' },
    { id: 'customers', label: 'Customers' },
    { id: 'omnichannel', label: 'Omnichannel' },
    { id: 'documentStores', label: 'Document Stores' },
    { id: 'credentials', label: 'Credentials' },
    { id: 'tools', label: 'Tools' },
    { id: 'executions', label: 'Executions' }
]

export const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete']

const fullMatrix = (value) =>
    PERMISSION_MODULES.reduce((acc, m) => {
        acc[m.id] = PERMISSION_ACTIONS.reduce((a, act) => ({ ...a, [act]: value }), {})
        return acc
    }, {})

export const mockRoles = [
    {
        id: 'role-admin',
        name: 'Administrator',
        description: 'Full access to every module',
        isSystem: true,
        permissions: fullMatrix(true)
    },
    {
        id: 'role-manager',
        name: 'Sales Manager',
        description: 'Manages customers, pipelines and omnichannel conversations',
        isSystem: false,
        permissions: {
            chatflows: { view: true, create: false, edit: false, delete: false },
            agentflows: { view: true, create: false, edit: false, delete: false },
            customers: { view: true, create: true, edit: true, delete: true },
            omnichannel: { view: true, create: true, edit: true, delete: false },
            documentStores: { view: true, create: false, edit: false, delete: false },
            credentials: { view: false, create: false, edit: false, delete: false },
            tools: { view: false, create: false, edit: false, delete: false },
            executions: { view: true, create: false, edit: false, delete: false }
        }
    },
    {
        id: 'role-agent',
        name: 'Support Agent',
        description: 'Handles customer conversations across channels',
        isSystem: false,
        permissions: {
            chatflows: { view: false, create: false, edit: false, delete: false },
            agentflows: { view: false, create: false, edit: false, delete: false },
            customers: { view: true, create: false, edit: true, delete: false },
            omnichannel: { view: true, create: true, edit: false, delete: false },
            documentStores: { view: false, create: false, edit: false, delete: false },
            credentials: { view: false, create: false, edit: false, delete: false },
            tools: { view: false, create: false, edit: false, delete: false },
            executions: { view: false, create: false, edit: false, delete: false }
        }
    },
    {
        id: 'role-developer',
        name: 'Developer',
        description: 'Builds and maintains flows, tools and integrations',
        isSystem: false,
        permissions: {
            chatflows: { view: true, create: true, edit: true, delete: true },
            agentflows: { view: true, create: true, edit: true, delete: true },
            customers: { view: false, create: false, edit: false, delete: false },
            omnichannel: { view: false, create: false, edit: false, delete: false },
            documentStores: { view: true, create: true, edit: true, delete: false },
            credentials: { view: true, create: true, edit: true, delete: false },
            tools: { view: true, create: true, edit: true, delete: true },
            executions: { view: true, create: false, edit: false, delete: false }
        }
    }
]

export const mockEmployees = [
    {
        id: 'e1',
        name: 'Nguyễn Thu Hương',
        email: 'huong.nguyen@gtech.vn',
        phone: '0901 234 567',
        jobTitle: 'Head of Sales',
        department: 'Sales',
        roleId: 'role-manager',
        status: 'active',
        joinedOn: '2023-03-12'
    },
    {
        id: 'e2',
        name: 'Trần Văn Nam',
        email: 'nam.tran@gtech.vn',
        phone: '0902 345 678',
        jobTitle: 'Support Agent',
        department: 'Customer Support',
        roleId: 'role-agent',
        status: 'active',
        joinedOn: '2023-07-01'
    },
    {
        id: 'e3',
        name: 'Lê Minh Đức',
        email: 'duc.le@gtech.vn',
        phone: '0903 456 789',
        jobTitle: 'Backend Engineer',
        department: 'Engineering',
        roleId: 'role-developer',
        status: 'active',
        joinedOn: '2022-11-20'
    },
    {
        id: 'e4',
        name: 'Phạm Thị Mai',
        email: 'mai.pham@gtech.vn',
        phone: '0904 567 890',
        jobTitle: 'Support Agent',
        department: 'Customer Support',
        roleId: 'role-agent',
        status: 'invited',
        joinedOn: '—'
    },
    {
        id: 'e5',
        name: 'Đỗ Anh Tuấn',
        email: 'tuan.do@gtech.vn',
        phone: '0905 678 901',
        jobTitle: 'System Administrator',
        department: 'IT',
        roleId: 'role-admin',
        status: 'active',
        joinedOn: '2021-05-04'
    },
    {
        id: 'e6',
        name: 'Vũ Kim Ngân',
        email: 'ngan.vu@gtech.vn',
        phone: '0906 789 012',
        jobTitle: 'Sales Executive',
        department: 'Sales',
        roleId: 'role-manager',
        status: 'disabled',
        joinedOn: '2022-01-18'
    }
]

// Employee groups (Teams). Used by Pulse routing rules for "assign to team" strategy
// and shown as a management surface under Employees → Nhóm.
export const mockTeams = [
    {
        id: 'team-support',
        name: 'Đội Chăm sóc khách hàng',
        description: 'Xử lý ca chat từ website, Facebook, Instagram và Zalo OA.',
        leaderId: 'e2',
        memberIds: ['e2', 'e4'],
        color: 'primary'
    },
    {
        id: 'team-sales',
        name: 'Đội Sales tổng',
        description: 'Chốt đơn, tư vấn sản phẩm và chăm sóc khách VIP.',
        leaderId: 'e1',
        memberIds: ['e1', 'e6'],
        color: 'success'
    },
    {
        id: 'team-marketplace',
        name: 'Đội Sàn TMĐT',
        description: 'Trực chat và xử lý đơn Shopee, Lazada, TikTok Shop.',
        leaderId: 'e4',
        memberIds: ['e2', 'e4'],
        color: 'warning'
    },
    {
        id: 'team-tech',
        name: 'Đội Kỹ thuật',
        description: 'Hỗ trợ nội bộ, tích hợp và cấu hình luồng agent.',
        leaderId: 'e5',
        memberIds: ['e3', 'e5'],
        color: 'secondary'
    }
]
