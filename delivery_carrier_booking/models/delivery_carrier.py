# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class DeliveryCarrier(models.Model):
    _inherit = 'delivery.carrier'

    enable_delivery_date_selection = fields.Boolean(string=_('Enable Delivery Date Selection?'), help=_('Allow customers to select a delivery date.'))
    enable_delivery_time_slot_selection = fields.Boolean(string=_('Enable Delivery Time Slot Selection?'), help=_('Allow customers to select a delivery time slot for a chosen date.'))
    start_delivery_after_days = fields.Integer(string=_('Start Delivery After (Days)?'), help=_('Minimum number of days from today when delivery can be scheduled. E.g., 0 for same day, 1 for next day.'))
    time_slot_interval = fields.Integer(string=_('Time Slot Interval (Minutes)?'), help=_('Allow customers to select a delivery time slot for a chosen date.'))
    max_orders_per_slot = fields.Integer(string=_('Max Orders per Slot?'), help=_('Maximum number of orders that can be scheduled in a single time slot.'))
    booking_slot_ids = fields.One2many('delivery.carrier.booking.slot', 'delivery_carrier_id', string=_('Time Schedules'))
