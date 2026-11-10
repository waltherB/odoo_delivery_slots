/** @odoo-module **/

import WebsiteSaleCheckout from "@website_sale/js/checkout";
import { rpc } from "@web/core/network/rpc";
import { _t } from "@web/core/l10n/translation";

WebsiteSaleCheckout.include({
    events: {
        ...WebsiteSaleCheckout.prototype.events,
        "change #delivery_date": "_onBookingDateChange",
        "change #delivery_time_slot": "_saveDeliveryBooking",
    },

    async _updateDeliveryMethod(radio) {
        const version = this._bookingVersion = (this._bookingVersion || 0) + 1;
        this._bookingBusy = true;
        this._bookingReady = false;
        await this._super(...arguments);
        if (version === this._bookingVersion) {
            await this._refreshDeliveryBooking(radio, version);
        }
    },

    _isDeliveryMethodReady() {
        return this._super(...arguments)
            && !this._bookingBusy
            && (!this._bookingEnabled || this._bookingReady);
    },

    _bookingResult(result) {
        if (result.error || result.success === false) {
            throw new Error(result.error || "The delivery booking was not saved.");
        }
        return result;
    },

    _showBookingError(error) {
        this._bookingReady = false;
        this._disableMainButton();
        const alert = this.el.querySelector(".booking-error");
        alert.textContent = _t("Could not update your delivery booking. Please try again or reload the page.");
        alert.classList.remove("d-none");
        console.error("Delivery booking failed:", error);
    },

    async _refreshDeliveryBooking(radio, version) {
        const carrierId = Number(radio.dataset.dmId);
        this._bookingEnabled = true;
        this.el.querySelector(".js_delivery_booking")?.remove();
        const section = document.createElement("li");
        section.className = "js_delivery_booking list-group-item p-3";
        const translate = window._t;
        section.innerHTML = `
            <h6>${translate("schedule_delivery")}</h6>
            <div class="booking-fields d-none row">
                <div class="col-md-6 mb-3">
                    <label for="delivery_date" class="form-label">${translate("delivery_date")}</label>
                    <select id="delivery_date" class="form-select" required></select>
                </div>
                <div class="booking-time col-md-6 mb-3">
                    <label for="delivery_time_slot" class="form-label">${translate("time_slot")}</label>
                    <select id="delivery_time_slot" class="form-select"></select>
                </div>
            </div>
            <div class="booking-error alert alert-danger d-none" role="alert"></div>
            <div class="booking-confirmation alert alert-success d-none" role="status"></div>`;
        // Keep controls outside the carrier label's clickable overlay.
        radio.closest('[name="o_delivery_method"]').after(section);
        this._setBookingOptions(
            section.querySelector("#delivery_time_slot"), translate("select_time_slot"), []
        );
        try {
            if (this._bookingCarrierId && this._bookingCarrierId !== carrierId) {
                this._bookingResult(await rpc("/shop/set_delivery_booking", {
                    delivery_date: false, delivery_time_slot: false,
                }));
            }
            this._bookingCarrierId = carrierId;
            const result = this._bookingResult(await rpc("/shop/update_carrier_booking", {
                carrier_id: carrierId,
            }));
            if (version !== this._bookingVersion) {
                return;
            }
            this._bookingEnabled = result.booking_enabled;
            section.classList.toggle("d-none", !this._bookingEnabled);
            if (!this._bookingEnabled) {
                return;
            }
            this._bookingTimeEnabled = result.time_slot_enabled;
            section.querySelector(".booking-fields").classList.remove("d-none");
            section.querySelector(".booking-time").classList.toggle("d-none", !this._bookingTimeEnabled);
            const dateSelect = section.querySelector("#delivery_date");
            this._setBookingOptions(dateSelect, translate("select_delivery_date"), result.delivery_dates);
            dateSelect.value = result.delivery_date || "";
            if (dateSelect.value && this._bookingTimeEnabled) {
                await this._loadBookingTimeSlots(dateSelect.value, version);
                section.querySelector("#delivery_time_slot").value = result.delivery_time_slot || "";
            }
            this._bookingReady = Boolean(dateSelect.value && (
                !this._bookingTimeEnabled || section.querySelector("#delivery_time_slot").value
            ));
        } catch (error) {
            if (version === this._bookingVersion) {
                this._showBookingError(error);
            }
        } finally {
            if (version === this._bookingVersion) {
                this._bookingBusy = false;
            }
        }
    },

    _setBookingOptions(select, placeholder, options) {
        select.replaceChildren(new Option(placeholder, ""));
        for (const option of options) {
            select.add(new Option(option.label, option.value));
        }
    },

    async _loadBookingTimeSlots(deliveryDate, version) {
        const result = this._bookingResult(await rpc("/shop/get_time_slots", {
            delivery_date: deliveryDate,
            carrier_id: this._bookingCarrierId,
        }));
        if (version === this._bookingVersion) {
            this._setBookingOptions(
                this.el.querySelector("#delivery_time_slot"),
                window._t("select_time_slot"),
                result.time_slots.map(slot => ({ value: slot, label: slot }))
            );
        }
    },

    async _onBookingDateChange() {
        const version = this._bookingVersion;
        const dateSelect = this.el.querySelector("#delivery_date");
        const timeSelect = this.el.querySelector("#delivery_time_slot");
        this._bookingBusy = true;
        this._bookingReady = false;
        this._disableMainButton();
        dateSelect.disabled = true;
        timeSelect.disabled = true;
        timeSelect.replaceChildren(new Option(window._t("select_time_slot"), ""));
        try {
            if (dateSelect.value && this._bookingTimeEnabled) {
                await this._loadBookingTimeSlots(dateSelect.value, version);
            }
            if (version === this._bookingVersion) {
                await this._saveDeliveryBooking();
            }
        } catch (error) {
            if (version === this._bookingVersion) {
                this._showBookingError(error);
            }
        } finally {
            dateSelect.disabled = false;
            timeSelect.disabled = false;
            if (version === this._bookingVersion) {
                this._bookingBusy = false;
                this._enableMainButton();
            }
        }
    },

    async _saveDeliveryBooking() {
        const version = this._bookingVersion;
        const dateSelect = this.el.querySelector("#delivery_date");
        const timeSelect = this.el.querySelector("#delivery_time_slot");
        this._bookingBusy = true;
        this._bookingReady = false;
        this._disableMainButton();
        dateSelect.disabled = true;
        timeSelect.disabled = true;
        this.el.querySelector(".booking-error").classList.add("d-none");
        const confirmation = this.el.querySelector(".booking-confirmation");
        confirmation.classList.add("d-none");
        try {
            const result = this._bookingResult(await rpc("/shop/set_delivery_booking", {
                delivery_date: dateSelect.value || false,
                delivery_time_slot: this._bookingTimeEnabled ? timeSelect.value || false : false,
            }));
            if (!result.success) {
                throw new Error("The delivery booking was not saved.");
            }
            if (version === this._bookingVersion) {
                this._bookingReady = Boolean(dateSelect.value && (
                    !this._bookingTimeEnabled || timeSelect.value
                ));
                if (this._bookingReady) {
                    confirmation.textContent = window._t("delivery_scheduled_for") + " "
                        + dateSelect.selectedOptions[0].text
                        + (this._bookingTimeEnabled ? " " + window._t("at") + " " + timeSelect.value : "");
                    confirmation.classList.remove("d-none");
                }
            }
        } catch (error) {
            if (version === this._bookingVersion) {
                this._showBookingError(error);
            }
        } finally {
            dateSelect.disabled = false;
            timeSelect.disabled = false;
            if (version === this._bookingVersion) {
                this._bookingBusy = false;
                this._enableMainButton();
            }
        }
    },
});
