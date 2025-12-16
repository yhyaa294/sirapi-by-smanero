"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

export default function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setPermission(Notification.permission);
      checkSubscription();
    } else {
      setIsSupported(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) return;

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      await subscribeToPush();
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // In production, this would come from your server
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      // Send subscription to server
      await fetch('/api/subscribe-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      setSubscription(subscription);
    } catch (error) {
      console.error('Error subscribing to push:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      
      // Remove subscription from server
      await fetch('/api/unsubscribe-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });

      setSubscription(null);
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  const testNotification = async () => {
    if (!isSupported || permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    registration.showNotification('SmartAPD Test', {
      body: 'This is a test notification from SmartAPD!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [200, 100, 200],
      tag: 'test-notification',
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/view.png'
        }
      ]
    });
  };

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500">
        Push notifications not supported in this browser
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Push Notifications</h3>
          <p className="text-sm text-gray-600">
            {permission === 'granted' ? '✅ Enabled' : 
             permission === 'denied' ? '❌ Blocked' : '⚠️ Not set'}
          </p>
        </div>
        
        {permission === 'granted' ? (
          <button
            onClick={subscription ? unsubscribeFromPush : subscribeToPush}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <BellOff className="w-4 h-4" />
            {subscription ? 'Disable' : 'Enable'}
          </button>
        ) : (
          <button
            onClick={requestPermission}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Bell className="w-4 h-4" />
            Enable Notifications
          </button>
        )}
      </div>

      {permission === 'granted' && (
        <button
          onClick={testNotification}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Send Test Notification
        </button>
      )}
    </div>
  );
}
