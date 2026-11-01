// Axios adapter mock — trả dữ liệu cứng cho mọi request /api/v1/*
import {
    demoUser,
    demoFeatures,
    demoPermissions,
    demoChatflows,
    demoAgentflows,
    demoAssistants,
    demoChatModels,
    demoChatModelTools,
    demoDocStoresDetail,
    demoDocStoreLoaders,
    demoVectorStoreProviders,
    demoEmbeddingProviders,
    demoRecordManagers,
    demoTools,
    demoCredentials,
    demoVariables,
    demoPermissionGroups,
    demoApikeys,
    demoDocumentStores,
    demoDatasets,
    demoEvaluators,
    demoEvaluations,
    demoMarketplaces,
    demoCustomMcpServers,
    demoRoles,
    demoUsers,
    demoWorkspaces,
    demoExecutions,
    demoLogs,
    demoLeads,
    demoFeedback,
    demoChatMessages,
    demoNodes,
    demoSettings,
    demoLoginMethods,
    demoPricing,
    demoBilling
} from './mockData'

const ok = (data, config, status = 200) => ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
    request: {}
})

// Trợ lý tạo/sửa trong prototype được giữ lại trong trình duyệt để tải lại trang vẫn còn.
const ASSISTANTS_KEY = 'nexora.assistants.v1'
const bodyOf = (config) => (typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {})
const loadAssistants = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(ASSISTANTS_KEY))
        if (Array.isArray(saved)) return saved
    } catch (e) {
        // ignore — fall back to the demo seed
    }
    return demoAssistants
}
const saveAssistants = (list) => {
    try {
        localStorage.setItem(ASSISTANTS_KEY, JSON.stringify(list))
    } catch (e) {
        // ignore — storage may be unavailable
    }
}

// Prototype: mọi thông tin đăng nhập đều hợp lệ — hiển thị đúng thứ người dùng đã gõ.
const sessionFor = (config) => {
    let typed = ''
    try {
        typed = String(bodyOf(config).email ?? '').trim()
    } catch (e) {
        typed = ''
    }
    const name = typed
        .split('@')[0]
        .replace(/[._-]+/g, ' ')
        .trim()
    return JSON.parse(
        JSON.stringify({
            ...demoUser,
            email: typed || demoUser.email,
            name: name || demoUser.name,
            lastLogin: new Date().toISOString(),
            token: 'demo-token',
            permissions: demoPermissions,
            features: demoFeatures
        })
    )
}

const resolveResponse = (method, pathname, config) => {
    const m = (method || 'get').toLowerCase()
    const p = pathname.replace(/^\/api\/v1/, '').split('?')[0]

    // AUTH / ACCOUNT
    if (p === '/auth/resolve') return ok({ redirectUrl: '/signin' }, config)
    if (p === '/auth/login') return ok(sessionFor(config), config)
    if (p === '/auth/refreshToken') return ok({ id: demoUser.id }, config)
    if (p.startsWith('/auth/permissions/')) return ok(structuredClone(demoPermissionGroups), config)
    if (p.startsWith('/auth/sso-success')) return ok(sessionFor({}), config)

    if (p === '/account/logout') return ok({ message: 'logged_out', redirectTo: '/signin' }, config)
    if (p === '/account/billing') return ok(demoBilling, config)
    if (p.startsWith('/account/')) return ok({ success: true }, config)

    // USER / WORKSPACE / ORG
    if (p === '/user' && m === 'get') return ok(demoUser, config)
    if (p === '/user' && (m === 'put' || m === 'post')) return ok(demoUser, config)
    if (p.startsWith('/user')) return ok(demoUsers, config)

    if (p === '/workspace' && m === 'get') {
        const params = config?.params || {}
        if (params.id) return ok(demoWorkspaces[0], config)
        return ok(demoWorkspaces, config)
    }
    if (p === '/workspace/switch') return ok(sessionFor({}), config)
    if (p.startsWith('/workspace')) return ok(demoWorkspaces, config)
    if (p.startsWith('/organization')) return ok({ id: 'demo-org-id', name: 'Nexora Demo Org' }, config)

    // SETTINGS / CONFIG
    if (p === '/settings' || p.startsWith('/platformsettings') || p.startsWith('/platform-settings')) return ok(demoSettings, config)
    if (p === '/config') return ok({}, config)
    if (p === '/version' || p === '/api/version') return ok({ version: 'demo-1.0.0' }, config)
    if (p === '/ip') return ok({ ip: '127.0.0.1' }, config)

    // NODES / COMPONENTS
    if (p === '/nodes' || p.startsWith('/nodes')) return ok(demoNodes, config)
    if (p === '/components-credentials' || p.startsWith('/components-credentials')) return ok([], config)
    if (p === '/node-icon' || p.startsWith('/node-icon')) return ok({}, config)
    if (p.startsWith('/node-load-method')) return ok([], config)
    if (p.startsWith('/node-custom-function')) return ok({}, config)

    // FLOWS
    if (p === '/chatflows' || p.startsWith('/chatflows/count')) return ok(demoChatflows, config)
    if (p.startsWith('/chatflows')) {
        if (m === 'get') {
            const q = p.split('/').pop()
            const found = [...demoChatflows, ...demoAgentflows].find((f) => f.id === q)
            if (found) return ok(found, config)
            return ok(demoChatflows, config)
        }
        return ok({ id: 'cf-new', success: true }, config)
    }
    if (p === '/agentflows' || p.startsWith('/agentflows')) return ok(demoAgentflows, config)

    // ASSISTANTS
    if (p === '/assistants/components/chatmodels') return ok(demoChatModels, config)
    if (p === '/assistants/components/tools') return ok(demoChatModelTools, config)
    if (p === '/assistants/components/docstores') return ok(demoDocStoresDetail, config)
    if (p === '/assistants/generate/instruction' && m === 'post') {
        const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {}
        const task = body.task || body.description || 'nhiệm vụ của bạn'
        return ok(
            {
                instruction:
                    `Bạn là một trợ lý AI chuyên nghiệp, nhiệm vụ chính của bạn là ${task}.\n\n` +
                    `Nguyên tắc:\n` +
                    `1. Trả lời ngắn gọn, chính xác, bằng tiếng Việt.\n` +
                    `2. Nếu không biết câu trả lời, hãy nói "Tôi không chắc" thay vì bịa đặt.\n` +
                    `3. Luôn giữ thái độ lịch sự, chuyên nghiệp.\n` +
                    `4. Khi cần dữ liệu từ user, hãy hỏi rõ ràng từng mục một.\n`
            },
            config
        )
    }
    if (p.startsWith('/assistants/')) {
        const id = p.replace('/assistants/', '').split('/')[0]
        const list = loadAssistants()
        const found = list.find((a) => a.id === id)
        if (m === 'get') return ok(found || list[0] || demoAssistants[0], config)
        if (m === 'put') {
            const next = {
                ...(found || { id, type: 'CUSTOM', createdDate: new Date().toISOString(), workspaceId: 'demo-workspace-id' }),
                ...bodyOf(config),
                id,
                updatedDate: new Date().toISOString()
            }
            saveAssistants(found ? list.map((a) => (a.id === id ? next : a)) : [...list, next])
            return ok(next, config)
        }
        if (m === 'delete') {
            saveAssistants(list.filter((a) => a.id !== id))
            return ok({ success: true }, config)
        }
    }
    if (p === '/assistants' && m === 'post') {
        const body = bodyOf(config)
        const created = {
            id: `as-new-${Date.now()}`,
            type: body.type || 'CUSTOM',
            details: body.details || '{}',
            credential: body.credential || 'demo-cred-new',
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            workspaceId: 'demo-workspace-id'
        }
        saveAssistants([...loadAssistants(), created])
        return ok(created, config)
    }
    if (p.startsWith('/assistants')) return ok(loadAssistants(), config)
    if (p.startsWith('/openai-assistants')) return ok([], config)
    if (p.startsWith('/tools')) return ok(demoTools, config)
    if (p.startsWith('/credentials')) return ok(demoCredentials, config)
    if (p.startsWith('/variables')) {
        // The list view asks for pages ({ data, total }); other callers (suggestions, API dialog) expect a plain array
        return ok(config.params?.page ? { data: demoVariables, total: demoVariables.length } : demoVariables, config)
    }
    if (p.startsWith('/apikey')) return ok(config.params?.page ? { data: demoApikeys, total: demoApikeys.length } : demoApikeys, config)

    // DOCSTORE
    if (p === '/document-store/components/loaders') return ok(demoDocStoreLoaders, config)
    if (p === '/document-store/components/vectorstore') return ok(demoVectorStoreProviders, config)
    if (p === '/document-store/components/embeddings') return ok(demoEmbeddingProviders, config)
    if (p === '/document-store/components/recordmanager') return ok(demoRecordManagers, config)
    if (p === '/document-store/store' && m === 'get') return ok({ data: demoDocumentStores, total: demoDocumentStores.length }, config)
    if (p === '/document-store/store' && m === 'post') {
        const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {}
        return ok(
            {
                id: `ds-new-${Date.now()}`,
                name: body.name || 'Kho tài liệu mới',
                description: body.description || '',
                status: 'EMPTY',
                workspaceId: 'demo-workspace-id',
                loaders: [],
                whereUsed: '[]',
                createdDate: new Date().toISOString(),
                updatedDate: new Date().toISOString()
            },
            config
        )
    }
    if (p.startsWith('/document-store/store/')) {
        const id = p.replace('/document-store/store/', '').split('/')[0]
        if (m === 'get') {
            const found = demoDocumentStores.find((s) => s.id === id)
            return ok(found || demoDocumentStores[0], config)
        }
        if (m === 'put') return ok({ ...demoDocumentStores[0], id }, config)
        if (m === 'delete') return ok({ success: true }, config)
    }
    if (p.startsWith('/document-store/chunks/')) {
        // /document-store/chunks/:storeId/:fileId/:pageNo
        const parts = p.replace('/document-store/chunks/', '').split('/')
        const [storeId, fileId] = parts
        const store = demoDocumentStores.find((s) => s.id === storeId)
        const loader = store?.loaders?.find((l) => l.loaderId === fileId || l.id === fileId) || store?.loaders?.[0]
        const chunks = loader?._chunks || []
        return ok(
            { chunks, count: chunks.length, file: loader?.files?.[0], storeName: store?.name, description: store?.description },
            config
        )
    }
    if (p.startsWith('/document-store/loader/preview') && m === 'post') {
        return ok({ chunks: demoDocumentStores[0].loaders[0]._chunks, totalChunks: 10, previewChunkCount: 10 }, config)
    }
    if (p.startsWith('/document-store/loader/process/')) return ok({ success: true }, config)
    if (p.startsWith('/document-store/loader/save')) return ok({ success: true }, config)
    if (p.startsWith('/document-store/loader/')) return ok({ success: true }, config)
    if (p.startsWith('/document-store/refresh/')) return ok({ success: true }, config)
    if (p.startsWith('/document-store/vectorstore/query')) {
        return ok({ docs: demoDocumentStores[0].loaders[0]._chunks.slice(0, 4) }, config)
    }
    if (p.startsWith('/document-store/vectorstore')) return ok({ success: true }, config)
    if (p.startsWith('/document-store/store-configs/')) return ok({ config: {}, loaderConfig: {} }, config)
    if (p.startsWith('/document-store/generate-tool-desc/')) {
        return ok({ description: 'Trả lời các câu hỏi dựa trên dữ liệu trong kho tài liệu này.' }, config)
    }
    if (p.startsWith('/document-store') || p.startsWith('/documentstore')) return ok(demoDocumentStores, config)
    if (p.startsWith('/datasets')) return ok(demoDatasets, config)
    if (p.startsWith('/evaluators')) return ok(demoEvaluators, config)
    if (p.startsWith('/evaluations')) return ok(demoEvaluations, config)

    // MARKETPLACE / MCP
    if (p.startsWith('/marketplaces')) return ok(demoMarketplaces, config)
    if (p.startsWith('/custom-mcp-servers') || p.startsWith('/custommcpservers')) return ok(demoCustomMcpServers, config)
    if (p.startsWith('/mcp')) return ok([], config)

    // RBAC
    if (p.startsWith('/roles')) return ok(demoRoles, config)
    if (p.startsWith('/audit')) return ok({ records: [], total: 0 }, config)
    if (p.startsWith('/loginmethod') || p.startsWith('/login-method')) return ok(demoLoginMethods, config)
    if (p.startsWith('/sso')) return ok({ enabled: false, providers: [] }, config)

    // OBSERVE / LOGS / EXECUTIONS
    if (p.startsWith('/logs')) return ok(demoLogs, config)
    if (p.startsWith('/executions') || p.startsWith('/agentexecutions')) return ok(demoExecutions, config)

    // FEEDBACK / LEADS / CHAT / PREDICTION
    if (p.startsWith('/feedback')) return ok(demoFeedback, config)
    if (p.startsWith('/leads')) return ok(demoLeads, config)
    if (p.startsWith('/chatmessage') || p.startsWith('/chat-message')) return ok(demoChatMessages, config)
    if (p.startsWith('/prediction')) return ok({ text: '[Demo prototype – không có backend. Đây là phản hồi mẫu.]' }, config)

    // FILES
    if (p.startsWith('/attachments') || p.startsWith('/files')) return ok([], config)
    if (p.startsWith('/get-upload-file')) return ok({ url: '' }, config)

    // PRICING
    if (p.startsWith('/pricing')) return ok(demoPricing, config)

    // MISC
    if (p.startsWith('/validation')) return ok({ valid: true }, config)
    if (p.startsWith('/export-import')) return ok({ success: true }, config)
    if (p.startsWith('/scraper')) return ok({ data: '' }, config)
    if (p.startsWith('/tts')) return ok({ audio: '' }, config)
    if (p.startsWith('/webhook')) return ok({ success: true }, config)
    if (p.startsWith('/oauth2')) return ok({ success: true }, config)
    if (p.startsWith('/prompts-list')) return ok([], config)

    // Fallback
    if (m === 'get') return ok([], config)
    return ok({ success: true }, config)
}

const mockAdapter = (config) => {
    return new Promise((resolveP) => {
        const rawUrl = (config.baseURL || '') + (config.url || '')
        let pathname = rawUrl
        try {
            pathname = rawUrl.startsWith('http') ? new URL(rawUrl).pathname : rawUrl
        } catch {
            pathname = config.url || ''
        }
        const latency = 50 + Math.random() * 100
        setTimeout(() => resolveP(resolveResponse(config.method, pathname, config)), latency)
    })
}

export default mockAdapter
