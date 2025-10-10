export function formatErrorMessage(errorData: any): string {
  if (errorData.method && errorData.path) {
    return `(${errorData.method} ${errorData.path}) ${errorData.message}`
  }
  return errorData.message || 'Request failed'
}

export async function handleApiError(response: Response, defaultMessage: string): Promise<never> {
  const errorData = await response
    .json()
    .catch(() => ({ message: defaultMessage }))

  const errorMessage = formatErrorMessage(errorData)
  throw new Error(errorMessage)
}
