odoo.define('delivery_carrier_booking.delivery_booking', function (require) {
'use strict';

var publicWidget = require('web.public.widget');

// Create a new widget for delivery booking
publicWidget.registry.DeliveryBooking = publicWidget.Widget.extend({
    selector: 'body',
    events: {
        'change input[name="carrier_id"]': '_onCarrierChange',
        'change #delivery_date': '_onDeliveryDateChange',
        'change #delivery_time_slot': '_onTimeSlotChange',
    },

    start: function() {
        var self = this;
        this._super.apply(this, arguments);
        
        // Only initialize on payment page
        if (window.location.pathname.includes('/shop/payment')) {
            console.log('Initializing delivery booking on payment page');
            
            // Wait a bit for the page to fully load
            setTimeout(function() {
                self._injectBookingSection();
                self._setupGlobalEventListeners();
                self._checkInitialCarrier();
            }, 1000);
        }
    },

    _setupGlobalEventListeners: function() {
        var self = this;
        
        // Listen for any carrier changes globally
        document.addEventListener('change', function(e) {
            if (e.target.name === 'carrier_id' || 
                e.target.name === 'delivery_type' ||
                (e.target.type === 'radio' && e.target.name.includes('carrier'))) {
                console.log('Global carrier change detected:', e.target.name, e.target.value);
                self._updateBookingVisibility(e.target.value);
            }
        });
        
        // Also listen for clicks on delivery options
        document.addEventListener('click', function(e) {
            if (e.target.type === 'radio' && 
                (e.target.name === 'carrier_id' || e.target.name.includes('carrier'))) {
                console.log('Carrier radio clicked:', e.target.value);
                setTimeout(function() {
                    self._updateBookingVisibility(e.target.value);
                }, 100);
            }
        });
    },

    _onCarrierChange: function(ev) {
        var carrierId = ev.target.value;
        console.log('Carrier changed to:', carrierId);
        this._updateBookingVisibility(carrierId);
    },

    _onDeliveryDateChange: function(ev) {
        var selectedDate = ev.target.value;
        var carrierId = this._getCurrentCarrierId();
        
        if (selectedDate && carrierId) {
            this._loadTimeSlots(selectedDate, carrierId);
        }
    },

    _onTimeSlotChange: function() {
        this._saveDeliveryBooking();
    },

    _getCurrentCarrierId: function() {
        // Try multiple selectors to find the current carrier
        var checkedCarrier = document.querySelector('input[name="carrier_id"]:checked');
        if (!checkedCarrier) {
            checkedCarrier = document.querySelector('input[name="delivery_type"]:checked');
        }
        if (!checkedCarrier) {
            // Try to find any checked radio button that might be a carrier
            var allRadios = document.querySelectorAll('input[type="radio"]:checked');
            for (var i = 0; i < allRadios.length; i++) {
                var radio = allRadios[i];
                if (radio.name.includes('carrier') || radio.name.includes('delivery')) {
                    checkedCarrier = radio;
                    break;
                }
            }
        }
        
        console.log('Current carrier ID:', checkedCarrier ? checkedCarrier.value : 'none');
        return checkedCarrier ? checkedCarrier.value : null;
    },

    _checkInitialCarrier: function() {
        var carrierId = this._getCurrentCarrierId();
        if (carrierId) {
            this._updateBookingVisibility(carrierId);
        }
    },

    _updateBookingVisibility: function(carrierId) {
        var self = this;
        
        if (!carrierId) {
            this._hideBookingSection();
            return;
        }

        this._rpc({
            route: '/shop/update_carrier_booking',
            params: {
                carrier_id: carrierId
            }
        }).then(function(result) {
            console.log('Booking check result:', result);
            
            if (result.booking_enabled) {
                self._showBookingSection();
                if (result.delivery_dates) {
                    self._updateDeliveryDates(result.delivery_dates);
                }
            } else {
                self._hideBookingSection();
            }
        }).catch(function(error) {
            console.error('Error checking carrier booking:', error);
            self._hideBookingSection();
        });
    },

    _injectBookingSection: function() {
        if (document.querySelector('.js_delivery_booking')) {
            console.log('Booking section already exists');
            return; // Already exists
        }

        var bookingHTML = `
            <div class="js_delivery_booking" style="display: none; margin: 20px 0;">
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

        // Find the best place to inject - after delivery carrier selection
        var deliverySection = document.querySelector('#delivery_carrier') || 
                             document.querySelector('.o_delivery_carrier_select') ||
                             document.querySelector('.js_delivery');

        if (deliverySection) {
            console.log('Injecting booking section after delivery section');
            deliverySection.insertAdjacentHTML('afterend', bookingHTML);
        } else {
            // Fallback - inject at the beginning of the container
            var container = document.querySelector('.container') || document.body;
            console.log('Injecting booking section in container fallback');
            container.insertAdjacentHTML('afterbegin', bookingHTML);
        }
    },

    _showBookingSection: function() {
        var bookingSection = document.querySelector('.js_delivery_booking');
        if (bookingSection) {
            bookingSection.style.display = 'block';
            console.log('Showing booking section');
        } else {
            console.log('Booking section not found when trying to show');
        }
    },

    _hideBookingSection: function() {
        var bookingSection = document.querySelector('.js_delivery_booking');
        if (bookingSection) {
            bookingSection.style.display = 'none';
            // Clear selections
            var dateSelect = document.querySelector('#delivery_date');
            var timeSelect = document.querySelector('#delivery_time_slot');
            if (dateSelect) dateSelect.value = '';
            if (timeSelect) timeSelect.value = '';
            console.log('Hiding booking section');
        }
    },

    _updateDeliveryDates: function(dates) {
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
    },

    _loadTimeSlots: function(selectedDate, carrierId) {
        var self = this;
        var timeSelect = document.querySelector('#delivery_time_slot');
        if (!timeSelect) return;

        timeSelect.innerHTML = '<option value="">Loading...</option>';

        this._rpc({
            route: '/shop/get_time_slots',
            params: {
                delivery_date: selectedDate,
                carrier_id: carrierId
            }
        }).then(function(result) {
            timeSelect.innerHTML = '<option value="">Select time slot...</option>';
            if (result.time_slots) {
                result.time_slots.forEach(function(slot) {
                    var option = document.createElement('option');
                    option.value = slot;
                    option.textContent = slot;
                    timeSelect.appendChild(option);
                });
                console.log('Loaded time slots:', result.time_slots.length);
            }
        }).catch(function(error) {
            console.error('Error loading time slots:', error);
            timeSelect.innerHTML = '<option value="">Error loading slots</option>';
        });
    },

    _saveDeliveryBooking: function() {
        var dateSelect = document.querySelector('#delivery_date');
        var timeSelect = document.querySelector('#delivery_time_slot');

        if (dateSelect && timeSelect && dateSelect.value && timeSelect.value) {
            this._rpc({
                route: '/shop/set_delivery_booking',
                params: {
                    delivery_date: dateSelect.value,
                    delivery_time_slot: timeSelect.value
                }
            }).then(function() {
                console.log('Delivery booking saved');
            }).catch(function(error) {
                console.error('Error saving delivery booking:', error);
            });
        }
    }
});

return publicWidget.registry.DeliveryBooking;

});