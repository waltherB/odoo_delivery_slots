# -*- coding: utf-8 -*-

from odoo import http, _
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale
import json
from datetime import date, timedelta
import babel.dates

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
        
        # Get language for proper date formatting - works for both logged in and anonymous users
        user_lang = None
        
        # Try multiple methods to get language for anonymous users
        if request.env.user and not request.env.user._is_public():
            # Logged in user
            user_lang = request.env.user.lang
        else:
            # Anonymous user - try different methods
            user_lang = (
                request.env.context.get('lang') or  # From context
                request.httprequest.cookies.get('frontend_lang') or  # From cookie
                request.website.default_lang_id.code or  # Website default
                'en_US'  # Final fallback
            )
        
        # Convert Odoo language code to Babel locale
        locale_mapping = {
            'da_DK': 'da',
            'da': 'da',
            'en_US': 'en',
            'en': 'en'
        }
        locale = locale_mapping.get(user_lang, 'en')
        
        for i in range(30): # Show 30 days
            current_date = start_date + timedelta(days=i)
            if str(current_date.weekday()) in carrier.booking_slot_ids.mapped('weekday'):
                try:
                    # Use Babel for proper localized date formatting
                    formatted_date = babel.dates.format_date(
                        current_date, 
                        format='full', 
                        locale=locale
                    )
                    # Capitalize first letter for proper formatting
                    formatted_date = formatted_date[0].upper() + formatted_date[1:] if formatted_date else formatted_date
                except Exception as e:
                    # Fallback to manual Danish formatting if Babel fails
                    if locale == 'da':
                        weekdays_da = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag', 'søndag']
                        months_da = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 
                                   'juli', 'august', 'september', 'oktober', 'november', 'december']
                        weekday_name = weekdays_da[current_date.weekday()]
                        month_name = months_da[current_date.month - 1]
                        formatted_date = f"{weekday_name.capitalize()}, {current_date.day}. {month_name} {current_date.year}"
                    else:
                        # English fallback
                        formatted_date = current_date.strftime('%A, %d %B %Y')
                
                dates.append({
                    'value': current_date.isoformat(), 
                    'label': formatted_date
                })
        return dates

    @http.route(['/shop/get_time_slots'], type='json', auth="public", website=True)
    def get_time_slots(self, delivery_date, carrier_id, **post):
        try:
            carrier = request.env['delivery.carrier'].browse(int(carrier_id))
            if not carrier or not delivery_date:
                return {'time_slots': [], 'error': 'Missing carrier or date'}

            selected_date = date.fromisoformat(delivery_date)
            weekday = str(selected_date.weekday())
            slots = carrier.booking_slot_ids.filtered(lambda s: s.weekday == weekday)
            
            time_slots = []
            interval_hours = (carrier.time_slot_interval or 60) / 60.0
            
            for slot in slots:
                current_time = slot.opening_hour
                while current_time + interval_hours <= slot.closing_hour:
                    start_hour = int(current_time)
                    start_min = int((current_time - start_hour) * 60)
                    end_time = current_time + interval_hours
                    end_hour = int(end_time)
                    end_min = int((end_time - end_hour) * 60)
                    
                    time_slot = f"{start_hour:02d}:{start_min:02d} - {end_hour:02d}:{end_min:02d}"
                    time_slots.append(time_slot)
                    current_time += interval_hours
                    
            return {
                'time_slots': time_slots,
                'debug_info': {
                    'carrier_id': carrier_id,
                    'selected_date': delivery_date,
                    'weekday': weekday,
                    'slots_found': len(slots),
                    'user_is_public': request.env.user._is_public()
                }
            }
        except Exception as e:
            return {'time_slots': [], 'error': str(e)}

    @http.route(['/shop/set_delivery_booking'], type='json', auth="public", website=True)
    def set_delivery_booking(self, delivery_date, delivery_time_slot, **post):
        try:
            order = request.website.sale_get_order()
            if not order:
                return {'success': False, 'error': 'No active order found'}
            
            # Use sudo() to ensure we can write to the order even for anonymous users
            order.sudo().write({
                'delivery_booking_date': delivery_date,
                'delivery_booking_slot': delivery_time_slot,
            })
            
            return {
                'success': True,
                'debug_info': {
                    'order_id': order.id,
                    'delivery_date': delivery_date,
                    'delivery_slot': delivery_time_slot,
                    'user_is_public': request.env.user._is_public()
                }
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route(['/shop/update_carrier_booking'], type='json', auth="public", website=True)
    def update_carrier_booking(self, carrier_id, **post):
        try:
            carrier = request.env['delivery.carrier'].browse(int(carrier_id))
            if not carrier:
                return {'booking_enabled': False, 'error': 'Carrier not found'}
            
            # Check if we have a valid order (works for both logged in and anonymous users)
            order = request.website.sale_get_order()
            if not order:
                return {'booking_enabled': False, 'error': 'No active order'}
            
            result = {
                'booking_enabled': carrier.enable_delivery_date_selection,
                'delivery_dates': [],
                'debug_info': {
                    'carrier_id': carrier_id,
                    'carrier_name': carrier.name,
                    'order_id': order.id if order else None,
                    'user_is_public': request.env.user._is_public(),
                    'user_lang': request.env.context.get('lang', 'unknown')
                }
            }
            
            if carrier.enable_delivery_date_selection:
                result['delivery_dates'] = self._get_available_dates(carrier)
                
            return result
        except Exception as e:
            return {'booking_enabled': False, 'error': str(e)}

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

    @http.route(['/shop/debug_booking'], type='json', auth="public", website=True)
    def debug_booking(self, **post):
        """Debug endpoint to check anonymous user booking status"""
        try:
            order = request.website.sale_get_order()
            user = request.env.user
            
            return {
                'success': True,
                'debug_info': {
                    'has_order': bool(order),
                    'order_id': order.id if order else None,
                    'order_state': order.state if order else None,
                    'user_is_public': user._is_public(),
                    'user_id': user.id,
                    'user_name': user.name,
                    'website_id': request.website.id,
                    'session_id': request.session.sid if hasattr(request.session, 'sid') else 'unknown',
                    'context_lang': request.env.context.get('lang'),
                    'cookies': dict(request.httprequest.cookies),
                }
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}



