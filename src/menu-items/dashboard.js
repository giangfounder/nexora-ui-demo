import { iconComponent } from '@/ui-component/icons/AppIcon'

const dashboard = {
    id: 'dashboard-root',
    type: 'group',
    children: [
        {
            id: 'overview',
            title: 'Tổng quan',
            type: 'group',
            children: [
                {
                    id: 'dashboard',
                    title: 'Dashboard',
                    type: 'item',
                    url: '/dashboard',
                    icon: iconComponent('SquaresFour'),
                    breadcrumbs: true
                },
                {
                    id: 'reports',
                    title: 'Báo cáo',
                    type: 'item',
                    url: '/reports',
                    icon: iconComponent('ChartLine'),
                    breadcrumbs: true
                }
            ]
        },
        {
            id: 'operations',
            title: 'Vận hành',
            type: 'group',
            children: [
                {
                    id: 'omnichannel',
                    title: 'Kênh',
                    type: 'item',
                    url: '/omnichannel',
                    icon: iconComponent('ChatTeardropText'),
                    breadcrumbs: true,
                    permission: 'customers:view'
                },
                {
                    id: 'customers',
                    title: 'Khách hàng',
                    type: 'item',
                    url: '/customers',
                    icon: iconComponent('User'),
                    breadcrumbs: true,
                    permission: 'customers:view'
                },
                {
                    id: 'employees',
                    title: 'Nhân sự',
                    type: 'item',
                    url: '/employees',
                    icon: iconComponent('Briefcase'),
                    breadcrumbs: true,
                    permission: 'customers:view'
                }
            ]
        },
        {
            id: 'ai',
            title: 'Tự động hoá',
            type: 'group',
            children: [
                {
                    id: 'chatflows',
                    title: 'Chat Flows',
                    type: 'item',
                    url: '/chatflows',
                    icon: iconComponent('TreeStructure'),
                    breadcrumbs: true,
                    permission: 'chatflows:view'
                },
                {
                    id: 'agentflows',
                    title: 'Agent Flows',
                    type: 'item',
                    url: '/agentflows',
                    icon: iconComponent('UsersThree'),
                    breadcrumbs: true,
                    permission: 'agentflows:view'
                },
                {
                    id: 'assistants',
                    title: 'Assistants',
                    type: 'item',
                    url: '/assistants',
                    icon: iconComponent('GitBranch'),
                    breadcrumbs: true,
                    permission: 'assistants:view'
                },
                {
                    id: 'prism',
                    title: 'Prism',
                    type: 'item',
                    url: '/prism',
                    icon: iconComponent('Microscope'),
                    breadcrumbs: true,
                    permission: 'customers:view'
                }
            ]
        },
        {
            id: 'apps',
            title: 'Kho ứng dụng',
            type: 'group',
            children: [
                {
                    id: 'marketplaces',
                    title: 'Kho ứng dụng',
                    type: 'item',
                    url: '/marketplaces',
                    icon: iconComponent('Storefront'),
                    breadcrumbs: true,
                    permission: 'templates:marketplace,templates:custom'
                },
                {
                    id: 'tools',
                    title: 'Công cụ',
                    type: 'item',
                    url: '/tools',
                    icon: iconComponent('Wrench'),
                    breadcrumbs: true,
                    permission: 'tools:view'
                },
                {
                    id: 'credentials',
                    title: 'Chứng thực',
                    type: 'item',
                    url: '/credentials',
                    icon: iconComponent('Lock'),
                    breadcrumbs: true,
                    permission: 'credentials:view'
                },
                {
                    id: 'variables',
                    title: 'Biến',
                    type: 'item',
                    url: '/variables',
                    icon: iconComponent('BracketsSquare'),
                    breadcrumbs: true,
                    permission: 'variables:view'
                },
                {
                    id: 'apikey',
                    title: 'Khoá API',
                    type: 'item',
                    url: '/apikey',
                    icon: iconComponent('Key'),
                    breadcrumbs: true,
                    permission: 'apikeys:view'
                },
                {
                    id: 'document-stores',
                    title: 'Kho tài liệu',
                    type: 'item',
                    url: '/document-stores',
                    icon: iconComponent('Files'),
                    breadcrumbs: true,
                    permission: 'documentStores:view'
                }
            ]
        },
        {
            id: 'system',
            title: 'Hệ thống',
            type: 'group',
            children: [
                {
                    id: 'settings',
                    title: 'Cấu hình',
                    type: 'item',
                    url: '/settings',
                    icon: iconComponent('GearSix'),
                    breadcrumbs: true,
                    permission: 'customers:view'
                },
                {
                    id: 'executions',
                    title: 'Lịch sử chạy',
                    type: 'item',
                    url: '/executions',
                    icon: iconComponent('ClipboardText'),
                    breadcrumbs: true,
                    permission: 'executions:view'
                },
                {
                    id: 'evaluations',
                    title: 'Đánh giá',
                    type: 'item',
                    url: '/evaluations',
                    icon: iconComponent('ChartBar'),
                    breadcrumbs: true,
                    display: 'feat:evaluations',
                    permission: 'evaluations:view'
                },
                {
                    id: 'datasets',
                    title: 'Datasets',
                    type: 'item',
                    url: '/datasets',
                    icon: iconComponent('Database'),
                    breadcrumbs: true,
                    display: 'feat:datasets',
                    permission: 'datasets:view'
                },
                {
                    id: 'evaluators',
                    title: 'Evaluators',
                    type: 'item',
                    url: '/evaluators',
                    icon: iconComponent('TestTube'),
                    breadcrumbs: true,
                    display: 'feat:evaluators',
                    permission: 'evaluators:view'
                },
                {
                    id: 'logs',
                    title: 'Nhật ký',
                    type: 'item',
                    url: '/logs',
                    icon: iconComponent('ListChecks'),
                    breadcrumbs: true,
                    display: 'feat:logs',
                    permission: 'logs:view'
                }
            ]
        },
        {
            id: 'management',
            title: 'Quản trị',
            type: 'group',
            children: [
                {
                    id: 'sso',
                    title: 'SSO',
                    type: 'item',
                    url: '/sso-config',
                    icon: iconComponent('ShieldCheckered'),
                    breadcrumbs: true,
                    display: 'feat:sso-config',
                    permission: 'sso:manage'
                },
                {
                    id: 'roles',
                    title: 'Vai trò',
                    type: 'item',
                    url: '/roles',
                    icon: iconComponent('LockKey'),
                    breadcrumbs: true,
                    display: 'feat:roles',
                    permission: 'roles:manage'
                },
                {
                    id: 'users',
                    title: 'Người dùng',
                    type: 'item',
                    url: '/users',
                    icon: iconComponent('Users'),
                    breadcrumbs: true,
                    display: 'feat:users',
                    permission: 'users:manage'
                },
                {
                    id: 'workspaces',
                    title: 'Workspace',
                    type: 'item',
                    url: '/workspaces',
                    icon: iconComponent('Stack'),
                    breadcrumbs: true,
                    display: 'feat:workspaces',
                    permission: 'workspace:view'
                },
                {
                    id: 'login-activity',
                    title: 'Lịch sử đăng nhập',
                    type: 'item',
                    url: '/login-activity',
                    icon: iconComponent('ClipboardText'),
                    breadcrumbs: true,
                    display: 'feat:login-activity',
                    permission: 'loginActivity:view'
                }
            ]
        }
    ]
}

export default dashboard
