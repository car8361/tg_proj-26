import { Injectable } from '@nestjs/common';
import nm from "nodemailer";
import mt from "mailtrap";

@Injectable()
export class MailerService {
    private readonly transport;
    constructor() {
        if (!process.env.MAILTRAP_SECRET) {
            throw new Error("MAILTRAP_SECRET missing in .env")
        }
        this.transport = nm.createTransport(
        mt.MailtrapTransport({
            token: process.env.MAILTRAP_SECRET,
            sandbox: true,
            testInboxId: 4262057,
        }));
    }
    sendMail(recipients: string[], subject: string, text: string, html: string) {
        this.transport
          .sendMail({
            from: {
              address: 'hello@demomailtrap.co',
              name: "Mailtrap",
            },
            to: recipients,
            subject: subject,
            text: text,
            html: html
          }, (error, info) => {
            if (error) {
              return console.error(error);
            }
            console.log("Message sent: %s", info);
          })
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
