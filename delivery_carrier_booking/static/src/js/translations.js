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
        // Method 1: Check HTML lang attribute (website language) - most reliable for website
        var htmlLang = document.documentElement.getAttribute('lang');
        if (htmlLang) {
            var lang = htmlLang.split('-')[0].split('_')[0]; // Convert 'da-DK' or 'da_DK' to 'da'
            // Only return if it's a supported language
            if (lang === 'da' || lang === 'en') {
                return lang;
            }
        }
        
        // Method 2: Check body data-lang attribute
        var bodyLang = document.body.getAttribute('data-lang');
        if (bodyLang) {
            var lang = bodyLang.split('-')[0].split('_')[0];
            if (lang === 'da' || lang === 'en') {
                return lang;
            }
        }
        
        // Method 3: Check URL for language prefix (e.g., /da/, /en/)
        var urlMatch = window.location.pathname.match(/^\/([a-z]{2})(?:[_-][A-Z]{2})?\//);
        if (urlMatch) {
            var lang = urlMatch[1];
            if (lang === 'da' || lang === 'en') {
                return lang;
            }
        }
        
        // Method 4: Try to get language injected by template (if available)
        if (window.odooDeliveryBookingLang && window.odooDeliveryBookingLang !== 'null') {
            var injectedLang = window.odooDeliveryBookingLang.split('_')[0];
            if (injectedLang === 'da' || injectedLang === 'en') {
                return injectedLang;
            }
        }
        
        // Method 5: Try to get language from Odoo's session
        if (window.odoo && window.odoo.session_info && window.odoo.session_info.user_context) {
            var lang = window.odoo.session_info.user_context.lang;
            if (lang) {
                var sessionLang = lang.split('_')[0]; // Convert 'da_DK' to 'da'
                if (sessionLang === 'da' || sessionLang === 'en') {
                    return sessionLang;
                }
            }
        }
        
        // Method 6: Check browser language
        var browserLang = navigator.language || navigator.userLanguage;
        if (browserLang) {
            var lang = browserLang.split('-')[0].split('_')[0];
            if (lang === 'da' || lang === 'en') {
                return lang;
            }
        }
        
        // Method 7: Only check for Danish text if no other method worked (last resort)
        var pageText = document.body.textContent || '';
        if (pageText.includes('Leveringsmetode') && pageText.includes('Betalingsmetode') && pageText.includes('Ordrebekræftelse')) {
            return 'da';
        }
        
        // Default to English if nothing else works
        return 'en';
    }
    
    // Translation function
    window._t = function(key) {
        var lang = getCurrentLanguage();
        var translations = window.DeliveryBookingTranslations[lang] || window.DeliveryBookingTranslations['en'];
        return translations[key] || key;
    };
    

    
})();