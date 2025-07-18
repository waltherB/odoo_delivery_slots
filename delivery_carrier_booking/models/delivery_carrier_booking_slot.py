# -*- coding: utf-8 -*-

from odoo import models, fields, _

class DeliveryCarrierBookingSlot(models.Model):
    _name = 'delivery.carrier.booking.slot'
    _description = 'Delivery Carrier Booking Slot'

    delivery_carrier_id = fields.Many2one('delivery.carrier', string=_('Delivery Carrier'), required=True, ondelete='cascade')
    weekday = fields.Selection([
        ('0', _('Monday')),
        ('1', _('Tuesday')),
        ('2', _('Wednesday')),
        ('3', _('Thursday')),
        ('4', _('Friday')),
        ('5', _('Saturday')),
        ('6', _('Sunday')),
    ], string=_('Day of the Week'), required=True)
    opening_hour = fields.Float(string=_('Opening Hour'), help=_('Opening hour in 24h format (e.g., 9.5 for 09:30)'))
    closing_hour = fields.Float(string=_('Closing Hour'), help=_('Closing hour in 24h format (e.g., 17.5 for 17:30)'))

    _sql_constraints = [
        ('opening_hour_check', 'CHECK(opening_hour >= 0 and opening_hour <= 24)', _('Opening hour must be between 0 and 24.')),
        ('closing_hour_check', 'CHECK(closing_hour >= 0 and closing_hour <= 24 and closing_hour > opening_hour)', _('Closing hour must be between 0 and 24 and greater than opening hour.')),
]
