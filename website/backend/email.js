const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendVerificationEmail(email, token) {
  const verificationUrl =
    `${process.env.FRONTEND_URL}/verify-email` +
    `?token=${encodeURIComponent(token)}`;

  await sgMail.send({
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: "PlayVerse",
    },
    subject: "Verify your PlayVerse account",
    text: `Verify your account by visiting: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Verify your PlayVerse account</h2>

        <p>
          Click the button below to confirm your email address.
        </p>

        <a
          href="${verificationUrl}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background: #6b46c1;
            color: white;
            border-radius: 8px;
            text-decoration: none;
          "
        >
          Verify email
        </a>

        <p>This link expires in one hour.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await sgMail.send({
    to: email,

    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: "PlayVerse",
    },

    subject: "Reset your PlayVerse password",

    text: `Reset your PlayVerse password using this link: ${resetUrl}`,

    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Reset your PlayVerse password</h2>

        <p>
          We received a request to reset your password.
        </p>

        <p>
          This link expires in one hour.
        </p>

        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 12px 18px;
            background: #6c5ce7;
            color: white;
            text-decoration: none;
            border-radius: 8px;
          "
        >
          Reset password
        </a>

        <p>
          If you did not request this, you can ignore this email.
        </p>
      </div>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
