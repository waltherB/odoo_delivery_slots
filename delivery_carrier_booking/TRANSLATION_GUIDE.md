# Translation Guide - Delivery Carrier Booking

## Overview

The Delivery Carrier Booking module is fully prepared for internationalization with support for multiple languages. This guide explains how to add new translations and maintain existing ones.

## Supported Languages

### Currently Available
- **English (en)** - Default language
- **Danish (da)** - Complete translation

### Adding New Languages

To add a new language translation:

1. **Create Translation File**
   ```bash
   # Copy the template
   cp i18n/delivery_carrier_booking.pot i18n/[language_code].po
   
   # Example for German
   cp i18n/delivery_carrier_booking.pot i18n/de.po
   ```

2. **Update Header Information**
   ```po
   "Language-Team: German\n"
   "Language: de\n"
   "Plural-Forms: nplurals=2; plural=(n != 1);\n"
   ```

3. **Translate Strings**
   Replace `msgstr ""` with translated text:
   ```po
   msgid "Schedule Your Delivery"
   msgstr "Planen Sie Ihre Lieferung"
   ```

## Translation Files Structure

### Backend Translations (Python/XML)
Located in `i18n/[language_code].po`:
- Model field labels and help text
- View strings and page titles
- Constraint error messages
- Calendar event descriptions

### Frontend Translations (JavaScript)
Located in `static/src/js/translations.js`:
- Customer-facing interface strings
- Form labels and placeholders
- Status messages and confirmations

## Translatable Strings

### Backend Strings
| English | Context | Type |
|---------|---------|------|
| "Enable Delivery Date Selection?" | Field label | Model |
| "Booking" | Page title | View |
| "Scheduling Rules" | Group title | View |
| "Opening hour must be between 0 and 24." | Error message | Constraint |

### Frontend Strings
| English | Context | Usage |
|---------|---------|-------|
| "Schedule Your Delivery" | Section title | Customer interface |
| "Select delivery date..." | Placeholder | Dropdown |
| "Loading..." | Status message | AJAX loading |
| "Delivery scheduled for" | Confirmation | Success message |

## Translation Workflow

### For Developers

1. **Mark New Strings for Translation**
   ```python
   # In Python files
   from odoo import _, models, fields
   
   field_name = fields.Char(string=_('Field Label'))
   ```

   ```javascript
   // In JavaScript files
   var message = _t('translatable_key');
   ```

2. **Update POT Template**
   ```bash
   # Generate new template (if using Odoo tools)
   odoo-bin -d database --i18n-export=i18n/delivery_carrier_booking.pot --modules=delivery_carrier_booking
   ```

3. **Update Existing Translations**
   ```bash
   # Update existing PO files with new strings
   msgmerge --update i18n/da.po i18n/delivery_carrier_booking.pot
   ```

### For Translators

1. **Edit PO Files**
   Use translation tools like:
   - **Poedit** (GUI editor)
   - **Lokalize** (KDE translation tool)
   - **Text editor** (for simple changes)

2. **Validate Translations**
   ```bash
   # Check for errors
   msgfmt --check i18n/da.po
   ```

3. **Test Translations**
   - Install module with new language
   - Switch user language in Odoo
   - Verify all strings are translated

## JavaScript Translation System

### How It Works

The module includes a custom translation system for JavaScript:

```javascript
// Translation function
window._t = function(key) {
    var lang = getCurrentLanguage();
    var translations = window.DeliveryBookingTranslations[lang] || 
                      window.DeliveryBookingTranslations['en'];
    return translations[key] || key;
};

// Usage
var title = _t('schedule_delivery'); // Returns translated string
```

### Adding New JavaScript Translations

1. **Add to Translation Dictionary**
   ```javascript
   // In static/src/js/translations.js
   window.DeliveryBookingTranslations = {
       'en': {
           'new_key': 'English Text',
           // ... existing translations
       },
       'da': {
           'new_key': 'Dansk Tekst',
           // ... existing translations
       }
   };
   ```

2. **Use in Code**
   ```javascript
   var translatedText = _t('new_key');
   ```

## Language-Specific Considerations

### Danish Translation Notes

- **Time Format**: Uses "kl." instead of "at" for time
- **Formal Address**: Uses formal "De" form in customer interface
- **Date Format**: Follows Danish date conventions
- **Technical Terms**: Some terms kept in English when commonly used

### Adding Right-to-Left Languages

For RTL languages (Arabic, Hebrew):

1. **Add RTL Support**
   ```css
   [dir="rtl"] .js_delivery_booking {
       text-align: right;
   }
   ```

2. **Update JavaScript**
   ```javascript
   function getCurrentDirection() {
       return document.dir === 'rtl' ? 'rtl' : 'ltr';
   }
   ```

## Testing Translations

### Manual Testing

1. **Change User Language**
   - Go to Settings → Users & Companies → Users
   - Edit user and change Language
   - Log out and log back in

2. **Test All Interfaces**
   - Backend configuration forms
   - Frontend booking interface
   - Error messages and confirmations

3. **Check Text Overflow**
   - Ensure translated text fits in UI elements
   - Test on different screen sizes
   - Verify mobile responsiveness

### Automated Testing

```python
# Test translation loading
def test_translation_loading(self):
    # Switch to Danish
    self.env.user.lang = 'da'
    
    # Test field translation
    carrier = self.env['delivery.carrier'].create({
        'name': 'Test Carrier'
    })
    
    # Verify translated field labels
    field_info = carrier.fields_get(['enable_delivery_date_selection'])
    self.assertIn('Aktivér', field_info['enable_delivery_date_selection']['string'])
```

## Maintenance

### Regular Tasks

1. **Update Translations**
   - Review new features for translatable strings
   - Update existing translations when text changes
   - Add new languages based on user requests

2. **Quality Assurance**
   - Check translation consistency
   - Verify technical accuracy
   - Test user experience in different languages

3. **Community Contributions**
   - Accept translation contributions from community
   - Review and validate community translations
   - Maintain translation credits

## Translation Credits

### Contributors
- **Danish**: [Your Name] - Initial translation
- **[Language]**: [Contributor Name] - [Contribution]

### How to Contribute

1. **Fork Repository**
2. **Add/Update Translation Files**
3. **Test Translations**
4. **Submit Pull Request**

## Support

### Getting Help
- **Documentation**: This guide and README.md
- **Community**: Odoo community forums
- **Professional**: Translation services available

### Reporting Issues
- **Missing Translations**: Create GitHub issue
- **Translation Errors**: Submit correction via PR
- **New Language Requests**: Open feature request

---

**The module is now fully internationalized and ready for global deployment!** 🌍

Translation infrastructure is in place, Danish translation is complete, and the system is ready for additional languages as needed.