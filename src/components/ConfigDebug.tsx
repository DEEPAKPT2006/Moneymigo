import React from 'react';
import { firebaseConfig, isFirebaseConfigured, isAuthEnabled, isFirestoreEnabled } from '../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export const ConfigDebug: React.FC = () => {
  const isConfigured = isFirebaseConfigured();
  const authReady = isAuthEnabled();
  const firestoreReady = isFirestoreEnabled();

  // Only show in development
  if (!import.meta.env?.DEV) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 max-h-96 overflow-auto">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          🔍 Configuration Debug
          <Badge variant={isConfigured ? "default" : "destructive"}>
            {isConfigured ? 'Configured' : 'Demo Mode'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Firebase Config:</strong>
          <div className="bg-muted p-2 rounded mt-1 font-mono">
            <div>apiKey: {firebaseConfig.apiKey.substring(0, 10)}...</div>
            <div>projectId: {firebaseConfig.projectId}</div>
            <div>authDomain: {firebaseConfig.authDomain}</div>
          </div>
        </div>
        
        <div>
          <strong>Service Status:</strong>
          <div className="bg-muted p-2 rounded mt-1 text-xs">
            <div>Firebase Core: {isConfigured ? '✅ Connected' : '❌ Not Connected'}</div>
            <div>Authentication: {authReady ? '✅ Enabled' : '❌ Not Enabled'}</div>
            <div>Firestore Database: {firestoreReady ? '✅ Enabled' : '❌ Not Enabled'}</div>
            <div>Project: {firebaseConfig.projectId}</div>
          </div>
        </div>
        
        <div className={`rounded p-2 text-xs ${
          authReady && firestoreReady ? 
          'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' :
          'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
        }`}>
          <strong>MoneyMigo Status:</strong>
          <div>{isConfigured ? '✅' : '⚠️'} Firebase Backend {isConfigured ? 'Connected' : 'Needs Setup'}</div>
          <div>{authReady ? '✅' : '⚠️'} Authentication {authReady ? 'Ready' : 'Needs Setup'}</div>
          <div>{firestoreReady ? '✅' : '⚠️'} Database {firestoreReady ? 'Ready' : 'Needs Setup'}</div>
          <div>✅ AI Features Enabled</div>
        </div>
      </CardContent>
    </Card>
  );
};