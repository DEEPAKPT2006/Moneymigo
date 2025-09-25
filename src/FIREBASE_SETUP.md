# Firebase Setup Guide for MoneyMigo

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `moneymigo` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In the Firebase console, go to **Authentication** > **Sign-in method**
2. Enable the following sign-in providers:
   - **Email/Password**: Click the toggle to enable
   - **Google**: Click the toggle to enable and configure
   - **Anonymous**: Click the toggle to enable (for guest users)

## 3. Set up Firestore Database

1. Go to **Firestore Database** in the Firebase console
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

## 4. Configure Security Rules

Replace the default Firestore rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /transactions/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /budgets/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /goals/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /userPreferences/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 5. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Enter app nickname: `moneymigo-web`
5. Click "Register app"
6. Copy the configuration object

## 6. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Replace the placeholder values in `.env` with your actual Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Important**: Add `.env` to your `.gitignore` to keep your API keys secure:
   ```
   # Environment variables
   .env
   .env.local
   ```

## 7. Enable Required APIs

Make sure these APIs are enabled in your Google Cloud Console:
- Firebase Authentication API
- Cloud Firestore API
- Identity and Access Management (IAM) API

## 8. Testing

After setup:
1. Restart your development server: `npm run dev`
2. The Firebase setup notice should disappear
3. Create a test account or sign in as guest
4. Add some transactions to verify database connectivity
5. Check the Firestore console to see if data is being stored

## Demo Mode

If Firebase is not configured, MoneyMigo automatically runs in **Demo Mode**:
- ✅ All features work normally
- ✅ Data is stored in browser localStorage
- ❌ No cloud sync or multi-device access
- ❌ No user authentication
- ❌ Data is lost when browser data is cleared

You'll see a blue notice banner when running in demo mode.

## 9. Production Considerations

For production deployment:

1. **Update Firestore Rules**: Make them more restrictive
2. **Configure Firebase Hosting** (optional)
3. **Set up proper authentication domains**
4. **Enable App Check** for additional security
5. **Set up monitoring and analytics**

## Troubleshooting

### Common Issues:

1. **Permission Denied**: Check Firestore security rules
2. **Authentication Errors**: Verify auth configuration and enabled sign-in methods
3. **Network Errors**: Check if Firebase APIs are enabled
4. **Import Errors**: Ensure Firebase SDK is properly installed

### Debug Mode:

Enable Firebase debug mode by adding this to your app:
```typescript
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';

// Only in development
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

## Data Structure

The app creates the following collections in Firestore:

- **transactions**: User financial transactions
- **budgets**: User budget limits
- **goals**: User financial goals  
- **userPreferences**: User settings and custom categories

Each document includes a `userId` field to associate data with the authenticated user.