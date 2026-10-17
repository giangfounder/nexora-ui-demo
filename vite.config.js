import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Standalone UI prototype — không có backend, build thẳng cho Netlify
// Dùng workspace root node_modules (pnpm hoist) cho các alias codemirror/lezer
const WS_ROOT_NM = resolve(__dirname, '../node_modules')

export default defineConfig(() => {
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
                '@codemirror/state': resolve(WS_ROOT_NM, '@codemirror/state'),
                '@codemirror/view': resolve(WS_ROOT_NM, '@codemirror/view'),
                '@codemirror/language': resolve(WS_ROOT_NM, '@codemirror/language'),
                '@codemirror/lang-javascript': resolve(WS_ROOT_NM, '@codemirror/lang-javascript'),
                '@codemirror/lang-json': resolve(WS_ROOT_NM, '@codemirror/lang-json'),
                '@uiw/react-codemirror': resolve(WS_ROOT_NM, '@uiw/react-codemirror'),
                '@uiw/codemirror-theme-vscode': resolve(WS_ROOT_NM, '@uiw/codemirror-theme-vscode'),
                '@uiw/codemirror-theme-sublime': resolve(WS_ROOT_NM, '@uiw/codemirror-theme-sublime'),
                '@lezer/common': resolve(WS_ROOT_NM, '@lezer/common'),
                '@lezer/highlight': resolve(WS_ROOT_NM, '@lezer/highlight')
            }
        },
        root: resolve(__dirname),
        cacheDir: resolve(__dirname, '.vite-cache'),
        build: {
            outDir: './build',
            chunkSizeWarningLimit: 8000
        },
        server: {
            port: 3000,
            host: true,
            strictPort: false
        }
    }
})
