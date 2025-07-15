# -*- coding: utf-8 -*-
{
    'name': "Delivery Carrier Booking",

    'summary': """
        Allow customers to select a delivery date and time slot for their orders.""",

    'description': """
        This module allows you to configure delivery date and time slot options for your delivery methods.
    """,

    'author': "Jules",
    'website': "https://www.example.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/17.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Inventory/Delivery',
    'version': '17.0.1.0.0',

    # any module necessary for this one to work correctly
    'depends': ['base', 'delivery', 'website_sale'],

    # always loaded
    'data': [
        'security/ir.model.access.csv',
        'views/delivery_carrier_views.xml',
        'views/sale_order_views.xml',
        'views/website_sale_templates.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'delivery_carrier_booking/static/src/js/checkout.js',
        ],
    },
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
}
