/*
    Pulse Local - Telegram Mini App
    Telegram Web App Integration
    
    Description: Telegram Web App API integration and utilities
    Author: Developer
    Date: 2025-06-26
*/

// Telegram Web App utilities
const TelegramApp = {
    // Check if running inside Telegram
    isRunningInTelegram() {
        return window.Telegram && window.Telegram.WebApp;
    },

    // Initialize Telegram Web App
    init() {
        if (this.isRunningInTelegram()) {
            const tg = window.Telegram.WebApp;
            
            // Expand the app to full height
            tg.expand();
            
            // Enable closing confirmation
            tg.enableClosingConfirmation();
            
            console.log('Telegram Web App initialized');
            console.log('User data:', tg.initDataUnsafe.user);
            
            // Telegram Web App specific initialization will be added here
        } else {
            console.log('Running outside Telegram - development mode');
        }
    },

    // Get Telegram user data
    getUserData() {
        if (this.isRunningInTelegram()) {
            return window.Telegram.WebApp.initDataUnsafe.user;
        }
        return null;
    },

    // Additional Telegram Web App methods will be added here
};

// Initialize Telegram integration when script loads
TelegramApp.init();
