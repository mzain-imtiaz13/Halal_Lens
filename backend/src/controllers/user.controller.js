// controllers/UserController.js
const {
  admin,
  db,
  auth: adminAuth,
} = require("../config/firebaseAdmin.config");
const EmailService = require("../services/email.service");

const UserController = {
  disableAccount: async (req, res) => {
    try {
      const { uid, email } = req.user; // From verified token (firebaseAuth middleware)

      if (!uid) {
        return res.status(400).json({
          success: false,
          message: "Invalid request: UID missing from auth token.",
        });
      }

      // 1) Disable Firebase Auth user
      await adminAuth.updateUser(uid, { disabled: true });

      // 2) Mark user as inactive in Firestore (users collection)
      const userRef = db.collection("users").doc(uid);

      await userRef.set(
        {
          status: "inactive", // enum: "active" | "inactive"
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      await EmailService.sendAccountDeletionEmail(email);

      return res.json({
        success: true,
        message:
          "Your account has been disabled. Firebase will automatically delete it after 30 days.",
      });
    } catch (error) {
      console.error("Disable user error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to disable user.",
        error: error.message,
      });
    }
  },
};

module.exports = UserController;
