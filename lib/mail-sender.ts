import axios from 'axios'

export interface SendMailResult {
  success: boolean
  provider: 'resend' | 'brevo'
  id?: string
}

/**
 * Sends an email using direct HTTP REST APIs (Resend primary if present, Brevo fallback).
 * Avoids SMTP port blocks on serverless and cloud environments.
 */
export async function sendMail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<SendMailResult> {
  const fromEmail = process.env.MAIL_FROM_EMAIL || 'hariprasant.centennialinfotech@gmail.com'
  const fromName = process.env.MAIL_FROM_NAME || 'Centennial Infotech'

  // 1️⃣ Option A: Try Resend (if configured)
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await axios.post(
        'https://api.resend.com/emails',
        {
          from: `${fromName} <${fromEmail}>`,
          to: [to],
          subject,
          html: htmlContent,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      )
      console.log('✅ Email sent via Resend:', response.data?.id)
      return { success: true, provider: 'resend', id: response.data?.id }
    } catch (error: any) {
      console.warn('⚠️ Resend failed, falling back to Brevo...', error.response?.data || error.message)
    }
  }

  // 2️⃣ Option B: Brevo REST API
  if (process.env.BREVO_API_KEY) {
    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: fromName,
            email: fromEmail,
          },
          to: [{ email: to }],
          subject,
          htmlContent,
        },
        {
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      )
      console.log('✅ Email sent via Brevo HTTP API:', response.data?.messageId)
      return { success: true, provider: 'brevo', id: response.data?.messageId }
    } catch (error: any) {
      console.error('❌ Brevo API Error:', error.response?.data || error.message)
      throw new Error(`Email delivery failed: ${error.response?.data?.message || error.message}`)
    }
  }

  throw new Error('No email provider configured. Set BREVO_API_KEY or RESEND_API_KEY in .env.')
}
