# 🚚 Delivery Carrier Booking

## Free & Open Source Delivery Scheduling for Odoo

[![License: LGPL-3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)
[![Odoo Version](https://img.shields.io/badge/Odoo-17.0-purple.svg)](https://github.com/odoo/odoo)
[![GitHub Issues](https://img.shields.io/github/issues/waltherB/odoo_delivery_slots)](https://github.com/waltherB/odoo_delivery_slots/issues)
[![GitHub Forks](https://img.shields.io/github/forks/waltherB/odoo_delivery_slots)](https://github.com/waltherB/odoo_delivery_slots/network)
[![GitHub Stars](https://img.shields.io/github/stars/waltherB/odoo_delivery_slots)](https://github.com/waltherB/odoo_delivery_slots/stargazers)
[![Contributors](https://img.shields.io/github/contributors/waltherB/odoo_delivery_slots)](https://github.com/waltherB/odoo_delivery_slots/graphs/contributors)

**🎯 A completely free, open source Odoo module that empowers customers to select delivery dates and time slots during checkout.**

> **Built by developers, for developers. Maintained by the community, for the community.**

### 🌟 Join Our Open Source Community

This project thrives because of contributors like you! Whether you're fixing bugs, adding features, translating, or just spreading the word - every contribution makes this module better for everyone.

**👉 [Star this repo](https://github.com/waltherB/odoo_delivery_slots) • [Fork it](https://github.com/waltherB/odoo_delivery_slots/fork) • [Contribute](https://github.com/waltherB/odoo_delivery_slots/blob/main/README.md#-contributing) • [Report Issues](https://github.com/waltherB/odoo_delivery_slots/issues)**

## 🌟 Why Choose Open Source?

This project is **100% free** and **open source** because we believe the best software is built together:

### 🤝 Community Benefits
- **🔓 No vendor lock-in** - You own your solution completely
- **🔍 Full transparency** - Every line of code is open for review
- **🚀 Faster innovation** - Collective problem-solving beats solo development
- **💰 Zero licensing costs** - Free forever, no hidden fees
- **🛡️ Better security** - More eyes on the code means fewer vulnerabilities
- **📚 Learning opportunity** - Study real-world Odoo development

### 🎯 For Businesses
- **✅ Production-ready** - Used by real businesses worldwide
- **🔧 Customizable** - Fork and modify to fit your exact needs
- **📈 Scalable** - Grows with your business
- **🌍 Global support** - Community help in multiple languages

## 🚀 Features

### For Your Customers

- **Easy date selection** - Pick delivery dates that work for them
- **Time slot booking** - Choose specific delivery windows
- **Mobile-friendly** - Works perfectly on phones and tablets
- **Instant confirmation** - See booking details immediately
- **Multi-language** - Currently supports English and Danish

### For Your Business

- **Flexible setup** - Configure different rules per delivery carrier
- **Capacity management** - Set limits on orders per time slot
- **Order integration** - Booking details appear in sales orders
- **Calendar sync** - Automatic calendar events for deliveries
- **Route optimization** - Better planning with scheduled deliveries

## 📦 Installation

### Quick Install

1. **Download** this repository:
   ```bash
   git clone https://github.com/waltherB/odoo_delivery_slots.git
   ```

2. **Copy** to your Odoo addons directory:
   ```bash
   cp -r odoo_delivery_slots/delivery_carrier_booking /path/to/odoo/addons/
   ```

3. **Update** your Odoo apps list and install the module

### Requirements

- Odoo 17.0 or later
- Website Sale module (usually pre-installed)
- Delivery module (usually pre-installed)

## ⚙️ Configuration

### Step 1: Enable Booking for Carriers

1. Go to **Inventory → Configuration → Delivery → Delivery Methods**
2. Select a delivery carrier
3. Find the **Booking Configuration** tab
4. Check **"Allow Delivery Date Selection"**
5. Set your preferences:
   - **Start Delivery After Days**: How many days ahead to start showing dates
   - **Time Slot Interval**: Length of each time slot (in minutes)
   - **Max Orders Per Slot**: How many orders you can handle per slot

### Step 2: Set Up Time Slots

1. In the same carrier form, scroll to **Booking Time Slots**
2. Add slots for each day you deliver:
   - **Weekday**: Choose the day
   - **Opening Hour**: When you start deliveries (e.g., 9.0 for 9:00 AM)
   - **Closing Hour**: When you stop deliveries (e.g., 17.0 for 5:00 PM)
3. Save your settings

### Step 3: Test It Out

1. Add some products to your cart
2. Go to checkout and select your configured delivery method
3. You should see the booking interface appear
4. Try selecting different dates and time slots

## 🤝 Contributing - We Need You!

**This project is powered by contributors like you!** Every bug report, feature suggestion, code contribution, and translation makes this module better for the entire Odoo community.

### 🚀 Quick Ways to Help (5 minutes)

- **⭐ Star this repo** - Show your support and help others discover it
- **🍴 Fork the project** - Create your own version to experiment with
- **� Rep ort a bug** - Found something broken? [Tell us about it](https://github.com/waltherB/odoo_delivery_slots/issues/new)
- **💡 Share an idea** - Have a feature request? [Start a discussion](https://github.com/waltherB/odoo_delivery_slots/discussions)
- **� Spreavd the word** - Share with other Odoo developers

### 🛠️ Code Contributions (30+ minutes)

- **🔧 Fix bugs** - Check our [open issues](https://github.com/waltherB/odoo_delivery_slots/issues)
- **✨ Add features** - Implement something from our [roadmap](https://github.com/waltherB/odoo_delivery_slots/projects)
- **🧪 Write tests** - Help us maintain quality
- **📚 Improve documentation** - Make it easier for others to contribute
- **🌍 Add translations** - Support more languages ([guide here](TRANSLATION_GUIDE.md))

### 💬 Community Contributions

- **❓ Answer questions** - Help other users in [discussions](https://github.com/waltherB/odoo_delivery_slots/discussions)
- **📝 Write tutorials** - Blog about your experience using this module
- **🎥 Create videos** - Show others how to use or extend the module
- **🗣️ Present at events** - Share this project at Odoo meetups or conferences

### 🏁 Getting Started with Development

**New to open source?** No problem! Here's how to make your first contribution:

1. **🍴 Fork this repository** - Click the "Fork" button at the top of this page

2. **📥 Clone your fork** to your local machine:

   ```bash
   git clone https://github.com/YOUR_USERNAME/odoo_delivery_slots.git
   cd odoo_delivery_slots
   ```

3. **🌿 Create a feature branch**:

   ```bash
   git checkout -b feature/my-awesome-improvement
   ```

4. **🔧 Make your changes** - Fix bugs, add features, improve docs

5. **✅ Test your changes** - Make sure everything works

6. **📤 Push to your fork**:

   ```bash
   git push origin feature/my-awesome-improvement
   ```

7. **🎯 Create a Pull Request** - Go to GitHub and click "New Pull Request"

**Need help?** Check out [GitHub's guide to contributing](https://docs.github.com/en/get-started/quickstart/contributing-to-projects) or ask in our [discussions](https://github.com/waltherB/odoo_delivery_slots/discussions).

### Code Style

- Follow [Odoo's coding guidelines](https://www.odoo.com/documentation/17.0/contributing/development.html)
- Write clear commit messages
- Add comments for complex logic
- Test your changes thoroughly

## 🐛 Issues & Support

### Found a Bug?

1. **Check existing issues** first: [GitHub Issues](https://github.com/waltherB/odoo_delivery_slots/issues)
2. **Create a new issue** if it's not already reported
3. **Include details**:
   - Odoo version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if helpful

### Need Help?

- **Documentation**: Check this README and the code comments
- **Discussions**: [GitHub Discussions](https://github.com/waltherB/odoo_delivery_slots/discussions)
- **Issues**: [Report bugs or request features](https://github.com/waltherB/odoo_delivery_slots/issues)

## 🌍 Translations

Currently supported languages:

- **English** (default)
- **Danish** (complete)

Want to add your language? We'd love your help! Check out our [Translation Guide](TRANSLATION_GUIDE.md).

## 🔧 Technical Details

### What This Module Does

- Extends `delivery.carrier` with booking configuration
- Extends `sale.order` with booking date and time fields
- Adds new model `delivery.carrier.booking.slot` for time management
- Provides AJAX endpoints for real-time booking updates
- Integrates with Odoo's calendar for delivery events

### API Endpoints

- `/shop/update_carrier_booking` - Check if booking is enabled
- `/shop/get_time_slots` - Get available slots for a date
- `/shop/set_delivery_booking` - Save customer's selection

## 📄 License

This project is licensed under the **LGPL-3.0 License** - see the [LICENSE](LICENSE) file for details.

This means you can:
- ✅ Use it commercially
- ✅ Modify it
- ✅ Distribute it
- ✅ Use it privately

You must:
- 📝 Include the license
- 📝 State changes you make
- 📝 Keep it open source if you distribute modifications

## 🙏 Acknowledgments

- **Odoo Community** - For the amazing platform
- **Contributors** - Everyone who helps improve this module
- **Users** - For testing, feedback, and feature requests
- **Translators** - For making this module accessible worldwide

## 🚀 What's Next?

Check out our [roadmap](https://github.com/waltherB/odoo_delivery_slots/projects) to see what's coming next, or suggest your own ideas!

---

**Made with ❤️ by the open source community**

[⭐ Star this repo](https://github.com/waltherB/odoo_delivery_slots) | [🍴 Fork it](https://github.com/waltherB/odoo_delivery_slots/fork) | [🐛 Report issues](https://github.com/waltherB/odoo_delivery_slots/issues) | [💬 Discussions](https://github.com/waltherB/odoo_delivery_slots/discussions)