type LogoutCallback = () => void

let logoutCallback: LogoutCallback | null = null

export function setLogoutCallback(callback: LogoutCallback) {
  logoutCallback = callback
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, options)

  if (response
      .status === 401) {
    if (logoutCallback) {
      logoutCallback()
    }
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Request failed' }))

    throw new Error(errorData.message || 'Request failed')
  }

  const contentType = response
    .headers
    .get('content-type')

  if (contentType && contentType
      .includes('application/json')) {
    return response
      .json()
  }

  return {} as T
}
