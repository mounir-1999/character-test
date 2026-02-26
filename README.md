# University of Tripoli - Character Test

This project is a web test for personality.


# Change questions/answers text
open src/assets/js then change the text you want

# For Development
Run npm install
Run npm run dev 

# Firebase (save user name + 4-letter result)
This project saves the final 4-letter Briggs result (ex: ENTP) with the user's name to **Firestore**.

1) Create a Firebase project
2) Enable **Firestore Database**
3) Create a Web App in Firebase and copy the config values
4) Copy `.env.example` to `.env` and fill in your Firebase values

Firestore collection used: `testResults`

## Basic Firestore rules (for testing only)
During development you can allow writes temporarily, then tighten later.
Example (DO NOT use in production):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

# For Publishing
After ANY UPDATE, run npm run build, then copy dist folder and put it where you want 