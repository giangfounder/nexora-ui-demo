import {
    IconLayoutDashboard,
    IconChartAreaLine,
    IconMessage2,
    IconUser,
    IconBriefcase,
    IconHierarchy,
    IconUsersGroup,
    IconGitBranch,
    IconBuildingStore,
    IconTool,
    IconLock,
    IconVariable,
    IconKey,
    IconFiles,
    IconSettings,
    IconClipboardList,
    IconChartHistogram,
    IconDatabase,
    IconTestPipe,
    IconMicroscope,
    IconShieldLock,
    IconLockCheck,
    IconUsers,
    IconStack2,
    IconListCheck
} from '@tabler/icons-react'

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
                    icon: IconLayoutDashboard,
                    breadcrumbs: true
                },
                {
                    id: 'reports',
                    title: 'Báo cáo',
                    type: 'item',
                    url: '/reports',
                    icon: IconChartAreaLine,
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
                    icon: IconMessage2,
                    breadcrumbs: true,
                    permission: 'customers:view'
                },
                {
                    id: 'customers',
                    title: 'Khách hàng',
                    type: 'item',
                    url: '/customers',
                    icon: IconUser,
                    breadcrumbs: true,
                    permission: 'customers:view'
                },
                {
                    id: 'employees',
                    title: 'Nhân sự',
                    type: 'item',
                    url: '/employees',
                    icon: IconBriefcase,
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
                    icon: IconHierarchy,
                    breadcrumbs: true,
                    permission: 'chatflows:view'
                },
                {
                    id: 'agentflows',
                    title: 'Agent Flows',
                    type: 'item',
                    url: '/agentflows',
                    icon: IconUsersGroup,
                    breadcrumbs: true,
                    permission: 'agentflows:view'
                },
                {
                    id: 'assistants',
                    title: 'Assistants',
                    type: 'item',
                    url: '/assistants',
                    icon: IconGitBranch,
                    breadcrumbs: true,
                    permission: 'assistants:view'
                },
                {
                    id: 'prism',
                    title: 'Prism',
                    type: 'item',
                    url: '/prism',
                    icon: IconMicroscope,
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
                    icon: IconBuildingStore,
                    breadcrumbs: true,
                    permission: 'templates:marketplace,templates:custom'
                },
                {
                    id: 'tools',
                    title: 'Công cụ',
                    type: 'item',
                    url: '/tools',
                    icon: IconTool,
                    breadcrumbs: true,
                    permission: 'tools:view'
                },
                {
                    id: 'credentials',
                    title: 'Chứng thực',
                    type: 'item',
                    url: '/credentials',
                    icon: IconLock,
                    breadcrumbs: true,
                    permission: 'credentials:view'
                },
                {
                    id: 'variables',
                    title: 'Biến',
                    type: 'item',
                    url: '/variables',
                    icon: IconVariable,
                    breadcrumbs: true,
                    permission: 'variables:view'
                },
                {
                    id: 'apikey',
                    title: 'Khoá API',
                    type: 'item',
                    url: '/apikey',
                    icon: IconKey,
                    breadcrumbs: true,
                    permission: 'apikeys:view'
                },
                {
                    id: 'document-stores',
                    title: 'Kho tài liệu',
                    type: 'item',
                    url: '/document-stores',
                    icon: IconFiles,
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
                    icon: IconSettings,
                    breadcrumbs: true,
                    permission: 'customers:view'
                },
                {
                    id: 'executions',
                    title: 'Lịch sử chạy',
                    type: 'item',
                    url: '/executions',
                    icon: IconClipboardList,
                    breadcrumbs: true,
                    permission: 'executions:view'
                },
                {
                    id: 'evaluations',
                    title: 'Đánh giá',
                    type: 'item',
                    url: '/evaluations',
                    icon: IconChartHistogram,
                    breadcrumbs: true,
                    display: 'feat:evaluations',
                    permission: 'evaluations:view'
                },
                {
                    id: 'datasets',
                    title: 'Datasets',
                    type: 'item',
                    url: '/datasets',
                    icon: IconDatabase,
                    breadcrumbs: true,
                    display: 'feat:datasets',
                    permission: 'datasets:view'
                },
                {
                    id: 'evaluators',
                    title: 'Evaluators',
                    type: 'item',
                    url: '/evaluators',
                    icon: IconTestPipe,
                    breadcrumbs: true,
                    display: 'feat:evaluators',
                    permission: 'evaluators:view'
                },
                {
                    id: 'logs',
                    title: 'Nhật ký',
                    type: 'item',
                    url: '/logs',
                    icon: IconListCheck,
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
                    icon: IconShieldLock,
                    breadcrumbs: true,
                    display: 'feat:sso-config',
                    permission: 'sso:manage'
                },
                {
                    id: 'roles',
                    title: 'Vai trò',
                    type: 'item',
                    url: '/roles',
                    icon: IconLockCheck,
                    breadcrumbs: true,
                    display: 'feat:roles',
                    permission: 'roles:manage'
                },
                {
                    id: 'users',
                    title: 'Người dùng',
                    type: 'item',
                    url: '/users',
                    icon: IconUsers,
                    breadcrumbs: true,
                    display: 'feat:users',
                    permission: 'users:manage'
                },
                {
                    id: 'workspaces',
                    title: 'Workspace',
                    type: 'item',
                    url: '/workspaces',
                    icon: IconStack2,
                    breadcrumbs: true,
                    display: 'feat:workspaces',
                    permission: 'workspace:view'
                },
                {
                    id: 'login-activity',
                    title: 'Lịch sử đăng nhập',
                    type: 'item',
                    url: '/login-activity',
                    icon: IconClipboardList,
                    breadcrumbs: true,
                    display: 'feat:login-activity',
                    permission: 'loginActivity:view'
                }
            ]
        }
    ]
}

export default dashboard
