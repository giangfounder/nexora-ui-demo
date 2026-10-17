# Đặc tả kỹ thuật UI — Màn hình Trợ lý (Assistant Workspace)

**Route:** `/assistants/custom/:id` (ví dụ `/assistants/custom/as-demo-1`)
**Ngày:** 2026-10-04
**Nguồn đặc tả:** đọc trực tiếp từ mã nguồn `ui-prototype` (không suy đoán từ ảnh chụp).

| Hạng mục   | Giá trị                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| Framework  | Vite 5 + React 18.2 SPA                                                                                        |
| Routing    | react-router-dom 6.3 (`MainRoutes.jsx:212-219`)                                                                |
| UI kit     | MUI 5.15 (`@mui/material`), icon `@tabler/icons-react` 3.x                                                     |
| Styling    | `sx` + Emotion                                                                                                 |
| State      | React `useState` cục bộ (không Redux ở màn này)                                                                |
| Data layer | axios `@/api/assistants`, `@/api/documentstore` — bị chặn bởi `mockAdapter` (prototype, không gọi server thật) |
| Layout     | `MainLayout` + `RequireAuth`                                                                                   |

## 0. Danh mục mã nguồn

| Mã      | File                                                                                     |
| ------- | ---------------------------------------------------------------------------------------- |
| `AW`    | `src/views/assistants/custom/workspace/AssistantWorkspace.jsx` (1000 dòng) — trang chính |
| `TS`    | `.../workspace/ToolSheet.jsx` (860) — cấu hình từng công cụ                              |
| `PS`    | `.../workspace/PlaybookSheet.jsx` (638) — drawer Kịch bản                                |
| `TE`    | `.../workspace/TokenEditor.jsx` (357) — ô nhập có gợi ý biến                             |
| `CTP`   | `.../workspace/ChatTestPanel.jsx` (455) — khung thử nghiệm                               |
| `CAT`   | `.../workspace/catalog.js` (239) — danh mục tool, trạng thái mặc định                    |
| `PLN`   | `.../workspace/planner.js` (151) — biên dịch kịch bản → các bước                         |
| `TOK`   | `.../workspace/tokens.js` (94) — ngữ pháp biến, registry                                 |
| `PRIM`  | `.../workspace/primitives.jsx` — `ToneTile`, `MetaPill`, `StatusPill`, `stripVi`         |
| `HOOK`  | `src/hooks/useDialogShell.jsx` — `FormField`, `useSheetShell` (kích thước drawer)        |
| `SEED1` | `src/mocks/mockData.js:193-220` — bản ghi assistant `as-demo-1`                          |
| `SEED2` | `src/mocks/mockData.js:294-340` — 3 kho tài liệu demo                                    |

---

## 1. Danh mục màn hình

| ID      | Màn hình / vùng                 | Thành phần   | Loại                           |
| ------- | ------------------------------- | ------------ | ------------------------------ |
| **S1**  | Khung trang + Breadcrumb + Hero | `AW:267-372` | Trang                          |
| **S2**  | Thanh Tabs + nút Kịch bản       | `AW:378-467` | Điều hướng                     |
| **S3**  | Tab **Thiết lập**               | `AW:470-636` | Tab                            |
| **S4**  | Tab **Kiến thức**               | `AW:639-803` | Tab                            |
| **S5**  | Tab **Công cụ**                 | `AW:806-907` | Tab                            |
| **S6**  | Khung thử nghiệm (cột phải)     | `CTP`        | Panel sticky                   |
| **S7**  | Drawer cấu hình công cụ         | `TS:800-858` | Drawer `md` 480px / `lg` 720px |
| **S8**  | Drawer Kịch bản                 | `PS:461-628` | Drawer `lg` 720px              |
| **S9**  | Sửa 1 kịch bản toàn màn hình    | `PS:190-275` | Dialog fullscreen              |
| **S10** | Sửa hướng dẫn toàn màn hình     | `AW:928-978` | Dialog fullscreen              |
| **S11** | Menu Cấu hình & tiện ích        | `AW:339-359` | Menu                           |

**Bố cục:** `Grid` 2 cột — trái `xs=12 lg=7`, phải `xs=12 lg=5`. Cột phải `position: sticky; top: 88px` trên `lg`. Dưới `lg` hai cột xếp dọc.

---

## 2. S1 — Breadcrumb & Hero

### 2.1 Breadcrumb

| Thành phần | Label                   | Hành vi                          | Điều kiện |
| ---------- | ----------------------- | -------------------------------- | --------- |
| Nút text   | `Trợ lý`                | `navigate('/assistants/custom')` | luôn      |
| Icon       | `IconChevronRight` 14px | trang trí                        | luôn      |
| Text       | `{name}` (in đậm)       | không tương tác                  | luôn      |

### 2.2 Hero

| Thành phần   | Giá trị / nhãn                                                                                                         | Điều kiện    |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------ |
| Avatar       | `IconRobot` 26px trong nền cam 52×52                                                                                   | luôn         |
| Tiêu đề `h1` | `{name \|\| 'Trợ lý mới'}`                                                                                             | luôn         |
| Status pill  | `Chưa lưu` (amber) **nếu** `dirty`; ngược lại `Đang hoạt động` (emerald)                                               | `AW:315`     |
| Dòng phụ     | `[model.label] · [N kho tài liệu] · [N công cụ] · [N kịch bản] · [N biến thu thập]`, bỏ qua phần tử rỗng, nối bằng `·` | `AW:318-327` |

> **BR-HERO-01** — `Đang hoạt động` là nhãn **hiển thị cố định**, không phải trạng thái thật của assistant. Chỉ khi có thay đổi chưa lưu mới hiện `Chưa lưu`.

### 2.3 Cụm nút phải

| #   | Control          | Component                    | Label / Icon                                                                  | Hành vi           | Disabled |
| --- | ---------------- | ---------------------------- | ----------------------------------------------------------------------------- | ----------------- | -------- |
| H1  | IconButton 36×36 | `IconSettings`               | Tooltip `Cấu hình & tiện ích`                                                 | mở Menu S11       | không    |
| H2  | Button outlined  | `IconPlus` + `Thêm`          | `navigate('/assistants/custom')` — **điều hướng về danh sách, KHÔNG tạo mới** | không             |
| H3  | Button contained | `IconDeviceFloppy` / spinner | `save()`; khi `saving` icon đổi thành `CircularProgress` 14px, nhãn vẫn `Lưu` | `saving === true` |

### 2.4 S11 — Menu Cấu hình & tiện ích

| Item                            | Hành vi                                                                                | Trạng thái                        |
| ------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------- |
| `Tham số mô hình`               | đóng menu → `setTab(0)` → sau 80ms `scrollIntoView('#section-params', smooth, center)` | **Hoạt động**                     |
| `Lịch sử tin nhắn`              | chỉ đóng menu                                                                          | ❌ chưa cài                       |
| `Khách hàng tiềm năng`          | chỉ đóng menu                                                                          | ❌ chưa cài                       |
| `Phân tích`                     | chỉ đóng menu                                                                          | ❌ chưa cài                       |
| `Nhân bản`                      | chỉ đóng menu                                                                          | ❌ chưa cài                       |
| —                               | `Divider`                                                                              | —                                 |
| `Xoá trợ lý` (màu `error.main`) | chỉ đóng menu                                                                          | ❌ chưa cài, **không có confirm** |

---

## 3. S2 — Tabs & nút Kịch bản

### 3.1 Tabs

| #   | Tab         | Icon                    | Badge `CountPill`         | Nội dung |
| --- | ----------- | ----------------------- | ------------------------- | -------- |
| 0   | `Thiết lập` | `IconAdjustmentsFilled` | không                     | S3       |
| 1   | `Kiến thức` | `IconBookFilled`        | `selectedStoreIds.length` | S4       |
| 2   | `Công cụ`   | `IconPuzzleFilled`      | `enabledCount`            | S5       |

-   `variant='scrollable'`, `scrollButtons=false`, chiều cao 44px, indicator 2px màu primary.
-   Badge dùng nền primary khi tab đang active, nền hover khi không active.
-   **Chỉ 1 tab hiện tại cùng lúc** — điều kiện render `{tab === N && ...}`, không dùng giữ tab ẩn.

### 3.2 Nút `Kịch bản`

| Thuộc tính         | Giá trị                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Icon               | `IconDirectionsFilled` (start, luôn màu amber) + `IconLayoutSidebarRightExpandFilled` (end, màu disabled)                      |
| Nhãn               | `Kịch bản` + `CountPill` = `toolState.playbooks.length`                                                                        |
| Tone của CountPill | `rose` nếu có ≥1 kịch bản tone rose; `amber` nếu có ≥1 tone rose/amber; `undefined` (mặc định) nếu tất cả hợp lệ               |
| Cảnh báo           | Nếu `playbookAlert.count > 0`: thêm `IconAlertTriangleFilled` 14px màu theo tone + text ẩn (screen-reader) `", N cần xem lại"` |
| Tooltip            | `"{N} kịch bản cần xem lại"` nếu `count > 0`, ngược lại `Mở kịch bản xử lý`                                                    |
| Hành động          | `setPlaybookOpen(true)` → mở Drawer S8                                                                                         |

> **BR-ALERT-01** — `playbookAlert` **không xét `playbook.enabled`**. Kịch bản đang tắt nhưng cấu hình lỗi vẫn làm đếm badge cảnh báo.

---

## 4. S3 — Tab `Thiết lập`

Gồm 4 `SectionCard`: `Danh tính`, `Mô hình`, `Hướng dẫn`, `Tham số`.

### 4.1 Card `Danh tính`

| Field     | Control                                  | Label        | Bắt buộc | Giá trị mặc định                                                                | Ràng buộc                                  |
| --------- | ---------------------------------------- | ------------ | -------- | ------------------------------------------------------------------------------- | ------------------------------------------ |
| `name`    | `TextField size=small`                   | `Tên trợ lý` | ✅ \*    | `'Trợ lý mới'` khi API không trả                                                | `maxWidth: 420`. **Không validate rỗng**   |
| `welcome` | `TokenEditor` (`minRows=1`, `maxRows=4`) | `Lời chào`   | không    | `'Xin chào {{customer.name}}! Mình là trợ lý của Nexora, bạn cần hỗ trợ gì ạ?'` | Palette chỉ hiện nhóm `customer`, `system` |

### 4.2 Card `Mô hình`

| Thuộc tính                | Giá trị                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Component                 | `Autocomplete` **single**                                                                                       |
| `options`                 | `models` từ `GET /assistants/components/chatmodels`                                                             |
| `disableClearable`        | ✅ không cho xoá model                                                                                          |
| `groupBy`                 | theo `provider` (lấy từ `description.split('provider: ')[1]`, fallback `label.split(' ')[0]`)                   |
| `getOptionLabel`          | `o.short` — rút gọn theo `parseModel`: ưu tiên trong ngoặc, trừ `(Local)` / `(Vietnamese)`                      |
| So khớp                   | `isOptionEqualToValue = o.name === v.name`                                                                      |
| Placeholder               | `Chọn model`                                                                                                    |
| Render option             | `ProviderBadge` (avatar 24px, 2 chữ đầu provider) + tên đậm nếu selected + `IconCircleCheckFilled` nếu selected |
| Adornment trái            | `ProviderBadge` của model đang chọn                                                                             |
| Placeholder khi chưa chọn | `modelName = details.chatModel?.name \|\| ms[0].name` → **tự chọn model đầu tiên**                              |

### 4.3 Card `Hướng dẫn`

| Control       | Label                                                 | Hành vi                                                                                                                                                                                           |
| ------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button `Tạo`  | `IconSparkles` + `Tạo`, size small                    | `POST /assistants/generate/instruction` với `{ task: name }` → ghi đè `instruction` bằng `res.data.instruction`, nếu rỗng giữ nguyên giá trị cũ. **Không có loading state, không confirm ghi đè** |
| IconButton    | `IconArrowsMaximize`, `aria-label='Mở toàn màn hình'` | mở Dialog S10                                                                                                                                                                                     |
| `TokenEditor` | `minRows=7`, `maxRows=16`                             | placeholder `Vai trò, giọng điệu, giới hạn của trợ lý… vd: xưng hô với khách bằng {{customer.name}}`                                                                                              |
| Caption phải  | `{instruction.length} ký tự`                          | cập nhật mỗi lần gõ                                                                                                                                                                               |

### 4.4 Card `Tham số` (`id="section-params"`)

| Field                | Control  | Label hiển thị               | Min | Max  | Step | Mặc định |
| -------------------- | -------- | ---------------------------- | --- | ---- | ---- | -------- |
| `params.temperature` | `Slider` | `Temperature · {toFixed(1)}` | 0   | 2    | 0.1  | **0.7**  |
| `params.topP`        | `Slider` | `Top-P · {toFixed(2)}`       | 0   | 1    | 0.05 | **0.95** |
| `params.maxTokens`   | `Slider` | `Max tokens · {n}`           | 256 | 8192 | 256  | **2048** |
| `params.memory`      | `Select` | `Nhớ hội thoại`              | —   | —    | —    | **10**   |
| `params.streaming`   | `Switch` | `Phản hồi dạng stream`       | —   | —    | —    | **true** |

**Options của `Nhớ hội thoại`:** `[0, 5, 10, 20, 50]` — nhãn: `0 → "Không nhớ"`, `n > 0 → "{n} tin nhắn gần nhất"`.

> **BR-PARAM-01** — `temperature`, `topP`, `maxTokens`, `memory`, `streaming` chỉ được gửi lên server; **không dùng trong mô phỏng khung thử nghiệm**.

---

## 5. S4 — Tab `Kiến thức`

### 5.1 Card `Kho tài liệu`

**Action:** Button `Tạo` (`IconPlus`) → `navigate('/document-stores')`.

**Autocomplete (multi):**

| Thuộc tính             | Giá trị                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `disableCloseOnSelect` | ✅ giữ menu mở khi chọn nhiều                                                                       |
| `getOptionLabel`       | `o.name`                                                                                            |
| `filterOptions`        | `stripVi(name + ' ' + description).includes(stripVi(inputValue))` — không phân biệt dấu tiếng Việt  |
| `renderOption`         | `Checkbox size=small` + tên (đậm) + caption `"{chunks} chunk · {vectorStoreConfig?.name \|\| '—'}"` |
| `renderTags`           | `Chip size=small label={o.name}`                                                                    |
| Placeholder            | `''` nếu đã chọn ≥1; `'Chọn kho tài liệu cho RAG'` nếu chưa chọn                                    |

**Danh sách kho đã gắn** (chỉ render khi `selectedStoreIds.length > 0`):

| Thành phần   | Nội dung                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------- |
| `ToneTile`   | `IconBookFilled`, tone `teal`, 32px                                                           |
| Tên          | `{s.name}`                                                                                    |
| `StatusPill` | `status === 'SYNC'` → emerald `Đã đồng bộ`; ngược lại → amber `Chưa đồng bộ`                  |
| `MetaPill`   | `IconScissors` + tổng `totalChunks` của mọi loader → `"{n} chunk"`                            |
| `MetaPill`   | `IconLanguage` + tổng `totalChars` format `vi-VN` → `"{n} ký tự"`                             |
| `MetaPill`   | `IconDatabase` + `vectorStoreConfig.name` (chỉ khi có)                                        |
| IconButton   | `IconX`, `aria-label="Gỡ {s.name}"`, tooltip `Gỡ khỏi trợ lý` → bỏ id khỏi `selectedStoreIds` |

> **BR-KB-01** — `chunks`/`chars` là **tổng qua `store.loaders[]`**, không đọc `totalChunks` ở cấp store.

### 5.2 Card `Truy xuất`

| Field                 | Control                                  | Label                                                                                                 | Min/Max        | Mặc định                                                    |
| --------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------------- |
| `retrieval.query`     | `TokenEditor` (`minRows=1`, `maxRows=3`) | `Ngữ cảnh truy vấn` — hint: _"Bổ sung thuộc tính khách vào câu tìm kiếm để kết quả sát nhu cầu hơn."_ | —              | `'{{user_message}} — khách quan tâm {{customer.industry}}'` |
| `retrieval.topK`      | `Slider` có `marks`                      | `Số đoạn lấy về · {n}`                                                                                | 1–10, step 1   | **4**                                                       |
| `retrieval.threshold` | `Slider`                                 | `Ngưỡng tương đồng · {toFixed(2)}`                                                                    | 0–1, step 0.05 | **0.6**                                                     |
| `retrieval.cite`      | `Switch`                                 | `Kèm trích dẫn`                                                                                       | —              | **true**                                                    |

Palette của ô `Ngữ cảnh truy vấn`: nhóm `customer`, `collect`, `output`, `system` (không có `api`, `kb`).

> **BR-RETRIEVE-01** — `topK` và `threshold` **không được mô phỏng**; bộ tìm kiếm trong khung thử nghiệm chỉ dùng `retrieval.query` làm ngữ cảnh.

---

## 6. S5 — Tab `Công cụ`

### 6.1 Thanh lọc

| Control                         | Label                                           | Hành vi                                                                          |
| ------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------- |
| `ToggleButtonGroup` (exclusive) | `Tất cả` / `Đang bật` / `Nâng cao`              | `onChange` chặn giá trị `null` → **không thể bỏ chọn**, luôn có 1 nhóm đang chọn |
| `TextField`                     | placeholder `Tìm công cụ`, prefix `IconSearch`  | lọc `stripVi(tool.label).includes(stripVi(query))`                               |
| Caption phải                    | `{enabledCount}/{TOOL_CATALOG.length} đang bật` | cập nhật realtime                                                                |

**Điều kiện lọc:**

-   `Tất cả` → mọi tool
-   `Đang bật` → chỉ tool có `toolState.enabled[id] === true`
-   `Nâng cao` → chỉ tool có `group === 'advanced'`
-   Tìm kiếm luôn áp dụng sau nhóm lọc

**Rỗng:** khung viền đứt, chữ `Không có công cụ phù hợp.`

### 6.2 Danh mục công cụ (`CAT:14-26`)

| ID             | Label              | Icon                      | Tone    | Nhóm     | Sheet | Mặc định                                      | Bật |
| -------------- | ------------------ | ------------------------- | ------- | -------- | ----- | --------------------------------------------- | --- |
| `deepResearch` | Deep Research      | `IconWorld`               | teal    | advanced | lg    | 2 URL · `[web,docs]` · depth 3 · maxResults 8 | ✅  |
| `apiCaller`    | Gọi API            | `IconApi`                 | orange  | advanced | lg    | 2 API mẫu                                     | ✅  |
| `collectInfo`  | Thu thập thông tin | `IconClipboardListFilled` | amber   | advanced | lg    | 3 biến                                        | ✅  |
| `webBrowser`   | Web Browser        | `IconGlobeFilled`         | teal    | basic    | md    | —                                             | ✅  |
| `calculator`   | Calculator         | `IconCalculatorFilled`    | emerald | basic    | md    | —                                             | ✅  |
| `serpAPI`      | Google Search      | `IconSearch`              | orange  | basic    | md    | apiKey rỗng, max 5                            | ❌  |
| `braveSearch`  | Brave Search       | `IconSearch`              | amber   | basic    | md    | apiKey rỗng, max 5                            | ❌  |
| `customTool`   | Custom Tool        | `IconPuzzleFilled`        | orange  | basic    | lg    | `get_shipping_fee`                            | ❌  |
| `requestsGet`  | HTTP GET           | `IconTerminal`            | teal    | basic    | md    | endpoint rỗng                                 | ❌  |
| `requestsPost` | HTTP POST          | `IconTerminal`            | teal    | basic    | md    | endpoint rỗng                                 | ❌  |
| `zapierNLA`    | Zapier             | `IconBoltFilled`          | amber   | basic    | md    | webhook rỗng                                  | ❌  |

**Badge tóm tắt trên card** (`toolMeta`, `CAT:209-238`):

| Tool                         | Badge                                                               |
| ---------------------------- | ------------------------------------------------------------------- |
| Deep Research                | `{n} URL` · `{n} nguồn` · `Độ sâu {n}`                              |
| Gọi API                      | `{n} API` · `{n} đang bật`                                          |
| Thu thập thông tin           | `{n} biến` · `{n} lấy từ hồ sơ`                                     |
| Google Search / Brave Search | `Đã có key` (emerald) nếu có key, ngược lại `Thiếu API key` (amber) |
| Custom Tool                  | `{name}()` hoặc `chưa đặt tên()`                                    |
| HTTP GET / POST              | endpoint bỏ scheme, hoặc `Mọi endpoint` nếu rỗng                    |
| Zapier                       | `Đã kết nối` (emerald) / `Chưa kết nối` (amber)                     |
| Web Browser, Calculator      | `Sẵn sàng`                                                          |

### 6.3 Card công cụ

| Thuộc tính | Giá trị                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| Vùng bấm   | `Box role="button" tabIndex=0`, `aria-label="Cấu hình {label}"`; click hoặc **Enter** → mở Drawer S7     |
| `ToneTile` | icon + tone; bị **mute** (giảm độ đậm) khi tool đang tắt                                                 |
| Nhãn       | `{t.label}`, đổi màu `text.secondary` khi tắt                                                            |
| Switch     | `size=small`, `aria-label="Bật {label}"`, `onClick` có `stopPropagation()` → bật/tắt **không** mở Drawer |
| Badge      | `opacity 0.6` khi tool tắt                                                                               |

---

## 7. S7 — Drawer cấu hình công cụ

**Kích thước:** `md` = 480px, `lg` = 720px, `xs` = 100%. Anchor `right`, backdrop `#000` 32%.
**Header:** `ToneTile` (mute nếu tắt) · tên tool · `Switch` toggle (`aria-label='Bật công cụ'`) · `IconButton X` (`aria-label='Đóng'`).
**Footer:** Button `Xong`.

> **BR-SHEET-01** — Khi tool **đang tắt**: hiện `StatusPill` amber `Công cụ đang tắt` + Button `Bật`, đồng thời **giảm opacity toàn bộ nội dung xuống 0.55**. Vẫn chỉnh sửa được (không khoá field).

### 7.1 `Deep Research`

| Field         | Control                                                                   | Label / Placeholder                                                           | Quy tắc                                                                  |
| ------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| URL đầu vào   | `TextField multiline maxRows=4` (mono)                                    | placeholder `https://…`; hint _"Dán nhiều link cùng lúc, mỗi dòng một link."_ | `Enter` (không `Shift+Enter`) → thêm                                     |
| Nút `Thêm`    | `variant=contained`, height 40                                            | —                                                                             | **disabled** khi `draft.trim()` rỗng                                     |
| Danh sách URL | Mỗi dòng: favicon từ `google.com/s2/favicons?domain=`, hostname, URL mono | —                                                                             | Rỗng → `Chưa có URL nào — agent sẽ chỉ dùng các nguồn mở rộng bên dưới.` |
| Scope mỗi URL | `ToggleButtonGroup` exclusive                                             | `Trang` (`page`) / `Tên miền` (`domain`)                                      | URL mới thêm mặc định `page`                                             |
| Gỡ URL        | `IconButton IconTrash`                                                    | `aria-label='Gỡ URL'`                                                         | —                                                                        |
| Nguồn mở rộng | 5 pill-button, `aria-pressed`                                             | `Web`, `Tin tức`, `Học thuật`, `Wikipedia`, `Kho tài liệu`                    | `id`: `web/news/scholar/wiki/docs`                                       |
| `depth`       | `Slider` có marks                                                         | `Độ sâu · {n} lớp`                                                            | 1–5, step 1, mặc định 3                                                  |
| `maxResults`  | `TextField type=number`                                                   | `Số kết quả tối đa`                                                           | clamp `1..50`, rỗng → 1                                                  |

> **BR-URL-01** — Regex hợp lệ: `/^https?:\/\/[^\s.]+\.[^\s]+$/i`. Link trùng URL đã có bị loại. **Số link sai hiển thị cảnh báo** `{n} link không hợp lệ đã bị bỏ qua` và phần sai **được giữ lại trong ô nhập** để sửa.

### 7.2 `Gọi API` — Danh sách

| Thành phần | Nội dung                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header     | `{n} API` + Button `Thêm` (contained)                                                                                                                       |
| Rỗng       | `Chưa có API nào. Thêm API để agent lấy dữ liệu từ hệ thống của bạn.`                                                                                       |
| Dòng API   | Method (mono, 52px, màu primary) · tên · URL bỏ scheme · `MetaPill "{n} vào"` · `MetaPill "{n} ra"` · `Switch aria-label="Bật {name}"` · `IconChevronRight` |
| Vùng bấm   | click hoặc **Enter** → vào màn chi tiết                                                                                                                     |
| Thêm       | `newApi(apis.length + 1)` → mở ngay màn chi tiết                                                                                                            |

**Cấu trúc API mới (`CAT:53-65`):** `{ id: api<ts>, key: "api_{n}", name: "API {n}", enabled: true, when: "", triggers: "", method: "GET", url: "https://", headers: [{ key: "Authorization", value: "Bearer {{api_token}}" }], body: "", outputs: [] }`

### 7.3 `Gọi API` — Chi tiết

| Field            | Control                                                                                     | Label                                                                                                            | Bắt buộc | Quy tắc                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| —                | Button `Tất cả API`                                                                         | `IconArrowLeft`                                                                                                  | —        | quay lại danh sách                                                                      |
| `enabled`        | `Switch`                                                                                    | `Bật`                                                                                                            | —        | —                                                                                       |
| `name`           | `TextField`                                                                                 | `Tên API`                                                                                                        | ✅       | **không validate rỗng**                                                                 |
| `key`            | `TextField` mono đậm, adornment `{{api.` … `}}`                                             | `Mã gọi trong kịch bản`                                                                                          | —        | tự `slugify` (bỏ dấu VN, ký tự đặc biệt → `_`, trim `_`)                                |
| `when`           | `TextField`                                                                                 | `Khi nào agent gọi`                                                                                              | —        | placeholder _"Mô tả tình huống để agent tự quyết định gọi API này"_                     |
| `method` + `url` | `Select` 112px + `TextField`                                                                | `Endpoint`                                                                                                       | ✅       | options `GET POST PUT PATCH DELETE`                                                     |
| `headers`        | Cặp `TextField` key/value (2:3) + `IconButton X` (`aria-label='Gỡ header'`) + Button `Thêm` | `Headers`                                                                                                        | —        | —                                                                                       |
| `body`           | `TextField multiline minRows=5` (mono, nền sunken)                                          | `Body`                                                                                                           | —        | **chỉ hiện khi `method !== 'GET'`**                                                     |
| Chips biến       | `VarChip` booleans                                                                          | `Chèn biến` — hint _"Bấm để chèn vào ô đang chọn. Vàng: hỏi khách · Cam: từ API khác · Xanh: hồ sơ khách hàng."_ | —        | nhấp → chèn `{{token}}` tại con trỏ của ô đang focus                                    |
| `outputs`        | Cặp `path` → `var` + `IconArrowRight` + `IconButton X` + Button `Thêm`                      | `Đầu ra · {n}` — hint _"Lưu giá trị trong response vào biến để dùng ở câu trả lời hoặc API sau."_                | —        | placeholder `data.status` → `ten_bien`; `var` tự sanitize `[^a-zA-Z0-9_]→_` + lowercase |
| —                | Button outlined `Gửi thử`                                                                   | —                                                                                                                | —        | disabled khi `sending`; nhãn `Đang gửi…`                                                |
| —                | Button error `Xoá API`                                                                      | —                                                                                                                | —        | xoá ngay, không confirm                                                                 |

**Kiểm tra JSON của `body`:**

1. `body.trim()` rỗng → không hiện pill.
2. Thay mọi `{{token}}` bằng `0`, `JSON.parse` thành công → `StatusPill` emerald `JSON hợp lệ`.
3. Ngược lại → `StatusPill` rose `JSON lỗi cú pháp`.

**`Gửi thử` (mô phỏng, 600ms):**

-   Sinh `sample` từ mọi biến thu thập + output của API khác; ghi đè cứng `customer_phone='0901234567'`, `order_code='NX-20481'`, `api_token='••••'`, `customer.phone='0912345678'`, `customer.email='minhquan@example.com'`.
-   Kết quả: `StatusPill` emerald `200 OK` + dòng request đã nội suy + thời gian ngẫu nhiên `160–320 ms` + `<pre>` JSON `{ ok: true, ...sampleResponse(api) }`.
-   `sampleResponse` dựng object lồng theo `path` (`data.status` → `{data:{status:'Đang giao'}}`), không có output → `{ok:true}`.

**Phân loại biến (`varState`)** — hiển thị cạnh mỗi token ở mục `Đầu vào`:

| Điều kiện                              | Tone     | Nhãn                       |
| -------------------------------------- | -------- | -------------------------- |
| thuộc `SYSTEM_VARS`                    | không    | `hệ thống`                 |
| `customer.*` có trong `CUSTOMER_ATTRS` | teal     | `hồ sơ khách · {label}`    |
| `customer.*` không tồn tại             | **rose** | `thuộc tính không tồn tại` |
| là biến thu thập                       | amber    | `hỏi khách`                |
| là output của API khác                 | orange   | `từ {tên API}`             |
| còn lại                                | **rose** | `chưa định nghĩa`          |

`Đầu vào · 0` → text `API không dùng biến nào.`

> **BR-VAR-01** — `apiInputs()` = token tìm trong `url + body + headers[].value`, **loại trừ `SYSTEM_VARS`**, khử trùng lặp.
> **BR-VAR-02** — Nếu chưa focus ô nào, chip chèn vào **cuối `body`**.

### 7.4 `Thu thập thông tin`

| Thành phần | Nội dung                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Header     | `{n} biến` + Button `Thêm`                                                                                   |
| Rỗng       | `Chưa có biến. Thêm biến để agent biết cần hỏi khách những gì.`                                              |
| Biến mới   | `{ id: v<ts>, name: "bien_{n+1}", type: "text", required: false, description: "" }` — **không có `prefill`** |

**Mỗi biến:**

| Field         | Control                                                            | Label / Placeholder                                                                                      | Quy tắc                                                                                             |
| ------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `name`        | `TextField` mono đậm, adornment `{{` … `}}`, prefix số thứ tự `01` | —                                                                                                        | sanitize `[^a-zA-Z0-9_]→_` + lowercase; **trùng tên → field `error` + helperText `Trùng tên biến`** |
| `type`        | `Select` 104px                                                     | `text`, `number`, `email`, `phone`, `date`                                                               | —                                                                                                   |
| `required`    | `StatusPill` bọc trong `button`                                    | `Bắt buộc` (rose) / `Tuỳ chọn` (teal)                                                                    | tooltip đảo trạng thái                                                                              |
| `description` | `TextField multiline maxRows=3`                                    | placeholder _"Cách agent hỏi khách — vd: hỏi khéo, không ép nếu khách từ chối"_                          | dùng làm `label` của token trong palette                                                            |
| `prefill`     | `Select`                                                           | nhãn `Lấy sẵn từ hồ sơ`; option rỗng = _"Không — luôn hỏi khách"_; các option khác `"{label} · {{key}}"` | —                                                                                                   |
| Xoá           | `IconButton IconTrash`                                             | `aria-label='Xoá biến'`                                                                                  | xoá ngay, không confirm                                                                             |

**Badge suy ra:**

| Badge                              | Tone   | Điều kiện                                                     |
| ---------------------------------- | ------ | ------------------------------------------------------------- |
| `Cần cho {tên API}`                | orange | API **đang bật** dùng biến này làm input — mỗi API một badge  |
| `Tự điền từ {API} — không hỏi lại` | teal   | `guards.skipKnown === true` và API đang bật xuất ra biến này  |
| `Có từ {API} — vẫn hỏi xác nhận`   | teal   | `guards.skipKnown === false` và API đang bật xuất ra biến nếu |

### 7.5 Các tool đơn giản (`SimpleBody`)

| Tool                          | Nội dung                                                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `calculator`, `webBrowser`    | `Công cụ này không cần cấu hình.`                                                                                            |
| `serpAPI`, `braveSearch`      | `API key` (**required**, `type=password`, placeholder `••••••••`) · `Số kết quả` (`type=number`, rỗng → 1)                   |
| `customTool`                  | `Tên hàm` (**required**, mono) · `Khi nào agent gọi` (map vào `description`) · `Mã JavaScript` (multiline `minRows=8`, mono) |
| `zapierNLA`                   | `Webhook URL` (**required**, placeholder `https://hooks.zapier.com/…`)                                                       |
| `requestsGet`, `requestsPost` | `Endpoint mặc định` — hint _"Để trống nếu agent được gọi mọi endpoint."_, placeholder `https://…`                            |

> **BR-SIMPLE-01** — Các field đánh dấu **required** ở S7 **không có validate**, chỉ là nhãn đỏ. Xem mục 12.

---

## 8. S8 — Drawer `Kịch bản`

**Kích thước:** `lg` = 720px. Header: `ToneTile` amber · `Kịch bản` · `CountPill` · `IconButton X`.
**Footer:** Button `Xong`.

### 8.1 Vùng `Quy tắc an toàn` (`PS:570-617`)

| Field                | Control                 | Label                                             | Mặc định | Options                                                                                    |
| -------------------- | ----------------------- | ------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `guards.fillMissing` | `Switch`                | `Tự bổ sung dữ liệu còn thiếu trước khi gọi API`  | ✅ true  | —                                                                                          |
| `guards.skipKnown`   | `Switch`                | `Không hỏi lại thông tin đã có trong hồ sơ khách` | ✅ true  | —                                                                                          |
| `guards.onError`     | `Select` (minWidth 200) | `Khi API lỗi`                                     | `retry`  | `retry`→*"Thử lại 1 lần"*, `skip`→*"Bỏ qua, trả lời tiếp"*, `handoff`→*"Chuyển nhân viên"* |

### 8.2 Danh sách kịch bản

**Rỗng:** icon 44px + `Chưa có kịch bản. Thêm kịch bản để chỉ cho agent cách xử lý từng tình huống.` + Button `Thêm`.

**Thêm:** n = `playbooks.length + 1`; `while` tên `Kịch bản {n}` đã tồn tại thì `n++`; tạo `{ id: pb<ts>, name: "Kịch bản {n}", enabled: true, when: "", script: "" }`; **mở rộng (expand) ngay kịch bản vừa tạo**.

**Dòng kịch bản (collapsed):**

| Thành phần      | Nội dung                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Badge số thứ tự | `index + 1` tròn, nền amber nếu bật, xám nếu tắt                                                      |
| Tên             | `pb.name?.trim() \|\| 'Kịch bản chưa đặt tên'`                                                        |
| `MetaPill`      | `{steps.length + 1} bước` — **chỉ khi `steps.length > 0`** (cộng 1 là bước _"Trả lời khách"_ cố định) |
| `MetaPill`      | sức khoẻ (mục 8.4)                                                                                    |
| `Switch`        | `aria-label="Kích hoạt kịch bản {i+1}: {tên}"`, tooltip `Bật/Tắt kịch bản`, `stopPropagation`         |
| Chevron         | `IconButton`, `aria-expanded`, `aria-controls="pb-body-{id}"`, xoay 180° khi mở                       |

**Toàn bộ dòng là vùng bấm** để mở/đóng; chevron là nút riêng cho bàn phím.

**Mở rộng:**

| Field    | Label                                             | Placeholder                                                                                 | Ghi chú                                                             |
| -------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `name`   | `Tên kịch bản`                                    | —                                                                                           | `maxWidth 420`                                                      |
| `when`   | `Trường hợp kích hoạt` + nút `IconArrowsMaximize` | _"vd: khách hỏi tình trạng đơn hàng, giao hàng hoặc mã đơn"_                                | `TextField multiline minRows=2 maxRows=6`                           |
| `script` | `Cách xử lý` + nút `IconArrowsMaximize`           | _"Viết như hướng dẫn cho nhân viên: thu thập {{biến}}, gọi {{api.…}}, tìm trong {{kb.…}}…"_ | `TokenEditor minRows=5 maxRows=14`, **autoFocus nếu `script` rỗng** |
| —        | Panel `Agent hiểu như sau`                        | —                                                                                           | xem mục 8.3                                                         |
| —        | Button error `Xoá`                                | —                                                                                           | xoá ngay, không confirm                                             |

**Sau khi xoá:** focus được chuyển sang kịch bản kế bên (kế tiếp, không có thì trước), nếu không còn kịch bản nào → focus nút `Thêm`.

### 8.3 Panel `Agent hiểu như sau` (Readback)

| Loại bước | Câu dựng sẵn                                                                                          |
| --------- | ----------------------------------------------------------------------------------------------------- |
| `profile` | `Khi cần, lấy {{attr}} từ hồ sơ khách` + _"— chưa định danh thì hỏi {{var}}"_ (chỉ ở chế độ thiết kế) |
| `ask`     | `Khi cần, hỏi khách {{var}}` + _"để gọi {{api.key}}"_ + _" (tuỳ chọn)"_ nếu `required === false`      |
| `call`    | `Khi cần, gọi {{api.key}}` + _"→ nhận {{o1}} {{o2}}"_                                                 |
| `search`  | `Khi cần, tìm trong {{kb.key}}`                                                                       |

-   Bước cuối **luôn** là `Trả lời khách`.
-   Danh sách rỗng → `Chèn biến, API hoặc kho tài liệu vào phần cách xử lý để tạo các bước.`
-   Vấn đề phát hiện được hiển thị **phía trên** danh sách bước, màu theo tone (`rose`/`amber`).

### 8.4 Sức khoẻ kịch bản (`playbookHealth`, `PS:287-294`)

| Điều kiện              | Tone                                                  | Nhãn           |
| ---------------------- | ----------------------------------------------------- | -------------- |
| `script.trim()` rỗng   | —                                                     | `Chưa có bước` |
| có `issues`            | `rose` nếu có ít nhất 1 issue rose, ngược lại `amber` | `{n} lưu ý`    |
| không lỗi nhưng 0 bước | —                                                     | `Chưa có bước` |
| còn lại                | `emerald`                                             | `Hợp lệ`       |

### 8.5 S9 — Sửa kịch bản toàn màn hình

| Vùng              | Nội dung                                                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header            | `ToneTile` amber · tên kịch bản · `MetaPill` sức khoẻ · `IconButton IconArrowsMinimize` (`aria-label='Thu nhỏ'`)                                     |
| Cột trái (flex 1) | `Trường hợp kích hoạt` (`minRows=3 maxRows=8`, **autoFocus khi focus=`when`**) → `Cách xử lý` (`TokenEditor fill`, **autoFocus khi focus=`script`**) |
| Cột phải (380px)  | Panel `Agent hiểu như sau`, cuộn riêng                                                                                                               |

Chỉ mở 1 kịch bản tại một thời điểm. `md` trở xuống 2 cột xếp dọc.

---

## 9. S10 — Sửa hướng dẫn toàn màn hình

| Vùng   | Nội dung                                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Header | `Hướng dẫn · {tên trợ lý}` · caption `{n} ký tự` · Button `Tạo` (`IconSparkles`) · `IconButton IconArrowsMinimize` (`aria-label='Thu nhỏ'`) |
| Thân   | `TokenEditor fill autoFocus`, `maxWidth 960`, căn giữa                                                                                      |

---

## 10. S6 — Khung thử nghiệm (cột phải)

**Kích thước:** `lg` → `calc(100vh - 168px)`, `xs` → 640px, `minHeight` 520px.

### 10.1 Header

| Thành phần               | Nội dung                                                            |
| ------------------------ | ------------------------------------------------------------------- |
| Avatar                   | bot 28px, nền cam                                                   |
| Tên                      | `assistantName \|\| 'Trợ lý'`                                       |
| `StatusPill`             | teal `Thử nghiệm`                                                   |
| `IconButton IconRefresh` | tooltip + `aria-label='Làm mới hội thoại'` → reset về tin nhắn chào |

### 10.2 Thanh chọn khách hàng

| Thành phần | Nội dung                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Nút khách  | Avatar chữ cái đầu (2 từ cuối của tên) hoặc `IconUserFilled`; tên hoặc `Khách vãng lai`; `IconChevronDown`         |
| Tooltip    | danh sách mọi giá trị hồ sơ đang chọn; nếu không có khách → _"Khách chưa định danh — agent sẽ phải hỏi thông tin"_ |
| Menu       | `Khách vãng lai` / _Chưa định danh_ + tối đa 5 khách đầu tiên (`phone` làm phụ)                                    |
| `MetaPill` | model (`model?.short \|\| '—'`), số kho đã gắn (icon sách), `{n} công cụ` đang bật                                 |

> **BR-TEST-01** — Hội thoại **tự reset** khi đổi khách, đổi `toolState`, hoặc đổi `welcome`. Mọi tin nhắn đã gửi mất.

### 10.3 Tin nhắn

| Loại         | Bố cục                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| Khách        | Bubble phải, `maxWidth 82%`, nền primary tint, timestamp dưới                                          |
| Bot          | Avatar trái + bubble `background.paper`, dưới là các `MetaPill` **trace** (icon + nhãn), rồi timestamp |
| Đang trả lời | Avatar trái + 3 chấm nhảy (animation `bounce`, delay 0/0.15/0.30s)                                     |
| Vùng         | `aria-live='polite'`, tự cuộn xuống đáy                                                                |

**Trace có thể gặp:**

| Nội dung                                                | Tone    |
| ------------------------------------------------------- | ------- |
| `Kịch bản · {tên}`                                      | teal    |
| `{{attr}} = {value}` (profile)                          | teal    |
| `{{var}} = {value}` hoặc `= ∅` khi bỏ qua               | amber   |
| `{{var}} chưa hợp lệ`                                   | rose    |
| `{METHOD} {tên API} · 200`                              | orange  |
| `{tên API} lỗi` + ` · đã thử lại` nếu `onError = retry` | rose    |
| `{{kb.key}}` (+ ` + hồ sơ`)                             | emerald |
| `Deep Research · {host1}, {host2}`                      | teal    |

**Prompt mẫu** (chỉ hiện khi `messages.length <= 1 && !typing`): `Giờ mở cửa thế nào?` · `Giá Nexora Pulse X1 Pro?` · `Tra cứu đơn hàng giúp mình` · `Tư vấn giúp mình nên mua gì`

### 10.4 Ô nhập

| Thuộc tính   | Giá trị                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| Placeholder  | `Trả lời: {mô tả biến}…` nếu đang chờ trả lời, ngược lại `Nhập tin nhắn…`                               |
| `aria-label` | `Tin nhắn thử nghiệm`                                                                                   |
| Phím         | `Enter` gửi, `Shift+Enter` xuống dòng                                                                   |
| Nút gửi      | `IconButton` 40×40, `aria-label='Gửi'`, **disabled** khi `input.trim()` rỗng **hoặc** `typing === true` |

---

## 11. Hệ thống biến (Token)

### 11.1 Ngữ pháp

`{{ tên }}` — chấp nhận khoảng trắng quanh tên: regex `/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g`.

### 11.2 Sáu nhóm

| Nhóm         | Màu     | Nguồn sinh token                                                                                                                                 |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Khách hàng   | teal    | `CUSTOMER_ATTRS` = 7 thuộc tính dựng sẵn (`name, phone, email, type, stage, tags, last_contact`) + mọi thuộc tính tuỳ chỉnh từ module Khách hàng |
| Thu thập     | amber   | `collectInfo.variables[].name`                                                                                                                   |
| API          | orange  | `api.{key}` của mọi API                                                                                                                          |
| Đầu ra API   | orange  | `outputs[].var` — nhãn `từ {tên API}`                                                                                                            |
| Kho tài liệu | emerald | `kb.{key}` — `key` = `store.key` hoặc `slugify(store.name)`                                                                                      |
| Hệ thống     | không   | `user_message`, `session_id`, `assistant_name`, `api_token`                                                                                      |

> **BR-TOKEN-01** — Palette hiện token của **mọi** kho tài liệu, kể cả kho **chưa gắn**; kho chưa gắn có nhãn kèm hậu tố ` · chưa gắn`.
> **BR-TOKEN-02** — Token không tồn tại trong registry được tô **rose** (đỏ) trong editor và sinh cảnh báo ở Readback.
> **BR-TOKEN-03** — `{{customer.name}}` khi không có hồ sơ thay bằng `"bạn"`; token khác không có giá trị thay bằng chuỗi rỗng; sau đó dọn khoảng trắng kép và dấu câu thừa.

### 11.3 Gợi ý khi gõ (`TokenEditor`)

| Hành động               | Kết quả                                                                  |
| ----------------------- | ------------------------------------------------------------------------ |
| Gõ `{{`                 | Mở `Popper` 380px, tối đa **8** gợi ý, lọc `stripVi(name + ' ' + label)` |
| `ArrowDown` / `ArrowUp` | Di chuyển vòng trong danh sách                                           |
| `Enter` / `Tab`         | Chèn token, đặt con trỏ sau token                                        |
| `Escape`                | Đóng gợi ý, `stopPropagation` — **không đóng Drawer/Dialog cha**         |
| Click chuột             | `onMouseDown` chèn (giữ focus)                                           |
| Blur                    | Đóng sau 120ms                                                           |
| Palette `Chèn`          | Menu nhóm, chèn tại con trỏ                                              |

---

## 12. Business rules tổng hợp

| ID    | Rule                                                                                                                             |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| BR-01 | `dirty` = snapshot JSON khác baseline; baseline chốt **một lần** sau khi tải xong. Thay đổi ở tab nào cũng làm bẩn               |
| BR-02 | Chỉ nút `Lưu` ghi. Đóng trang/navigation **không cảnh báo mất dữ liệu**                                                          |
| BR-03 | `save()` không có `catch` → lỗi mạng làm `finally` chạy nhưng **không có thông báo lỗi**                                         |
| BR-04 | Demo (`id` bắt đầu `as-demo`): giữ nguyên bộ dữ liệu mẫu. Assistant thật **không có `config`**: reset kho = `[]`, tool = tắt hết |
| BR-05 | Khi có `config` đã lưu: merge theo từng field; `toolState` merge đè lên `initialToolState()`                                     |
| BR-06 | `modelName` luôn có giá trị sau tải: fallback `models[0].name`                                                                   |
| BR-07 | TokenEditor `fill` bỏ auto-resize, `textarea` `position:absolute; inset:0`                                                       |
| BR-08 | Drawer: `ToolSheet` kích thước theo `tool.sheet`; `PlaybookSheet` cố định `lg`                                                   |
| BR-09 | Mọi thao tác xoá (`Xoá biến`, `Xoá API`, `Xoá` kịch bản) **không có hộp thoại xác nhận**                                         |
| BR-10 | `Tạo` (AI instruction) **ghi đè không cảnh báo**, không có trạng thái loading, không disable                                     |
| BR-11 | Nút `Thêm` ở Hero điều hướng về `/assistants/custom`, không tạo assistant                                                        |
| BR-12 | Toggle group công cụ không cho bỏ chọn (chặn `null`)                                                                             |

---

## 13. Quy tắc biên dịch kịch bản (`planner.js`)

Đầu vào: `script` (văn bản tự do) + `registry` + `toolState` + `customer`.
`customer === undefined` → **chế độ thiết kế** (hiện cả 2 nhánh có/không). `customer === null` → khách vãng lai. `customer = {...}` → khách đã định danh.

### 13.1 Bước sinh ra

| `kind`    | Nguồn                                                                   | Nội dung                                                                  |
| --------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `profile` | `ensure()` khi tìm thấy thuộc tính hồ sơ (hoặc `prefill` + `skipKnown`) | `attr`, `as` (tên biến thu thập tương ứng), `orAsk` (chỉ chế độ thiết kế) |
| `ask`     | `ensure()` khi cần hỏi khách                                            | `var`, `forApi` (API đang cần), `conditional`                             |
| `call`    | Token `{{api.key}}`                                                     | `api`, `missing`, `outputs`                                               |
| `search`  | Token `{{kb.key}}`                                                      | `store`, `token`                                                          |

**Điều kiện `conditional`:** trong câu chứa token, từ `nếu` / `khi cần` / `trường hợp` xuất hiện **sau** từ nối `rồi` / `sau đó` / `tiếp theo` / `và sau`. Mốc câu = `.` `!` `?` hoặc xuống dòng gần nhất.

### 13.2 Cảnh báo sinh ra

| Tone  | Điều kiện                                                     | Thông điệp                                                |
| ----- | ------------------------------------------------------------- | --------------------------------------------------------- |
| rose  | Token không có trong registry                                 | `{{x}} không tồn tại`                                     |
| rose  | Cần hỏi biến nhưng `collectInfo` tắt                          | `Cần hỏi {{x}} nhưng công cụ Thu thập thông tin đang tắt` |
| rose  | API tắt (`api.enabled === false` hoặc `apiCaller` tắt)        | `{{api.x}} đang tắt nên sẽ bị bỏ qua`                     |
| amber | Khách chưa định danh, cần thuộc tính hồ sơ không có `prefill` | `Khách chưa định danh nên không có {{x}}`                 |
| amber | API còn input chưa lấy được                                   | `{{api.x}} có thể thiếu {{a}}, {{b}}`                     |
| amber | Kho tài liệu chưa gắn                                         | `{{kb.x}} chưa được gắn ở tab Kiến thức`                  |

**Cơ chế bảo đảm thứ tự:** trước khi gọi API (khi `guards.fillMissing`), `ensure()` lần lượt phân giải: hồ sơ khách → output của API khác → hỏi khách. `SYSTEM_VARS` coi như luôn có. Không có biến nào hỏi trùng. `depth > 8` thì dừng. Mỗi API chỉ được gọi 1 lần.

---

## 14. Quy tắc mô phỏng khung thử nghiệm

### 14.1 Thứ tự xử lý tin nhắn

1. **Đang chờ trả lời biến** → validate → `advance()` từ bước kế.
2. **Khớp kịch bản** → `matchPlaybook()` → `compilePlaybook(customer = cust)` → `advance()` từ bước 0.
3. **Tìm trong kho tài liệu đã gắn** → trả nguyên văn chunk.
4. **Deep Research** (nếu bật và có URL) → trả câu mẫu prototype.
5. **Fallback** → _"Mình chưa có thông tin cho câu hỏi này. Bạn thử gắn thêm kho tài liệu hoặc bật Deep Research nhé."_

### 14.2 Khớp kịch bản

Tách từ (bỏ stop-word tiếng Việt, giữ từ ≥ 2 ký tự, đã `stripVi`), so **các từ khác nhau** giữa `"{tên} {trường hợp kích hoạt}"` và tin nhắn. Điểm = số từ trùng. **Ngưỡng khớp ≥ 2.** Chỉ xét kịch bản `enabled !== false`. Điểm cao nhất thắng; hòa → giữ kịch bản đầu tiên.

### 14.3 Tìm trong kho tài liệu

-   Token câu hỏi: `stripVi(text)` → từ ≥ 2 ký tự, không stop-word.
-   Token ngữ cảnh: `interpolate(retrievalQuery, {...cust, user_message: ''})` → từ ≥ **3** ký tự.
-   `score = hitsCauHoi + 0.3 × hitsNguCanh`; **điều kiện `hitsCauHoi >= 2`**; giữ chunk điểm cao nhất.
-   `kb.san_pham` được xử lý riêng: parse `"... Giá Xđ"` để dựng danh sách sản phẩm.

### 14.4 Validate câu trả lời cho biến

| Loại     | Quy tắc                                                             | Thông báo khi sai                                                                 |
| -------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `phone`  | `text.replace(/[\s.-]/g,'')` phải khớp `/^0\d{9}$/`                 | _"Số điện thoại cần đủ 10 số và bắt đầu bằng 0, bạn kiểm tra lại giúp mình nhé."_ |
| `number` | `parseBudget()` không `NaN`                                         | _"Bạn cho mình con số cụ thể nhé, ví dụ \"5 triệu\"."_                            |
| tuỳ chọn | người dùng trả lời khớp `bo qua \| khong co \| skip` (đã `stripVi`) | giá trị = `''`, trace `= ∅`, tiền tố _"Cảm ơn bạn! "_                             |

`parseBudget` hiểu `tr|trieu|m` → ×1e6; `k|nghin|ngan` → ×1e3; số < 1000 → coi là triệu; bỏ ký tự lạ, `.` là dấu phân cách nghìn, `,` là thập phân.

### 14.5 Xử lý bước `call`

-   URL phải khớp `/^https?:\/\/[^/\s]+\.[^/\s]+/`. Nếu không → bước đánh dấu lỗi, **bỏ qua các bước còn lại có điều kiện**.
-   `onError = retry` → trace thêm ` · đã thử lại`.
-   `onError = handoff` → dừng hẳn, trả _"Hệ thống tra cứu đang gặp sự cố, mình chuyển bạn sang nhân viên hỗ trợ ngay nhé."_
-   `onError = skip` → bỏ qua, tiếp tục.

### 14.6 Sinh câu trả lời cuối (`finalText`)

| Ưu tiên | Điều kiện         | Nội dung                                                                                                                                                              |
| ------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | có `order_status` | Trạng thái đơn + mã đơn (fallback `gần nhất`) + ngày giao + hạng thành viên                                                                                           |
| 2       | có `__products`   | Có ngân sách → lọc `price <= budget`, sort **giảm dần**, lấy 3. Không ngân sách → 3 mẫu rẻ nhất. Rỗng → báo _"Hiện chưa có mẫu nào trong ngân sách …"_ + mẫu gần nhất |
| 3       | có `__hit`        | Nguyên văn `chunk.pageContent`                                                                                                                                        |
| 4       | —                 | _"Mình đã xử lý xong yêu cầu \"{tên kịch bản}\"."_                                                                                                                    |

Mọi câu bắt đầu bằng `"Chào {customer.name}! "` nếu có tên.

---

## 15. Hợp đồng API

| Method | Endpoint                                   | Payload / dùng ở                             |
| ------ | ------------------------------------------ | -------------------------------------------- |
| `GET`  | `/api/v1/assistants/components/chatmodels` | danh sách model                              |
| `GET`  | `/api/v1/document-store?page=1&limit=50`   | `sRes.data?.data \|\| sRes.data`             |
| `GET`  | `/api/v1/assistants/:id`                   | bỏ qua nếu `id === 'new'`                    |
| `PUT`  | `/api/v1/assistants/:id`                   | `{ details: <JSON string>, type: 'CUSTOM' }` |
| `POST` | `/api/v1/assistants/generate/instruction`  | `{ task: name }`                             |

### 15.1 Cấu trúc `details` khi lưu

```jsonc
{
  "name": "Trợ lý CSKH Demo",
  "instruction": "…",
  "chatModel": { "name": "chatOpenAI", "label": "ChatOpenAI (GPT-4o)" },
  "config": {
    "welcome": "…",
    "params":     { "temperature": 0.7, "topP": 0.95, "maxTokens": 2048, "memory": 10, "streaming": true },
    "retrieval":  { "topK": 4, "threshold": 0.6, "cite": true, "query": "…" },
    "selectedStoreIds": ["ds-demo-1", "ds-demo-2"],
    "toolState": {
      "enabled":   { "deepResearch": true, "…": false },
      "deepResearch": { "links": [...], "sources": [...], "depth": 3, "maxResults": 8 },
      "apiCaller":    { "apis": [...] },
      "collectInfo":  { "variables": [...] },
      "guards":       { "fillMissing": true, "skipKnown": true, "onError": "retry" },
      "playbooks":    [...],
      "serpAPI": { "apiKey": "", "maxResults": 5 },
      "braveSearch": { "apiKey": "", "maxResults": 5 },
      "customTool":  { "name": "...", "description": "...", "code": "..." },
      "requestsGet":  { "endpoint": "" },
      "requestsPost": { "endpoint": "" },
      "zapierNLA":    { "webhook": "" }
    }
  }
}
```

> **⚠ Cấu trúc `details` lệch với hệ thống Flowise gốc.** Server (`packages/server/src/services/assistants`) không có trường `config`; nó đọc `instructions`, `chatModel`, `type`. Cần mapping khi chuyển từ prototype sang production.

### 15.2 Prototype: mock adapter

`src/mocks/mockAdapter.js` chặn mọi request `/api/v1/*`; assistant lưu ở `localStorage` key `nexora.assistants.v1`. Đây là **dữ liệu giả**, không có backend thật.

---

## 16. Acceptance criteria (Given / When / Then)

**AC-01 — Nạp trang**

-   GIVEN `as-demo-1` có `details` không chứa `config`
-   THEN tên = _Trợ lý CSKH Demo_, model = `chatOpenAI`, hướng dẫn = _Bạn là trợ lý CSKH thân thiện…_, lời chào = giá trị mặc định, 2 kho `ds-demo-1`+`ds-demo-2`, 5 tool bật, 2 kịch bản, 3 biến thu thập.

**AC-02 — Cảnh báo chưa lưu**

-   GIVEN trang đã tải xong
-   WHEN sửa bất kỳ field nào trong `snapshot`
-   THEN pill đổi sang `Chưa lưu`; bấm `Lưu` → pill về `Đang hoạt động` + snackbar _Đã lưu trợ lý_ (variant success).

**AC-03 — Điều hướng từ menu**

-   GIVEN mở menu Cấu hình
-   WHEN chọn `Tham số mô hình`
-   THEN về tab `Thiết lập` và cuộn tới card `Tham số`.

**AC-04 — Chèn biến**

-   GIVEN đang focus ô URL của API
-   WHEN nhấn chip `{{customer_phone}}`
-   THEN `{{customer_phone}}` chèn đúng vị trí con trỏ, con trỏ đặt sau token.

**AC-05 — Validate JSON body**

-   GIVEN API `method = POST`
-   WHEN body là `{ "a": {{customer_id}} }` hợp lệ về cú pháp sau nội suy
-   THEN pill emerald `JSON hợp lệ`; body hỏng → pill rose `JSON lỗi cú pháp`. `method = GET` → **không** render body.

**AC-06 — Bật/tắt tool không mở Drawer**

-   GIVEN card tool đang hiển thị
-   WHEN click Switch
-   THEN chỉ đổi trạng thái, Drawer **không** mở; click phần còn lại của card → Drawer mở; focus bàn phím → `Enter` mở Drawer.

**AC-07 — Gỡ kho tài liệu**

-   GIVEN tab Kiến thức, kho đang gắn
-   WHEN bấm `X`
-   THEN kho biến mất khỏi danh sách và chip; badge tab Kiến thức giảm 1.

**AC-08 — Tool tắt trong Drawer**

-   GIVEN mở Drawer của tool đang tắt
-   THEN hiện `Công cụ đang tắt` + nút `Bật`, nội dung mờ 0.55; bấm `Bật` → pill biến mất, nội dung sáng, Switch header bật.

**AC-09 — Thêm URL không hợp lệ**

-   GIVEN dán `abc.com` và `https://ok.vn/a`
-   WHEN bấm `Thêm`
-   THEN thêm 1 URL hợp lệ, cảnh báo `1 link không hợp lệ đã bị bỏ qua`, `abc.com` **vẫn còn** trong ô nhập.

**AC-10 — Sức khoẻ kịch bản**

-   GIVEN kịch bản để trống `script`
-   THEN badge `Chưa có bước` (không màu); có token không tồn tại → badge đỏ `{n} lưu ý`; hợp lệ → badge xanh `Hợp lệ`.

**AC-11 — Badge cảnh báo trên nút Kịch bản**

-   GIVEN 2 kịch bản, 1 có vấn đề
-   THEN CountPill tone amber + tam giác cảnh báo + tooltip `1 kịch bản cần xem lại`.

**AC-12 — Hỏi và validate biến**

-   GIVEN chạy kịch bản cần `{{customer_phone}}`
-   WHEN khách nhập `123`
-   THEN bot trả thông báo lỗi, trace `{{customer_phone}} chưa hợp lệ`, **không** sang bước sau; nhập `0901234567` → tiếp tục, tiền tố _"Cảm ơn bạn! "_.

**AC-13 — Bỏ qua biến tuỳ chọn**

-   GIVEN biến `required = false`
-   WHEN khách nhập `bỏ qua`
-   THEN giá trị = rỗng, trace `= ∅`, chuyển bước kế tiếp.

**AC-14 — Trả lời tư vấn sản phẩm**

-   GIVEN chạy kịch bản _Tư vấn sản phẩm_ với `budget = 5 triệu`
-   THEN không có mẫu nào khớp → báo chưa có mẫu trong ngân sách + đề xuất mẫu rẻ nhất.

**AC-15 — Chuyển nhân viên khi API lỗi**

-   GIVEN `guards.onError = handoff` và API có URL không hợp lệ
-   WHEN chạy tới bước gọi API
-   THEN dừng hẳn, trả thông báo chuyển nhân viên, xoá trạng thái chờ.

**AC-16 — Reset hội thoại**

-   GIVEN đã gửi tin nhắn
-   WHEN đổi khách hoặc bấm `IconRefresh`
-   THEN hội thoại về đúng 1 tin nhắn chào, các prompt mẫu hiện lại.

**AC-17 — Token `{{x}}` không tồn tại**

-   WHEN gõ `{{foo}}` trong `Cách xử lý`
-   THEN token hiển thị nền đỏ; Readback hiện cảnh báo `{{foo}} không tồn tại`; nút Kịch bản chuyển tone đỏ.

**AC-18 — Kho chưa gắn**

-   GIVEN token `{{kb.chinh_sach}}` mà kho đó chưa chọn ở tab Kiến thức
-   THEN Readback hiện `{{kb.chinh_sach}} chưa được gắn ở tab Kiến thức`; palette ghi ` · chưa gắn`.

**AC-19 — Tạo hướng dẫn bằng AI**

-   WHEN bấm `Tạo`
-   THEN `instruction` bị thay bằng kết quả API; nếu API trả rỗng → giữ nguyên; số ký tự cập nhật.

**AC-20 — Điều hướng responsive**

-   GIVEN khung `< lg`
-   THEN 2 cột xếp dọc; khung thử nghiệm chiều cao cố định 640px; Drawer chiếm 100% chiều rộng; S9 xếp dọc.

---

## 17. Accessibility

| Hạng mục                  | Đã có                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| Tabs                      | `id="ws-tab-{i}"`, `aria-controls="ws-tabpanel-{i}"`, `role="tabpanel"`, `aria-labelledby` |
| Drawer Kịch bản           | `role="dialog"`, `aria-modal`, `aria-labelledby="playbook-sheet-title"`                    |
| Drawer Tool               | qua `useSheetShell` (MUI Drawer mặc định)                                                  |
| Icon-only button          | đều có `aria-label`                                                                        |
| Switch                    | đều có `aria-label` mô tả đích                                                             |
| Vùng bấm dạng card        | `role="button"` + `tabIndex=0` + xử lý `Enter`                                             |
| Vùng bấm dạng nút         | `component='button'` + `aria-pressed`                                                      |
| Badge cảnh báo            | có bản text ẩn cho screen-reader                                                           |
| Bảng tin khung thử nghiệm | `aria-live='polite'`                                                                       |
| Kịch bản                  | `aria-expanded`, `aria-controls`, focus được giữ lại sau khi xoá                           |

---

## 18. Khoảng trống cần quyết định (chưa xử lý)

| #   | Vấn đề                                                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | 5 menu item chưa hoạt động, gồm cả **`Xoá trợ lý` không có confirm**                                                        |
| 2   | Không có cảnh báo điều hướng khi đang có thay đổi chưa lưu                                                                  |
| 3   | `save()` không xử lý lỗi — lỗi API không có snackbar                                                                        |
| 4   | `Tạo` (AI) ghi đè hướng dẫn không cảnh báo, không loading, không disable                                                    |
| 5   | Các field `required` ở S7 không validate — API có thể lưu với tên rỗng / URL rỗng / key rỗng                                |
| 6   | Xoá biến / Xoá API / Xoá kịch bản không có confirm                                                                          |
| 7   | `temperature`, `topP`, `maxTokens`, `memory`, `streaming`, `topK`, `threshold`, `cite` chỉ lưu, **không tác động mô phỏng** |
| 8   | `hooks.onError = 'skip'` chưa được mô phỏng rõ ràng (bỏ qua nhưng không ghi trace riêng)                                    |
| 9   | Badge cảnh báo Kịch bản không xét `enabled`                                                                                 |
| 10  | Không có lock cạnh tranh — hai tab mở cùng một assistant sẽ ghi đè lẫn nhau                                                 |
| 11  | Chưa có kiểm thử tự động cho `planner.js` / `tokens.js` (logic quyết định hành vi agent)                                    |
| 12  | Toàn bộ chuỗi UI là **tiếng Việt hardcode**, không qua `src/i18n` — không thể chuyển ngôn ngữ                               |

---

## 19. Checklist implement

-   [ ] `AssistantWorkspace` — khung, 3 tab, Hero, save/load, dirty tracking
-   [ ] `TokenEditor` + `tokens.js` — registry, gợi ý, highlight token
-   [ ] `catalog.js` — danh mục 11 tool, state mặc định, `blankToolState`
-   [ ] `planner.js` — `compilePlaybook`, `matchPlaybook`, `isConditional`
-   [ ] `ToolSheet` — 4 body (`DeepResearch`, `ApiList/ApiDetail`, `CollectInfo`, `Simple`)
-   [ ] `PlaybookSheet` — danh sách, expand, readback, guards, focus dialog
-   [ ] `ChatTestPanel` — `respond`, `advance`, `finalText`, `searchStores`, `parseBudget`
-   [ ] API layer — 5 endpoint, mapping `details.config`
-   [ ] Test: unit test cho `planner` + `tokens` + `parseBudget`; E2E cho AC-01 → AC-20
