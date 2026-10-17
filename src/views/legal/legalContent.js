// Legal copy shown on /terms, /privacy and /cookies.
// DRAFT: this is a starting template, not legal advice — have it reviewed by counsel before going live,
// and replace the operator details below with the registered company's.
export const LEGAL_ENTITY = {
    brand: 'NEXORA',
    company: 'Công ty vận hành nền tảng NEXORA',
    address: 'Việt Nam',
    privacyEmail: 'privacy@nexora.vn',
    supportEmail: 'support@nexora.vn'
}

export const LEGAL_UPDATED = '29/09/2026'
// Same date as a Date, so each language can format it in its own locale
export const LEGAL_UPDATED_DATE = new Date(2026, 8, 29)

const E = LEGAL_ENTITY

export const LEGAL_DOCS = {
    terms: {
        path: '/terms',
        label: 'Điều khoản sử dụng',
        title: 'Điều khoản sử dụng',
        intro: `Các điều khoản này điều chỉnh việc bạn truy cập và sử dụng nền tảng chăm sóc khách hàng đa kênh ${E.brand} (“Dịch vụ”). Khi đăng nhập hoặc sử dụng Dịch vụ, bạn xác nhận đã đọc, hiểu và đồng ý với các điều khoản dưới đây.`,
        sections: [
            {
                id: 'pham-vi',
                heading: 'Phạm vi áp dụng',
                body: [
                    `Điều khoản áp dụng cho mọi người dùng được tổ chức của mình (“Khách hàng”) cấp tài khoản trên ${E.brand}, bao gồm quản trị viên, nhân viên tư vấn và người dùng tích hợp qua API.`,
                    'Nếu tổ chức của bạn đã ký hợp đồng dịch vụ riêng với chúng tôi, các điều khoản trong hợp đồng đó được ưu tiên áp dụng khi có khác biệt.'
                ]
            },
            {
                id: 'tai-khoan',
                heading: 'Tài khoản và bảo mật đăng nhập',
                body: [
                    'Bạn chịu trách nhiệm giữ bí mật thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của mình.',
                    'Không chia sẻ tài khoản cho người khác. Hãy thông báo ngay cho quản trị viên của tổ chức hoặc cho chúng tôi khi phát hiện truy cập trái phép.',
                    'Chúng tôi có thể tạm khóa tài khoản khi phát hiện dấu hiệu xâm nhập, lạm dụng hoặc theo yêu cầu của quản trị viên tổ chức.'
                ]
            },
            {
                id: 'su-dung',
                heading: 'Sử dụng Dịch vụ đúng mục đích',
                body: ['Khi sử dụng Dịch vụ, bạn cam kết không:'],
                list: [
                    'Gửi tin nhắn rác, nội dung lừa đảo hoặc nội dung vi phạm pháp luật Việt Nam tới khách hàng cuối.',
                    'Thu thập, xử lý dữ liệu cá nhân của khách hàng cuối khi chưa có cơ sở pháp lý hoặc sự đồng ý hợp lệ.',
                    'Can thiệp, dò quét, vượt qua cơ chế bảo mật hoặc làm gián đoạn hạ tầng của Dịch vụ.',
                    'Sao chép, dịch ngược hoặc khai thác Dịch vụ cho mục đích xây dựng sản phẩm cạnh tranh.'
                ]
            },
            {
                id: 'kenh-ket-noi',
                heading: 'Kênh kết nối bên thứ ba',
                body: [
                    'Dịch vụ cho phép kết nối với các nền tảng như Zalo, Facebook Messenger, Instagram, WhatsApp, TikTok, Shopee, Lazada và email. Việc sử dụng các kênh này đồng thời chịu sự điều chỉnh bởi chính sách của từng nền tảng.',
                    'Chúng tôi không chịu trách nhiệm về gián đoạn, thay đổi API hoặc quyết định khóa tài khoản do bên thứ ba thực hiện.'
                ]
            },
            {
                id: 'ai',
                heading: 'Tính năng trí tuệ nhân tạo',
                body: [
                    'Trợ lý ảo, gợi ý trả lời và phân tích tự động được tạo bởi mô hình AI và có thể không chính xác tuyệt đối. Người dùng cần kiểm tra lại trước khi dùng kết quả cho quyết định quan trọng.',
                    'Khách hàng chịu trách nhiệm về nội dung mà chatbot của mình gửi tới khách hàng cuối.'
                ]
            },
            {
                id: 'du-lieu',
                heading: 'Dữ liệu của Khách hàng',
                body: [
                    'Khách hàng giữ toàn bộ quyền đối với dữ liệu hội thoại, hồ sơ khách hàng và tài liệu tải lên Dịch vụ.',
                    `Chúng tôi chỉ xử lý dữ liệu này để cung cấp, duy trì và cải thiện Dịch vụ theo Chính sách bảo mật của ${E.brand}.`
                ]
            },
            {
                id: 'so-huu-tri-tue',
                heading: 'Quyền sở hữu trí tuệ',
                body: [
                    `Thương hiệu, giao diện, mã nguồn và tài liệu của ${E.brand} thuộc quyền sở hữu của chúng tôi hoặc bên cấp phép. Một số thành phần được phát hành theo giấy phép mã nguồn mở và tuân theo giấy phép tương ứng.`
                ]
            },
            {
                id: 'gioi-han',
                heading: 'Giới hạn trách nhiệm',
                body: [
                    'Dịch vụ được cung cấp theo hiện trạng. Trong phạm vi pháp luật cho phép, chúng tôi không chịu trách nhiệm đối với thiệt hại gián tiếp, mất lợi nhuận hoặc mất dữ liệu phát sinh từ việc sử dụng Dịch vụ.'
                ]
            },
            {
                id: 'thay-doi',
                heading: 'Thay đổi điều khoản',
                body: [
                    'Chúng tôi có thể cập nhật điều khoản khi Dịch vụ thay đổi. Những thay đổi quan trọng sẽ được thông báo trong ứng dụng hoặc qua email trước khi có hiệu lực.'
                ]
            },
            {
                id: 'luat-ap-dung',
                heading: 'Luật áp dụng',
                body: [
                    'Điều khoản được điều chỉnh bởi pháp luật Việt Nam. Tranh chấp được ưu tiên giải quyết bằng thương lượng; nếu không thành, sẽ được đưa ra cơ quan có thẩm quyền tại Việt Nam.'
                ]
            }
        ]
    },
    privacy: {
        path: '/privacy',
        label: 'Chính sách bảo mật',
        title: 'Chính sách bảo mật',
        intro: `Chính sách này mô tả cách ${E.brand} thu thập, sử dụng và bảo vệ dữ liệu cá nhân, phù hợp với Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân và các quy định liên quan.`,
        sections: [
            {
                id: 'vai-tro',
                heading: 'Vai trò của chúng tôi',
                body: [
                    'Đối với dữ liệu tài khoản người dùng (họ tên, email, lịch sử đăng nhập), chúng tôi là bên kiểm soát dữ liệu.',
                    'Đối với dữ liệu khách hàng cuối mà tổ chức của bạn đưa vào Dịch vụ (hội thoại, số điện thoại, đơn hàng), tổ chức của bạn là bên kiểm soát và chúng tôi là bên xử lý dữ liệu theo chỉ dẫn.'
                ]
            },
            {
                id: 'thu-thap',
                heading: 'Dữ liệu chúng tôi thu thập',
                list: [
                    'Thông tin tài khoản: họ tên, email công việc, vai trò, tổ chức.',
                    'Dữ liệu sử dụng: thời điểm đăng nhập, địa chỉ IP, trình duyệt, thao tác trong ứng dụng.',
                    'Nội dung do bạn tạo: kịch bản chatbot, tài liệu tri thức, ghi chú, báo cáo.',
                    'Dữ liệu từ kênh kết nối: tin nhắn và thông tin hồ sơ công khai mà nền tảng bên thứ ba chuyển tới.'
                ]
            },
            {
                id: 'muc-dich',
                heading: 'Mục đích xử lý',
                list: [
                    'Xác thực đăng nhập và bảo vệ tài khoản.',
                    'Vận hành các tính năng hội thoại, chatbot, báo cáo và phân tích.',
                    'Hỗ trợ kỹ thuật, khắc phục sự cố và phòng chống gian lận.',
                    'Gửi thông báo vận hành, bảo mật và thay đổi chính sách.'
                ],
                body: ['Chúng tôi không bán dữ liệu cá nhân và không dùng dữ liệu khách hàng cuối để quảng cáo.']
            },
            {
                id: 'chia-se',
                heading: 'Chia sẻ dữ liệu',
                body: [
                    'Dữ liệu chỉ được chia sẻ với nhà cung cấp hạ tầng, nhà cung cấp mô hình AI và nền tảng kênh mà tổ chức của bạn chủ động kết nối, trong phạm vi cần thiết để vận hành Dịch vụ.',
                    'Chúng tôi cung cấp dữ liệu cho cơ quan nhà nước khi có yêu cầu hợp lệ theo quy định pháp luật.'
                ]
            },
            {
                id: 'bao-ve',
                heading: 'Biện pháp bảo vệ',
                list: [
                    'Mã hóa thông tin xác thực kênh và khóa API khi lưu trữ.',
                    'Phân quyền theo vai trò và nhật ký truy cập.',
                    'Giới hạn số lần đăng nhập để chống dò mật khẩu.',
                    'Sao lưu định kỳ và quy trình khôi phục dữ liệu.'
                ]
            },
            {
                id: 'luu-tru',
                heading: 'Thời gian lưu trữ',
                body: [
                    'Dữ liệu được lưu trong thời gian tổ chức của bạn sử dụng Dịch vụ. Khi hợp đồng chấm dứt, dữ liệu được xóa hoặc trả lại theo thỏa thuận, trừ trường hợp pháp luật yêu cầu lưu giữ lâu hơn.'
                ]
            },
            {
                id: 'quyen',
                heading: 'Quyền của chủ thể dữ liệu',
                body: [
                    'Bạn có quyền được biết, truy cập, chỉnh sửa, yêu cầu xóa, hạn chế xử lý, rút lại sự đồng ý và phản đối việc xử lý dữ liệu cá nhân của mình.',
                    `Khách hàng cuối muốn thực hiện các quyền này nên liên hệ trực tiếp doanh nghiệp đã thu thập dữ liệu. Với dữ liệu tài khoản, vui lòng gửi yêu cầu tới ${E.privacyEmail}.`
                ]
            },
            {
                id: 'lien-he',
                heading: 'Liên hệ',
                body: [
                    `Mọi câu hỏi về quyền riêng tư, vui lòng gửi email tới ${E.privacyEmail}. Chúng tôi phản hồi trong vòng 72 giờ làm việc.`
                ]
            }
        ]
    },
    cookies: {
        path: '/cookies',
        label: 'Chính sách cookie',
        title: 'Chính sách cookie',
        intro: `${E.brand} chỉ dùng cookie và bộ nhớ trình duyệt ở mức cần thiết để bạn đăng nhập và làm việc ổn định.`,
        sections: [
            {
                id: 'thiet-yeu',
                heading: 'Cookie thiết yếu',
                body: [
                    'Dùng để duy trì phiên đăng nhập, bảo vệ chống giả mạo yêu cầu và cân bằng tải. Không thể tắt vì Dịch vụ sẽ không hoạt động nếu thiếu.'
                ]
            },
            {
                id: 'tuy-chon',
                heading: 'Lưu tùy chọn giao diện',
                body: [
                    'Bộ nhớ trình duyệt lưu các tùy chọn như chế độ sáng/tối, ngôn ngữ, vị trí trợ lý Mira và bộ lọc gần nhất. Dữ liệu này chỉ nằm trên thiết bị của bạn.'
                ]
            },
            {
                id: 'quan-ly',
                heading: 'Quản lý cookie',
                body: [
                    'Bạn có thể xóa cookie trong phần cài đặt trình duyệt. Sau khi xóa, bạn sẽ cần đăng nhập lại và các tùy chọn giao diện trở về mặc định.'
                ]
            }
        ]
    }
}

// English version of the same documents — same paths and section ids, so links and anchors match.
export const LEGAL_DOCS_EN = {
    terms: {
        path: '/terms',
        label: 'Terms of Service',
        title: 'Terms of Service',
        intro: `These terms govern your access to and use of the ${E.brand} omnichannel customer care platform (the “Service”). By signing in to or using the Service, you confirm that you have read, understood and agree to the terms below.`,
        sections: [
            {
                id: 'pham-vi',
                heading: 'Scope',
                body: [
                    `These terms apply to every user who is given an account on ${E.brand} by their organization (the “Customer”), including administrators, support agents and users integrating through the API.`,
                    'If your organization has signed a separate service agreement with us, the terms of that agreement prevail where they differ.'
                ]
            },
            {
                id: 'tai-khoan',
                heading: 'Accounts and sign-in security',
                body: [
                    'You are responsible for keeping your sign-in details confidential and for all activity under your account.',
                    'Do not share your account with anyone else. Notify your organization’s administrator or us immediately if you notice unauthorized access.',
                    'We may suspend an account when we detect signs of intrusion or abuse, or at the request of the organization’s administrator.'
                ]
            },
            {
                id: 'su-dung',
                heading: 'Acceptable use',
                body: ['When using the Service, you agree not to:'],
                list: [
                    'Send spam, fraudulent content or content that violates Vietnamese law to end customers.',
                    'Collect or process end customers’ personal data without a legal basis or valid consent.',
                    'Interfere with, scan, bypass the security mechanisms of, or disrupt the Service’s infrastructure.',
                    'Copy, reverse engineer or exploit the Service to build a competing product.'
                ]
            },
            {
                id: 'kenh-ket-noi',
                heading: 'Third-party channels',
                body: [
                    'The Service lets you connect platforms such as Zalo, Facebook Messenger, Instagram, WhatsApp, TikTok, Shopee, Lazada and email. Your use of these channels is also governed by each platform’s own policies.',
                    'We are not responsible for outages, API changes or account suspensions made by third parties.'
                ]
            },
            {
                id: 'ai',
                heading: 'Artificial intelligence features',
                body: [
                    'Virtual assistants, reply suggestions and automated analysis are generated by AI models and may not be fully accurate. Review the results before relying on them for important decisions.',
                    'Customers are responsible for the content their chatbots send to end customers.'
                ]
            },
            {
                id: 'du-lieu',
                heading: 'Customer data',
                body: [
                    'Customers retain all rights to the conversation data, customer profiles and documents they upload to the Service.',
                    `We process this data only to provide, maintain and improve the Service in accordance with the ${E.brand} Privacy Policy.`
                ]
            },
            {
                id: 'so-huu-tri-tue',
                heading: 'Intellectual property',
                body: [
                    `The ${E.brand} brand, interface, source code and documentation belong to us or our licensors. Some components are released under open-source licenses and are subject to those licenses.`
                ]
            },
            {
                id: 'gioi-han',
                heading: 'Limitation of liability',
                body: [
                    'The Service is provided “as is”. To the extent permitted by law, we are not liable for indirect damages, lost profits or data loss arising from use of the Service.'
                ]
            },
            {
                id: 'thay-doi',
                heading: 'Changes to these terms',
                body: [
                    'We may update these terms as the Service changes. Material changes will be announced in the app or by email before they take effect.'
                ]
            },
            {
                id: 'luat-ap-dung',
                heading: 'Governing law',
                body: [
                    'These terms are governed by the laws of Vietnam. Disputes will first be resolved through negotiation; failing that, they will be brought before the competent authorities in Vietnam.'
                ]
            }
        ]
    },
    privacy: {
        path: '/privacy',
        label: 'Privacy Policy',
        title: 'Privacy Policy',
        intro: `This policy describes how ${E.brand} collects, uses and protects personal data, in line with Decree 13/2023/ND-CP on personal data protection and related regulations.`,
        sections: [
            {
                id: 'vai-tro',
                heading: 'Our role',
                body: [
                    'For user account data (name, email, sign-in history), we are the data controller.',
                    'For end-customer data your organization brings into the Service (conversations, phone numbers, orders), your organization is the controller and we process the data on its instructions.'
                ]
            },
            {
                id: 'thu-thap',
                heading: 'Data we collect',
                list: [
                    'Account information: name, work email, role, organization.',
                    'Usage data: sign-in times, IP address, browser, actions in the app.',
                    'Content you create: chatbot scripts, knowledge documents, notes, reports.',
                    'Data from connected channels: messages and public profile information passed on by third-party platforms.'
                ]
            },
            {
                id: 'muc-dich',
                heading: 'Why we process data',
                list: [
                    'Authenticating sign-ins and protecting accounts.',
                    'Running conversation, chatbot, reporting and analytics features.',
                    'Technical support, troubleshooting and fraud prevention.',
                    'Sending operational, security and policy-change notices.'
                ],
                body: ['We do not sell personal data and do not use end-customer data for advertising.']
            },
            {
                id: 'chia-se',
                heading: 'Data sharing',
                body: [
                    'Data is shared only with infrastructure providers, AI model providers and the channel platforms your organization chooses to connect, to the extent needed to run the Service.',
                    'We provide data to government authorities when legally required to do so.'
                ]
            },
            {
                id: 'bao-ve',
                heading: 'Safeguards',
                list: [
                    'Channel credentials and API keys are encrypted at rest.',
                    'Role-based access control and access logs.',
                    'Sign-in attempt limits to prevent password guessing.',
                    'Regular backups and data recovery procedures.'
                ]
            },
            {
                id: 'luu-tru',
                heading: 'Retention',
                body: [
                    'Data is kept for as long as your organization uses the Service. When the contract ends, data is deleted or returned as agreed, unless the law requires it to be kept longer.'
                ]
            },
            {
                id: 'quyen',
                heading: 'Data subject rights',
                body: [
                    'You have the right to be informed about, access, correct and request deletion of your personal data, to restrict its processing, to withdraw consent and to object to processing.',
                    `End customers who wish to exercise these rights should contact the business that collected their data directly. For account data, please send your request to ${E.privacyEmail}.`
                ]
            },
            {
                id: 'lien-he',
                heading: 'Contact',
                body: [`For any privacy questions, please email ${E.privacyEmail}. We respond within 72 business hours.`]
            }
        ]
    },
    cookies: {
        path: '/cookies',
        label: 'Cookie Policy',
        title: 'Cookie Policy',
        intro: `${E.brand} uses cookies and browser storage only as far as needed for you to sign in and work reliably.`,
        sections: [
            {
                id: 'thiet-yeu',
                heading: 'Essential cookies',
                body: [
                    'Used to keep you signed in, protect against request forgery and balance load. They cannot be turned off because the Service would not work without them.'
                ]
            },
            {
                id: 'tuy-chon',
                heading: 'Interface preferences',
                body: [
                    'Browser storage keeps preferences such as light/dark mode, language, the position of the Mira assistant and your most recent filters. This data stays on your device.'
                ]
            },
            {
                id: 'quan-ly',
                heading: 'Managing cookies',
                body: [
                    'You can clear cookies in your browser settings. After clearing them you will need to sign in again, and interface preferences return to their defaults.'
                ]
            }
        ]
    }
}

// Legal documents in the active language (Vietnamese unless English is selected)
export const getLegalDocs = (language) => (language === 'en' ? LEGAL_DOCS_EN : LEGAL_DOCS)

export const LEGAL_ORDER = ['terms', 'privacy', 'cookies']
