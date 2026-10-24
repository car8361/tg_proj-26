import { Injectable } from '@nestjs/common';
import nm from "nodemailer";
import mt from "mailtrap";

@Injectable()
export class MailerService {
    private readonly client;
    constructor() {
        if (!process.env.MAILTRAP_SECRET) {
            throw new Error("MAILTRAP_SECRET missing in .env")
        }
       this.client = new mt.MailtrapClient({
       token: process.env.MAILTRAP_SECRET,
       });
    }
    sendMail(recipients: string, subject: string, text: string, html: string) {
        this.client
          .send({
            from: {
              email: 'noreply@dnck.dev',
              name: "Terra demo app - Verification",
            },
            to: [{email: recipients}],
            subject: subject,
            text: text,
            html: html
          }).then(console.log, console.error);
    }

    /*
    this.transport
          .sendMail({
            from: {
              address: 'hello@demomailtrap.co',
              name: "Mailtrap",
            },
            to: recipients,
            subject: "Verifikační kód",
            text: `Váš verifikační kód: ${code}.`,
            html: `<div><p>Váš verifikační kód: ${code}</p></div>`
          }, (error, info) => {
            if (error) {
              return console.error(error);
            }
            console.log("Message sent: %s", info.message);
          })
            */
}
