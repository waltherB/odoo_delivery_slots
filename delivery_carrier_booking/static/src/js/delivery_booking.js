console.log('=== DELIVERY BOOKING JS LOADED ===');

// Simple approach without complex widget system
(function() {
    'use strict';
    
    console.log('=== DELIVERY BOOKING SCRIPT STARTING ===');
    
    // Only run on payment page
    if (!window.location.pathname.includes('/shop/payment')) {
        console.log('=== NOT ON PAYMENT PAGE, EXITING ===');
        return;
    }
    
    console.log('=== ON PAYMENT PAGE, INITIALIZING ===');
    
    // Wait for page to load - handle both cases
    function initDeliveryBooking() {
        console.log('=== INITIALIZING DELIVERY BOOKING ===');
        
        // Inject booking section
        injectBookingSection();
        
        // Set up event listeners
        setupEventListeners();
        
        // Check initial state
        checkInitialCarrier();
    }
    
    if (document.readyState === 'loading') {
        console.log('=== DOM STILL LOADING, ADDING EVENT LISTENER ===');
        document.addEventListener('DOMContentLoaded', initDeliveryBooking);
    } else {
        console.log('=== DOM ALREADY LOADED, INITIALIZING NOW ===');
        initDeliveryBooking();
    }
    
    function injectBookingSection() {
        if (document.querySelector('.js_delivery_booking')) {
            console.log('=== BOOKING SECTION ALREADY EXISTS ===');
            return;
        }
        
        var bookingHTML = `
            <div class="js_delivery_booking" style="display: none; margin: 15px 0;">
                <div class="card">
                    <div class="card-header" style="background-color: #f8f9fa;">
                        <h6 class="mb-0">
                            <i class="fa fa-calendar me-2"></i>
                            Schedule Your Delivery
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="delivery_date" class="form-label">Delivery Date</label>
                                    <select id="delivery_date" name="delivery_date" class="form-control">
                                        <option value="">Select delivery date...</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="delivery_time_slot" class="form-label">Time Slot</label>
                                    <select id="delivery_time_slot" name="delivery_time_slot" class="form-control">
                                        <option value="">Select time slot...</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Find the delivery method section and inject after it
        var deliverySection = document.querySelector('div[name="delivery_method"]') ||
                             document.querySelector('.o_delivery_carrier_select') ||
                             document.querySelector('input[name="carrier_id"]')?.closest('div') ||
                             document.querySelector('label:contains("LEVERINGSMETODE")')?.closest('div');
        
        if (deliverySection) {
            console.log('=== INJECTING BOOKING SECTION AFTER DELIVERY METHODS ===');
            deliverySection.insertAdjacentHTML('afterend', bookingHTML);
        } else {
            // Fallback: try to find payment method section and inject before it
            var paymentSection = document.querySelector('div[name="payment_method"]') ||
                               document.querySelector('.o_payment_form') ||
                               document.querySelector('#payment_method');
            
            if (paymentSection) {
                console.log('=== INJECTING BOOKING SECTION BEFORE PAYMENT METHODS ===');
                paymentSection.insertAdjacentHTML('beforebegin', bookingHTML);
            } else {
                console.error('=== COULD NOT FIND SUITABLE INJECTION POINT ===');
            }
        }
    }
    
    function setupEventListeners() {
        console.log('=== SETTING UP EVENT LISTENERS ===');
        
        // Hook into Odoo's AJAX system to listen for update_carrier calls
        var originalXHROpen = XMLHttpRequest.prototype.open;
        var originalXHRSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url) {
            this._url = url;
            return originalXHROpen.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.send = function(data) {
            var xhr = this;
            
            // Only listen to update_carrier, NOT update_carrier_booking (to avoid loops)
            if (this._url && this._url.includes('/shop/update_carrier') && 
                !this._url.includes('/shop/update_carrier_booking')) {
                console.log('=== DETECTED UPDATE_CARRIER CALL ===');
                
                xhr.addEventListener('load', function() {
                    setTimeout(function() {
                        console.log('=== UPDATE_CARRIER COMPLETED, UPDATING BOOKING ===');
                        var currentCarrier = getCurrentCarrierId();
                        if (currentCarrier) {
                            repositionAndUpdateBooking(currentCarrier);
                        } else {
                            hideBookingSection();
                        }
                    }, 200);
                });
            }
            
            return originalXHRSend.apply(this, arguments);
        };
        
        // Also hook into fetch API (in case Odoo uses it)
        var originalFetch = window.fetch;
        window.fetch = function() {
            var args = arguments;
            return originalFetch.apply(this, arguments).then(function(response) {
                // Only listen to update_carrier, NOT update_carrier_booking (to avoid loops)
                if (args[0] && args[0].includes && args[0].includes('/shop/update_carrier') &&
                    !args[0].includes('/shop/update_carrier_booking')) {
                    setTimeout(function() {
                        console.log('=== FETCH UPDATE_CARRIER COMPLETED, UPDATING BOOKING ===');
                        var currentCarrier = getCurrentCarrierId();
                        if (currentCarrier) {
                            repositionAndUpdateBooking(currentCarrier);
                        } else {
                            hideBookingSection();
                        }
                    }, 200);
                }
                return response;
            });
        };
        
        // Listen for date changes
        document.addEventListener('change', function(e) {
            if (e.target.id === 'delivery_date') {
                console.log('=== DATE CHANGED:', e.target.value, '===');
                var carrierId = getCurrentCarrierId();
                if (e.target.value && carrierId) {
                    loadTimeSlots(e.target.value, carrierId);
                }
            }
        });
        
        // Fallback: also listen for direct clicks (in case AJAX doesn't fire)
        document.addEventListener('click', function(e) {
            if (e.target.closest('input[name="carrier_id"]') || 
                e.target.closest('label[for*="carrier"]')) {
                setTimeout(function() {
                    console.log('=== FALLBACK: CARRIER CLICK DETECTED ===');
                    var currentCarrier = getCurrentCarrierId();
                    if (currentCarrier) {
                        repositionAndUpdateBooking(currentCarrier);
                    }
                }, 500);
            }
        });
    }
    
    function getCurrentCarrierId() {
        var checkedCarrier = document.querySelector('input[name="carrier_id"]:checked') ||
                            document.querySelector('input[type="radio"]:checked');
        
        console.log('=== CURRENT CARRIER:', checkedCarrier ? checkedCarrier.value : 'none', '===');
        return checkedCarrier ? checkedCarrier.value : null;
    }
    
    function repositionAndUpdateBooking(carrierId) {
        console.log('=== REPOSITIONING AND UPDATING BOOKING FOR CARRIER:', carrierId, '===');
        
        // Remove existing booking section
        var existingBooking = document.querySelector('.js_delivery_booking');
        if (existingBooking) {
            console.log('=== REMOVING EXISTING BOOKING SECTION ===');
            existingBooking.remove();
        }
        
        // Find the selected carrier's container - try multiple selectors
        var selectedCarrierInput = document.querySelector('input[name="carrier_id"][value="' + carrierId + '"]') ||
                                  document.querySelector('input[value="' + carrierId + '"]') ||
                                  document.querySelector('input[name="carrier_id"]:checked');
        
        console.log('=== LOOKING FOR CARRIER INPUT WITH VALUE:', carrierId, '===');
        console.log('=== FOUND CARRIER INPUT:', selectedCarrierInput, '===');
        
        if (selectedCarrierInput) {
            var carrierContainer = selectedCarrierInput.closest('.o_delivery_carrier_select') ||
                                  selectedCarrierInput.closest('label') ||
                                  selectedCarrierInput.closest('div');
            
            if (carrierContainer) {
                console.log('=== FOUND CARRIER CONTAINER, INJECTING BOOKING SECTION ===');
                // Inject booking section after the selected carrier
                var bookingHTML = `
                    <div class="js_delivery_booking" style="display: none; margin: 15px 0;">
                        <div class="card">
                            <div class="card-header" style="background-color: #f8f9fa;">
                                <h6 class="mb-0">
                                    <i class="fa fa-calendar me-2"></i>
                                    Schedule Your Delivery
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="delivery_date" class="form-label">Delivery Date</label>
                                            <select id="delivery_date" name="delivery_date" class="form-control">
                                                <option value="">Select delivery date...</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="delivery_time_slot" class="form-label">Time Slot</label>
                                            <select id="delivery_time_slot" name="delivery_time_slot" class="form-control">
                                                <option value="">Select time slot...</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                carrierContainer.insertAdjacentHTML('afterend', bookingHTML);
                console.log('=== BOOKING SECTION REPOSITIONED AFTER SELECTED CARRIER ===');
                
                // Verify the section was created
                var newBookingSection = document.querySelector('.js_delivery_booking');
                if (newBookingSection) {
                    console.log('=== NEW BOOKING SECTION CREATED SUCCESSFULLY ===');
                } else {
                    console.log('=== ERROR: NEW BOOKING SECTION NOT FOUND AFTER CREATION ===');
                }
            } else {
                console.log('=== CARRIER CONTAINER NOT FOUND ===');
            }
        } else {
            console.log('=== SELECTED CARRIER INPUT NOT FOUND FOR CARRIER:', carrierId, '===');
            console.log('=== TRYING FALLBACK INJECTION ===');
            
            // Fallback: inject after the first delivery method or before payment methods
            var fallbackContainer = document.querySelector('.o_delivery_carrier_select') ||
                                   document.querySelector('input[name="carrier_id"]')?.closest('div') ||
                                   document.querySelector('div[name="payment_method"]');
            
            if (fallbackContainer) {
                console.log('=== FOUND FALLBACK CONTAINER, INJECTING BOOKING SECTION ===');
                var bookingHTML = `
                    <div class="js_delivery_booking" style="display: none; margin: 15px 0;">
                        <div class="card">
                            <div class="card-header" style="background-color: #f8f9fa;">
                                <h6 class="mb-0">
                                    <i class="fa fa-calendar me-2"></i>
                                    Schedule Your Delivery
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="delivery_date" class="form-label">Delivery Date</label>
                                            <select id="delivery_date" name="delivery_date" class="form-control">
                                                <option value="">Select delivery date...</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="delivery_time_slot" class="form-label">Time Slot</label>
                                            <select id="delivery_time_slot" name="delivery_time_slot" class="form-control">
                                                <option value="">Select time slot...</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                fallbackContainer.insertAdjacentHTML('afterend', bookingHTML);
                console.log('=== BOOKING SECTION INJECTED VIA FALLBACK ===');
            } else {
                console.log('=== NO FALLBACK CONTAINER FOUND ===');
            }
        }
        
        // Now check if booking should be visible for this carrier
        updateBookingVisibility(carrierId);
    }
    
    function checkInitialCarrier() {
        var carrierId = getCurrentCarrierId();
        console.log('=== INITIAL CARRIER CHECK, FOUND:', carrierId, '===');
        if (carrierId) {
            console.log('=== CALLING UPDATE BOOKING VISIBILITY FOR INITIAL CARRIER ===');
            updateBookingVisibility(carrierId);
        } else {
            console.log('=== NO INITIAL CARRIER FOUND, NOT HIDING SECTION ===');
            // Don't hide on initial load if no carrier is found
            // hideBookingSection();
        }
    }
    
    var isUpdatingBooking = false; // Flag to prevent infinite loops
    
    function updateBookingVisibility(carrierId) {
        console.log('=== UPDATING BOOKING VISIBILITY FOR CARRIER:', carrierId, '===');
        
        if (!carrierId) {
            console.log('=== NO CARRIER ID, HIDING BOOKING ===');
            hideBookingSection();
            return;
        }
        
        if (isUpdatingBooking) {
            console.log('=== ALREADY UPDATING BOOKING, SKIPPING TO PREVENT LOOP ===');
            return;
        }
        
        isUpdatingBooking = true;
        
        // Check if booking is enabled for this carrier
        
        // Check if booking is enabled for this carrier
        
        // Make AJAX call to check if booking is enabled
        fetch('/shop/update_carrier_booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'call',
                params: {
                    carrier_id: carrierId
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.result && data.result.booking_enabled) {
                showBookingSection();
                if (data.result.delivery_dates) {
                    updateDeliveryDates(data.result.delivery_dates);
                }
            } else {
                hideBookingSection();
            }
        })
        .catch(error => {
            console.error('=== ERROR CHECKING CARRIER BOOKING:', error, '===');
            hideBookingSection();
        })
        .finally(() => {
            isUpdatingBooking = false;
        });
    }
    
    function showBookingSection() {
        var bookingSection = document.querySelector('.js_delivery_booking');
        if (bookingSection) {
            bookingSection.style.display = 'block';
            console.log('=== SHOWING BOOKING SECTION ===');
        } else {
            console.log('=== BOOKING SECTION NOT FOUND WHEN TRYING TO SHOW ===');
        }
    }
    
    function hideBookingSection() {
        var bookingSection = document.querySelector('.js_delivery_booking');
        if (bookingSection) {
            bookingSection.style.display = 'none';
            console.log('=== HIDING BOOKING SECTION ===');
        } else {
            console.log('=== BOOKING SECTION NOT FOUND WHEN TRYING TO HIDE ===');
        }
    }
    
    function updateDeliveryDates(dates) {
        var dateSelect = document.querySelector('#delivery_date');
        if (dateSelect) {
            dateSelect.innerHTML = '<option value="">Select delivery date...</option>';
            dates.forEach(function(dateOption) {
                var option = document.createElement('option');
                option.value = dateOption.value;
                option.textContent = dateOption.label;
                dateSelect.appendChild(option);
            });
        }
    }
    
    function loadTimeSlots(selectedDate, carrierId) {
        var timeSelect = document.querySelector('#delivery_time_slot');
        if (!timeSelect) return;
        
        timeSelect.innerHTML = '<option value="">Loading...</option>';
        
        fetch('/shop/get_time_slots', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'call',
                params: {
                    delivery_date: selectedDate,
                    carrier_id: carrierId
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            timeSelect.innerHTML = '<option value="">Select time slot...</option>';
            if (data.result && data.result.time_slots) {
                data.result.time_slots.forEach(function(slot) {
                    var option = document.createElement('option');
                    option.value = slot;
                    option.textContent = slot;
                    timeSelect.appendChild(option);
                });
                console.log('Loaded time slots:', data.result.time_slots.length);
            }
        })
        .catch(error => {
            console.error('Error loading time slots:', error);
            timeSelect.innerHTML = '<option value="">Error loading slots</option>';
        });
    }
    
})();