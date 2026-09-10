import nodemailer from 'nodemailer'

if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
  console.warn(
    '[mail.ts] MAIL_USER and/or MAIL_PASS are not set. ' +
    'Email sending will fail. Set these values in your .env file.'
  )
}

const host = process.env.MAIL_HOST ?? 'smtp.gmail.com'
const port = Number(process.env.MAIL_PORT) || 587
const user = process.env.MAIL_USER ?? ''
const pass = process.env.MAIL_PASS ? process.env.MAIL_PASS.replace(/^["']|["']$/g, '') : ''
const secure = process.env.MAIL_SECURE === 'true'

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

export interface SendMailParams {
  name: string
  email: string
  company?: string
  phone?: string
  product?: string
  message: string
}

export async function sendContactEmail(params: SendMailParams) {
  const fromEmail = process.env.MAIL_FROM_EMAIL ?? process.env.MAIL_USER ?? ''
  const fromName = process.env.MAIL_FROM_NAME ?? 'Centennial Infotech'
  const recipient = process.env.MAIL_USER ?? ''

  if (!recipient) {
    throw new Error('MAIL_USER is not configured. Cannot send contact email.')
  }

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px; background: #ffffff;">
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0; font-size: 22px;">New Inquiry from Centennial Connect</h2>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Received via website contact form</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 140px; font-weight: 600;">Full Name:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${params.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Work Email:</td>
          <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${params.email}" style="color: #2563eb; text-decoration: none;">${params.email}</a></td>
        </tr>
        ${params.phone ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone:</td>
          <td style="padding: 8px 0; color: #0f172a;">${params.phone}</td>
        </tr>
        ` : ''}
        ${params.company ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Company:</td>
          <td style="padding: 8px 0; color: #0f172a;">${params.company}</td>
        </tr>
        ` : ''}
        ${params.product ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Product Interest:</td>
          <td style="padding: 8px 0; color: #0f172a;"><span style="background: #eff6ff; color: #2563eb; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">${params.product}</span></td>
        </tr>
        ` : ''}
      </table>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 12px;">
        <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message</h4>
        <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${params.message}</p>
      </div>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center;">
        Sent via <strong>Centennial Connect</strong> by Centennial InfoTech
      </div>
    </div>
  `

  // 1. Send notification to the business team
  const adminMailPromise = transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: recipient,
    replyTo: params.email,
    subject: `[Centennial Connect] New inquiry from ${params.name} ${params.company ? `(${params.company})` : ''}`,
    html: htmlContent,
    text: `New contact inquiry\n\nName: ${params.name}\nEmail: ${params.email}\nPhone: ${params.phone || 'N/A'}\nCompany: ${params.company || 'N/A'}\nProduct: ${params.product || 'N/A'}\n\nMessage:\n${params.message}`,
  })

  // 2. Send acknowledgment to the prospect
  const ackMailPromise = transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: params.email,
    subject: `Thank you for contacting Centennial Connect`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0;">Hello ${params.name},</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Thank you for reaching out to <strong>Centennial Connect</strong>. We have received your message regarding <strong>${params.product || 'our communication platform'}</strong>.
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          One of our product specialists will review your requirements and get back to you within one business day.
        </p>
        <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb;">
          <p style="margin: 0; font-size: 13px; color: #64748b;">
            Need urgent assistance? Call us directly at <strong>+1 (800) 555-0199</strong> or visit <a href="https://centennialinfotech.com/" style="color: #2563eb;">centennialinfotech.com</a>.
          </p>
        </div>
        <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
          Best regards,<br />
          <strong>The Centennial Connect Team</strong>
        </p>
      </div>
    `,
  }).catch((err) => {
    console.warn('Customer ack email warning:', err.message)
  })

  await adminMailPromise
  return { success: true }
}
