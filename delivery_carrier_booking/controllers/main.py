# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
import json
from datetime import date, timedelta

class WebsiteSaleDeliveryBooking(http.Controller):

    @http.route(['/shop/get_delivery_dates'], type='json', auth="public", website=True)
    def get_delivery_dates(self, carrier_id, **post):
        carrier = request.env['delivery.carrier'].browse(int(carrier_id))
        if not carrier:
            return {}

        dates = []
        start_date = date.today() + timedelta(days=carrier.start_delivery_after_days)
        for i in range(30): # Show 30 days
            current_date = start_date + timedelta(days=i)
            if str(current_date.weekday()) in carrier.booking_slot_ids.mapped('weekday'):
                dates.append({'value': current_date.isoformat(), 'label': current_date.strftime('%A, %d %B %Y')})
        return {'dates': dates}

    @http.route(['/shop/get_time_slots'], type='json', auth="public", website=True)
    def get_time_slots(self, delivery_date, carrier_id, **post):
        carrier = request.env['delivery.carrier'].browse(int(carrier_id))
        if not carrier or not delivery_date:
            return {}

        selected_date = date.fromisoformat(delivery_date)
        weekday = str(selected_date.weekday())
        slots = carrier.booking_slot_ids.filtered(lambda s: s.weekday == weekday)
        time_slots = []
        for slot in slots:
            current_time = slot.opening_hour
            while current_time < slot.closing_hour:
                time_slots.append(f"{int(current_time)}:00 - {int(current_time + carrier.time_slot_interval / 60)}:00")
                current_time += carrier.time_slot_interval / 60
        return {'time_slots': time_slots}

    @http.route(['/shop/set_delivery_booking'], type='json', auth="public", website=True)
    def set_delivery_booking(self, delivery_date, delivery_time_slot, **post):
        order = request.website.sale_get_order()
        if order:
            order.write({
                'delivery_booking_date': delivery_date,
                'delivery_booking_slot': delivery_time_slot,
            })
        return {}
