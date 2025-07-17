# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale
import json
from datetime import date, timedelta

class WebsiteSaleDeliveryBooking(WebsiteSale):

    @http.route(['/shop/payment/transaction'], type='http', auth="public", website=True, sitemap=False)
    def payment_transaction(self, **post):
        order = request.website.sale_get_order()
        if order.carrier_id and order.carrier_id.enable_delivery_date_selection and not order.delivery_booking_date:
            return request.redirect("/shop/checkout?carrier_booking_error=1")

        return super(WebsiteSaleDeliveryBooking, self).payment_transaction(**post)

    def _get_available_dates(self, carrier):
        dates = []
        start_date = date.today() + timedelta(days=carrier.start_delivery_after_days or 0)
        for i in range(30): # Show 30 days
            current_date = start_date + timedelta(days=i)
            if str(current_date.weekday()) in carrier.booking_slot_ids.mapped('weekday'):
                dates.append({'value': current_date.isoformat(), 'label': current_date.strftime('%A, %d %B %Y')})
        return dates

    @http.route(['/shop/get_time_slots'], type='json', auth="public", website=True)
    def get_time_slots(self, delivery_date, carrier_id, **post):
        carrier = request.env['delivery.carrier'].browse(int(carrier_id))
        if not carrier or not delivery_date:
            return {}

        selected_date = date.fromisoformat(delivery_date)
        weekday = str(selected_date.weekday())
        slots = carrier.booking_slot_ids.filtered(lambda s: s.weekday == weekday)
        
        # Debug info
        print(f"Selected date: {selected_date}, weekday: {weekday}")
        print(f"Found slots: {len(slots)}, carrier: {carrier.name}")
        
        time_slots = []
        interval_hours = (carrier.time_slot_interval or 60) / 60.0
        
        for slot in slots:
            print(f"Processing slot: {slot.weekday}, {slot.opening_hour} - {slot.closing_hour}")
            current_time = slot.opening_hour
            while current_time + interval_hours <= slot.closing_hour:
                start_hour = int(current_time)
                start_min = int((current_time - start_hour) * 60)
                end_time = current_time + interval_hours
                end_hour = int(end_time)
                end_min = int((end_time - end_hour) * 60)
                
                time_slot = f"{start_hour:02d}:{start_min:02d} - {end_hour:02d}:{end_min:02d}"
                time_slots.append(time_slot)
                print(f"Added time slot: {time_slot}")
                current_time += interval_hours
                
        print(f"Returning time slots: {time_slots}")
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

    @http.route(['/shop/checkout'], type='http', auth='public', website=True, sitemap=False)
    def checkout(self, **post):
        if post.get('carrier_booking_error'):
            post['carrier_booking_error'] = 'Please select a delivery date for your booking.'

        order = request.website.sale_get_order()
        if order and order.carrier_id:
            carrier = order.carrier_id
            if carrier.enable_delivery_date_selection:
                res = super(WebsiteSaleDeliveryBooking, self).checkout(**post)
                if hasattr(res, 'qcontext'):
                    res.qcontext['delivery_dates'] = self._get_available_dates(carrier)
                return res

        return super(WebsiteSaleDeliveryBooking, self).checkout(**post)

    @http.route(['/shop/confirm_order'], type='http', auth="public", website=True, sitemap=False)
    def confirm_order(self, **post):
        order = request.website.sale_get_order()
        if order.carrier_id and order.carrier_id.enable_delivery_date_selection and not order.delivery_booking_date:
            return request.redirect("/shop/payment?carrier_booking_error=1")

        # Add delivery booking data to context for payment page
        result = super(WebsiteSaleDeliveryBooking, self).confirm_order(**post)

        return result
        
    @http.route(['/shop/payment'], type='http', auth="public", website=True, sitemap=False)
    def payment(self, **post):
        if post.get('carrier_booking_error'):
            post['carrier_booking_error'] = 'Please select a delivery date for your booking.'
            
        result = super(WebsiteSaleDeliveryBooking, self).payment(**post)
        
        # Add delivery dates to context for payment page
        if hasattr(result, 'qcontext'):
            order = request.website.sale_get_order()
            if order and order.carrier_id and order.carrier_id.enable_delivery_date_selection:
                result.qcontext['delivery_dates'] = self._get_available_dates(order.carrier_id)
        
        return result


