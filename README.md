# Delivery Carrier Booking

**Professional delivery scheduling system for Odoo eCommerce**

Allow your customers to select specific delivery dates and time slots during checkout, improving customer satisfaction and optimizing your delivery operations.

## 🚀 Key Features

### Customer Experience
- **Dynamic Booking Interface**: Appears only for carriers with booking enabled
- **Real-time Date Selection**: Shows available delivery dates based on carrier configuration
- **Time Slot Selection**: Customers choose from available time slots for their selected date
- **Instant Confirmation**: Visual feedback when booking is saved
- **Mobile Responsive**: Works perfectly on all devices

### Business Management
- **Flexible Carrier Configuration**: Enable/disable booking per delivery carrier
- **Customizable Time Slots**: Set opening hours, intervals, and capacity per weekday
- **Sales Order Integration**: Booking details visible in sales orders and reports
- **Calendar Integration**: Automatic calendar events created for confirmed deliveries
- **Delivery Capacity Management**: Limit orders per time slot to manage workload

### Technical Excellence
- **Seamless Integration**: Works with existing Odoo eCommerce checkout flow
- **AJAX-Powered**: Dynamic updates without page reloads
- **Performance Optimized**: Efficient database queries and caching
- **Multi-language Support**: Complete internationalization with Danish translation included
- **Odoo 17 Compatible**: Built for the latest Odoo version

## 📋 Requirements

- Odoo 17.0+
- Website Sale module
- Delivery module

## 🛠 Installation

1. Download and extract the module to your Odoo addons directory
2. Update your addons list in Odoo
3. Install the "Delivery Carrier Booking" module
4. Configure your delivery carriers with booking settings

## ⚙️ Configuration

### 1. Enable Booking for Delivery Carriers

1. Go to **Inventory → Configuration → Delivery → Delivery Methods**
2. Select a delivery carrier
3. Go to the **Booking Configuration** tab
4. Enable **"Allow Delivery Date Selection"**
5. Configure booking settings:
   - **Start Delivery After Days**: Minimum days before delivery
   - **Time Slot Interval**: Duration of each time slot (minutes)
   - **Max Orders Per Slot**: Capacity limit per time slot

### 2. Configure Booking Time Slots

1. In the delivery carrier form, go to **Booking Time Slots** section
2. Add time slots for each weekday:
   - **Weekday**: Select day of the week
   - **Opening Hour**: Start time for deliveries
   - **Closing Hour**: End time for deliveries
3. Save the configuration

### 3. Test the Booking System

1. Add products to cart on your website
2. Go to checkout and select a delivery method with booking enabled
3. The booking interface will appear with available dates and time slots
4. Select your preferred delivery date and time
5. Complete the order

## 🎯 Use Cases

### Retail & eCommerce
- **Furniture Stores**: Schedule delivery and assembly appointments
- **Electronics**: Coordinate installation services
- **Grocery Delivery**: Allow customers to choose convenient time slots
- **Fashion Retail**: Offer premium delivery scheduling

### Service Industries
- **Home Services**: Schedule maintenance and repair visits
- **Healthcare**: Coordinate medical equipment deliveries
- **Catering**: Plan event delivery timing
- **B2B Services**: Manage business delivery schedules

### Logistics & Distribution
- **Last-Mile Delivery**: Optimize delivery routes and timing
- **Warehouse Operations**: Manage pickup and delivery slots
- **Supply Chain**: Coordinate with customer schedules
- **Fleet Management**: Optimize driver schedules

## 📊 Benefits

### For Customers
- ✅ **Convenience**: Choose delivery times that work for their schedule
- ✅ **Transparency**: Clear visibility of available time slots
- ✅ **Flexibility**: Easy selection and confirmation process
- ✅ **Reliability**: Confirmed delivery appointments

### For Businesses
- ✅ **Efficiency**: Optimize delivery routes and schedules
- ✅ **Customer Satisfaction**: Reduce missed deliveries
- ✅ **Operational Control**: Manage delivery capacity
- ✅ **Professional Image**: Enhanced customer experience

## 🔧 Technical Details

### Database Schema
- Extends `delivery.carrier` with booking configuration fields
- Extends `sale.order` with booking date and time slot fields
- New model `delivery.carrier.booking.slot` for time slot management

### API Endpoints
- `/shop/update_carrier_booking`: Check if carrier has booking enabled
- `/shop/get_time_slots`: Retrieve available time slots for a date
- `/shop/set_delivery_booking`: Save customer's booking selection

### JavaScript Integration
- Event-driven architecture for real-time updates
- AJAX integration with Odoo backend
- Responsive UI components
- Cross-browser compatibility

## 🌐 Compatibility

- **Odoo Version**: 17.0+
- **Dependencies**: `website_sale`, `delivery`
- **Languages**: English (default), Danish (complete translation)
- **Browsers**: Chrome, Firefox, Safari, Edge
- **Devices**: Desktop, Tablet, Mobile

## 📞 Support

For technical support, customization requests, or feature suggestions:

- **Documentation**: See included configuration guides
- **Issues**: Report bugs via GitHub issues
- **Customization**: Contact for professional services

## 📄 License

LGPL-3 - See LICENSE file for details

## 🏆 About

Developed with ❤️ for the Odoo community. This module represents professional-grade development practices and user experience design, making delivery scheduling accessible to businesses of all sizes.

---

**Transform your delivery operations with professional scheduling capabilities. Install Delivery Carrier Booking today!**
