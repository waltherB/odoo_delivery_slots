# Installation Guide - Delivery Carrier Booking

## Prerequisites

Before installing the Delivery Carrier Booking module, ensure you have:

- **Odoo 17.0** or later
- **Website Sale** module installed and configured
- **Delivery** module installed and configured
- Administrative access to your Odoo instance

## Installation Methods

### Method 1: Manual Installation (Recommended)

1. **Download the Module**
   ```bash
   # Clone from repository
   git clone https://github.com/your-repo/delivery_carrier_booking.git
   
   # Or download and extract ZIP file
   ```

2. **Copy to Addons Directory**
   ```bash
   # Copy the module to your Odoo addons directory
   cp -r delivery_carrier_booking /path/to/odoo/addons/
   
   # Or for custom addons directory
   cp -r delivery_carrier_booking /path/to/custom-addons/
   ```

3. **Update Addons List**
   - Go to **Apps** in Odoo
   - Click **Update Apps List**
   - Search for "Delivery Carrier Booking"

4. **Install the Module**
   - Click **Install** on the Delivery Carrier Booking module
   - Wait for installation to complete

### Method 2: Using Odoo.sh

1. **Add to Repository**
   ```bash
   # Add module to your Odoo.sh repository
   git submodule add https://github.com/your-repo/delivery_carrier_booking.git addons/delivery_carrier_booking
   ```

2. **Deploy**
   - Push changes to your Odoo.sh repository
   - The module will be available in the Apps menu

### Method 3: Docker Installation

1. **Add to Docker Compose**
   ```yaml
   volumes:
     - ./addons/delivery_carrier_booking:/mnt/extra-addons/delivery_carrier_booking
   ```

2. **Restart Container**
   ```bash
   docker-compose restart
   ```

## Post-Installation Setup

### 1. Verify Installation

1. Go to **Apps** → **Installed**
2. Confirm "Delivery Carrier Booking" is listed
3. Check that no error messages appear

### 2. Configure Permissions

The module automatically sets up required permissions. Verify:

- **Sales Manager**: Full access to booking configuration
- **Sales User**: View booking information in sales orders
- **Website User**: Access to booking interface during checkout

### 3. Initial Configuration

1. **Configure Delivery Carriers**
   - Go to **Inventory** → **Configuration** → **Delivery** → **Delivery Methods**
   - Select a delivery carrier
   - Go to **Booking Configuration** tab
   - Enable booking features as needed

2. **Test the Installation**
   - Add products to cart on your website
   - Proceed to checkout
   - Select a delivery method with booking enabled
   - Verify the booking interface appears

## Troubleshooting

### Common Issues

**Issue: Module not appearing in Apps list**
```bash
# Solution: Update apps list and restart Odoo
sudo service odoo restart
```

**Issue: Permission errors during installation**
```bash
# Solution: Check file permissions
sudo chown -R odoo:odoo /path/to/addons/delivery_carrier_booking
sudo chmod -R 755 /path/to/addons/delivery_carrier_booking
```

**Issue: Database migration errors**
```bash
# Solution: Update the module
# Go to Apps → Delivery Carrier Booking → Upgrade
```

**Issue: JavaScript not loading**
- Clear browser cache
- Check browser console for errors
- Verify assets are properly loaded

### Database Backup

**Before installation, always backup your database:**

```bash
# Create database backup
pg_dump your_database_name > backup_before_booking_module.sql

# Or use Odoo backup
# Go to Settings → Database Manager → Backup
```

### Rollback Instructions

If you need to uninstall the module:

1. **Uninstall via Interface**
   - Go to **Apps** → **Delivery Carrier Booking**
   - Click **Uninstall**
   - Confirm the action

2. **Manual Cleanup** (if needed)
   ```sql
   -- Remove module data (use with caution)
   DELETE FROM ir_module_module WHERE name = 'delivery_carrier_booking';
   ```

## Performance Considerations

### Database Optimization

The module adds minimal database overhead:
- 3 new fields on `delivery.carrier`
- 2 new fields on `sale.order`
- 1 new model `delivery.carrier.booking.slot`

### Caching

The module uses efficient caching for:
- Available delivery dates
- Time slot calculations
- Carrier configuration

### Load Testing

For high-traffic sites, test the booking interface under load:
- Concurrent user bookings
- Peak checkout times
- Mobile device performance

## Security Considerations

### Data Protection

The module handles customer data responsibly:
- Booking information is stored securely
- No sensitive data in JavaScript
- Proper access controls implemented

### API Security

All AJAX endpoints include:
- Authentication checks
- Input validation
- CSRF protection

## Support and Maintenance

### Regular Maintenance

- **Monthly**: Review booking configurations
- **Quarterly**: Analyze booking patterns and optimize
- **Annually**: Update module to latest version

### Monitoring

Monitor these metrics:
- Booking completion rates
- Time slot utilization
- Customer satisfaction scores
- Delivery success rates

### Updates

To update the module:

1. **Backup Database**
2. **Download Latest Version**
3. **Replace Module Files**
4. **Upgrade Module** (Apps → Upgrade)
5. **Test Functionality**

## Getting Help

### Documentation
- README.md - Overview and features
- CONFIG.md - Detailed configuration guide
- This file - Installation instructions

### Support Channels
- GitHub Issues - Bug reports and feature requests
- Community Forums - General questions
- Professional Support - Custom development

### Professional Services

For custom development or enterprise support:
- Module customization
- Integration services
- Training and consultation
- Priority support

---

**Installation complete!** Your Delivery Carrier Booking module is ready to transform your delivery operations.