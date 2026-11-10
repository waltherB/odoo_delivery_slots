const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

function fixture(respond) {
    class Element {
        constructor() {
            this.value = "";
            this.options = [];
            this.classes = new Set();
            this.classList = {
                add: name => this.classes.add(name),
                remove: name => this.classes.delete(name),
                toggle: (name, hidden) => hidden ? this.classes.add(name) : this.classes.delete(name),
            };
        }
        replaceChildren(...options) {
            this.options = options;
            this.value = "";
        }
        add(option) {
            this.options.push(option);
        }
        get selectedOptions() {
            return this.options.filter(option => option.value === this.value);
        }
    }
    const calls = [];
    const errors = [];
    let section;
    const selectors = [
        "#delivery_date", "#delivery_time_slot", ".booking-fields", ".booking-time", ".booking-error",
        ".booking-confirmation",
    ];
    const document = {
        createElement() {
            section = new Element();
            const fields = Object.fromEntries(selectors.map(selector => [selector, new Element()]));
            section.querySelector = selector => fields[selector];
            section.remove = () => {};
            return section;
        },
    };
    const checkout = {
        prototype: { events: { 'click [name="o_delivery_radio"]': "_selectDeliveryMethod" } },
        include(methods) {
            this.methods = methods;
        },
    };
    const source = readFileSync(resolve(__dirname, "../static/src/js/delivery_booking.js"), "utf8")
        .replace(/^import .*;\n/gm, "");
    vm.runInNewContext(source, {
        WebsiteSaleCheckout: checkout,
        rpc: async (route, params) => {
            calls.push({ route, params });
            return respond(route, params);
        },
        _t: text => text,
        window: { _t: text => text },
        document,
        Option: function (label, value) { this.text = label; this.value = value; },
        console: { error: (...args) => errors.push(args) },
    });
    const widget = {
        ...checkout.methods,
        _bookingVersion: 1,
        _bookingBusy: true,
        _super: () => true,
        el: {
            querySelector: selector => selector === ".js_delivery_booking"
                ? section : section?.querySelector(selector),
        },
        _disableMainButton() { this.disabled = true; },
        _enableMainButton() { this.disabled = !this._isDeliveryMethodReady(); },
    };
    const radio = {
        dataset: { dmId: "8" },
        closest: () => ({ after() {} }),
    };
    return { widget, radio, calls, errors, field: selector => section.querySelector(selector) };
}

function booking(overrides = {}) {
    return {
        booking_enabled: true,
        time_slot_enabled: true,
        delivery_date: false,
        delivery_time_slot: false,
        delivery_dates: [{ value: "2026-11-11", label: "Wednesday" }],
        ...overrides,
    };
}

test("keeps Odoo carrier events and runs after the Odoo delivery update", async () => {
    const f = fixture(() => booking());
    assert.equal(f.widget.events['click [name="o_delivery_radio"]'], "_selectDeliveryMethod");
    let updated = false;
    f.widget._super = async () => { updated = true; };
    const refresh = f.widget._refreshDeliveryBooking;
    f.widget._refreshDeliveryBooking = async function (...args) {
        assert.equal(updated, true);
        return refresh.apply(this, args);
    };
    await f.widget._updateDeliveryMethod(f.radio);
    assert.equal(f.calls[0].route, "/shop/update_carrier_booking");
    assert.equal(f.calls[0].params.carrier_id, 8);
    assert.equal(f.field("#delivery_date").options.length, 2);
    assert.equal(f.widget._bookingReady, false);
});

test("date plus time must be saved before continuing", async () => {
    const f = fixture(route => route === "/shop/update_carrier_booking" ? booking()
        : route === "/shop/get_time_slots" ? { time_slots: ["09:00 - 09:30"] }
        : { success: true });
    await f.widget._refreshDeliveryBooking(f.radio, 1);
    f.field("#delivery_date").value = "2026-11-11";
    await f.widget._onBookingDateChange();
    assert.equal(f.field("#delivery_time_slot").options.length, 2);
    assert.equal(f.widget.disabled, true);
    assert.equal(f.calls.at(-1).params.delivery_time_slot, false);
    f.field("#delivery_time_slot").value = "09:00 - 09:30";
    await f.widget._saveDeliveryBooking();
    assert.equal(f.widget.disabled, false);
    assert.equal(f.calls.at(-1).params.delivery_time_slot, "09:00 - 09:30");
});

test("date-only carriers can continue without a time slot", async () => {
    const f = fixture(route => route === "/shop/update_carrier_booking"
        ? booking({ time_slot_enabled: false }) : { success: true });
    await f.widget._refreshDeliveryBooking(f.radio, 1);
    assert.equal(f.field(".booking-time").classes.has("d-none"), true);
    f.field("#delivery_date").value = "2026-11-11";
    await f.widget._onBookingDateChange();
    assert.equal(f.widget.disabled, false);
    assert.equal(f.calls.some(call => call.route === "/shop/get_time_slots"), false);
});

test("carriers with booking disabled retain normal checkout readiness", async () => {
    const f = fixture(() => booking({ booking_enabled: false }));
    await f.widget._refreshDeliveryBooking(f.radio, 1);
    assert.equal(f.widget._isDeliveryMethodReady(), true);
});

test("restores an existing booking when returning to checkout", async () => {
    const f = fixture(route => route === "/shop/get_time_slots"
        ? { time_slots: ["09:00 - 09:30"] }
        : booking({ delivery_date: "2026-11-11", delivery_time_slot: "09:00 - 09:30" }));
    await f.widget._refreshDeliveryBooking(f.radio, 1);
    assert.equal(f.field("#delivery_date").value, "2026-11-11");
    assert.equal(f.field("#delivery_time_slot").value, "09:00 - 09:30");
    assert.equal(f.widget._isDeliveryMethodReady(), true);
});

test("changing carrier clears the previous booking before loading the new one", async () => {
    const f = fixture(route => route === "/shop/set_delivery_booking"
        ? { success: true } : booking({ booking_enabled: false }));
    f.widget._bookingCarrierId = 2;
    await f.widget._refreshDeliveryBooking(f.radio, 1);
    assert.equal(f.calls[0].route, "/shop/set_delivery_booking");
    assert.equal(f.calls[0].params.delivery_date, false);
    assert.equal(f.calls[0].params.delivery_time_slot, false);
    assert.equal(f.calls[1].route, "/shop/update_carrier_booking");
});

test("RPC errors are visible and cannot unlock checkout", async () => {
    const f = fixture(() => ({ error: "No active order" }));
    await f.widget._refreshDeliveryBooking(f.radio, 1);
    assert.equal(f.widget._isDeliveryMethodReady(), false);
    assert.equal(f.field(".booking-error").classes.has("d-none"), false);
    assert.match(f.field(".booking-error").textContent, /Could not update/);
    assert.equal(f.errors.length, 1);
});

test("failed saves cannot be treated as successful bookings", async () => {
    const f = fixture(route => route === "/shop/update_carrier_booking"
        ? booking({ time_slot_enabled: false }) : { success: false, error: "Write failed" });
    await f.widget._refreshDeliveryBooking(f.radio, 1);
    f.field("#delivery_date").value = "2026-11-11";
    await f.widget._saveDeliveryBooking();
    assert.equal(f.widget.disabled, true);
    assert.equal(f.widget._bookingReady, false);
    assert.equal(f.errors.length, 1);
});
