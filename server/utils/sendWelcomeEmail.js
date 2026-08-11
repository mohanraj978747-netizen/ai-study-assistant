import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail({ email, name }) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: '🎓 Welcome to Nova AI Study Assistant!',

      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <title>Welcome to Nova</title>
          </head>

          <body
            style="
              margin: 0;
              padding: 0;
              background-color: #0b0b12;
              font-family: Arial, Helvetica, sans-serif;
            "
          >
            <div
              style="
                max-width: 600px;
                margin: 40px auto;
                background-color: #151522;
                border-radius: 20px;
                overflow: hidden;
                border: 1px solid #2a2a3a;
              "
            >

              <!-- Header -->
              <div
                style="
                  padding: 35px 30px;
                  text-align: center;
                  background: linear-gradient(
                    135deg,
                    #92400e,
                    #312e81
                  );
                "
              >
                <div
                  style="
                    font-size: 42px;
                    margin-bottom: 10px;
                  "
                >
                  🎓
                </div>

                <h1
                  style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 28px;
                  "
                >
                  Welcome to Nova!
                </h1>

                <p
                  style="
                    margin: 10px 0 0;
                    color: #e5e7eb;
                    font-size: 15px;
                  "
                >
                  Your AI Study Assistant
                </p>
              </div>

              <!-- Content -->
              <div
                style="
                  padding: 35px 30px;
                  color: #d1d5db;
                "
              >

                <h2
                  style="
                    color: #ffffff;
                    margin-top: 0;
                  "
                >
                  Hi ${name || 'Student'} 👋
                </h2>

                <p style="line-height: 1.7;">
                  Your Nova account has been successfully created.
                  Welcome to your new AI-powered study companion!
                </p>

                <p style="line-height: 1.7;">
                  With Nova, you can:
                </p>

                <ul
                  style="
                    line-height: 2;
                    padding-left: 25px;
                  "
                >
                  <li>🤖 Chat with your AI tutor</li>
                  <li>📚 Summarize your study notes</li>
                  <li>🧠 Generate AI-powered quizzes</li>
                  <li>📅 Organize your study plan</li>
                  <li>💬 Keep your learning conversations</li>
                </ul>

                <!-- Button -->
                <div
                  style="
                    text-align: center;
                    margin: 30px 0;
                  "
                >
                  <a
                    href="https://ai-study-assistant-henna.vercel.app"
                    style="
                      display: inline-block;
                      padding: 14px 28px;
                      background-color: #f59e0b;
                      color: #111827;
                      text-decoration: none;
                      font-weight: bold;
                      border-radius: 10px;
                    "
                  >
                    Start Studying 🚀
                  </a>
                </div>

                <p
                  style="
                    line-height: 1.7;
                    color: #9ca3af;
                  "
                >
                  We're excited to have you with us.
                  Keep learning, keep growing!
                </p>

                <p
                  style="
                    margin-top: 30px;
                    color: #fbbf24;
                    font-weight: bold;
                  "
                >
                  — Nova AI Study Assistant
                </p>

              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Welcome email error:', error);
      throw new Error(error.message || 'Failed to send welcome email');
    }

    console.log('✅ Welcome email sent:', data?.id);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ Welcome email exception:', error);
    throw error;
  }
}