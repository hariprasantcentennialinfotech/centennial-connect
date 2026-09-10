'use server'

import { sendMail } from '@/lib/mail-sender'
import { getDatabase } from '@/lib/mongodb'

export interface ContactActionResult {
  success?: boolean
  error?: string
}

export async function submitContactForm(
  _prev: ContactActionResult,
  formData: FormData
): Promise<ContactActionResult> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const company = String(formData.get('company') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const product = String(formData.get('product') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (name.length < 2) {
    return { error: 'Please enter your full name.' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }
  if (message.length < 10) {
    return { error: 'Message must be at least 10 characters long.' }
  }

  // 1. Store the inquiry in MongoDB
  try {
    const db = await getDatabase()
    if (db) {
      await db.collection('inquiries').insertOne({
        name,
        email,
        company,
        phone,
        product,
        message,
        createdAt: new Date().toISOString(),
        status: 'new',
      })
    }
  } catch (dbErr) {
    console.warn('Could not persist inquiry to MongoDB:', dbErr)
  }

  // 2. Dispatch emails via HTTP REST API (Brevo / Resend)
  const adminNotificationHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px; background: #ffffff;">
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0; font-size: 22px;">New Inquiry from Centennial Connect</h2>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Received via website contact form</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 140px; font-weight: 600;">Full Name:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Work Email:</td>
          <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
        </tr>
        ${phone ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone:</td>
          <td style="padding: 8px 0; color: #0f172a;">${phone}</td>
        </tr>
        ` : ''}
        ${company ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Company:</td>
          <td style="padding: 8px 0; color: #0f172a;">${company}</td>
        </tr>
        ` : ''}
        ${product ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Product Interest:</td>
          <td style="padding: 8px 0; color: #0f172a;"><span style="background: #eff6ff; color: #2563eb; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">${product}</span></td>
        </tr>
        ` : ''}
      </table>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 12px;">
        <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message</h4>
        <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
      </div>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center;">
        Sent via <strong>Centennial Connect</strong> by Centennial InfoTech
      </div>
    </div>
  `

  const userAckHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #0f172a; margin-top: 0;">Hello ${name},</h2>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        Thank you for reaching out to <strong>Centennial Connect</strong>. We have received your inquiry regarding <strong>${product || 'our communication platform'}</strong>.
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        Our team will review your requirements and get back to you within one business day.
      </p>
      <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb;">
        <p style="margin: 0; font-size: 13px; color: #64748b;">
          Need immediate assistance? Call us at <strong>U.S.: +1 (419) 847 3416</strong> or <strong>India: +91 81465-11568</strong>, or visit <a href="https://centennialinfotech.com/" style="color: #2563eb;">centennialinfotech.com</a>.
        </p>
      </div>
      <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
        Best regards,<br />
        <strong>The Centennial Connect Team</strong>
      </p>
    </div>
  `

  try {
    const adminEmail = process.env.MAIL_USER
    if (!adminEmail) {
      throw new Error('MAIL_USER is not configured.')
    }
    
    // 1. Send notification to Centennial Infotech team
    await sendMail(
      adminEmail,
      `[Centennial Connect] New inquiry from ${name} ${company ? `(${company})` : ''}`,
      adminNotificationHtml
    )

    // 2. Send acknowledgment to the user
    sendMail(
      email,
      'Thank you for contacting Centennial Connect',
      userAckHtml
    ).catch((err) => {
      console.warn('User acknowledgment email warning:', err.message)
    })

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Contact email dispatch failed:', msg)
    return {
      error: 'We could not send your message right now. Please try again later or contact us through our support page.',
    }
  }
}
