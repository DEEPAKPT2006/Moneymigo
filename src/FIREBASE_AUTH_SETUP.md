# Firebase Authentication Setup Guide

## 🔥 Quick Fix for "auth/configuration-not-found" Error

The error you're seeing means Firebase Authentication needs to be enabled in your Firebase project. This is a quick 2-minute fix!

### Step-by-Step Solution:

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/project/studio-4094080917-c3f91/authentication/users
   - Or click the "Open Firebase Console" button in the app

2. **Enable Authentication**
   - Click **"Get Started"** button in the Authentication section
   - This initializes Firebase Authentication for your project

3. **Enable Sign-in Methods**
   - Go to the **"Sign-in method"** tab
   - Enable **"Email/Password"** provider
   - Click **"Enable"** and **"Save"**

4. **Optional: Enable Google Sign-in**
   - In the same "Sign-in method" tab
   - Enable **"Google"** provider if you want Google sign-in

5. **Test the Fix**
   - Return to your MoneyMigo app
   - Refresh the page
   - Authentication should now work!

### What This Enables:

✅ **User Registration & Login**
- Create accounts with email/password
- Secure user authentication
- Session management

✅ **Data Sync**
- User data stored in Firebase
- Sync across multiple devices
- Real-time updates

✅ **Security**
- Secure user authentication
- Protected user data
- Firebase security rules

### Current Status:

- ✅ Firebase Project: Connected (`studio-4094080917-c3f91`)
- ✅ Firestore Database: Working
- ✅ API Keys: Configured
- ❌ Authentication: **Needs to be enabled** (this is the only missing piece!)

### Don't Want Authentication?

That's totally fine! MoneyMigo works perfectly in **Demo Mode**:
- All features available
- Data stored locally on your device
- No account needed
- Perfect for testing and personal use

---

**Need Help?** The authentication setup is just one click in Firebase Console - it takes less than 30 seconds!