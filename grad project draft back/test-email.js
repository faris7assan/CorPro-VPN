const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ys5313944@gmail.com',
    pass: 'kcqifpkugavenkpq',
  },
});

async function test() {
  console.log('--- Testing Email with App Password ---');
  try {
    await transporter.sendMail({
      from: 'ys5313944@gmail.com',
      to: 'ys5313944@gmail.com',
      subject: "Test from VPN Backend",
      text: "If you see this, the App Password works!"
    });
    console.log('✅ SUCCESS: Email sent successfully!');
  } catch (err) {
    console.error('❌ FAILURE:', err.message);
  }
}

test();
