// Test the fix - Run this in browser console (F12)

console.clear();
console.log("🔧 Testing Supplier Profile Fix\n");

// 1. Decode current token
const token = localStorage.getItem("token");
if (token) {
  const parts = token.split(".");
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(atob(parts[1]));
      console.log("✅ Current User:");
      console.log("   User ID:", payload.id || payload.userId);
      console.log("   Username:", payload.username);
      console.log("   Role:", payload.role);

      if (payload.role !== "supplier") {
        console.log("\n⚠️  Warning: You're not logged in as a supplier!");
        console.log("   Please login with a supplier account (user ID 4 or 7)");
      }
    } catch (e) {
      console.log("❌ Cannot decode token");
    }
  }
}

// 2. Test the API
console.log("\n🧪 Testing API...");
fetch("http://localhost:3004/api/suppliers/profile/me", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then(async (response) => {
    const data = await response.json();
    console.log("   Status:", response.status);
    console.log("   Response:", data);

    if (response.ok) {
      console.log("\n✅ SUCCESS! Profile loaded:");
      console.log("   Supplier ID:", data.data.id);
      console.log("   Name:", data.data.name);
      console.log("   Email:", data.data.email);
      console.log(
        "\n🎉 The fix is working! Refresh the page to see your profile."
      );
    } else {
      console.log("\n❌ Still not working. Response:", data);
    }
  })
  .catch((err) => console.log("❌ Error:", err.message));
