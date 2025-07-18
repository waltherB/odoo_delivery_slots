# Configuration Guide - Delivery Carrier Booking

## Overview

This guide provides detailed instructions for configuring the Delivery Carrier Booking module to meet your specific business needs.

## Quick Start Configuration

### 1. Basic Carrier Setup

1. **Navigate to Delivery Methods**
   - Go to **Inventory** → **Configuration** → **Delivery** → **Delivery Methods**
   - Select an existing carrier or create a new one

2. **Enable Booking**
   - Open the delivery carrier form
   - Go to the **Booking Configuration** tab
   - Check **"Enable Delivery Date Selection"**
   - Check **"Enable Delivery Time Slot Selection"**

3. **Set Basic Parameters**
   - **Start Delivery After Days**: `1` (next day delivery)
   - **Time Slot Interval**: `60` (1-hour slots)
   - **Max Orders Per Slot**: `5` (capacity limit)

### 2. Configure Time Slots

1. **Add Weekday Slots**
   - In the **Booking Time Slots** section, click **Add a line**
   - **Weekday**: Select day (0=Monday, 6=Sunday)
   - **Opening Hour**: `9.0` (9:00 AM)
   - **Closing Hour**: `17.0` (5:00 PM)

2. **Example Configuration**
   ```
   Monday (0):    9:00 - 17:00
   Tuesday (1):   9:00 - 17:00
   Wednesday (2): 9:00 - 17:00
   Thursday (3):  9:00 - 17:00
   Friday (4):    9:00 - 17:00
   Saturday (5):  9:00 - 12:00
   Sunday (6):    Not configured (no delivery)
   ```

## Advanced Configuration

### Delivery Carrier Settings

#### Booking Configuration Tab

| Field | Description | Example | Notes |
|-------|-------------|---------|-------|
| **Enable Delivery Date Selection** | Shows date picker to customers | ✓ Enabled | Required for booking |
| **Enable Delivery Time Slot Selection** | Shows time slot options | ✓ Enabled | Requires date selection |
| **Start Delivery After Days** | Minimum advance booking | `2` | 0 = same day, 1 = next day |
| **Time Slot Interval** | Duration of each slot (minutes) | `120` | 30, 60, 120, 240 minutes |
| **Max Orders Per Slot** | Capacity per time slot | `3` | 0 = unlimited |

#### Time Slot Configuration

**Weekday Reference:**
- `0` = Monday
- `1` = Tuesday  
- `2` = Wednesday
- `3` = Thursday
- `4` = Friday
- `5` = Saturday
- `6` = Sunday

**Hour Format:**
- Use decimal format: `9.5` = 9:30 AM
- `9.0` = 9:00 AM
- `13.5` = 1:30 PM
- `17.0` = 5:00 PM

### Business Scenarios

#### Scenario 1: Furniture Store
```
Delivery Requirements:
- Large items need 4-hour delivery windows
- Only weekdays, 8 AM - 6 PM
- Maximum 2 deliveries per slot
- 2-day advance booking required

Configuration:
- Time Slot Interval: 240 minutes (4 hours)
- Opening Hours: 8:00 - 18:00 (weekdays only)
- Max Orders Per Slot: 2
- Start Delivery After Days: 2
```

#### Scenario 2: Grocery Delivery
```
Delivery Requirements:
- 1-hour delivery slots
- 7 days a week, 8 AM - 10 PM
- High capacity (10 orders per slot)
- Next-day delivery available

Configuration:
- Time Slot Interval: 60 minutes (1 hour)
- Opening Hours: 8:00 - 22:00 (daily)
- Max Orders Per Slot: 10
- Start Delivery After Days: 1
```

#### Scenario 3: Premium Service
```
Delivery Requirements:
- 2-hour premium slots
- Weekdays only, business hours
- Exclusive service (1 order per slot)
- Same-day delivery for VIP customers

Configuration:
- Time Slot Interval: 120 minutes (2 hours)
- Opening Hours: 9:00 - 17:00 (weekdays)
- Max Orders Per Slot: 1
- Start Delivery After Days: 0
```

### Multiple Carrier Configuration

#### Standard Delivery
```
Carrier: "Standard Delivery"
- Booking: Disabled
- Regular delivery without scheduling
```

#### Express Delivery
```
Carrier: "Express Delivery"
- Booking: Enabled
- Time Slots: 2-hour windows
- Capacity: 5 orders per slot
- Advance: Next day
```

#### Premium Delivery
```
Carrier: "Premium Delivery"
- Booking: Enabled
- Time Slots: 1-hour windows
- Capacity: 2 orders per slot
- Advance: Same day (for VIP)
```

## Customer Experience Configuration

### Frontend Customization

#### Booking Section Styling
The booking interface can be customized via CSS:

```css
/* Custom styling for booking section */
.js_delivery_booking {
    border: 2px solid #your-brand-color;
    border-radius: 10px;
}

.js_delivery_booking .card-header {
    background-color: #your-brand-color;
    color: white;
}
```

#### Text Customization
Modify text in the template or via translations:
- "Schedule Your Delivery" → Your custom text
- "Select delivery date..." → Your custom text
- "Select time slot..." → Your custom text

### Multi-language Support

1. **Enable Languages**
   - Go to **Settings** → **Translations** → **Languages**
   - Install required languages

2. **Translate Interface**
   - Go to **Settings** → **Translations** → **Translated Terms**
   - Search for "delivery_carrier_booking"
   - Add translations for your languages

## Integration Configuration

### Calendar Integration

The module automatically creates calendar events when orders are confirmed:

```python
# Automatic calendar event creation
Event Name: "Delivery for SO001"
Date: Selected delivery date
Description: "Delivery for order SO001. Time slot: 09:00 - 12:00"
Attendees: Customer contact
```

### Email Templates

Customize email templates to include booking information:

```html
<!-- In sale order confirmation email -->
<p><strong>Delivery Schedule:</strong></p>
<p>Date: ${object.delivery_booking_date}</p>
<p>Time: ${object.delivery_booking_slot}</p>
```

### Report Integration

Add booking information to reports:

```xml
<!-- In sale order report template -->
<div t-if="doc.delivery_booking_date">
    <strong>Scheduled Delivery:</strong>
    <span t-field="doc.delivery_booking_date"/>
    at <span t-field="doc.delivery_booking_slot"/>
</div>
```

## Performance Optimization

### Database Optimization

#### Indexing
The module automatically creates necessary database indexes:
- `delivery_carrier_booking_date` index on `sale_order`
- `weekday` index on `delivery_carrier_booking_slot`

#### Query Optimization
- Time slot queries are cached for 1 hour
- Available dates are calculated efficiently
- Minimal database calls during checkout

### Caching Configuration

```python
# Cache configuration (automatic)
@tools.ormcache('carrier_id', 'date')
def _get_available_slots(self, carrier_id, date):
    # Cached time slot calculation
```

## Security Configuration

### Access Rights

The module includes proper access controls:

| Group | Permissions |
|-------|-------------|
| **Sales Manager** | Full configuration access |
| **Sales User** | View booking information |
| **Portal User** | Create bookings during checkout |
| **Public User** | View available slots |

### Data Protection

- Customer booking data is encrypted in transit
- No sensitive information in JavaScript
- Proper input validation on all endpoints

## Troubleshooting Configuration

### Common Configuration Issues

#### Issue: No time slots appearing
**Cause**: No booking slots configured for the selected weekday
**Solution**: Add booking slots for all required weekdays

#### Issue: Booking section not showing
**Cause**: Booking not enabled for the carrier
**Solution**: Enable "Allow Delivery Date Selection" in carrier configuration

#### Issue: Wrong time format
**Cause**: Incorrect hour format in configuration
**Solution**: Use decimal format (9.5 for 9:30, not 9:30)

### Validation Rules

The module includes automatic validation:
- Opening hour must be less than closing hour
- Time slot interval must be positive
- Max orders per slot must be non-negative
- Start delivery days must be non-negative

### Debug Mode

Enable debug mode for troubleshooting:

```python
# In JavaScript console
localStorage.setItem('delivery_booking_debug', 'true');
```

This will show additional console logs for debugging.

## Maintenance Configuration

### Regular Maintenance Tasks

#### Weekly
- Review booking patterns
- Check for any configuration issues
- Monitor customer feedback

#### Monthly
- Analyze delivery capacity utilization
- Optimize time slot configurations
- Update carrier settings if needed

#### Quarterly
- Review and update advance booking requirements
- Analyze seasonal patterns
- Plan capacity adjustments

### Monitoring Configuration

Set up monitoring for:
- Booking completion rates
- Time slot utilization
- Customer satisfaction
- Delivery success rates

### Backup Configuration

Ensure regular backups include:
- Carrier booking configurations
- Customer booking data
- Time slot definitions
- Calendar events

## Advanced Customization

### Custom Business Logic

Extend the module for custom requirements:

```python
# Custom validation example
class DeliveryCarrier(models.Model):
    _inherit = 'delivery.carrier'
    
    def _validate_booking_slot(self, date, time_slot):
        # Add custom validation logic
        if self.custom_field and some_condition:
            return False
        return super()._validate_booking_slot(date, time_slot)
```

### API Extensions

Add custom endpoints for specific needs:

```python
@http.route(['/shop/custom_booking_check'], type='json', auth="public")
def custom_booking_check(self, **kwargs):
    # Custom booking logic
    return {'result': custom_result}
```

### Integration with Third-party Systems

Connect with external systems:
- Warehouse management systems
- Fleet management software
- Customer notification services
- Analytics platforms

---

**Configuration complete!** Your delivery booking system is now optimized for your specific business needs.