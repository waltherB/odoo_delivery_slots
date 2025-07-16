{
    'name': 'Delivery Carrier Booking',
    'version': '17.0.1.0.0',
    'license': 'LGPL-3',
    'summary': """Allows customers to select a delivery date and time slot during checkout.""",
    'description': """This module enhances the standard delivery process by allowing customers to choose a specific date and time for their deliveries.
Delivery carriers can be configured with available days, time intervals, and maximum orders per slot.
Integrates with the Odoo Calendar to create events for scheduled deliveries.""",
    'category': 'Website/eCommerce',  # Updated category slightly
    'author': 'GDP Custom Development',
    'company': 'GDP Custom Development',
    'installable': True,
    'auto_install': False,
    'depends': ['website_sale', 'delivery'],
    'data': [
        'security/ir.model.access.csv',
        'views/delivery_carrier_views.xml',
        'views/sale_order_views.xml',
        'views/website_sale_templates.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'delivery_carrier_booking/static/src/js/delivery_booking.js',
        ],
    },
    'installable': True,
    'application': False,
}
