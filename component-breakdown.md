# 🧩 Component Breakdown

This document provides a detailed breakdown of all UI components used throughout the TikTok Reposter Dashboard, organized by screen and functionality.

## 📱 Navigation Components

### Navigation Bar

**File**: All HTML files  
**Purpose**: Primary navigation and branding

#### Structure:

- **Logo/Brand**: TikTok Reposter title with emoji
- **Desktop Navigation**: Horizontal menu for larger screens
- **Mobile Menu Button**: Hamburger menu for mobile devices
- **Dark Mode Toggle**: Theme switching functionality

#### Features:

- Responsive design with mobile collapse
- Active state highlighting
- Smooth transitions and hover effects
- Accessible keyboard navigation

#### CSS Classes:

```css
.nav-link-active: bg-indigo-100 text-indigo-700
.nav-link: text-gray-600 hover:text-gray-900
```

### Mobile Navigation Menu

**Purpose**: Collapsible navigation for mobile devices

#### Features:

- Slide-down animation
- Touch-friendly spacing
- Auto-close on outside click
- Same navigation structure as desktop

---

## 🏠 Dashboard Components

### Status Cards

**File**: `index.html`  
**Purpose**: Display key metrics and system status

#### Card Types:

1. **Active Sources**: Shows number of configured sources
2. **Pending Posts**: Videos awaiting publication
3. **Posts Today**: Daily posting statistics
4. **Agent Status**: Current system status with animation

#### Features:

- Color-coded icons and backgrounds
- Animated counters (simulated)
- Hover effects for interactivity
- Responsive grid layout

#### CSS Classes:

```css
.status-card: bg-white rounded-lg shadow p-6
.status-icon: p-2 rounded-lg (color varies)
```

### Agent Activity Panel

**File**: `index.html`  
**Purpose**: Show current agent operations

#### Features:

- Live progress bar animation
- Real-time status updates
- Agent identification and task description
- Progress percentage and completion metrics

### Recent Videos List

**File**: `index.html`  
**Purpose**: Display recently processed videos

#### Features:

- Video thumbnails (placeholder)
- Status badges with color coding
- Creator information and view counts
- Quick action buttons

### Scheduled Posts Panel

**File**: `index.html`  
**Purpose**: Show upcoming scheduled posts

#### Features:

- Platform-specific icons
- Time and date information
- Content preview
- Color-coded platform indicators

---

## 🎯 Source Settings Components

### Source Type Selector

**File**: `sources.html`  
**Purpose**: Choose between username, hashtag, or trending

#### Features:

- Radio button cards with visual selection
- Icon representation for each type
- Dynamic form field updates
- Visual feedback on selection

#### CSS Classes:

```css
.selected-source: border-indigo-500 bg-indigo-50
.source-option: border-gray-200 hover:border-indigo-300
```

### Source Configuration Form

**File**: `sources.html`  
**Purpose**: Configure scraping parameters

#### Fields:

- **Source Input**: Dynamic based on type selection
- **Scraping Frequency**: Dropdown with preset options
- **Custom CRON**: Conditional field for advanced scheduling
- **Advanced Options**: Toggle switches and quality settings

#### Features:

- Dynamic field validation
- Conditional field visibility
- Custom toggle switches
- Help text and placeholders

### Active Sources Sidebar

**File**: `sources.html`  
**Purpose**: Manage existing sources

#### Features:

- Scrollable list with custom scrollbar
- Status indicators (active, paused, error)
- Quick action buttons (edit, delete, pause)
- Source statistics and last run information

---

## 🔄 Repost Configuration Components

### Platform Selection Grid

**File**: `repost-config.html`  
**Purpose**: Choose target platforms for reposting

#### Platform Cards:

- **Instagram Reels**: Pink gradient icon
- **YouTube Shorts**: Red background icon
- **Facebook**: Blue background icon
- **TikTok Alt**: Black background icon

#### Features:

- Visual selection with checkboxes
- Platform-specific settings panels
- Color-coded platform branding
- Conditional settings visibility

#### CSS Classes:

```css
.platform-instagram: gradient background
.platform-youtube: bg-red-500
.platform-facebook: bg-blue-500
.platform-tiktok: bg-black
```

### Scheduling Options

**File**: `repost-config.html`  
**Purpose**: Configure posting schedule

#### Schedule Types:

1. **Regular Intervals**: Time-based posting
2. **Specific Time Slots**: Fixed daily times
3. **AI Optimal Times**: Intelligent scheduling

#### Features:

- Dynamic form sections based on selection
- Time picker components
- Active days selection
- Timezone configuration

### Caption Configuration

**File**: `repost-config.html`  
**Purpose**: Set up caption generation

#### Options:

- **Original Caption**: Use source caption
- **Template**: Custom caption templates with variables
- **AI Generated**: AI-powered caption creation

#### Features:

- Template editor with variable substitution
- AI prompt configuration
- Preview functionality
- Variable helper text

### Watermark Settings

**File**: `repost-config.html`  
**Purpose**: Configure video watermarks

#### Features:

- Enable/disable toggle
- Text vs. logo options
- Position selector grid
- Opacity and size controls
- File upload for logos

---

## 📚 Video Library Components

### Filter and Search Bar

**File**: `video-library.html`  
**Purpose**: Filter and search video content

#### Features:

- Search input with icon
- Status filter dropdown
- Source filter dropdown
- View toggle (grid/list)
- Sort options dropdown

### Video Cards (Grid View)

**File**: `video-library.html`  
**Purpose**: Display videos in card format

#### Features:

- Video thumbnail with play overlay
- Status badges with color coding
- Platform indicators
- Action buttons (edit, post, delete)
- Hover effects and animations

#### Status Types:

- **Pending**: Yellow badge
- **Scheduled**: Yellow badge with time
- **Posted**: Green badge with timestamp
- **Processing**: Blue badge with progress
- **Error**: Red badge with error info

### Video List Items (List View)

**File**: `video-library.html`  
**Purpose**: Detailed list view of videos

#### Features:

- Horizontal layout with thumbnail
- Extended metadata display
- Platform icons
- Action button groups
- Status information

### Pagination Component

**File**: `video-library.html`  
**Purpose**: Navigate through video pages

#### Features:

- Previous/Next buttons
- Page numbers with current highlight
- Results count display
- Responsive design

---

## 📊 Agent Logs Components

### Filter Sidebar

**File**: `agent-logs.html`  
**Purpose**: Filter and search log entries

#### Features:

- Log level checkboxes with counts
- Agent type filters
- Time range selector
- Search input field
- Agent status summary

### Timeline Component

**File**: `agent-logs.html`  
**Purpose**: Display chronological log entries

#### Log Entry Types:

- **Live Activity**: Animated current operations
- **Success**: Green icon with checkmark
- **Info**: Blue icon with info symbol
- **Warning**: Yellow icon with triangle
- **Error**: Red icon with X symbol
- **System**: Purple icon with settings

#### Features:

- Color-coded log levels
- Expandable error details
- Action buttons for retry/skip
- Auto-refresh capability
- Progress indicators for ongoing tasks

### Log Entry Cards

**File**: `agent-logs.html`  
**Purpose**: Individual log entry display

#### Features:

- Icon-based visual hierarchy
- Timestamp and agent identification
- Expandable content areas
- Action buttons where applicable
- Syntax highlighting for errors

---

## ⚙️ Settings Components

### API Configuration Sections

**File**: `settings.html`  
**Purpose**: Manage API keys and authentication

#### API Services:

- **TikTok API**: App ID and Secret
- **Instagram API**: App credentials
- **YouTube API**: API key and OAuth
- **Facebook API**: App ID and Secret

#### Features:

- Password field masking
- Toggle visibility buttons
- Connection status indicators
- Test connection functionality

### Download Services Grid

**File**: `settings.html`  
**Purpose**: Configure download service providers

#### Service Cards:

- **SSSTik**: Primary service (active)
- **TikMate**: Secondary service (active)
- **SnapTik**: Tertiary service (disabled)

#### Features:

- Enable/disable toggles
- Service status indicators
- Rate limit information
- Priority ordering

### Storage Configuration

**File**: `settings.html`  
**Purpose**: Manage local and cloud storage

#### Features:

- Directory path inputs with browse buttons
- Storage usage visualization
- Cloud storage configuration
- Provider selection dropdown
- Auto-upload options

### Notification Settings

**File**: `settings.html`  
**Purpose**: Configure notification channels and types

#### Channels:

- **Email**: With address input
- **Slack**: Webhook URL
- **Discord**: Webhook URL
- **Telegram**: Bot token and chat ID

#### Features:

- Channel enable/disable toggles
- Notification type categorization
- Frequency settings
- Test notification functionality

---

## 🎨 Shared UI Components

### Toggle Switches

**Purpose**: Custom toggle components for boolean settings

#### CSS Implementation:

```css
.toggle-switch: Custom switch container
.toggle-slider: Animated switch element
.toggle-slider:before: Switch handle
input:checked + .toggle-slider: Active state
```

### Status Badges

**Purpose**: Color-coded status indicators

#### Badge Types:

- **Pending**: Yellow background
- **Processing**: Blue background
- **Scheduled**: Yellow background
- **Posted**: Green background
- **Error**: Red background

### Buttons

**Purpose**: Consistent button styling throughout

#### Button Variants:

- **Primary**: Indigo background for main actions
- **Secondary**: Gray background for secondary actions
- **Danger**: Red background for destructive actions

### Form Components

**Purpose**: Consistent form styling

#### Features:

- Focus states with ring effects
- Error states with red borders
- Help text styling
- Placeholder text
- Required field indicators

### Cards

**Purpose**: Content containers with consistent styling

#### Features:

- Rounded corners (8px)
- Subtle shadows
- Hover effects for interactive cards
- Dark mode support
- Responsive padding

### Icons

**Purpose**: Lucide icon integration

#### Features:

- Consistent sizing
- Color theming
- Hover states
- Accessibility attributes
- Dynamic icon switching

---

## 📱 Responsive Design Components

### Mobile Menu

**Purpose**: Collapsible navigation for mobile

#### Features:

- Slide animation
- Backdrop overlay
- Touch-friendly sizing
- Close on outside click

### Grid Systems

**Purpose**: Responsive layout grids

#### Breakpoints:

- `grid-cols-1`: Mobile (< 640px)
- `sm:grid-cols-2`: Small tablets (640px+)
- `lg:grid-cols-3`: Laptops (1024px+)
- `xl:grid-cols-4`: Large screens (1280px+)

### Typography Scale

**Purpose**: Responsive text sizing

#### Scales:

- Headings: `text-3xl` on mobile, `text-4xl` on desktop
- Body: `text-sm` on mobile, `text-base` on desktop
- Captions: `text-xs` consistently

---

## 🌙 Dark Mode Components

### Theme Toggle

**Purpose**: Switch between light and dark themes

#### Implementation:

- Local storage persistence
- System preference detection
- Icon switching (moon/sun)
- Smooth transitions

### Color Variations

**Purpose**: Dark mode color adaptations

#### Patterns:

- Background: `bg-white dark:bg-gray-800`
- Text: `text-gray-900 dark:text-white`
- Borders: `border-gray-200 dark:border-gray-700`
- Subtle text: `text-gray-600 dark:text-gray-300`

---

## 🔧 Interactive Components

### Progress Bars

**Purpose**: Show operation progress

#### Types:

- **Determinate**: Known progress percentage
- **Indeterminate**: Infinite progress animation
- **Stepped**: Multi-stage progress indicator

### Loading States

**Purpose**: Indicate loading or processing

#### Components:

- Skeleton loaders
- Spinner animations
- Pulse effects
- Progress indicators

### Notifications

**Purpose**: User feedback system

#### Types:

- **Success**: Green with checkmark
- **Error**: Red with X icon
- **Warning**: Yellow with triangle
- **Info**: Blue with info icon

#### Features:

- Auto-dismiss timers
- Manual close buttons
- Stacking behavior
- Animation entrance/exit

---

## 📋 Component Usage Guidelines

### Consistency Rules

1. **Spacing**: Use consistent padding/margin values
2. **Colors**: Follow established color palette
3. **Typography**: Maintain hierarchical structure
4. **Icons**: Use Lucide icons consistently
5. **States**: Apply consistent hover/focus/active states

### Accessibility Standards

1. **ARIA Labels**: Provide descriptive labels
2. **Keyboard Navigation**: Ensure tab order and shortcuts
3. **Color Contrast**: Meet WCAG guidelines
4. **Screen Readers**: Use semantic HTML
5. **Focus Indicators**: Visible focus states

### Performance Considerations

1. **Lazy Loading**: Load content as needed
2. **Animation Performance**: Use CSS transforms
3. **Bundle Size**: Minimize CSS/JS payload
4. **Caching**: Implement appropriate caching strategies
5. **Progressive Enhancement**: Core functionality without JS

This component breakdown provides the foundation for implementing a consistent, accessible, and maintainable user interface across the entire TikTok Reposter Dashboard system.
