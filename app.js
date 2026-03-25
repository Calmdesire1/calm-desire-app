// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

// ==========================================
// Authentication & LocalStorage Logic
// ==========================================
const AuthSystem = {
    masterPass: "adminMaster123", // The hardcoded master password for the admin panel

    // Check if a normal user is currently authenticated
    isAuthenticated: function() {
        return localStorage.getItem('aura_authenticated') === 'true';
    },

    // Login for normal users
    login: function(username, password) {
        const users = JSON.parse(localStorage.getItem('aura_users')) || [];
        const msg = document.getElementById('errorMessage');
        
        const validUser = users.find(u => u.username === username && u.password === password);

        if (validUser) {
            localStorage.setItem('aura_authenticated', 'true');
            window.location.href = 'game.html';
        } else {
            msg.textContent = "Invalid User ID or Password.";
        }
    },

    // Logout normal user
    logout: function() {
        localStorage.removeItem('aura_authenticated');
        // Reset game progress on logout
        localStorage.removeItem('aura_current_card'); 
        window.location.href = 'index.html';
    },

    // ---- Admin Functions ----
    verifyAdmin: function(password) {
        const msg = document.getElementById('masterError');
        if (password === this.masterPass) {
            document.getElementById('adminLoginSection').classList.add('hidden');
            document.getElementById('adminDashboardSection').classList.remove('hidden');
            this.renderUsers();
        } else {
            msg.textContent = "Incorrect Master Password.";
        }
    },

    logoutAdmin: function() {
        document.getElementById('adminLoginSection').classList.remove('hidden');
        document.getElementById('adminDashboardSection').classList.add('hidden');
        document.getElementById('masterPassword').value = '';
    },

    createUser: function(username, password) {
        if (!username || !password) return;
        let users = JSON.parse(localStorage.getItem('aura_users')) || [];
        
        // Prevent duplicates
        if (users.find(u => u.username === username)) {
            alert("User ID already exists.");
            return;
        }

        users.push({ id: Date.now(), username, password });
        localStorage.setItem('aura_users', JSON.stringify(users));
        this.renderUsers();
    },

    deleteUser: function(id) {
        let users = JSON.parse(localStorage.getItem('aura_users')) || [];
        users = users.filter(u => u.id !== id);
        localStorage.setItem('aura_users', JSON.stringify(users));
        this.renderUsers();
    },

    renderUsers: function() {
        const users = JSON.parse(localStorage.getItem('aura_users')) || [];
        const tbody = document.getElementById('usersTableBody');
        const countSpan = document.getElementById('userCount');
        
        if (!tbody) return; // Not on admin page
        
        tbody.innerHTML = '';
        countSpan.textContent = users.length;

        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.username}</td>
                <td>${u.password}</td>
                <td><button class="btn-delete" onclick="AuthSystem.deleteUser(${u.id})">Delete</button></td>
            `;
            tbody.appendChild(tr);
        });
    }
};

// ==========================================
// Game Mechanics
// ==========================================
const GameSystem = {
    totalCards: 69, // Loops after the 69th card
    currentCard: 1,

    init: function() {
        const savedCard = localStorage.getItem('aura_current_card');
        if (savedCard) {
            this.currentCard = parseInt(savedCard, 10);
        }
        this.updateUI();
    },

    nextCard: function() {
        const cardDisplay = document.getElementById('activeCard');
        
        // Retrigger animation
        cardDisplay.style.animation = 'none';
        cardDisplay.offsetHeight; /* trigger reflow */
        cardDisplay.style.animation = null;

        this.currentCard++;
        if (this.currentCard > this.totalCards) {
            this.currentCard = 1; // Loop back to the first card
        }

        localStorage.setItem('aura_current_card', this.currentCard.toString());
        this.updateUI();
    },

    updateUI: function() {
        const counter = document.getElementById('cardCounter');
        const numDisplay = document.getElementById('cardNumberDisplay');
        const quoteDisplay = document.getElementById('cardQuoteDisplay');

        if (counter) counter.textContent = this.currentCard;
        if (numDisplay) numDisplay.textContent = `Card #${this.currentCard}`;
        
        // As requested by safety guidelines, these are placeholders.
        if (quoteDisplay) {
            quoteDisplay.textContent = `[This is placeholder text for the intimate quote belonging to Card ${this.currentCard}. Replace this text with your intended content in the future via an array of quotes.]`;
        }
    }
};
