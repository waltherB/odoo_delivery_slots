{
    'name': 'Delivery Carrier Booking',
    'version': '17.0.1.0.0',
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
