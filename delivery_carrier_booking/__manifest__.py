{
    'name': 'Delivery Carrier Booking & Scheduling',
    'version': '17.0.1.0.0',
    'category': 'Website/eCommerce',
    'summary': '🆓 Open Source Delivery Scheduling - Community-driven, forever free',
    'description': """
🚚 Open Source Delivery Carrier Booking
=======================================

**100% FREE & OPEN SOURCE** - No licensing fees, ever!

🌟 Community-Powered Solution:
------------------------------
This module is built and maintained by the global Odoo community. 
When you use it, you're joining thousands of developers and businesses 
who believe in collaborative, transparent software development.

✨ What You Get (Completely Free):
---------------------------------
* **Customer Self-Service**: Easy date and time slot selection during checkout
* **Flexible Configuration**: Different booking rules per delivery carrier  
* **Real-time Updates**: Dynamic availability based on your capacity settings
* **Mobile Responsive**: Perfect experience on phones, tablets, and desktop
* **Multi-language Ready**: English and Danish included, more coming
* **Calendar Integration**: Automatic delivery events for your team
* **Order Integration**: Booking details seamlessly appear in sales orders
* **Anonymous Support**: Works for guest checkout (no login required)

🚀 Quick Setup (5 minutes):
---------------------------
1. Install this free module from GitHub
2. Go to Inventory → Delivery → Delivery Methods  
3. Enable "Delivery Date Selection" for your carriers
4. Configure time slots and daily capacity limits
5. Done! Customers can now schedule their deliveries

🤝 Join Our Open Source Community:
----------------------------------
* **⭐ Star us**: https://github.com/waltherB/odoo_delivery_slots
* **🍴 Fork & customize**: Make it your own
* **🐛 Report issues**: Help us improve
* **💡 Request features**: Share your ideas  
* **🔧 Contribute code**: Submit pull requests
* **🌍 Add translations**: Support more languages
* **💬 Get help**: Community discussions available

**Why Open Source?**
• No vendor lock-in - you own your solution
• Transparent code - review everything
• Community support - help from real users
• Continuous improvement - better together
• Zero licensing costs - free forever

**Ready to contribute?** Check out our GitHub repository!

📄 License: LGPL-3.0 (Free for commercial use)
🌍 Translations: Help us add more languages
🐛 Bugs: Report on GitHub for quick fixes

Join our growing community of users and contributors!
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
