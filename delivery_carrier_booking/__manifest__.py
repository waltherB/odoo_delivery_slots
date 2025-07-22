{
    'name': 'Delivery Carrier Booking & Scheduling',
    'version': '17.0.1.0.0',
    'category': 'Website/eCommerce',
    'summary': 'Allow customers to schedule delivery dates and time slots during checkout',
    'description': """
Delivery Carrier Booking & Scheduling
=====================================

This module extends Odoo's delivery functionality by allowing customers to schedule their deliveries during the checkout process.

Key Features:
------------
* **Customer Self-Service**: Customers can select preferred delivery dates and time slots
* **Flexible Configuration**: Configure different time slots and availability for each delivery carrier
* **Dynamic Interface**: Booking section appears only for carriers with scheduling enabled
* **Real-time Updates**: Available time slots update based on selected date and carrier capacity
* **Order Integration**: Booking information is saved to sales orders and visible to staff
* **Calendar Integration**: Automatic calendar events created for scheduled deliveries
* **Responsive Design**: Works seamlessly on desktop and mobile devices

Configuration:
-------------
1. Go to Inventory > Configuration > Delivery > Delivery Methods
2. Edit or create a delivery carrier
3. Enable "Delivery Date Selection" and "Time Slot Selection"
4. Configure booking slots with weekdays and time ranges
5. Set capacity limits and advance booking requirements

Usage:
------
* Customers see the booking interface during checkout for enabled carriers
* Available dates are calculated based on your advance booking settings
* Time slots are generated from your configured booking slots
* Selected booking information appears on sales orders
* Calendar events are automatically created when orders are confirmed

Technical Details:
-----------------
* Compatible with Odoo 17.0
* Integrates with existing website_sale and delivery modules
* Uses AJAX for dynamic content loading
* Responsive Bootstrap-based interface
* Extensible architecture for custom requirements
    """,
    'author': 'Walther Barnett',
    'website': 'https://github.com/waltherB/odoo_delivery_slots',
    'license': 'LGPL-3',
    'depends': ['website_sale', 'delivery', 'calendar'],
    'data': [
        'security/ir.model.access.csv',
        'views/delivery_carrier_views.xml',
        'views/sale_order_views.xml',
        'views/website_sale_templates.xml',
    ],
    'demo': [
        'demo/demo.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'delivery_carrier_booking/static/src/js/translations.js',
            'delivery_carrier_booking/static/src/js/delivery_booking.js',
        ],
    },
    'images': [
        'static/description/banner.png',
        'static/description/icon.png',
        'static/description/screenshot-1.png',
        'static/description/screenshot-2.png',
        'static/description/screenshot-3.png',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,   
}
