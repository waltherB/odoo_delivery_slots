/** @odoo-module **/

document.addEventListener('DOMContentLoaded', function() {
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
                // Reset booking selections when delivery method changes
                if (deliveryDateSelect) deliveryDateSelect.value = '';
                if (deliveryTimeSlotSelect) clearTimeSlots();
                
                // Show/hide booking section based on carrier settings
                const bookingSection = document.querySelector('.js_delivery_booking');
                if (bookingSection) {
                    // This will be handled by the template condition, but we can add dynamic behavior here
                    setTimeout(() => {
                        // Reload the page to update the booking section visibility
                        // In a more advanced implementation, this could be done via AJAX
                    }, 100);
                }
            });
        });
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
});
