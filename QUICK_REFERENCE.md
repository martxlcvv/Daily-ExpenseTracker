# Quick Reference Guide - Daily Ledger Improvements

## 🚀 Getting Started

### **1. Run Your App**
```bash
npm start
# or
expo start
```

Your app now has:
- ✅ Green theme (Tarsi-inspired)
- ✅ Fixed splash screen
- ✅ Image-based avatar support
- ✅ Smooth animations
- ✅ Responsive design

---

## **📝 Code Examples**

### **Using the Avatar Component**

```jsx
import UserAvatar from '../components/UserAvatar';

<UserAvatar
  userName="James"
  mascotType="squirrel"        // or 'rocket', 'star', 'heart', 'smile'
  size="md"                     // 'sm', 'md', or 'lg'
  customImageUri={avatarImage}  // Optional: custom image path
  totalExpenses={5000}          // For context-aware messages
  enableVoice={true}            // Enable Tagalog voice
  showMessage={true}            // Show speech bubble
/>
```

### **Using AnimatedButton**

```jsx
import AnimatedButton from '../components/AnimatedButton';

<AnimatedButton 
  onPress={() => handlePress()}
  scaleAmount={0.95}            // How much to scale (0.9-0.98)
  duration={100}                // Animation duration in ms
  disabled={false}              // Disable the button
>
  <Text>Click Me!</Text>
</AnimatedButton>
```

### **Using AnimatedView**

```jsx
import AnimatedView from '../components/AnimatedView';

<AnimatedView 
  animation="fadeSlideUp"       // 'fadeSlideUp', 'fade', 'slideUp', 'scale'
  duration={400}                // Animation duration in ms
  delay={100}                   // Delay before animation starts
>
  <Text>Animated Content</Text>
</AnimatedView>
```

### **Using Responsive Sizes**

```jsx
import { ResponsiveSize } from '../utils/responsive';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: ResponsiveSize.spacing.lg,       // Auto-scales
    fontSize: ResponsiveSize.fontSize.lg,     // Auto-scales
    iconSize: ResponsiveSize.icon.medium,     // Auto-scales
  }
});

// Check screen size
if (ResponsiveSize.isSmallScreen) {
  // Do something for small screens
}
if (ResponsiveSize.isTablet) {
  // Do something for tablets
}
```

### **Using Avatar Messages**

```jsx
import { 
  getExpenseGreeting,
  getRandomMessage,
  motivational
} from '../utils/avatarMessages';

// Get contextual greeting
const greeting = getExpenseGreeting('James', 5000);
// Output: "Good morning, James! Whoa! Ang ganda ng gala mo, pero ouch sa wallet! 💸"

// Get random motivational message
const motivation = getRandomMessage('motivational');
// Output: "Small steps lead to big wins, charot pero totoo! 🌟"

// Get expense reaction
const reaction = getRandomMessage('expense', 'high');
// Output: "Oy decent spending mo! But seryoso, budget check ASAP! 📈"
```

---

## **🎨 Color Usage**

### **Using Green Theme Colors**

```jsx
import { useTheme } from '../context/ThemeContext';

const MyComponent = () => {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Button color={colors.primary}>Save</Button>
      <Text color={colors.textSecondary}>Secondary text</Text>
    </View>
  );
};

// Available colors:
// colors.primary          #2ECC71 (green)
// colors.primaryLight     #52DE97 (light green)
// colors.primaryDark      #27AE60 (dark green)
// colors.background       Auto based on theme
// colors.surface          Auto based on theme
// colors.text             Auto based on theme
// colors.textSecondary    Secondary text color
// colors.danger           #FF5252
// colors.success          #2ECC71 (same as primary)
```

---

## **📁 Project Structure**

```
DailyExpenseTracker/
├── assets/
│   └── avatar.png                     ← Place your avatar here
├── src/
│   ├── components/
│   │   ├── AnimatedButton.js          ← Reusable animated button
│   │   ├── AnimatedView.js            ← Reusable animated view
│   │   ├── UserAvatar.js              ← Avatar with image support
│   │   ├── SplashScreen.js            ← Fixed loading screen
│   │   └── dashboard/
│   │       └── BalanceCard.js         ← Updated with animations
│   ├── utils/
│   │   ├── avatarMessages.js          ← Tagalog messages
│   │   ├── responsive.js              ← Responsive utilities
│   │   └── ...
│   ├── theme/
│   │   ├── colors.js                  ← Green theme
│   │   ├── spacing.js
│   │   └── typography.js
│   └── ...
├── AVATAR_SETUP_GUIDE.md              ← Avatar setup instructions
├── IMPROVEMENTS_SUMMARY.md            ← Complete improvements list
└── QUICK_REFERENCE.md                 ← This file
```

---

## **⚙️ Customization**

### **Change Avatar Messages**

Edit `src/utils/avatarMessages.js`:

```javascript
const greetings = {
  morning: [
    "Your custom message here! 💚",
    "Another morning message!",
  ],
};

const expenseReactions = {
  veryHigh: [
    "Wow, expensive talaga! 💸",
  ],
};
```

### **Change Green Theme Color**

Edit `src/theme/colors.js`:

```javascript
// Change from #2ECC71 to your color
primary: '#YOUR_HEX_COLOR',
primaryLight: '#YOUR_LIGHT_COLOR',
primaryDark: '#YOUR_DARK_COLOR',
```

### **Adjust Animation Speeds**

```jsx
// In AnimatedButton - change duration
<AnimatedButton duration={50}>  {/* Faster */}
<AnimatedButton duration={200}> {/* Slower */}

// In AnimatedView - change duration
<AnimatedView duration={200}>   {/* Faster */}
<AnimatedView duration={800}>   {/* Slower */}
```

### **Change Splash Screen Timing**

Edit `src/components/SplashScreen.js`:

```javascript
// Change 2500 to your preferred milliseconds
setTimeout(() => {
  // 2500 = 2.5 seconds
  // Change to 3000 for 3 seconds, 1500 for 1.5 seconds
}, 2500);
```

---

## **🐛 Troubleshooting**

### **Avatar image not showing**
```
✓ Check file path: assets/avatar.png
✓ Ensure image exists
✓ Try reloading app (Ctrl+R)
✓ Check image format (PNG/JPG)
```

### **Animations not smooth**
```
✓ Ensure useNativeDriver: true
✓ Check duration (should be 300-800ms)
✓ Test on physical device for accuracy
```

### **Colors not updating**
```
✓ Verify changes in src/theme/colors.js
✓ Restart the app
✓ Check isDark prop for theme switching
```

### **Responsive sizes not working**
```
✓ Import ResponsiveSize correctly
✓ Use ResponsiveSize.spacing, not static values
✓ Test on different screen sizes
```

---

## **✅ Features Checklist**

- [x] Green theme throughout app
- [x] Image-based avatar support
- [x] Tagalog/Gen-Z avatar messages
- [x] Smooth button animations
- [x] Fixed splash screen
- [x] Responsive design
- [x] Reusable components
- [x] Better typography
- [x] Improved spacing
- [x] No breaking changes

---

## **🎯 Performance Tips**

1. **Use `useNativeDriver: true`** for animations
2. **Memoize components** with `React.memo()` if re-rendering
3. **Responsive sizes** automatically calculate - no hardcoded values
4. **AnimatedButtons** are lightweight and performant
5. **Avatars** with custom images: optimize image size (512x512 recommended)

---

## **📚 Learn More**

- **Avatar Setup**: See `AVATAR_SETUP_GUIDE.md`
- **Full Changes**: See `IMPROVEMENTS_SUMMARY.md`
- **Theme Reference**: Check `src/theme/colors.js`
- **Messages List**: Check `src/utils/avatarMessages.js`

---

## **💡 Pro Tips**

✨ **Mix animations**: Combine AnimatedButton inside AnimatedView for layered effects
✨ **Custom gradients**: Use `colors.gradientCard` for green gradient backgrounds
✨ **Responsive gaps**: Use `ResponsiveSize.spacing` for consistent spacing
✨ **Avatar variety**: Create multiple avatar images for user choice
✨ **Message timing**: Avatar speaks with slight delay for more natural feel

---

**Happy coding! Your app is now modern, responsive, and delightful to use. 💚**
