let unauthorizedCallback: (() => void) | null = null

export function setUnauthorizedCallback(callback: () => void) {
  unauthorizedCallback = callback
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const response = await fetch(url, options)

  if (response
      .status === 401 && unauthorizedCallback) {
    unauthorizedCallback()
  }

  return response
}
