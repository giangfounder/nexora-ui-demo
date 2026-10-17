import { Navigate, useParams } from 'react-router-dom'

const StudioRedirect = () => {
    const { id } = useParams()
    return <Navigate to={`/assistants/studio/${id}`} replace />
}

export default StudioRedirect
