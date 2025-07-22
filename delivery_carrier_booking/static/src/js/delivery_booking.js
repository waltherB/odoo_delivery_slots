// Simple approach without complex widget system
(function() {
    'use strict';
    
    // Only run on payment page
    if (!window.location.pathname.includes('/shop/payment')) {
        return;
    }
    
    // Wait for page to load - handle both cases
    function initDeliveryBooking() {
        // Inject booking section
        injectBookingSection();
        
        // Set up event listeners
        setupEventListeners();
        
        // Check initial state
        checkInitialCarrier();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDeliveryBooking);
    } else {
        initDeliveryBooking();
    }
    
    // Function to generate translated booking HTML
    function generateBookingHTML() {
        return `
            <div class="js_delivery_booking" style="display: none; margin: 15px 0;">
                <div class="card">
                    <div class="card-header" style="background-color: #f8f9fa;">
                        <h6 class="mb-0">
                            <i class="fa fa-calendar me-2"></i>
                            ` + _t('schedule_delivery') + `
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="delivery_date" class="form-label">` + _t('delivery_date') + `</label>
                                    <select id="delivery_date" name="delivery_date" class="form-control">
                                        <option value="">` + _t('select_delivery_date') + `</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="delivery_time_slot" class="form-label">` + _t('time_slot') + `</label>
                                    <select id="delivery_time_slot" name="delivery_time_slot" class="form-control">
                                        <option value="">` + _t('select_time_slot') + `</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function injectBookingSection() {
        if (document.querySelector('.js_delivery_booking')) {
            return;
        }
        
        var bookingHTML = generateBookingHTML();
        
        // Find the delivery method section and inject after it
        var deliverySection = document.querySelector('div[name="delivery_method"]') ||
                             document.querySelector('.o_delivery_carrier_select') ||
                             document.querySelector('input[name="carrier_id"]')?.closest('div') ||
                             document.querySelector('label:contains("LEVERINGSMETODE")')?.closest('div');
        
        if (deliverySection) {
            deliverySection.insertAdjacentHTML('afterend', bookingHTML);
        } else {
            // Fallback: try to find payment method section and inject before it
            var paymentSection = document.querySelector('div[name="payment_method"]') ||
                               document.querySelector('.o_payment_form') ||
                               document.querySelector('#payment_method');
            
            if (paymentSection) {
                paymentSection.insertAdjacentHTML('beforebegin', bookingHTML);
            }
        }
    }
    
    function setupEventListeners() {
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
                
                xhr.addEventListener('load', function() {
                    setTimeout(function() {
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
                var carrierId = getCurrentCarrierId();
                if (e.target.value && carrierId) {
                    loadTimeSlots(e.target.value, carrierId);
                }
                // Save the selected date
                saveDeliveryBooking();
            }
            
            // Listen for time slot changes
            if (e.target.id === 'delivery_time_slot') {
                // Save the selected time slot
                saveDeliveryBooking();
            }
        });
        
        // Fallback: also listen for direct clicks (in case AJAX doesn't fire)
        document.addEventListener('click', function(e) {
            if (e.target.closest('input[name="carrier_id"]') || 
                e.target.closest('label[for*="carrier"]')) {
                setTimeout(function() {
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
        
        return checkedCarrier ? checkedCarrier.value : null;
    }
    
    function repositionAndUpdateBooking(carrierId) {
        // Remove existing booking section
        var existingBooking = document.querySelector('.js_delivery_booking');
        if (existingBooking) {
            existingBooking.remove();
        }
        
        // Find the selected carrier's container - try multiple selectors
        var selectedCarrierInput = document.querySelector('input[name="carrier_id"][value="' + carrierId + '"]') ||
                                  document.querySelector('input[value="' + carrierId + '"]') ||
                                  document.querySelector('input[name="carrier_id"]:checked');
        
        if (selectedCarrierInput) {
            var carrierContainer = selectedCarrierInput.closest('.o_delivery_carrier_select') ||
                                  selectedCarrierInput.closest('label') ||
                                  selectedCarrierInput.closest('div');
            
            if (carrierContainer) {
                // Inject booking section after the selected carrier
                var bookingHTML = generateBookingHTML();
                carrierContainer.insertAdjacentHTML('afterend', bookingHTML);
            }
        } else {
            // Fallback: inject after the first delivery method or before payment methods
            var fallbackContainer = document.querySelector('.o_delivery_carrier_select') ||
                                   document.querySelector('input[name="carrier_id"]')?.closest('div') ||
                                   document.querySelector('div[name="payment_method"]');
            
            if (fallbackContainer) {
                var bookingHTML = generateBookingHTML();
                fallbackContainer.insertAdjacentHTML('afterend', bookingHTML);
            }
        }
        
        // Now check if booking should be visible for this carrier
        updateBookingVisibility(carrierId);
    }
    
    function checkInitialCarrier() {
        var carrierId = getCurrentCarrierId();
        if (carrierId) {
            updateBookingVisibility(carrierId);
        }
    }
    
    var isUpdatingBooking = false; // Flag to prevent infinite loops
    
    function updateBookingVisibility(carrierId) {
        if (!carrierId) {
            hideBookingSection();
            return;
        }
        
        if (isUpdatingBooking) {
            return;
        }
        
        isUpdatingBooking = true;
        
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
            // Temporary debugging for anonymous user issues
            if (window.location.search.includes('debug_booking')) {
                console.log('Booking response:', data);
            }
            
            if (data.result && data.result.booking_enabled) {
                showBookingSection();
                if (data.result.delivery_dates) {
                    updateDeliveryDates(data.result.delivery_dates);
                }
            } else {
                hideBookingSection();
                // Show error if debugging is enabled
                if (window.location.search.includes('debug_booking') && data.result && data.result.error) {
                    console.error('Booking error:', data.result.error);
                }
            }
        })
        .catch(error => {
            hideBookingSection();
            if (window.location.search.includes('debug_booking')) {
                console.error('Booking fetch error:', error);
            }
        })
        .finally(() => {
            isUpdatingBooking = false;
        });
    }
    
    function showBookingSection() {
        var bookingSection = document.querySelector('.js_delivery_booking');
        if (bookingSection) {
            bookingSection.style.display = 'block';
        }
    }
    
    function hideBookingSection() {
        var bookingSection = document.querySelector('.js_delivery_booking');
        if (bookingSection) {
            bookingSection.style.display = 'none';
        }
    }
    
    function updateDeliveryDates(dates) {
        var dateSelect = document.querySelector('#delivery_date');
        if (dateSelect) {
            dateSelect.innerHTML = '<option value="">' + _t('select_delivery_date') + '</option>';
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
        
        timeSelect.innerHTML = '<option value="">' + _t('loading') + '</option>';
        
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
            timeSelect.innerHTML = '<option value="">' + _t('select_time_slot') + '</option>';
            if (data.result && data.result.time_slots) {
                data.result.time_slots.forEach(function(slot) {
                    var option = document.createElement('option');
                    option.value = slot;
                    option.textContent = slot;
                    timeSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            timeSelect.innerHTML = '<option value="">' + _t('error_loading_slots') + '</option>';
        });
    }
    
    function saveDeliveryBooking() {
        var dateSelect = document.querySelector('#delivery_date');
        var timeSelect = document.querySelector('#delivery_time_slot');
        
        if (!dateSelect || !timeSelect) return;
        
        var selectedDate = dateSelect.value;
        var selectedTimeSlot = timeSelect.value;
        
        // Only save if both date and time slot are selected
        if (selectedDate && selectedTimeSlot) {
            fetch('/shop/set_delivery_booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: {
                        delivery_date: selectedDate,
                        delivery_time_slot: selectedTimeSlot
                    }
                })
            })
            .then(response => response.json())
            .then(data => {
                // Show a confirmation message
                var bookingSection = document.querySelector('.js_delivery_booking');
                if (bookingSection) {
                    var confirmationDiv = bookingSection.querySelector('.booking-confirmation');
                    if (!confirmationDiv) {
                        confirmationDiv = document.createElement('div');
                        confirmationDiv.className = 'booking-confirmation alert alert-success mt-2';
                        bookingSection.appendChild(confirmationDiv);
                    }
                    confirmationDiv.innerHTML = '<i class="fa fa-check"></i> ' + _t('delivery_scheduled_for') + ' ' + 
                                              dateSelect.options[dateSelect.selectedIndex].text + 
                                              ' ' + _t('at') + ' ' + selectedTimeSlot;
                    
                    // Hide confirmation after 3 seconds
                    setTimeout(function() {
                        if (confirmationDiv) {
                            confirmationDiv.style.display = 'none';
                        }
                    }, 3000);
                }
            })
            .catch(error => {
                // Silent error handling
            });
        }
    }
    
})();