import { createTransport } from 'nodemailer'

interface Mail {
  to: string
  subject: string
  text: string
}

// Sends through SMTP when a host is configured (e.g. Mailhog in dev, a real
// provider in prod). With no host the message is logged as structured JSON, so
// the local flow works without any mail infrastructure.
export async function sendMail(mail: Mail): Promise<void> {
  const config = useRuntimeConfig()

  if (!config.smtpHost) {
    console.info(JSON.stringify({ level: 'info', type: 'mail', ...mail }))
    return
  }

  const transport = createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort),
    secure: false,
  })
  await transport.sendMail({ from: config.mailFrom, ...mail })
}
