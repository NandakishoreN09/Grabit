import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { auth, isAdmin, logout as firebaseLogout } from "../lib/firebase";
import { getDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Profile() {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [userName, setUserName] = useState("");
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        router.push("/login"); // Redirect if not logged in
        return;
      }

      setIsAdminUser(await isAdmin(auth.currentUser.uid));

      // Fetch User Details
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserName(userSnap.data().name || "No Name Set");
      }

      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  const handleSaveName = async () => {
    if (newName.trim() === "") {
      alert("Name cannot be empty");
      return;
    }
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { name: newName });
    } else {
      alert("User is not logged in");
    }
    setUserName(newName);
    setEditing(false);
  };

  // ✅ Fix Logout to properly redirect after sign-out
  const handleLogout = async () => {
    await firebaseLogout();
    router.push("/login"); // ✅ Ensure router handles the redirection
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-primary text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-primary text-white min-h-screen flex flex-col justify-center items-center p-10">
      <motion.h1 
        className="text-5xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        Profile
      </motion.h1>

      {/* Editable Name Section */}
      <div className="mb-6 flex flex-col items-center">
        {editing ? (
          <div className="flex gap-3">
            <input 
              type="text" 
              className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
            />
            <button className="bg-green-500 px-4 py-2 rounded-lg text-black hover:scale-105 transition" onClick={handleSaveName}>
              Save
            </button>
            <button className="bg-red-500 px-4 py-2 rounded-lg text-black hover:scale-105 transition" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">{userName}</h2>
            <button className="bg-gray-700 px-3 py-1 rounded-lg text-white text-sm hover:scale-105 transition" onClick={() => setEditing(true)}>
              Edit
            </button>
          </div>
        )}
      </div>

      <p className="text-lg mb-2">{isAdminUser ? "Role: Admin" : "Role: User"}</p>

      <motion.button
        className="mt-6 bg-red-500 px-6 py-3 rounded-lg text-white font-semibold hover:scale-105 transition"
        whileHover={{ scale: 1.1 }}
        onClick={handleLogout} // ✅ Calls fixed logout function
      >
        Logout
      </motion.button>
    </div>
  );
}
