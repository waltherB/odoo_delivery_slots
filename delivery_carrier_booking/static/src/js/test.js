console.log('=== DELIVERY BOOKING TEST SCRIPT LOADED ===');

// Try to run immediately
(function() {
    console.log('=== IMMEDIATE EXECUTION ===');
    
    // Try multiple ways to ensure it runs
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTest);
    } else {
        initTest();
    }
    
    // Also try with window load
    window.addEventListener('load', initTest);
    
    function initTest() {
        console.log('=== TEST INIT FUNCTION CALLED ===');
        
        // Add a visible element to the page
        var testDiv = document.createElement('div');
        testDiv.innerHTML = 'DELIVERY BOOKING JS LOADED!';
        testDiv.style.cssText = 'position: fixed; top: 0; left: 0; background: red; color: white; padding: 10px; z-index: 9999; font-weight: bold;';
        testDiv.id = 'delivery-booking-test';
        
        document.body.appendChild(testDiv);
        
        console.log('=== TEST ELEMENT ADDED TO PAGE ===');
        
        // Remove after 5 seconds
        setTimeout(function() {
            var el = document.getElementById('delivery-booking-test');
            if (el) el.remove();
        }, 5000);
    }
})();