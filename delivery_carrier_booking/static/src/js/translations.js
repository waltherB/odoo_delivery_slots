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
            return injectedLang;
        }
        
        // Method 2: Try to get language from Odoo's session
        if (window.odoo && window.odoo.session_info && window.odoo.session_info.user_context) {
            var lang = window.odoo.session_info.user_context.lang;
            if (lang) {
                return lang.split('_')[0]; // Convert 'da_DK' to 'da'
            }
        }
        
        // Method 3: Check if page language is Danish (common in Danish Odoo installations)
        var bodyLang = document.body.getAttribute('data-lang') || 
                      document.documentElement.getAttribute('lang') ||
                      document.querySelector('html').getAttribute('lang');
        if (bodyLang && bodyLang.toLowerCase().includes('da')) {
            return 'da';
        }
        
        // Method 4: Check for Danish text in the page (heuristic)
        var pageText = document.body.textContent || '';
        if (pageText.includes('Leveringsmetode') || pageText.includes('Betalingsmetode') || pageText.includes('Ordrebekræftelse')) {
            return 'da';
        }
        
        // Method 5: Fallback to browser language
        var browserLang = navigator.language || navigator.userLanguage;
        if (browserLang) {
            return browserLang.split('-')[0]; // Convert 'da-DK' to 'da'
        }
        
        // Default to English
        return 'en';
    }
    
    // Translation function
    window._t = function(key) {
        var lang = getCurrentLanguage();
        var translations = window.DeliveryBookingTranslations[lang] || window.DeliveryBookingTranslations['en'];
        return translations[key] || key;
    };
    

    
})();