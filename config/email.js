const nodemailer = require('nodemailer');

const smtpTransport = nodemailer.createTransport({
    service: "Naver",
    auth: {
        user: "",
        pass: ""
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports={
    smtpTransport
}
