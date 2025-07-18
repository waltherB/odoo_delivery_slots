// Translation system for Delivery Carrier Booking
(function() {
    'use strict';
    
    // Translation dictionary - will be populated by Odoo's translation system
    window.DeliveryBookingTranslations = {
        'en': {
            'schedule_delivery': 'Schedule Your Delivery',
            'delivery_date': 'Delivery Date',
            'select_delivery_date': 'Select delivery date...',
            'time_slot': 'Time Slot',
            'select_time_slot': 'Select time slot...',
            'loading': 'Loading...',
            'error_loading_slots': 'Error loading slots',
            'delivery_scheduled_for': 'Delivery scheduled for',
            'at': 'at'
        },
        'da': {
            'schedule_delivery': 'Planlæg din levering',
            'delivery_date': 'Leveringsdato',
            'select_delivery_date': 'Vælg leveringsdato...',
            'time_slot': 'Tidspunkt',
            'select_time_slot': 'Vælg tidspunkt...',
            'loading': 'Indlæser...',
            'error_loading_slots': 'Fejl ved indlæsning af tidspunkter',
            'delivery_scheduled_for': 'Levering planlagt til',
            'at': 'kl.'
        }
    };
    
    // Get current language from Odoo
    function getCurrentLanguage() {
        // Method 1: Try to get language injected by template
        if (window.odooDeliveryBookingLang) {
            var injectedLang = window.odooDeliveryBookingLang.split('_')[0];
            console.log('Language from template injection:', injectedLang);
            return injectedLang;
        }
        
        // Method 2: Try to get language from Odoo's session
        if (window.odoo && window.odoo.session_info && window.odoo.session_info.user_context) {
            var lang = window.odoo.session_info.user_context.lang;
            if (lang) {
                console.log('Language from Odoo session:', lang);
                return lang.split('_')[0]; // Convert 'da_DK' to 'da'
            }
        }
        
        // Method 3: Try to get from document lang attribute
        if (document.documentElement.lang) {
            var docLang = document.documentElement.lang.split('-')[0];
            console.log('Language from document:', docLang);
            return docLang;
        }
        
        // Method 4: Try to get from HTML lang attribute
        var htmlLang = document.querySelector('html').getAttribute('lang');
        if (htmlLang) {
            console.log('Language from HTML:', htmlLang);
            return htmlLang.split('-')[0];
        }
        
        // Method 5: Fallback to browser language
        var browserLang = navigator.language || navigator.userLanguage;
        if (browserLang) {
            console.log('Language from browser:', browserLang);
            return browserLang.split('-')[0]; // Convert 'da-DK' to 'da'
        }
        
        // Default to English
        console.log('Language defaulting to English');
        return 'en';
    }
    
    // Translation function
    window._t = function(key) {
        var lang = getCurrentLanguage();
        var translations = window.DeliveryBookingTranslations[lang] || window.DeliveryBookingTranslations['en'];
        var result = translations[key] || key;
        
        // Debug logging (only in debug mode)
        if (window.location.search.includes('debug') || localStorage.getItem('delivery_booking_debug')) {
            console.log('Translation:', key, '->', result, '(lang:', lang, ')');
        }
        
        return result;
    };
    
    // Helper function to manually set language for testing
    window.setDeliveryBookingLanguage = function(lang) {
        localStorage.setItem('delivery_booking_lang', lang);
        console.log('Delivery booking language set to:', lang);
        // Reload the page to apply changes
        window.location.reload();
    };
    
    // Debug function to test all translations
    window.testDeliveryBookingTranslations = function() {
        var keys = ['schedule_delivery', 'delivery_date', 'select_delivery_date', 'time_slot', 'select_time_slot'];
        console.log('=== Testing Delivery Booking Translations ===');
        console.log('Current language:', getCurrentLanguage());
        keys.forEach(function(key) {
            console.log(key + ':', _t(key));
        });
    };
    
    // Check for manually set language
    var manualLang = localStorage.getItem('delivery_booking_lang');
    if (manualLang) {
        console.log('Using manually set language:', manualLang);
        // Override getCurrentLanguage for manual setting
        var originalGetCurrentLanguage = getCurrentLanguage;
        getCurrentLanguage = function() {
            return manualLang;
        };
    }
    
})();