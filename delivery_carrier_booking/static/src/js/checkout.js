odoo.define('delivery_carrier_booking.checkout', function (require) {
    "use strict";

    var ajax = require('web.ajax');

    $(document).ready(function () {
        var carrier_id = $('input[name="delivery_type"]:checked').val();
        if (carrier_id) {
            ajax.jsonRpc('/shop/get_delivery_dates', 'call', {
                'carrier_id': carrier_id
            }).then(function (data) {
                var $date_select = $('#delivery_date');
                $date_select.empty();
                if (data.dates &amp;&amp; data.dates.length > 0) {
                    $date_select.append('&lt;option value=""&gt;Select a date&lt;/option&gt;');
                    data.dates.forEach(function (date) {
                        $date_select.append('&lt;option value="' + date.value + '"&gt;' + date.label + '&lt;/option&gt;');
                    });
                    $('#delivery_booking_options').show();
                } else {
                    $('#delivery_booking_options').hide();
                }
                $date_select.trigger('change');
            });
        }
    });

    $('input[name="delivery_type"]').on('change', function () {
        var carrier_id = $(this).val();
        if (carrier_id) {
            ajax.jsonRpc('/shop/get_delivery_dates', 'call', {
                'carrier_id': carrier_id
            }).then(function (data) {
                var $date_select = $('#delivery_date');
                $date_select.empty();
                if (data.dates &amp;&amp; data.dates.length > 0) {
                    $date_select.append('&lt;option value=""&gt;Select a date&lt;/option&gt;');
                    data.dates.forEach(function (date) {
                        $date_select.append('&lt;option value="' + date.value + '"&gt;' + date.label + '&lt;/option&gt;');
                    });
                    $('#delivery_booking_options').show();
                } else {
                    $('#delivery_booking_options').hide();
                }
                $date_select.trigger('change');
            });
        } else {
            $('#delivery_booking_options').hide();
        }
    });

    $('#delivery_date').on('change', function () {
        var delivery_date = $(this).val();
        var carrier_id = $('input[name="delivery_type"]:checked').val();
        if (delivery_date &amp;&amp; carrier_id) {
            ajax.jsonRpc('/shop/get_time_slots', 'call', {
                'delivery_date': delivery_date,
                'carrier_id': carrier_id
            }).then(function (data) {
                var $time_slot_select = $('#delivery_time_slot');
                $time_slot_select.empty();
                if (data.time_slots &amp;&amp; data.time_slots.length > 0) {
                    data.time_slots.forEach(function (slot) {
                        $time_slot_select.append('&lt;option value="' + slot + '"&gt;' + slot + '&lt;/option&gt;');
                    });
                    $('#delivery_time_slot_selection').show();
                } else {
                    $('#delivery_time_slot_selection').hide();
                }
                $time_slot_select.trigger('change');
            });
        } else {
            $('#delivery_time_slot_selection').hide();
        }
    });

    $('#delivery_time_slot').on('change', function () {
        var delivery_date = $('#delivery_date').val();
        var delivery_time_slot = $(this).val();
        ajax.jsonRpc('/shop/set_delivery_booking', 'call', {
            'delivery_date': delivery_date,
            'delivery_time_slot': delivery_time_slot
        });
    });
});
