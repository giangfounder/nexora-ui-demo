import { Navigate, useRoutes } from 'react-router-dom'

// routes
import MainRoutes from './MainRoutes'
import CanvasRoutes from './CanvasRoutes'
import ChatbotRoutes from './ChatbotRoutes'
import config from '@/config'
import AuthRoutes from '@/routes/AuthRoutes'
import ExecutionRoutes from './ExecutionRoutes'

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
    return useRoutes(
        [MainRoutes, AuthRoutes, CanvasRoutes, ChatbotRoutes, ExecutionRoutes, { path: '*', element: <Navigate to='/' replace /> }],
        config.basename
    )
}
