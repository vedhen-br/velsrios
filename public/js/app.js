// API Base URL
const API_BASE_URL = '/api';

// Check server status on load
window.addEventListener('DOMContentLoaded', () => {
    checkHealth();
});

// Check API Health
async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        
        const statusText = document.getElementById('status-text');
        const statusIndicator = document.getElementById('status-indicator');
        
        if (data.status === 'ok') {
            statusText.textContent = 'Sistema Online';
            statusIndicator.classList.add('online');
        }
    } catch (error) {
        console.error('Erro ao verificar status:', error);
        const statusText = document.getElementById('status-text');
        statusText.textContent = 'Sistema Offline';
    }
}

// Test API
async function testAPI() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        displayResult(data);
    } catch (error) {
        displayError('Erro ao conectar com a API: ' + error.message);
    }
}

// Get Platform Info
async function getInfo() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/info`);
        const data = await response.json();
        displayResult(data);
    } catch (error) {
        displayError('Erro ao obter informações: ' + error.message);
    }
}

// Get Users (example)
async function getUsers() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const data = await response.json();
        displayResult(data);
    } catch (error) {
        displayError('Erro ao obter usuários: ' + error.message);
    }
}

// Display Result
function displayResult(data) {
    const output = document.getElementById('api-output');
    output.textContent = JSON.stringify(data, null, 2);
    output.style.color = '#10b981'; // Green
}

// Display Error
function displayError(message) {
    const output = document.getElementById('api-output');
    output.textContent = message;
    output.style.color = '#ef4444'; // Red
}

// Show Loading
function showLoading() {
    const output = document.getElementById('api-output');
    output.textContent = 'Carregando...';
    output.style.color = '#fbbf24'; // Yellow
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Log platform info to console
console.log('%c🚀 Velsrios Platform', 'color: #4f46e5; font-size: 20px; font-weight: bold;');
console.log('%cBem-vindo à plataforma!', 'color: #7c3aed; font-size: 14px;');
