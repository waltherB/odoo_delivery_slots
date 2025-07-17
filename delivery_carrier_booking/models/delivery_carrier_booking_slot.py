# -*- coding: utf-8 -*-

from odoo import models, fields

class DeliveryCarrierBookingSlot(models.Model):
    _name = 'delivery.carrier.booking.slot'
    _description = 'Delivery Carrier Booking Slot'

    delivery_carrier_id = fields.Many2one('delivery.carrier', string='Delivery Carrier', required=True, ondelete='cascade')
    weekday = fields.Selection([
        ('0', 'Monday'),
        ('1', 'Tuesday'),
        ('2', 'Wednesday'),
        ('3', 'Thursday'),
        ('4', 'Friday'),
        ('5', 'Saturday'),
        ('6', 'Sunday'),
    ], string='Day of the Week', required=True)
    opening_hour = fields.Float(string='Opening Hour', widget='float_time')
    closing_hour = fields.Float(string='Closing Hour', widget='float_time')

    _sql_constraints = [
        ('opening_hour_check', 'CHECK(opening_hour >= 0 and opening_hour <= 24)', 'Opening hour must be between 0 and 24.'),
        ('closing_hour_check', 'CHECK(closing_hour >= 0 and closing_hour <= 24 and closing_hour > opening_hour)', 'Closing hour must be between 0 and 24 and greater than opening hour.'),
]
