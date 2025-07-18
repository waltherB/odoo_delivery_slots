# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    delivery_booking_date = fields.Date(string=_('Delivery Date'))
    delivery_booking_slot = fields.Char(string=_('Delivery Time Slot'))

    def _action_confirm(self):
        res = super(SaleOrder, self)._action_confirm()
        for order in self:
            if order.delivery_booking_date and order.delivery_booking_slot:
                self.env['calendar.event'].create({
                    'name': _('Delivery for %s') % order.name,
                    'start_date': order.delivery_booking_date,
                    'stop_date': order.delivery_booking_date,
                    'allday': True,
                    'partner_ids': [(6, 0, [order.partner_id.id])],
                    'description': _('Delivery for order %s.\nTime slot: %s') % (order.name, order.delivery_booking_slot),
                })
        return res
