// TikTok Reposter Dashboard JavaScript

// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize dark mode
    initializeDarkMode();
    
    // Initialize interactive elements
    initializeInteractiveElements();
    
    // Initialize mock data updates
    initializeMockDataUpdates();
});

// Mobile Menu Toggle
function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
}

// Dark Mode Toggle
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const html = document.documentElement;
    
    // Check for saved dark mode preference or default to light mode
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
                      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDarkMode) {
        html.classList.add('dark');
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            html.classList.toggle('dark');
            const isDark = html.classList.contains('dark');
            localStorage.setItem('darkMode', isDark);
            
            // Update icon
            const icon = darkModeToggle.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
                lucide.createIcons();
            }
        });
    }
}

// Interactive Elements
function initializeInteractiveElements() {
    // Toggle switches
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            console.log(`Toggle ${this.name} changed to:`, this.checked);
            // Add visual feedback
            const parent = this.closest('.toggle-switch');
            if (parent) {
                parent.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    parent.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });
    
    // Card hover effects
    const cards = document.querySelectorAll('.card-hover');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Button click effects
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Ripple effect
            const ripple = document.createElement('div');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Mock data updates for dashboard
function initializeMockDataUpdates() {
    // Update agent progress periodically
    const progressBar = document.querySelector('.bg-green-600');
    const progressText = document.querySelector('.text-xs.text-gray-500');
    
    if (progressBar && progressText) {
        let progress = 65;
        let processed = 13;
        const total = 20;
        
        setInterval(() => {
            if (progress < 100) {
                progress += Math.random() * 5;
                processed = Math.floor((progress / 100) * total);
                
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `Progress: ${processed}/${total} videos processed`;
            } else {
                // Reset progress
                progress = 0;
                processed = 0;
                progressBar.style.width = '0%';
                progressText.textContent = 'Starting new batch...';
            }
        }, 3000);
    }
    
    // Update stats periodically
    updateStatsCounters();
}

function updateStatsCounters() {
    const counters = document.querySelectorAll('.text-2xl.font-bold.text-gray-900');
    const values = [12, 47, 8]; // Active Sources, Pending Posts, Posts Today
    
    counters.forEach((counter, index) => {
        if (values[index] !== undefined) {
            const originalValue = values[index];
            
            setInterval(() => {
                const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                const newValue = Math.max(0, originalValue + variation);
                counter.textContent = newValue;
            }, 10000); // Update every 10 seconds
        }
    });
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
    
    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    }[type] || 'bg-blue-500';
    
    notification.className += ` ${bgColor} text-white`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i data-lucide="${getNotificationIcon(type)}" class="h-5 w-5"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    lucide.createIcons();
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'alert-triangle',
        info: 'info'
    };
    return icons[type] || 'info';
}

// Form validation helper
function validateForm(formElement) {
    const requiredFields = formElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
            field.classList.remove('border-gray-300', 'focus:border-indigo-500', 'focus:ring-indigo-500');
            isValid = false;
        } else {
            field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
            field.classList.add('border-gray-300', 'focus:border-indigo-500', 'focus:ring-indigo-500');
        }
    });
    
    return isValid;
}

// Simulate API calls
function simulateApiCall(endpoint, data = null) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`API call to ${endpoint}`, data);
            resolve({
                success: Math.random() > 0.1, // 90% success rate
                data: { message: 'Operation completed successfully' },
                timestamp: new Date().toISOString()
            });
        }, Math.random() * 2000 + 500); // Random delay 500-2500ms
    });
}

// Export functions for use in other files
window.TikTokDashboard = {
    showNotification,
    validateForm,
    simulateApiCall
}; 