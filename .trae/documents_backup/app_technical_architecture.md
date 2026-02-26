## 1. Architecture design

```mermaid
graph TD
  A[User Browser] --> B[React Frontend Application]
  B --> C[Supabase SDK]
  C --> D[Supabase Service]

  subgraph "Frontend Layer"
      B
  end

  subgraph "Service Layer (Provided by Supabase)"
      D
  end
```

## 2. Technology Description
- Frontend: React@18 + tailwindcss@3 + vite
- Initialization Tool: vite-init
- Backend: Supabase (Authentication, Database, Storage)
- State Management: React Context API
- UI Components: Custom components with Tailwind CSS

## 3. Route definitions
| Route | Purpose |
|-------|---------|
| / | Home/Feed page, displays posts and trending content |
| /profile | Profile page, shows user information and posts |
| /messages | Messages page, displays conversations |
| /login | Login page, user authentication |
| /register | Registration page, new user signup |

## 4. API definitions

### 4.1 Core API

**Post Management**
```
GET /api/posts
POST /api/posts
DELETE /api/posts/:id
```

**User Authentication**
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
```

**Messages**
```
GET /api/conversations
POST /api/messages
GET /api/messages/:conversationId
```

## 5. Server architecture diagram

```mermaid
graph TD
  A[Client / Frontend] --> B[Supabase Client SDK]
  B --> C[Supabase Auth Service]
  B --> D[Supabase Database]
  B --> E[Supabase Storage]

  subgraph "Frontend Application"
      A
  end

  subgraph "Supabase Services"
      C
      D
      E
  end
```

## 6. Data model

### 6.1 Data model definition
```mermaid
erDiagram
  USERS ||--o{ POSTS : creates
  USERS ||--o{ COMMENTS : writes
  USERS ||--o{ MESSAGES : sends
  POSTS ||--o{ COMMENTS : has
  USERS ||--o{ CONVERSATIONS : participates

  USERS {
    UUID id PK
    STRING email
    STRING username
    STRING avatar_url
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }
  
  POSTS {
    UUID id PK
    UUID user_id FK
    STRING content
    STRING image_url
    INTEGER likes_count
    INTEGER comments_count
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }
  
  COMMENTS {
    UUID id PK
    UUID post_id FK
    UUID user_id FK
    STRING content
    TIMESTAMP created_at
  }
  
  MESSAGES {
    UUID id PK
    UUID conversation_id FK
    UUID sender_id FK
    STRING content
    BOOLEAN is_read
    TIMESTAMP created_at
  }
  
  CONVERSATIONS {
    UUID id PK
    UUID user1_id FK
    UUID user2_id FK
    TIMESTAMP last_message_at
    TIMESTAMP created_at
  }
```

### 6.2 Data Definition Language

**Users Table**
```sql
-- create table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

**Posts Table**
```sql
-- create table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create index
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

**Comments Table**
```sql
-- create table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create index
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
```

**Conversations Table**
```sql
-- create table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);
```

**Messages Table**
```sql
-- create table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create index
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

**Supabase Row Level Security (RLS) Policies**
```sql
-- Grant basic read access to anon role
GRANT SELECT ON users TO anon;
GRANT SELECT ON posts TO anon;
GRANT SELECT ON comments TO anon;

-- Grant full access to authenticated role
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON posts TO authenticated;
GRANT ALL PRIVILEGES ON comments TO authenticated;
GRANT ALL PRIVILEGES ON conversations TO authenticated;
GRANT ALL PRIVILEGES ON messages TO authenticated;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```