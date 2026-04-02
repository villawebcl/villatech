import { WebpayPlus, Options, Environment } from 'transbank-sdk'
import { getPublicAppUrl, requireEnv } from './env'

function getEnvironment(): Environment {
  return process.env.TRANSBANK_ENV === 'production'
    ? Environment.Production
    : Environment.Integration
}

function getTransaction() {
  return new WebpayPlus.Transaction(
    new Options(
      requireEnv('TRANSBANK_COMMERCE_CODE'),
      requireEnv('TRANSBANK_API_KEY'),
      getEnvironment()
    )
  )
}

export async function createWebpayTransaction(
  orderId: string,
  amount: number
): Promise<{ url: string; token: string }> {
  const tx = getTransaction()
  const buyOrder = `VT-${orderId.slice(-8).toUpperCase()}`
  const sessionId = `sess-${Date.now()}`
  const returnUrl = `${getPublicAppUrl()}/api/payment/callback`

  const response = await tx.create(buyOrder, sessionId, amount, returnUrl)
  return { url: response.url, token: response.token }
}

export async function confirmWebpayTransaction(token: string) {
  const tx = getTransaction()
  return await tx.commit(token)
}
