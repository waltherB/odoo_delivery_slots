console.log('Delivery booking JavaScript loaded!');

// Simple approach without complex widget system
(function() {
    'use strict';
    
    // Only run on payment page
    if (!window.location.pathname.includes('/shop/payment')) {
        return;
    }
    
    console.log('Initializing delivery booking on payment page');
    
    // Wait for page to load
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, setting up delivery booking');
        
        // Inject booking section
        injectBookingSection();
        
        // Set up event listeners
        setupEventListeners();
        
        // Check initial state
        checkInitialCarrier();
    });
    
    function injectBookingSection() {
        if (document.querySelector('.js_delivery_booking')) {
            console.log('Booking section already exists');
            return;
        }
        
        var bookingHTML = `
            <div class="js_delivery_booking" style="display: none; margin: 20px 0; border: 2px solid red;">
                <div class="card mb-3">
                    <div class="card-header" style="background-color: #f8f9fa;">
                        <h5 class="mb-0">
                            <i class="fa fa-calendar me-2"></i>
                            Schedule Your Delivery
                        </h5>
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
        
        // Try multiple injection points
        var container = document.querySelector('.container') || 
                       document.querySelector('main') || 
                       document.body;
        
        if (container) {
            console.log('Injecting booking section into:', container.tagName);
            container.insertAdjacentHTML('afterbegin', bookingHTML);
        } else {
            console.error('Could not find container for booking section');
        }
    }
    
    function setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Listen for carrier changes
        document.addEventListener('change', function(e) {
            if (e.target.type === 'radio' && 
                (e.target.name === 'carrier_id' || e.target.name.includes('carrier'))) {
                console.log('Carrier changed:', e.target.name, e.target.value);
                updateBookingVisibility(e.target.value);
            }
        });
        
        // Listen for date changes
        document.addEventListener('change', function(e) {
            if (e.target.id === 'delivery_date') {
                console.log('Date changed:', e.target.value);
                var carrierId = getCurrentCarrierId();
                if (e.target.value && carrierId) {
                    loadTimeSlots(e.target.value, carrierId);
                }
            }
        });
    }
    
    function getCurrentCarrierId() {
        var checkedCarrier = document.querySelector('input[name="carrier_id"]:checked') ||
                            document.querySelector('input[type="radio"]:checked');
        
        console.log('Current carrier:', checkedCarrier ? checkedCarrier.value : 'none');
        return checkedCarrier ? checkedCarrier.value : null;
    }
    
    function checkInitialCarrier() {
        var carrierId = getCurrentCarrierId();
        if (carrierId) {
            console.log('Initial carrier check:', carrierId);
            updateBookingVisibility(carrierId);
        }
    }
    
    function updateBookingVisibility(carrierId) {
        console.log('Updating booking visibility for carrier:', carrierId);
        
        if (!carrierId) {
            hideBookingSection();
            return;
        }
        
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
            console.log('Booking check result:', data);
            
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
            console.error('Error checking carrier booking:', error);
            hideBookingSection();
        });
    }
    
    function showBookingSection() {
        var bookingSection = document.querySelector('.js_delivery_booking');
        if (bookingSection) {
            bookingSection.style.display = 'block';
            console.log('Showing booking section');
        }
    }
    
    function hideBookingSection() {
        var bookingSection = document.querySelector('.js_delivery_booking');
        if (bookingSection) {
            bookingSection.style.display = 'none';
            console.log('Hiding booking section');
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
            console.log('Updated delivery dates:', dates.length);
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