const UserInfo = () => {

    const idInstance = import.meta.env.VITE_ID_INSTANCE
    const apiTokenInstance = import.meta.env.VITE_API_TOKEN_INSTANCE

    return (
        <div className="space-y-3 border-b border-border px-4 py-4">
            <div>
              <p className="text-xs text-muted">idInstance</p>
              <p className="truncate text-sm font-medium">{idInstance}</p>
            </div>
            <div>
              <p className="text-xs text-muted">apiTokenInstance</p>
              <p className="truncate text-sm font-medium">{apiTokenInstance}</p>
            </div>
          </div>
    )
}

export default UserInfo