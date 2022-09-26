const nodemailer = require('nodemailer')
async function NetworkAlerts(subject, message, to){
    const transporter = nodemailer.createTransport({
        host: 'newhaven-smtp.newhaven.edu',
        port: 25
    });
    await transporter.sendMail({
        from: 'networkalerts@newhaven.edu',
        to: to,
        subject: subject,
        html: message
    });
}
module.exports = {NetworkAlerts}