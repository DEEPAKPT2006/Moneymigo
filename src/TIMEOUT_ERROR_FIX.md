# Fix "getPage timeout" Error

## 🚨 Quick Fix for Message getPage Timeout Errors

The error `Message getPage (id: 3) response timed out after 30000ms` is typically related to development environment communication issues, not your application code.

### What This Error Means:
This error occurs when the browser's internal messaging system (between tabs, extensions, service workers, or development tools) times out while trying to communicate.

### Immediate Solutions:

#### 1. **Hard Refresh (Most Common Fix)**
- **Windows/Linux:** `Ctrl + F5` or `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`
- This clears cached resources and reloads everything fresh

#### 2. **Clear Browser Cache**
- Open Developer Tools (`F12`)
- Right-click the refresh button
- Select "Empty Cache and Hard Reload"

#### 3. **Disable Browser Extensions**
- Open an incognito/private window
- If the error doesn't occur, a browser extension is likely the cause
- Disable extensions one by one to identify the culprit

#### 4. **Clear All Browser Data**
```javascript
// Run this in the browser console:
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

#### 5. **Service Worker Cleanup**
```javascript
// Run this in the browser console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
  location.reload();
});
```

### Development Environment Fixes:

#### 6. **Restart Development Server**
```bash
# Stop the server (Ctrl+C) and restart
npm run dev
# or
yarn dev
```

#### 7. **Clear Node.js Cache**
```bash
# Clear npm cache
npm start -- --reset-cache

# Or delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 8. **Check for Port Conflicts**
- Make sure no other applications are using the same port
- Try running on a different port: `npm run dev -- --port 3001`

### Browser-Specific Fixes:

#### **Chrome/Edge:**
- Clear browsing data: `chrome://settings/clearBrowserData`
- Disable hardware acceleration: `chrome://settings/system`
- Reset Chrome: `chrome://settings/reset`

#### **Firefox:**
- Clear everything: `about:preferences#privacy`
- Refresh Firefox: `about:support` → "Refresh Firefox"

#### **Safari:**
- Clear website data: Safari → Preferences → Privacy → Manage Website Data
- Disable extensions: Safari → Preferences → Extensions

### Advanced Troubleshooting:

#### 9. **Check Network Issues**
- Disable VPN if using one
- Try a different network
- Check if corporate firewall is blocking resources

#### 10. **Browser Extension Conflicts**
Common problematic extensions:
- Ad blockers (temporarily disable)
- Developer tools extensions
- React DevTools (update to latest version)
- Privacy-focused extensions

#### 11. **Development Tools Issues**
- Close and reopen Developer Tools
- Try different browsers (Chrome, Firefox, Edge)
- Update your browser to the latest version

### Prevention:

#### **Best Practices:**
- Regularly clear browser cache during development
- Keep browser and extensions updated
- Use incognito mode for testing
- Avoid having too many tabs open during development

#### **Project Setup:**
- Add error boundaries (already implemented in MoneyMigo)
- Use proper timeout handling in API calls
- Implement service worker cleanup utilities

### For MoneyMigo Specifically:

The app now includes:
- ✅ Enhanced error boundaries that catch timeout errors
- ✅ Development server helper that detects connection issues
- ✅ Service worker cleanup utilities
- ✅ Automatic error recovery mechanisms
- ✅ Clear user guidance when issues occur

### When to Worry:

**Don't worry if:**
- Error occurs occasionally during development
- App still functions normally
- Error disappears after refresh

**Do investigate if:**
- Error occurs consistently in production
- App becomes completely unusable
- Error spreads to other websites/applications

### Emergency Reset:

If nothing else works:
1. Close all browser windows
2. Clear all browser data
3. Restart the browser
4. Restart your development server
5. Open the app in a fresh browser window

---

**99% of the time, a hard refresh (`Ctrl + F5`) will fix this error!**