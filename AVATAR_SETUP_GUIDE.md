**Daily Ledger - Avatar Image Setup Guide**

## 🖼️ Avatar Image Setup Instructions

This app now supports custom image-based avatars like Tarsi! Follow these steps to add your avatar image:

### **Step 1: Prepare Your Image**

1. Get an image file (PNG, JPG, or WebP)
   - Recommended size: 512×512 pixels or larger
   - Recommended format: PNG (supports transparency)
   - Recommended aspect ratio: Square (1:1)

### **Step 2: Create Assets Folder Structure**

If you don't have an assets folder in your project root, create one:

```
DailyExpenseTracker/
├── assets/                    ← Create this folder if it doesn't exist
│   └── avatar.png             ← Place your avatar image here
├── src/
├── app/
├── package.json
└── ...
```

### **Step 3: Place Your Avatar Image**

1. Copy your image file to the `assets/` folder
2. Name it `avatar.png` (or any name you prefer)
3. Example path: `DailyExpenseTracker/assets/avatar.png`

### **Step 4: Using the Avatar in Settings Screen**

The avatar system works two ways:

#### **Option A: Use Built-in Emoji Avatars**
Users can select from predefined avatars in Settings:
- Squirrel 🐿️
- Rocket 🚀
- Star ⭐
- Heart 💖
- Smile 😊

#### **Option B: Use Custom Image Avatar**
Users can upload a custom image from their device:
1. Go to Settings → Avatar Customization
2. Tap "Upload Avatar Photo"
3. Select an image from their device
4. The image will be used as their avatar throughout the app

### **Step 5: Default Avatar Image (Optional)**

To set a default custom avatar that appears on first launch:

1. Place your image in: `assets/avatar.png`
2. In `src/context/ExpenseContext.js`, update the initial settings:

```javascript
const defaultSettings = {
  // ... other settings
  avatarImage: require('../../assets/avatar.png'),
  mascotType: 'squirrel',
};
```

### **Step 6: Avatar Features**

The avatar now includes:

✅ **Image Support**: Use custom PNG/JPG/WebP images
✅ **Emoji Fallback**: Default emoji avatars
✅ **Smooth Animations**: Gentle idle bounce animation
✅ **Tagalog Voice**: Avatar speaks in Tagalog/Gen-Z style
✅ **Witty Messages**: Context-aware, humorous responses
✅ **Responsive Design**: Scales across all screen sizes

### **Step 7: Configure Avatar Messages (Optional)**

The avatar has pre-configured witty Tagalog/Gen-Z messages. To customize:

Edit `src/utils/avatarMessages.js` and modify these sections:

```javascript
const greetings = {
  morning: [
    "Your custom message here!",
    // ... more messages
  ],
  afternoon: [
    // ...
  ],
  evening: [
    // ...
  ],
};

const expenseReactions = {
  veryHigh: ["Message for high expenses"],
  high: ["Message for moderate spending"],
  moderate: ["Message for normal spending"],
  low: ["Message for low spending"],
  zero: ["Message for no expenses"],
};
```

### **File Structure Reference**

```
DailyExpenseTracker/
├── assets/
│   ├── avatars/                 (optional: for avatar variations)
│   │   └── ...
│   └── avatar.png               ← YOUR CUSTOM AVATAR IMAGE
├── src/
│   ├── components/
│   │   ├── UserAvatar.js        (avatar display component)
│   │   ├── AnimatedButton.js    (reusable animated button)
│   │   ├── AnimatedView.js      (reusable animated view)
│   │   └── ...
│   ├── utils/
│   │   ├── avatarMessages.js    (witty Tagalog messages)
│   │   ├── responsive.js        (responsive design utilities)
│   │   └── ...
│   ├── theme/
│   │   ├── colors.js            (violet theme - Tarsi style)
│   │   ├── spacing.js           (responsive spacing)
│   │   └── typography.js        (font sizes)
│   ├── screens/
│   └── ...
├── package.json
└── ...
```

### **Troubleshooting**

**Q: Avatar image not showing?**
A: 
- Check the file path is correct: `assets/avatar.png`
- Ensure the image file exists in the right folder
- Try refreshing the app (Ctrl+R or reload)
- Check the image format (PNG/JPG recommended)

**Q: Avatar messages not in Tagalog?**
A:
- Messages are already in Tagalog/Gen-Z style
- Check `src/utils/avatarMessages.js` for the full list
- Enable Voice in Settings to hear Tagalog audio

**Q: How to change avatar size?**
A:
- Avatar sizes: `sm` (small), `md` (medium), `lg` (large)
- Edit component usage and set `size="lg"`

**Q: Want different avatar behavior?**
A:
- Edit `src/components/UserAvatar.js`
- Modify animations, colors, sizes, or messages
- Update message categories in `avatarMessages.js`

### **Features Implemented**

✨ **UI/UX Improvements**:
- ✅ Violet theme (Tarsi-inspired)
- ✅ Dark mode with violet accent
- ✅ Responsive design (mobile & desktop)
- ✅ Smooth animations
- ✅ Modern minimalist layout
- ✅ Consistent spacing & typography

🎨 **Avatar System**:
- ✅ Image-based avatar support
- ✅ Emoji fallback options
- ✅ Idle bounce animation
- ✅ Witty Tagalog messages
- ✅ Context-aware greetings
- ✅ Gen-Z humor

🔧 **Code Quality**:
- ✅ Reusable components (AnimatedButton, AnimatedView)
- ✅ Responsive utilities
- ✅ Clean code structure
- ✅ No breaking changes
- ✅ Easy customization

### **Need Help?**

Check these files for more details:
- Avatar component: `src/components/UserAvatar.js`
- Messages system: `src/utils/avatarMessages.js`
- Theme colors: `src/theme/colors.js`
- Responsive design: `src/utils/responsive.js`

Happy budgeting! 💚
