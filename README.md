# Expo + Supabase Posts App

A simple mobile app where users can create and manage their own posts. Built with Expo, TypeScript, and Supabase.

## What This App Does

This is a basic social media-style app where:
- Users can sign up and login with email/password
- Users can create posts with text and images
- Users can view only their own posts
- Users can delete their own posts
- Everything is secure - users can't see or access other people's posts

## How I Built It

I structured the app in a clean, organized way:

```
src/
├── components/        # Reusable UI pieces (buttons, cards, inputs)
├── screens/          # Main app screens (login, create post, view posts)
├── navigation/       # How users move between screens
├── services/         # Handles talking to Supabase (auth, posts, storage)
├── store/            # Manages app state (who's logged in, etc.)
├── types/            # TypeScript definitions
└── utils/            # Helper functions
```

## Getting Started

### Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Open the SQL Editor and run these files in order:
   - First run `supabase/rls_policies.sql` - this creates the posts table
   - Then run `supabase/storage_setup.sql` - this sets up image storage
4. Go to Settings > API and copy your:
   - Project URL
   - anon public key

### Step 2: Add Your Supabase Credentials

Create a file called `.env` in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3: Install and Run

```bash
npm install
npm start
```

Then press `i` for iOS simulator or `a` for Android emulator.

## Security - Row Level Security (RLS)

The most important part of this app is security. I used Supabase's Row Level Security to make sure users can only access their own data.

### How RLS Works

I created policies that check: "Is this user trying to access their own data?"

**For Reading Posts:**
- Policy checks: `auth.uid() = user_id`
- If you're logged in as User A, you can only see User A's posts
- Even if you try to query all posts, the database only returns yours

**For Creating Posts:**
- Policy checks: `auth.uid() = user_id` 
- You can only create posts with your own user ID
- If you try to create a post for someone else, it gets rejected

**For Updating/Deleting:**
- Same check - you can only modify your own posts

### Why This Matters

- **Server-side enforcement**: These checks happen in the database, not in the app code
- **Can't be bypassed**: Even if someone modifies the app code, they can't access other users' data
- **Automatic**: Supabase applies these rules to every database query automatically

The policies ensure complete data isolation - each user's posts are completely separate from others.

## Features

- ✅ Email/password login and signup
- ✅ Create posts with text and optional images
- ✅ View your own posts in a list
- ✅ Delete your posts
- ✅ Image upload using Supabase Storage
- ✅ Secure token storage (encrypted)
- ✅ Clean, simple UI
- ✅ Toast notifications for feedback
- ✅ Form validation

## What I Learned / Trade-offs

### Things I Kept Simple

- **No pagination**: Loads all posts at once (fine for small numbers of posts)
- **No offline mode**: Needs internet connection
- **No post editing**: Can only create and delete (didn't have time to add edit)
- **Image cleanup**: When you delete a post, the image stays in storage (minor issue)

### What I'd Add With More Time

1. Edit existing posts
2. Pagination for when you have lots of posts
3. Better error messages
4. Offline support (cache posts locally)
5. Search/filter posts
6. Post detail view
7. Better loading animations

## Technical Stack

- **Expo** - Makes React Native development easier
- **TypeScript** - Catches errors before they happen
- **Supabase** - Handles authentication and database
- **React Navigation** - Screen navigation
- **Zustand** - Simple state management
- **Expo SecureStore** - Encrypted storage for tokens

## Security Notes

- All database queries go through Supabase with RLS enabled
- Auth tokens are stored encrypted using Expo SecureStore
- Client-side checks are backed up by server-side RLS policies
- No sensitive data in the client code

## Project Structure Explanation

I organized the code to keep things maintainable:

- **components/**: Reusable pieces like buttons and input fields
- **screens/**: The main pages users see (login, posts list, etc.)
- **services/**: Business logic - how we talk to Supabase
- **store/**: Global state (who's logged in, loading states)
- **navigation/**: Defines how users move between screens
- **types/**: TypeScript types to prevent bugs
- **utils/**: Helper functions used throughout the app

This structure makes it easy to find and modify code later.

## License

This is a demo/prototype project.
