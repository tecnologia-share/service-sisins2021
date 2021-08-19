import { Transporter, createTransport } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';

interface SendEmailParams {
  to: string;
  subject: string;
  variables: Record<string, unknown>;
  path: string;
}

class SendMailService {
  private client: Transporter;
  constructor() {
    this.client = createTransport({
      port: Number(process.env.SMTP_PORT),
      host: process.env.SMTP_HOST,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      debug: true,
    });
  }

  async execute({ to, subject, variables, path }: SendEmailParams) {
    const templateFileContent = fs.readFileSync(path).toString('utf-8');

    const mailTemplateParse = handlebars.compile(templateFileContent);

    const html = mailTemplateParse(variables);

    await this.client.sendMail({
      to,
      subject,
      html,
      from: 'email@mail.com',
    });
  }
}

export default new SendMailService();
