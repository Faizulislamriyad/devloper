// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAZ2xuIUMsYaKswUQday5HnvQMmYzwnLzA",
    authDomain: "faizulislamriyad2.firebaseapp.com",
    projectId: "faizulislamriyad2",
    storageBucket: "faizulislamriyad2.firebasestorage.app",
    messagingSenderId: "842077976801",
    appId: "1:842077976801:web:09d4c320179fe292961fa0",
    measurementId: "G-5S5DBRWGVE"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const loginSection = document.getElementById('login-section');
const hirePanel = document.getElementById('hire-panel');
const adminPanel = document.getElementById('admin-panel');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const saveSettingsBtn = document.getElementById('save-settings');
const aboutSection = document.getElementById('about');
const projectsSection = document.getElementById('projects');
const hireSection = document.getElementById('hire');
const footerElement = document.querySelector('footer');
const adminTaskList = document.getElementById('admin-task-list');

const SETTINGS_DOC = 'portfolioSettings';

// Helper functions
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPassword(pass) {
    return pass.length >= 6;
}
function setButtonsLoading(loading) {
    loginBtn.disabled = loading;
    signupBtn.disabled = loading;
    saveSettingsBtn.disabled = loading;
    loginBtn.textContent = loading ? '⏳' : 'Login';
    signupBtn.textContent = loading ? '⏳' : 'Signup';
}

// Load settings
async function loadSettingsAndApply() {
    try {
        const docRef = doc(db, 'settings', SETTINGS_DOC);
        const docSnap = await getDoc(docRef);
        let settings = {
            menu: ['about', 'projects', 'hire'],
            features: { showPhoto: true, showCover: true, showBio: true, showSkills: true },
            footer: { showFooter: true, showCopyright: true, showSocial: true }
        };
        if (docSnap.exists()) {
            settings = docSnap.data();
        } else {
            await setDoc(docRef, settings);
        }
        updateMenuVisibility(settings.menu || ['about', 'projects', 'hire']);
        applyFeatures(settings.features);
        applyFooter(settings.footer);
        updateCheckboxes(settings);
    } catch (error) {
        console.warn('Firebase error, using fallback defaults', error);
        updateMenuVisibility(['about', 'projects', 'hire']);
        applyFeatures({ showPhoto: true, showCover: true, showBio: true, showSkills: true });
        applyFooter({ showFooter: true, showCopyright: true, showSocial: true });
    }
}

function updateMenuVisibility(menuArray) {
    const menuMap = { 'about': document.getElementById('menu-about'), 'projects': document.getElementById('menu-projects'), 'hire': document.getElementById('menu-hire') };
    for (let [key, el] of Object.entries(menuMap)) {
        if (el) el.style.display = menuArray.includes(key) ? 'inline-block' : 'none';
    }
    aboutSection.style.display = menuArray.includes('about') ? 'block' : 'none';
    projectsSection.style.display = menuArray.includes('projects') ? 'block' : 'none';
    hireSection.style.display = menuArray.includes('hire') ? 'block' : 'none';
}

function applyFeatures(features) {
    const photo = document.getElementById('profile-photo');
    const cover = document.getElementById('cover-photo');
    const bio = document.getElementById('bio-text');
    const skills = document.getElementById('skills-list');
    if (photo) photo.style.display = features.showPhoto ? 'block' : 'none';
    if (cover) cover.style.display = features.showCover ? 'block' : 'none';
    if (bio) bio.style.display = features.showBio ? 'block' : 'none';
    if (skills) skills.style.display = features.showSkills ? 'block' : 'none';
}

function applyFooter(footer) {
    if (!footer.showFooter) {
        footerElement.style.display = 'none';
        return;
    }
    footerElement.style.display = 'block';
    const copyright = document.getElementById('footer-copyright');
    const social = document.getElementById('footer-social');
    if (copyright) copyright.style.display = footer.showCopyright ? 'inline' : 'none';
    if (social) social.style.display = footer.showSocial ? 'inline' : 'none';
}

function updateCheckboxes(settings) {
    document.getElementById('menu-about-check').checked = settings.menu.includes('about');
    document.getElementById('menu-projects-check').checked = settings.menu.includes('projects');
    document.getElementById('menu-hire-check').checked = settings.menu.includes('hire');
    document.getElementById('feature-photo').checked = settings.features?.showPhoto ?? true;
    document.getElementById('feature-cover').checked = settings.features?.showCover ?? true;
    document.getElementById('feature-bio').checked = settings.features?.showBio ?? true;
    document.getElementById('feature-skills').checked = settings.features?.showSkills ?? true;
    document.getElementById('footer-show').checked = settings.footer?.showFooter ?? true;
    document.getElementById('footer-copyright-check').checked = settings.footer?.showCopyright ?? true;
    document.getElementById('footer-social-check').checked = settings.footer?.showSocial ?? true;
}

// Save settings
async function saveSettingsToFirebase() {
    const user = auth.currentUser;
    if (!user) {
        alert('Please login first to save settings.');
        return;
    }
    const menu = [];
    if (document.getElementById('menu-about-check').checked) menu.push('about');
    if (document.getElementById('menu-projects-check').checked) menu.push('projects');
    if (document.getElementById('menu-hire-check').checked) menu.push('hire');
    const features = {
        showPhoto: document.getElementById('feature-photo').checked,
        showCover: document.getElementById('feature-cover').checked,
        showBio: document.getElementById('feature-bio').checked,
        showSkills: document.getElementById('feature-skills').checked
    };
    const footer = {
        showFooter: document.getElementById('footer-show').checked,
        showCopyright: document.getElementById('footer-copyright-check').checked,
        showSocial: document.getElementById('footer-social-check').checked
    };
    const settings = { menu, features, footer };
    try {
        await setDoc(doc(db, 'settings', SETTINGS_DOC), settings);
        alert('Settings saved to Firebase!');
        updateMenuVisibility(menu);
        applyFeatures(features);
        applyFooter(footer);
    } catch (error) {
        console.error(error);
        alert('Error saving: ' + error.message);
    }
}

// Auth UI
function updateAuthUI(user) {
    if (user) {
        loginSection.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        userInfo.textContent = `Hi, ${user.email}`;
        hirePanel.style.display = 'block';
        if (user.email === 'admin@ekta.com') {
            adminPanel.style.display = 'block';
            loadAdminTasks();
        } else {
            adminPanel.style.display = 'none';
        }
    } else {
        loginSection.style.display = 'block';
        logoutBtn.style.display = 'none';
        userInfo.textContent = '';
        hirePanel.style.display = 'none';
        adminPanel.style.display = 'none';
    }
}

async function loadAdminTasks() {
    try {
        const querySnapshot = await getDocs(collection(db, 'settings'));
        let html = '<ul>';
        querySnapshot.forEach((doc) => {
            html += `<li><strong>${doc.id}</strong>: ${JSON.stringify(doc.data())}</li>`;
        });
        html += '</ul>';
        adminTaskList.innerHTML = html || '<p>No settings found</p>';
    } catch (e) {
        adminTaskList.innerHTML = '<p>Error loading tasks</p>';
    }
}

// Login / Signup
loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const pass = loginPassword.value.trim();
    if (!isValidEmail(email)) return alert('Valid email required.');
    if (!isValidPassword(pass)) return alert('Password must be at least 6 characters.');
    setButtonsLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
        alert('Login failed: ' + err.message);
    } finally {
        setButtonsLoading(false);
    }
});

signupBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const pass = loginPassword.value.trim();
    if (!isValidEmail(email)) return alert('Valid email required.');
    if (!isValidPassword(pass)) return alert('Password must be at least 6 characters.');
    setButtonsLoading(true);
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        alert('Account created!');
    } catch (err) {
        alert('Signup failed: ' + err.message);
    } finally {
        setButtonsLoading(false);
    }
});

logoutBtn.addEventListener('click', () => signOut(auth));

// Reload settings after login
onAuthStateChanged(auth, user => {
    updateAuthUI(user);
    if (user) loadSettingsAndApply();
});

saveSettingsBtn.addEventListener('click', saveSettingsToFirebase);

// Project modal
window.showProjectDetails = function(cardElement) {
    const title = cardElement.querySelector('.card-title').innerText;
    const description = cardElement.dataset.description || 'No description available.';
    const link = cardElement.dataset.link || '#';

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-desc').textContent = description;
    const linkBtn = document.getElementById('modal-link');
    linkBtn.href = link;
    linkBtn.style.display = link === '#' ? 'none' : 'inline-block';
    document.getElementById('project-modal').style.display = 'flex';
};

window.closeModal = function() {
    document.getElementById('project-modal').style.display = 'none';
};

window.onclick = function(event) {
    const modal = document.getElementById('project-modal');
    if (event.target === modal) modal.style.display = 'none';
};

// Initial load
loadSettingsAndApply();