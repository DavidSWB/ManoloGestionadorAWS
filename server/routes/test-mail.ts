import { Router } from "express";
import { sendMail, verifyConnection } from "../utils/mail";

const router = Router();

router.get("/verify-smtp", async (req, res) => {
  try {
    await verifyConnection();
    res.json({ ok: true, message: "SMTP connection verified" });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.get("/test-email", async (req, res) => {
  const { to } = req.query;

  if (!to) {
    return res.status(400).json({ ok: false, error: "Email recipient required" });
  }

  try {
    const info = await sendMail(
      to as string,
      "Test Email",
      "This is a test email from your application"
    );
    res.json({ ok: true, messageId: info.messageId });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;