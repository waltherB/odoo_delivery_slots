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
        // Try to get language from Odoo's session
        if (window.odoo && window.odoo.session_info && window.odoo.session_info.user_context) {
            var lang = window.odoo.session_info.user_context.lang;
            if (lang) {
                return lang.split('_')[0]; // Convert 'da_DK' to 'da'
            }
        }
        
        // Fallback to browser language
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