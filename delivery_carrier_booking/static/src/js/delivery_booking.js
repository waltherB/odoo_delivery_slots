/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import publicWidget from "@web/legacy/js/public/public_widget";

// Create a new widget for delivery booking
publicWidget.registry.DeliveryBooking = publicWidget.Widget.extend({
    selector: 'body',
    events: {
        'change input[name="carrier_id"]': '_onCarrierChange',
        'change #delivery_date': '_onDeliveryDateChange',
        'change #delivery_time_slot': '_onTimeSlotChange',
    },

    start() {
        this._super(...arguments);
        
        // Only initialize on payment page
        if (window.location.pathname.includes('/shop/payment')) {
            console.log('Initializing delivery booking on payment page');
            
            // Wait a bit for the page to fully load
            setTimeout(() => {
                this._injectBookingSection();
                this._setupGlobalEventListeners();
                this._checkInitialCarrier();
            }, 1000);
        }
    },

    _setupGlobalEventListeners() {
        // Listen for any carrier changes globally
        document.addEventListener('change', (e) => {
            if (e.target.name === 'carrier_id' || 
                e.target.name === 'delivery_type' ||
                (e.target.type === 'radio' && e.target.name.includes('carrier'))) {
                console.log('Global carrier change detected:', e.target.name, e.target.value);
                this._updateBookingVisibility(e.target.value);
            }
        });
        
        // Also listen for clicks on delivery options
        document.addEventListener('click', (e) => {
            if (e.target.type === 'radio' && 
                (e.target.name === 'carrier_id' || e.target.name.includes('carrier'))) {
                console.log('Carrier radio clicked:', e.target.value);
                setTimeout(() => {
                    this._updateBookingVisibility(e.target.value);
                }, 100);
            }
        });
    },

    _onCarrierChange(ev) {
        const carrierId = ev.target.value;
        console.log('Carrier changed to:', carrierId);
        this._updateBookingVisibility(carrierId);
    },

    _onDeliveryDateChange(ev) {
        const selectedDate = ev.target.value;
        const carrierId = this._getCurrentCarrierId();
        
        if (selectedDate && carrierId) {
            this._loadTimeSlots(selectedDate, carrierId);
        }
    },

    _onTimeSlotChange() {
        this._saveDeliveryBooking();
    },

    _getCurrentCarrierId() {
        // Try multiple selectors to find the current carrier
        let checkedCarrier = document.querySelector('input[name="carrier_id"]:checked');
        if (!checkedCarrier) {
            checkedCarrier = document.querySelector('input[name="delivery_type"]:checked');
        }
        if (!checkedCarrier) {
            // Try to find any checked radio button that might be a carrier
            const allRadios = document.querySelectorAll('input[type="radio"]:checked');
            for (let radio of allRadios) {
                if (radio.name.includes('carrier') || radio.name.includes('delivery')) {
                    checkedCarrier = radio;
                    break;
                }
            }
        }
        
        console.log('Current carrier ID:', checkedCarrier ? checkedCarrier.value : 'none');
        return checkedCarrier ? checkedCarrier.value : null;
    },

    _checkInitialCarrier() {
        const carrierId = this._getCurrentCarrierId();
        if (carrierId) {
            this._updateBookingVisibility(carrierId);
        }
    },

    _updateBookingVisibility(carrierId) {
        if (!carrierId) {
            this._hideBookingSection();
            return;
        }

        this.rpc('/shop/update_carrier_booking', {
            carrier_id: carrierId
        }).then((result) => {
            console.log('Booking check result:', result);
            
            if (result.booking_enabled) {
                this._showBookingSection();
                if (result.delivery_dates) {
                    this._updateDeliveryDates(result.delivery_dates);
                }
            } else {
                this._hideBookingSection();
            }
        }).catch((error) => {
            console.error('Error checking carrier booking:', error);
            this._hideBookingSection();
        });
    },

    _injectBookingSection() {
        if (this.el.querySelector('.js_delivery_booking')) {
            return; // Already exists
        }

        const bookingHTML = `
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
        const deliverySection = this.el.querySelector('#delivery_carrier') || 
                               this.el.querySelector('.o_delivery_carrier_select') ||
                               this.el.querySelector('.js_delivery');

        if (deliverySection) {
            deliverySection.insertAdjacentHTML('afterend', bookingHTML);
        } else {
            // Fallback - inject at the beginning of the container
            const container = this.el.querySelector('.container') || this.el;
            container.insertAdjacentHTML('afterbegin', bookingHTML);
        }
    },

    _showBookingSection() {
        const bookingSection = this.el.querySelector('.js_delivery_booking');
        if (bookingSection) {
            bookingSection.style.display = 'block';
            console.log('Showing booking section');
        }
    },

    _hideBookingSection() {
        const bookingSection = this.el.querySelector('.js_delivery_booking');
        if (bookingSection) {
            bookingSection.style.display = 'none';
            // Clear selections
            const dateSelect = this.el.querySelector('#delivery_date');
            const timeSelect = this.el.querySelector('#delivery_time_slot');
            if (dateSelect) dateSelect.value = '';
            if (timeSelect) timeSelect.value = '';
            console.log('Hiding booking section');
        }
    },

    _updateDeliveryDates(dates) {
        const dateSelect = this.el.querySelector('#delivery_date');
        if (dateSelect) {
            dateSelect.innerHTML = '<option value="">Select delivery date...</option>';
            dates.forEach(dateOption => {
                const option = document.createElement('option');
                option.value = dateOption.value;
                option.textContent = dateOption.label;
                dateSelect.appendChild(option);
            });
            console.log('Updated delivery dates:', dates.length);
        }
    },

    _loadTimeSlots(selectedDate, carrierId) {
        const timeSelect = this.el.querySelector('#delivery_time_slot');
        if (!timeSelect) return;

        timeSelect.innerHTML = '<option value="">Loading...</option>';

        this.rpc('/shop/get_time_slots', {
            delivery_date: selectedDate,
            carrier_id: carrierId
        }).then((result) => {
            timeSelect.innerHTML = '<option value="">Select time slot...</option>';
            if (result.time_slots) {
                result.time_slots.forEach(slot => {
                    const option = document.createElement('option');
                    option.value = slot;
                    option.textContent = slot;
                    timeSelect.appendChild(option);
                });
                console.log('Loaded time slots:', result.time_slots.length);
            }
        }).catch((error) => {
            console.error('Error loading time slots:', error);
            timeSelect.innerHTML = '<option value="">Error loading slots</option>';
        });
    },

    _saveDeliveryBooking() {
        const dateSelect = this.el.querySelector('#delivery_date');
        const timeSelect = this.el.querySelector('#delivery_time_slot');

        if (dateSelect && timeSelect && dateSelect.value && timeSelect.value) {
            this.rpc('/shop/set_delivery_booking', {
                delivery_date: dateSelect.value,
                delivery_time_slot: timeSelect.value
            }).then(() => {
                console.log('Delivery booking saved');
            }).catch((error) => {
                console.error('Error saving delivery booking:', error);
            });
        }
    }
});