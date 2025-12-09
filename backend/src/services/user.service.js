const { db } = require("../config/firebaseAdmin.config");

const USERS_COLLECTION = "users";

const UserService = {

  getUserByEmail: async (email) => {
    const snap = await db.collection(USERS_COLLECTION)
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snap.empty) return null;

    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  getUserById: async (id) => {
    const doc = await db.collection(USERS_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  updateUserById: async (id, data) => {
    const ref = db.collection(USERS_COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.update(data);
    const updated = await ref.get();
    return { id: updated.id, ...updated.data() };
  }

};

module.exports = UserService;
