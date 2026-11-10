import unittest
from types import SimpleNamespace
from unittest.mock import patch

from odoo.addons.delivery_carrier_booking.controllers import main
from odoo.exceptions import ValidationError


class TestBookingValidation(unittest.TestCase):
    def setUp(self):
        self.carrier = SimpleNamespace(
            enable_delivery_date_selection=True,
            enable_delivery_time_slot_selection=True,
        )
        self.carrier.sudo = lambda: self.carrier
        self.order = SimpleNamespace(
            carrier_id=self.carrier,
            delivery_booking_date=False,
            delivery_booking_slot=False,
        )
        self.request = SimpleNamespace(
            website=SimpleNamespace(sale_get_order=lambda: self.order),
            redirect=lambda url: url,
        )
        self.controller = main.WebsiteSaleDeliveryBooking()

    def checkout(self):
        with patch.object(main, "request", self.request), patch.object(
            main.WebsiteSale, "shop_confirm_order", return_value="payment"
        ):
            return self.controller.shop_confirm_order.original_endpoint(self.controller)

    def test_missing_date_blocks_checkout(self):
        self.assertEqual(self.checkout(), "/shop/checkout?carrier_booking_error=1")

    def test_missing_required_time_blocks_checkout(self):
        self.order.delivery_booking_date = "2026-11-11"
        self.assertEqual(self.checkout(), "/shop/checkout?carrier_booking_error=1")

    def test_complete_booking_allows_checkout(self):
        self.order.delivery_booking_date = "2026-11-11"
        self.order.delivery_booking_slot = "09:00 - 09:30"
        self.assertEqual(self.checkout(), "payment")

    def test_date_only_carrier_allows_checkout(self):
        self.carrier.enable_delivery_time_slot_selection = False
        self.order.delivery_booking_date = "2026-11-11"
        self.assertEqual(self.checkout(), "payment")

    def test_disabled_booking_allows_checkout(self):
        self.carrier.enable_delivery_date_selection = False
        self.assertEqual(self.checkout(), "payment")

    def test_payment_rejects_missing_required_time(self):
        self.order.delivery_booking_date = "2026-11-11"
        with patch.object(
            main.PaymentPortal, "_validate_transaction_for_order"
        ), self.assertRaises(ValidationError):
            main.WebsiteSaleDeliveryBookingPayment()._validate_transaction_for_order(
                None, self.order
            )

    def test_payment_allows_date_only_booking(self):
        self.order.delivery_booking_date = "2026-11-11"
        self.carrier.enable_delivery_time_slot_selection = False
        with patch.object(main.PaymentPortal, "_validate_transaction_for_order"):
            main.WebsiteSaleDeliveryBookingPayment()._validate_transaction_for_order(
                None, self.order
            )
