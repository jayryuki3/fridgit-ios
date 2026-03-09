# Fridgit iOS

A React Native (Expo) iOS app for smart fridge management. Track your food items, scan barcodes, get expiry alerts, and share your fridge with your household.

## Features

- **Household System** — Create or join a house with invite codes. All members see the same fridge.
- **Barcode Scanning** — Scan product barcodes to auto-fill item details via OpenFoodFacts.
- **Expiry Tracking** — Dashboard shows items expiring soon with color-coded warnings.
- **Location Tabs** — Filter items by fridge, freezer, pantry, or counter.
- **Shopping List** — Shared household shopping list with check-off support.
- **Sharing** — Share specific items with household members.
- **Push Notifications** — Get alerts before items expire (requires physical device).

## Tech Stack

- **React Native** with **Expo SDK 52**
- **React Navigation** (native stack + bottom tabs)
- **NativeWind** (Tailwind CSS for React Native)
- **Expo Camera** for barcode scanning
- **Expo SecureStore** for token storage
- **Axios** for API communication
- **Lucide React Native** for icons

## Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or Expo Go on a physical device
- Running Fridgit backend server (see [fridgit](https://github.com/jayryuki3/fridgit))

## Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/jayryuki3/fridgit-ios.git
   cd fridgit-ios
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL:**
   Edit `src/services/api.js` and set `API_BASE_URL` to your server address:
   ```javascript
   const API_BASE_URL = 'https://your-server-ip:3000/api';
   ```

4. **Start the app:**
   ```bash
   npx expo start
   ```
   - Press `i` to open in iOS Simulator
   - Or scan the QR code with Expo Go on your phone

## Project Structure

```
fridgit-ios/
├── App.jsx                          # Root component
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── babel.config.js                  # Babel + NativeWind
├── tailwind.config.js               # Tailwind theme
├── global.css                       # Tailwind directives
└── src/
    ├── components/
    │   └── SharePicker.jsx          # Household member sharing widget
    ├── constants/
    │   └── theme.js                 # Color tokens, categories, locations
    ├── hooks/
    │   └── useAuth.jsx              # Auth context + SecureStore
    ├── navigation/
    │   └── AppNavigator.jsx         # Auth/Household/Main tab navigation
    ├── screens/
    │   ├── LoginScreen.jsx          # Email/password login
    │   ├── RegisterScreen.jsx       # Account creation
    │   ├── HouseholdScreen.jsx      # Create or join a house
    │   ├── HouseholdSettingsScreen.jsx # Members, invite code, leave
    │   ├── HomeScreen.jsx           # Dashboard + expiring items
    │   ├── FridgeScreen.jsx         # Full item list + detail modal
    │   ├── NewItemScreen.jsx        # Barcode scan + manual add
    │   ├── ShoppingListScreen.jsx   # Shopping list
    │   ├── RecipesScreen.jsx        # Recipe suggestions (coming soon)
    │   └── SettingsScreen.jsx       # Profile, household, logout
    └── services/
        ├── api.js                   # Axios instance with auth
        └── notifications.js         # Expo push notifications
```

## User Flow

1. **Register/Login** — Create account or sign in
2. **Household Setup** — Create a new house or join with invite code
3. **Main App** — Home dashboard, Fridge list, Add items, Shopping list, Settings
4. **Invite Members** — Share invite code from Household Settings

## Backend

This app requires the [Fridgit backend](https://github.com/jayryuki3/fridgit) with the household system update. The backend adds:
- `POST /api/households` — Create household
- `POST /api/households/join` — Join via invite code
- `GET /api/households/mine` — List user's households
- `GET /api/households/:id/members` — List members
- Items are scoped to the active household

## Building for Device

```bash
# Development build
npx expo run:ios

# Production build (requires EAS)
npx eas build --platform ios
```

## License

MIT
