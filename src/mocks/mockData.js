// Dữ liệu cứng dùng cho bản demo UI/UX trên Netlify (không có backend)
const now = new Date().toISOString()
const earlier = (daysAgo) => new Date(Date.now() - daysAgo * 86400000).toISOString()

export const demoUser = {
    id: 'demo-user-id',
    email: 'demo@nexora.ai',
    name: 'Demo User',
    status: 'active',
    role: 'owner',
    isSSO: false,
    activeOrganizationId: 'demo-org-id',
    activeOrganizationSubscriptionId: 'demo-sub-id',
    activeOrganizationCustomerId: 'demo-cus-id',
    activeOrganizationProductId: 'prod-enterprise',
    activeWorkspaceId: 'demo-workspace-id',
    activeWorkspace: {
        id: 'demo-workspace-id',
        name: 'Nexora Demo Workspace',
        organizationId: 'demo-org-id'
    },
    lastLogin: now,
    isOrganizationAdmin: true,
    assignedWorkspaces: [{ id: 'demo-workspace-id', name: 'Nexora Demo Workspace', role: 'owner', organizationId: 'demo-org-id' }],
    permissions: ['*']
}

export const demoFeatures = {
    'feat:dashboard': true,
    'feat:chatflows': true,
    'feat:agentflows': true,
    'feat:assistants': true,
    'feat:tools': true,
    'feat:credentials': true,
    'feat:variables': true,
    'feat:apikeys': true,
    'feat:documentStores': true,
    'feat:datasets': true,
    'feat:evaluators': true,
    'feat:evaluations': true,
    'feat:logs': true,
    'feat:account': true,
    'feat:users': true,
    'feat:roles': true,
    'feat:workspaces': true,
    'feat:sso-config': true,
    'feat:login-activity': true,
    'feat:marketplaces': true
}

export const demoPermissions = ['*']

export const demoChatflows = [
    {
        id: 'cf-demo-1',
        name: 'Customer Support Bot',
        flowData: '{"nodes":[],"edges":[]}',
        deployed: true,
        isPublic: false,
        category: 'Support;Vietnamese',
        type: 'CHATFLOW',
        workspaceId: 'demo-workspace-id',
        createdDate: earlier(12),
        updatedDate: earlier(2)
    },
    {
        id: 'cf-demo-2',
        name: 'FAQ Trả lời tự động',
        flowData: '{"nodes":[],"edges":[]}',
        deployed: false,
        isPublic: false,
        category: 'FAQ',
        type: 'CHATFLOW',
        workspaceId: 'demo-workspace-id',
        createdDate: earlier(30),
        updatedDate: earlier(5)
    },
    {
        id: 'cf-demo-3',
        name: 'Omnichannel Zalo + Messenger',
        flowData: '{"nodes":[],"edges":[]}',
        deployed: true,
        isPublic: true,
        category: 'Omnichannel;Vietnamese',
        type: 'CHATFLOW',
        workspaceId: 'demo-workspace-id',
        createdDate: earlier(45),
        updatedDate: earlier(1)
    }
]

export const demoAgentflows = [
    {
        id: 'af-demo-1',
        name: 'Sales Agent AI',
        flowData: '{"nodes":[],"edges":[]}',
        deployed: true,
        category: 'Sales',
        type: 'AGENTFLOW',
        workspaceId: 'demo-workspace-id',
        createdDate: earlier(20),
        updatedDate: earlier(3)
    },
    {
        id: 'af-demo-2',
        name: 'Marketing Content Workflow',
        flowData: '{"nodes":[],"edges":[]}',
        deployed: false,
        category: 'Marketing',
        type: 'AGENTFLOW',
        workspaceId: 'demo-workspace-id',
        createdDate: earlier(10),
        updatedDate: earlier(1)
    }
]

// === Chat Models (cho dropdown "Chọn model" khi tạo trợ lý) ===
const makeChatModel = (name, label, provider) => ({
    label,
    name,
    type: name,
    icon: `/favicon.ico`,
    category: 'Chat Models',
    description: `${label} — provider: ${provider}`,
    baseClasses: ['ChatOpenAI', 'BaseChatModel', 'BaseLanguageModel'],
    tags: ['LlamaIndex'],
    credential: {
        label: 'Connect Credential',
        name: 'credential',
        type: 'credential',
        credentialNames: [`${provider.toLowerCase()}Api`],
        optional: true
    },
    inputs: [
        { label: 'Model Name', name: 'modelName', type: 'string', default: name },
        { label: 'Temperature', name: 'temperature', type: 'number', step: 0.1, default: 0.7, optional: true },
        { label: 'Max Tokens', name: 'maxTokens', type: 'number', optional: true, additionalParams: true },
        { label: 'Top P', name: 'topP', type: 'number', step: 0.1, optional: true, additionalParams: true },
        { label: 'Streaming', name: 'streaming', type: 'boolean', default: true, optional: true, additionalParams: true }
    ],
    outputs: [],
    inputAnchors: [],
    inputParams: [],
    outputAnchors: [{ id: `${name}_0-output-${name}-${name}|BaseChatModel|BaseLanguageModel`, name, label, type: name }]
})

export const demoChatModels = [
    makeChatModel('chatOpenAI', 'ChatOpenAI (GPT-4o)', 'OpenAI'),
    makeChatModel('chatAnthropic', 'ChatAnthropic (Claude 3.5 Sonnet)', 'Anthropic'),
    makeChatModel('chatGoogleGenerativeAI', 'Google Gemini 1.5 Pro', 'Google'),
    makeChatModel('chatMistralAI', 'Mistral Large', 'Mistral'),
    makeChatModel('chatOllama', 'Ollama (Local)', 'Ollama'),
    makeChatModel('chatGroq', 'Groq (Llama 3.1 70B)', 'Groq'),
    makeChatModel('chatVietnameseVNPT', 'VNPT ViGPT 7B (Vietnamese)', 'VNPT'),
    makeChatModel('chatZaloGPT', 'Zalo KiLM 7B (Vietnamese)', 'Zalo')
]

const makeTool = (name, label, desc) => ({
    label,
    name,
    type: name,
    icon: `/favicon.ico`,
    category: 'Tools',
    description: desc,
    baseClasses: ['Tool', 'StructuredTool'],
    inputs: [],
    outputs: [],
    inputAnchors: [],
    inputParams: [],
    outputAnchors: [{ id: `${name}_0-output-${name}-Tool|StructuredTool`, name, label, type: name }]
})

export const demoChatModelTools = [
    makeTool('calculator', 'Calculator', 'Perform calculations'),
    makeTool('serpAPI', 'SerpAPI (Google Search)', 'Google search via SerpAPI'),
    makeTool('braveSearch', 'Brave Search', 'Brave search engine'),
    makeTool('webBrowser', 'Web Browser', 'Load and summarise URLs'),
    makeTool('customTool', 'Custom Tool', 'User-defined function tool'),
    makeTool('requestsGet', 'HTTP GET', 'Make an HTTP GET request'),
    makeTool('requestsPost', 'HTTP POST', 'Make an HTTP POST request'),
    makeTool('zapierNLA', 'Zapier NLA', 'Call Zapier Natural Language Actions')
]

// Shortcut để dropdown "Kiến thức (Kho tài liệu)" trong tạo trợ lý hiển thị
export const demoDocStoresDetail = [
    {
        id: 'ds-demo-1',
        name: 'FAQ Chatbot Vietnamese',
        description: 'Bộ FAQ 500+ câu hỏi KH',
        status: 'SYNC',
        totalChunks: 10,
        totalChars: 1200
    },
    {
        id: 'ds-demo-2',
        name: 'Product Catalog Q4/2026',
        description: 'Catalogue sản phẩm Q4/2026',
        status: 'SYNC',
        totalChunks: 8,
        totalChars: 1100
    },
    { id: 'ds-demo-3', name: 'Policy & Terms', description: 'Điều khoản + chính sách', status: 'SYNC', totalChunks: 5, totalChars: 800 }
]

export const demoAssistants = [
    {
        id: 'as-demo-1',
        type: 'CUSTOM',
        details: JSON.stringify({
            name: 'Trợ lý CSKH Demo',
            instruction: 'Bạn là trợ lý CSKH thân thiện của Nexora. Trả lời ngắn gọn, lịch sự bằng tiếng Việt.',
            chatModel: { label: 'ChatOpenAI (GPT-4o)', name: 'chatOpenAI' }
        }),
        credential: 'demo-cred-1',
        createdDate: earlier(10),
        updatedDate: earlier(1),
        workspaceId: 'demo-workspace-id'
    },
    {
        id: 'as-demo-2',
        type: 'CUSTOM',
        details: JSON.stringify({
            name: 'Sales Assistant',
            instruction: 'Bạn là chuyên viên tư vấn bán hàng. Tập trung chốt đơn, upsell và cross-sell.',
            chatModel: { label: 'ChatAnthropic (Claude 3.5 Sonnet)', name: 'chatAnthropic' }
        }),
        credential: 'demo-cred-2',
        createdDate: earlier(5),
        updatedDate: earlier(1),
        workspaceId: 'demo-workspace-id'
    }
]
export const demoTools = []
export const demoCredentials = []
export const demoVariables = []
export const demoApikeys = []

// === Kho tài liệu (Document Store) — có loader + chunks để agent đọc được ===
const makeChunk = (storeId, loaderId, idx, content) => ({
    id: `chunk-${storeId}-${loaderId}-${idx}`,
    storeId,
    docId: loaderId,
    chunkNo: idx,
    pageContent: content,
    metadata: JSON.stringify({ source: `${storeId}-${loaderId}.pdf`, page: Math.floor(idx / 3) + 1 })
})

const faqChunks = [
    'Giờ mở cửa cửa hàng: 8h00 – 22h00 tất cả các ngày trong tuần, kể cả ngày lễ.',
    'Chính sách đổi trả: miễn phí đổi trả trong vòng 7 ngày kể từ ngày nhận hàng, với điều kiện sản phẩm còn nguyên tem, chưa qua sử dụng.',
    'Phương thức thanh toán hỗ trợ: Chuyển khoản ngân hàng, Ví MoMo, ZaloPay, Thẻ Visa/Mastercard, COD khi nhận hàng.',
    'Chương trình thành viên: Tích điểm 1% giá trị đơn hàng, đạt 500 điểm được voucher 100k.',
    'Hotline hỗ trợ: 1900.6868 (8h – 22h hằng ngày). Email: support@nexora.ai',
    'Giao hàng nội thành TP.HCM/Hà Nội: 2-4 giờ. Các tỉnh thành khác: 2-4 ngày làm việc.',
    'Phí vận chuyển: miễn phí cho đơn từ 500k. Dưới 500k phí 30k nội thành, 50k ngoại tỉnh.',
    'Chính sách bảo hành: 12 tháng chính hãng cho tất cả sản phẩm điện tử.',
    'Trung tâm bảo hành có mặt tại 63 tỉnh thành. Tra cứu địa chỉ qua app Nexora.',
    'Hỗ trợ trả góp 0% qua các ngân hàng: VPBank, Sacombank, Shinhan, Home Credit.'
]

const productChunks = [
    'Dòng Nexora Pulse X1: Smartphone 6.7", chip Snapdragon 8 Gen 3, RAM 12GB, 256GB. Giá 18.990.000đ.',
    'Dòng Nexora Pulse X1 Pro: màn hình 6.8" LTPO, chip 8 Gen 3, RAM 16GB, 512GB. Giá 24.990.000đ.',
    'Nexora Atlas 14: laptop 14" OLED 2.8K, Intel Core Ultra 7, 16GB RAM, 1TB SSD. Giá 32.990.000đ.',
    'Nexora Atlas 16 Studio: laptop 16" mini-LED, RTX 4070, 32GB RAM, 2TB SSD. Giá 59.990.000đ.',
    'Nexora Buds Air 3: tai nghe TWS, chống ồn chủ động 42dB, pin 36h. Giá 2.490.000đ.',
    'Nexora Watch 2: đồng hồ thông minh AMOLED 1.95", GPS, LTE eSIM, pin 14 ngày. Giá 7.990.000đ.',
    'Nexora Home Hub: loa thông minh có màn hình 10", điều khiển nhà qua Matter. Giá 3.990.000đ.',
    'Promo Q4/2026: giảm 15% cho combo smartphone + đồng hồ. Trả góp 0% 12 tháng.'
]

const policyChunks = [
    'Điều 1 — Phạm vi: Chính sách áp dụng cho mọi dịch vụ của Nexora tại thị trường Việt Nam.',
    'Điều 2 — Quyền riêng tư: Dữ liệu khách hàng được mã hoá AES-256 và không chia sẻ với bên thứ ba khi chưa có đồng ý.',
    'Điều 3 — Hoàn tiền: Hoàn 100% nếu lỗi do nhà sản xuất, trong vòng 14 ngày kể từ ngày mua.',
    'Điều 4 — Chấm dứt dịch vụ: Khách hàng có thể huỷ gói subscription bất cứ lúc nào, tiền còn lại hoàn vào ví Nexora.',
    'Điều 5 — Trách nhiệm: Nexora không chịu trách nhiệm với thiệt hại gián tiếp phát sinh từ việc sử dụng sản phẩm.'
]

const makeLoader = (loaderId, name, chunks, storeId) => ({
    id: `loader-${storeId}-${loaderId}`,
    loaderId,
    loaderName: name,
    loaderConfig: {},
    splitterId: 'recursiveCharacterTextSplitter',
    splitterName: 'Recursive Character Text Splitter',
    splitterConfig: { chunkSize: 1000, chunkOverlap: 200 },
    totalChunks: chunks.length,
    totalChars: chunks.reduce((s, c) => s + c.length, 0),
    status: 'SYNC',
    files: [
        {
            id: `file-${storeId}-${loaderId}`,
            name: `${storeId}-${loaderId}.pdf`,
            mimePrefix: 'application/pdf',
            size: 128400,
            status: 'SYNC',
            uploaded: new Date(Date.now() - 86400000 * 3).toISOString()
        }
    ],
    source: `${storeId}-${loaderId}.pdf`,
    credential: null,
    _chunks: chunks.map((c, i) => makeChunk(storeId, loaderId, i, c))
})

export const demoDocumentStores = [
    {
        id: 'ds-demo-1',
        key: 'faq',
        name: 'FAQ Chatbot Vietnamese',
        description: 'Bộ FAQ 500+ câu hỏi khách hàng thường gặp (vận chuyển, đổi trả, thanh toán).',
        status: 'SYNC',
        workspaceId: 'demo-workspace-id',
        whereUsed: '[]',
        vectorStoreConfig: { name: 'pinecone', config: { indexName: 'nexora-faq' } },
        embeddingConfig: { name: 'openAIEmbeddings', config: { modelName: 'text-embedding-3-small' } },
        recordManagerConfig: null,
        loaders: [makeLoader('pdfFile', 'PDF File', faqChunks, 'ds-demo-1')],
        createdDate: earlier(30),
        updatedDate: earlier(1)
    },
    {
        id: 'ds-demo-2',
        key: 'san_pham',
        name: 'Product Catalog Q4/2026',
        description: 'Catalogue sản phẩm Q4/2026 — Nexora Pulse X1, Atlas 14/16, Buds Air 3, Watch 2.',
        status: 'SYNC',
        workspaceId: 'demo-workspace-id',
        whereUsed: '[]',
        vectorStoreConfig: { name: 'pinecone', config: { indexName: 'nexora-product' } },
        embeddingConfig: { name: 'openAIEmbeddings', config: { modelName: 'text-embedding-3-small' } },
        recordManagerConfig: null,
        loaders: [makeLoader('pdfFile', 'PDF File', productChunks, 'ds-demo-2')],
        createdDate: earlier(14),
        updatedDate: earlier(2)
    },
    {
        id: 'ds-demo-3',
        key: 'chinh_sach',
        name: 'Policy & Terms',
        description: 'Điều khoản sử dụng + chính sách bảo mật + hoàn tiền.',
        status: 'SYNC',
        workspaceId: 'demo-workspace-id',
        whereUsed: '[]',
        vectorStoreConfig: { name: 'chroma', config: { collectionName: 'nexora-policy' } },
        embeddingConfig: { name: 'openAIEmbeddings', config: { modelName: 'text-embedding-3-small' } },
        recordManagerConfig: null,
        loaders: [makeLoader('textFile', 'Text File', policyChunks, 'ds-demo-3')],
        createdDate: earlier(60),
        updatedDate: earlier(5)
    }
]

export const demoDocStoreLoaders = [
    { label: 'PDF File', name: 'pdfFile', description: 'Tải file PDF', category: 'Document Loaders' },
    { label: 'Text File', name: 'textFile', description: 'Tải file văn bản .txt', category: 'Document Loaders' },
    { label: 'Word Document', name: 'docxFile', description: 'Tải file Word .docx', category: 'Document Loaders' },
    { label: 'CSV File', name: 'csvFile', description: 'Tải file CSV', category: 'Document Loaders' },
    { label: 'JSON File', name: 'jsonFile', description: 'Tải file JSON', category: 'Document Loaders' },
    { label: 'Website Crawler', name: 'cheerioWebScraper', description: 'Crawl 1 website', category: 'Document Loaders' },
    { label: 'Notion Database', name: 'notionDB', description: 'Đồng bộ từ Notion', category: 'Document Loaders' },
    { label: 'Google Drive', name: 'googleDrive', description: 'Đồng bộ Drive folder', category: 'Document Loaders' }
]

export const demoVectorStoreProviders = [
    { label: 'Pinecone', name: 'pinecone', description: 'Pinecone managed vector DB', category: 'Vector Stores' },
    { label: 'Chroma', name: 'chroma', description: 'Chroma open-source vector DB', category: 'Vector Stores' },
    { label: 'Qdrant', name: 'qdrant', description: 'Qdrant vector DB', category: 'Vector Stores' },
    { label: 'In-Memory Vector Store', name: 'memoryVectorStore', description: 'In-memory (dev)', category: 'Vector Stores' },
    { label: 'Supabase', name: 'supabase', description: 'Supabase pgvector', category: 'Vector Stores' }
]

export const demoEmbeddingProviders = [
    { label: 'OpenAI Embeddings', name: 'openAIEmbeddings', description: 'text-embedding-3', category: 'Embeddings' },
    { label: 'Cohere Embeddings', name: 'cohereEmbeddings', description: 'Cohere embed-v3', category: 'Embeddings' },
    { label: 'Google Embeddings', name: 'googleGenerativeAIEmbeddings', description: 'Google text-embedding', category: 'Embeddings' },
    { label: 'HuggingFace Inference', name: 'huggingFaceInferenceEmbeddings', description: 'HF embeddings', category: 'Embeddings' }
]

export const demoRecordManagers = [
    { label: 'SQLite Record Manager', name: 'sqliteRecordManager', description: 'SQLite record manager', category: 'Record Manager' },
    { label: 'Postgres Record Manager', name: 'postgresRecordManager', description: 'Postgres record manager', category: 'Record Manager' }
]
export const demoDatasets = []
export const demoEvaluators = []
export const demoEvaluations = []
export const demoMarketplaces = []
export const demoCustomMcpServers = []
export const demoRoles = []
export const demoUsers = [demoUser]
export const demoWorkspaces = [demoUser.activeWorkspace]
export const demoExecutions = []
export const demoLogs = []
export const demoLeads = []
export const demoFeedback = []
export const demoChatMessages = []
export const demoNodes = []

export const demoSettings = {
    PLATFORM_TYPE: 'ENTERPRISE',
    SHOW_COMMUNITY_NODES: 'true',
    DISABLE_FLOWISE_TELEMETRY: 'true'
}

export const demoLoginMethods = [
    { name: 'EMAIL', enabled: true },
    { name: 'GOOGLE', enabled: false },
    { name: 'GITHUB', enabled: false }
]

export const demoPricing = {
    plans: [
        { id: 'starter', name: 'Starter', price: 0 },
        { id: 'pro', name: 'Pro', price: 29 },
        { id: 'enterprise', name: 'Enterprise', price: 299 }
    ]
}

export const demoBilling = {
    customerId: 'demo-cus-id',
    subscriptionId: 'demo-sub-id',
    status: 'active',
    plan: 'enterprise',
    nextBillingDate: earlier(-25),
    amount: 299,
    currency: 'USD'
}
