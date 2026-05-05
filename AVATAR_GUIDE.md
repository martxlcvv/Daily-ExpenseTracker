# Avatar Voice & Custom Image Guide

## 📁 Where to Store Files

### Custom Avatar Images
Place your avatar images in this folder:
```
assets/avatars/
```

Your images can be:
- PNG files
- JPG/JPEG files
- GIF files
- Any standard image format

Example:
```
assets/
├── avatars/
│   ├── my-avatar.jpg
│   ├── my-photo.png
│   └── my-character.gif
└── images/
```

## 🎤 How Avatar Voice Works

### Voice Features:
1. **Dynamic Greetings** - Avatar greets you based on time of day:
   - 6 AM - 12 PM: "Good morning, [Name]!"
   - 12 PM - 5 PM: "Good afternoon, [Name]!"
   - 5 PM onwards: "Good evening, [Name]!"

2. **Expense-Based Reactions**:
   - Over ₱5000 spent today: "Wow, big expenses today! 💸"
   - Over ₱2000 spent today: "Quite a bit spent today! 💰"
   - Any expenses: "Keep tracking! 📊"
   - No expenses: "No expenses yet! 🎉"

3. **Text-to-Speech** - Avatar speaks when you open the app (if voice is enabled)

## ⚙️ Settings in Your App

### Step 1: Go to Settings Screen
Tap the menu button (☰) in the top-right of the Dashboard

### Step 2: Customize Avatar Section
You'll see:

#### **Emoji Mascots** (Choose One)
- 🐿️ Squirrel
- 🚀 Rocket
- ⭐ Star
- 💖 Heart
- 😊 Smile

#### **Custom Avatar Image**
- **"Upload Avatar Photo"** - Tap to select an image from your device
  - Supports: Photos, Screenshots, Custom images
  - Auto-crops to square (1:1 ratio)
  - Quality optimized for performance

- **"Remove Custom Image"** - Removes your custom photo (only shows if image is set)

#### **Avatar Voice**
- **Toggle "Avatar Voice"** - Enable/Disable voice greetings
- When ON: Avatar speaks greeting when you open the app
- When OFF: Avatar shows greeting text only

## 📸 How to Add a Custom Avatar

### Option 1: Use a Photo of Yourself
1. Go to Settings
2. Tap "Upload Avatar Photo"
3. Select a photo from your gallery
4. Crop to square if needed
5. Confirm

### Option 2: Use a Custom Image/Character
1. Download or create an image
2. Go to Settings
3. Tap "Upload Avatar Photo"
4. Select the image
5. Confirm

### Option 3: Use Phone Camera
1. Go to Settings
2. Tap "Upload Avatar Photo"
3. Take a new photo with camera
4. Crop as needed
5. Confirm

## 🎤 Voice Languages & Customization

The avatar currently speaks in **English** with:
- **Pitch**: 1.0 (Normal)
- **Speed**: 0.9 (Slightly slow for clarity)

Voice will vary based on your device's default text-to-speech engine.

## 📱 Where You'll See the Avatar

1. **Dashboard Screen** - Main view when you open the app
   - Shows avatar with daily greeting
   - Voice greets you if enabled
   - Updates based on today's spending

2. **Settings Screen** - Preview of current avatar
   - Shows your selected mascot or custom image
   - See changes in real-time

## 💡 Tips & Tricks

### Best Avatar Images
- Square images (1:1 ratio) look best
- Higher resolution images (500x500px+) work well
- Transparent PNG files work great
- Circular images look especially good

### Voice Tips
- Enable voice to get personalized greetings
- Avatar reacts to your spending patterns
- Different reactions for different expense levels
- Voice is language-dependent on your device settings

### Combining Features
- Use custom image + voice for most personalized experience
- Switch between mascots for variety
- Upload seasonal/themed images

## 🛠️ Troubleshooting

### Image Not Showing?
- Check file size (should be <5MB)
- Ensure file is in supported format (PNG, JPG, GIF)
- Try uploading again from gallery

### Voice Not Working?
- Check device volume settings
- Ensure "Avatar Voice" toggle is ON in Settings
- Some devices may have text-to-speech disabled

### Image Looks Blurry?
- Use higher resolution images (1000x1000px recommended)
- Avoid very large files (optimize before uploading)
- App will auto-optimize and cache images

## 📂 File Locations in Code

If you're a developer:
- Avatar component: `src/components/UserAvatar.js`
- Image upload handler: `src/screens/SettingsScreen.js`
- Avatar settings stored in: `src/context/ExpenseContext.js` (settings state)
- Images stored via: `expo-image-picker` library

## ✨ Future Ideas

Possible enhancements:
- Multiple avatar personalities
- Sound effects with voice
- Avatar animations based on spending
- Seasonal themes
- Avatar interactions (tap to talk)
- Custom voice recordings

---

**Enjoy your personalized avatar! 🎉**
