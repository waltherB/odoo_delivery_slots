/** @odoo-module **/

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the payment page
    if (window.location.pathname.includes('/shop/payment')) {
        initializePaymentPageBooking();
    }
    
    const deliveryDateSelect = document.getElementById('delivery_date');
    const deliveryTimeSlotSelect = document.getElementById('delivery_time_slot');

    if (!deliveryDateSelect || !deliveryTimeSlotSelect) {
        return; // Exit if elements not found
    }

    // Handle delivery date change
    deliveryDateSelect.addEventListener('change', function() {
        const selectedDate = this.value;
        const carrierId = getCarrierId();

        if (selectedDate && carrierId) {
            loadTimeSlots(selectedDate, carrierId);
        } else {
            clearTimeSlots();
        }
    });

    // Handle time slot change
    deliveryTimeSlotSelect.addEventListener('change', saveDeliveryBooking);
    deliveryDateSelect.addEventListener('change', saveDeliveryBooking);

    // Listen for delivery method changes
    listenForDeliveryMethodChanges();

    // Validate before payment
    validatePaymentForm();

    function getCarrierId() {
        // Try multiple ways to get carrier ID
        let carrierInput = document.querySelector('input[name="carrier_id"]:checked');
        if (!carrierInput) {
            carrierInput = document.querySelector('input[name="carrier_id"]');
        }
        if (!carrierInput) {
            // Try to get from delivery method selection
            const deliveryRadio = document.querySelector('input[name="delivery_type"]:checked');
            if (deliveryRadio) {
                return deliveryRadio.value;
            }
        }
        if (!carrierInput) {
            // Try to get from order data if available
            const orderData = document.querySelector('[data-carrier-id]');
            if (orderData) {
                return orderData.getAttribute('data-carrier-id');
            }
        }
        return carrierInput ? carrierInput.value : null;
    }

    function loadTimeSlots(selectedDate, carrierId) {
        deliveryTimeSlotSelect.innerHTML = '<option value="">Loading...</option>';

        fetch('/shop/get_time_slots', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
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
            clearTimeSlots();

            if (data.result && data.result.time_slots) {
                data.result.time_slots.forEach(function(slot) {
                    const option = document.createElement('option');
                    option.value = slot;
                    option.textContent = slot;
                    deliveryTimeSlotSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching time slots:', error);
            deliveryTimeSlotSelect.innerHTML = '<option value="">Error loading slots</option>';
        });
    }

    function clearTimeSlots() {
        deliveryTimeSlotSelect.innerHTML = '<option value="">Select time slot...</option>';
    }

    function saveDeliveryBooking() {
        const deliveryDate = deliveryDateSelect.value;
        const deliveryTimeSlot = deliveryTimeSlotSelect.value;

        if (deliveryDate && deliveryTimeSlot) {
            fetch('/shop/set_delivery_booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: {
                        delivery_date: deliveryDate,
                        delivery_time_slot: deliveryTimeSlot
                    }
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Delivery booking saved successfully');
                // Update the info alert if it exists
                updateBookingInfo(deliveryDate, deliveryTimeSlot);
            })
            .catch(error => {
                console.error('Error saving delivery booking:', error);
            });
        }
    }

    function updateBookingInfo(deliveryDate, deliveryTimeSlot) {
        const infoAlert = document.querySelector('.alert-info');
        if (infoAlert) {
            infoAlert.style.display = 'block';
            infoAlert.innerHTML = `
                <i class="fa fa-info-circle me-2"></i>
                <strong>Current Selection:</strong>
                ${deliveryDate} at ${deliveryTimeSlot}
            `;
        }
    }

    function listenForDeliveryMethodChanges() {
        const deliveryInputs = document.querySelectorAll('input[name="carrier_id"], input[name="delivery_type"]');
        deliveryInputs.forEach(input => {
            input.addEventListener('change', function() {
                const carrierId = this.value;
                
                // Reset booking selections when delivery method changes
                if (deliveryDateSelect) deliveryDateSelect.value = '';
                if (deliveryTimeSlotSelect) clearTimeSlots();
                
                // Check if this carrier has booking enabled and show/hide section
                updateCarrierBookingVisibility(carrierId);
            });
        });
    }

    function updateCarrierBookingVisibility(carrierId) {
        if (!carrierId) {
            hideBookingSection();
            return;
        }

        fetch('/shop/update_carrier', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
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
                // Load available dates for this carrier
                if (data.result.delivery_dates) {
                    updateDeliveryDates(data.result.delivery_dates);
                }
            } else {
                hideBookingSection();
            }
        })
        .catch(error => {
            console.error('Error updating carrier:', error);
            hideBookingSection();
        });
    }

    function showBookingSection() {
        const bookingSection = document.querySelector('.js_delivery_booking');
        if (bookingSection) {
            bookingSection.style.display = 'block';
        }
    }

    function hideBookingSection() {
        const bookingSection = document.querySelector('.js_delivery_booking');
        if (bookingSection) {
            bookingSection.style.display = 'none';
        }
    }

    function updateDeliveryDates(dates) {
        if (deliveryDateSelect) {
            deliveryDateSelect.innerHTML = '<option value="">Select delivery date...</option>';
            dates.forEach(function(dateOption) {
                const option = document.createElement('option');
                option.value = dateOption.value;
                option.textContent = dateOption.label;
                deliveryDateSelect.appendChild(option);
            });
        }
    }

    function validatePaymentForm() {
        const paymentForms = document.querySelectorAll('form[action*="payment"], form[action*="confirm"]');

        paymentForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                if (deliveryDateSelect && deliveryTimeSlotSelect) {
                    const deliveryDate = deliveryDateSelect.value;
                    const deliveryTimeSlot = deliveryTimeSlotSelect.value;

                    if (!deliveryDate || !deliveryTimeSlot) {
                        e.preventDefault();
                        alert('Please select a delivery date and time slot before proceeding.');
                        return false;
                    }
                }
            });
        });
    }

    function initializePaymentPageBooking() {
        // Create the booking section HTML
        const bookingHTML = `
            <div class="js_delivery_booking" style="display: none;">
                <div class="card mb-3">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fa fa-calendar me-2"></i>
                            Schedule Your Delivery
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="delivery_date" class="form-label">Delivery Date <span class="text-danger">*</span></label>
                                    <select id="delivery_date" name="delivery_date" class="form-control" required="required">
                                        <option value="">Select delivery date...</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="delivery_time_slot" class="form-label">Time Slot <span class="text-danger">*</span></label>
                                    <select id="delivery_time_slot" name="delivery_time_slot" class="form-control" required="required">
                                        <option value="">Select time slot...</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="alert alert-warning" id="carrier_booking_error" style="display: none;">
                            <i class="fa fa-warning me-2"></i>
                            <span id="booking_error_message"></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Find a suitable place to inject the booking section
        const targetElement = document.querySelector('main') || 
                             document.querySelector('.container') || 
                             document.querySelector('body');

        if (targetElement) {
            // Insert the booking section at the beginning of the target element
            targetElement.insertAdjacentHTML('afterbegin', bookingHTML);
            
            // Initialize the booking functionality after injection
            setTimeout(() => {
                initializeBookingFunctionality();
            }, 100);
        }
    }

    function initializeBookingFunctionality() {
        const deliveryDateSelect = document.getElementById('delivery_date');
        const deliveryTimeSlotSelect = document.getElementById('delivery_time_slot');

        if (deliveryDateSelect && deliveryTimeSlotSelect) {
            // Set up event listeners for the injected elements
            deliveryDateSelect.addEventListener('change', function() {
                const selectedDate = this.value;
                const carrierId = getCarrierId();

                if (selectedDate && carrierId) {
                    loadTimeSlots(selectedDate, carrierId);
                } else {
                    clearTimeSlots();
                }
            });

            deliveryTimeSlotSelect.addEventListener('change', saveDeliveryBooking);
            deliveryDateSelect.addEventListener('change', saveDeliveryBooking);

            // Listen for delivery method changes
            listenForDeliveryMethodChanges();

            // Check initial carrier state
            const initialCarrierId = getCarrierId();
            if (initialCarrierId) {
                updateCarrierBookingVisibility(initialCarrierId);
            }
        }
    }
});
