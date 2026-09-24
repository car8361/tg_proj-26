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
        const sender = {
            address: "hello@demomailtrap.co",
            name: "Mailtrap Test",
        };
        const recipients = [
        "luky.zoz@seznam.cz",
        ]; 

        this.transport
        .sendMail({
            from: sender,
            to: recipients,
            subject: "You are awesome!",
            text: "Congrats for sending test email with Mailtrap!",
            category: "Integration Test",
        })
        .then(console.log, console.error);
    }
    sendMail(address: string, name: string, recipients: string[], subject: string, text: string, category: string) {
        this.transport.sendMail({
            from: {
                address: address,
                name: name
            },
            to: recipients,
            subject: subject,
            text: text,
            category: category
        })
    }
}
