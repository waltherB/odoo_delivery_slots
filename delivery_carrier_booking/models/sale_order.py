# -*- coding: utf-8 -*-

from odoo import models, fields, api

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    delivery_booking_date = fields.Date(string='Delivery Date')
    delivery_booking_slot = fields.Char(string='Delivery Time Slot')

    def _action_confirm(self):
        res = super(SaleOrder, self)._action_confirm()
        for order in self:
            if order.delivery_booking_date and order.delivery_booking_slot:
                self.env['calendar.event'].create({
                    'name': f'Delivery for {order.name}',
                    'start_date': order.delivery_booking_date,
                    'stop_date': order.delivery_booking_date,
                    'allday': True,
                    'partner_ids': [(6, 0, [order.partner_id.id])],
                    'description': f'Delivery for order {order.name}.\nTime slot: {order.delivery_booking_slot}',
                })
        return res
