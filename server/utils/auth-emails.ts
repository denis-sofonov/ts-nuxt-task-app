import type { User } from '../database/schema'

type Recipient = Pick<User, 'id' | 'email' | 'name'>

export async function sendVerificationEmail(user: Recipient): Promise<void> {
  const token = await issueAuthToken(user.id, 'email_verification')
  const { appUrl } = useRuntimeConfig()
  const link = `${appUrl}/verify-email?token=${token}`

  await sendMail({
    to: user.email,
    subject: 'Verify your email',
    text: `Hi ${user.name},\n\nConfirm your email address:\n${link}\n\nThis link expires in 24 hours.`,
  })
}

export async function sendPasswordResetEmail(user: Recipient): Promise<void> {
  const token = await issueAuthToken(user.id, 'password_reset')
  const { appUrl } = useRuntimeConfig()
  const link = `${appUrl}/reset-password?token=${token}`

  await sendMail({
    to: user.email,
    subject: 'Reset your password',
    text: `Hi ${user.name},\n\nReset your password with this link:\n${link}\n\nThis link expires in 30 minutes. If you did not request it, ignore this email.`,
  })
}
