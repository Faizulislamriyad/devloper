// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js';

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
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const saveSettingsBtn = document.getElementById('save-settings');
const aboutSection = document.getElementById('about');
const projectsSection = document.getElementById('projects');
const hireSection = document.getElementById('hire');
const footerElement = document.querySelector('footer');
const adminTaskList = document.getElementById('admin-task-list');

// Edit panels
const profileEdit = document.getElementById('profile-edit');
const workEdit = document.getElementById('work-edit');
const educationEdit = document.getElementById('education-edit');
const projectsEdit = document.getElementById('projects-edit');

// Edit inputs
const editName = document.getElementById('edit-name');
const editBio = document.getElementById('edit-bio');
const editProfilePhoto = document.getElementById('edit-profile-photo');
const editCoverPhoto = document.getElementById('edit-cover-photo');
const editSkills = document.getElementById('edit-skills');
const saveProfileBtn = document.getElementById('save-profile');
const workListDiv = document.getElementById('work-list');
const addWorkBtn = document.getElementById('add-work');
const saveWorkBtn = document.getElementById('save-work');
const educationListDiv = document.getElementById('education-list');
const addEducationBtn = document.getElementById('add-education');
const saveEducationBtn = document.getElementById('save-education');
const projectsListDiv = document.getElementById('projects-list');
const addProjectBtn = document.getElementById('add-project');
const saveProjectsBtn = document.getElementById('save-projects');

// Display elements
const profilePhoto = document.getElementById('profile-photo');
const coverPhoto = document.getElementById('cover-photo');
const bioHeading = document.getElementById('bio-text');
const bioParagraph = document.getElementById('bio-paragraph');
const skillsList = document.getElementById('skills-list');
const workDisplay = document.getElementById('work-list-display');
const educationDisplay = document.getElementById('education-list-display');
const projectsGrid = document.getElementById('projects-grid');

const SETTINGS_DOC = 'portfolioSettings';
const ADMIN_EMAIL = 'mdriyadboss1234@gmail.com';

// Default data
const defaultSettings = {
  menu: ['about', 'projects', 'hire'],
  features: { showPhoto: true, showCover: true, showBio: true, showSkills: true },
  footer: { showFooter: true, showCopyright: true, showSocial: true },
  profile: {
    name: 'FAIZUL ISLAM RIYAD',
    bio: 'I have a rare ability to think differently and simplify complex ideas into elegant, practical solutions. This allows me to design and build projects with unique, innovative features that are both user-friendly and impactful. My work focuses on creativity, clarity, and functionality, ensuring every project stands out with its originality and effectiveness.',
    profilePhoto: 'riyad.png',
    coverPhoto: 'cover.jpg',
    skills: ['HTML', 'CSS', 'Python', 'JavaScript', 'React', 'Firebase', 'UI/UX', 'Node.js', 'Figma']
  },
  work: [
    { title: 'No Work Experience', company: '', description: '', startDate: '', endDate: '' }
  ],
  education: [
    { degree: 'Diploma in Eng (CSE)', institution: 'Barishal Polytechnic Institute, Barishal', year: '2023-24' }
  ],
  projects: [
    { id: 1, title: 'Ramdan Times', description: 'A brutalist dashboard with neo elements. Built with React and D3.', image: 'ramdan.jpg', link: 'https://ramadantime-five.vercel.app/', creationDate: '2024-01-15', features: 'Neo-brutalist design, D3 charts, responsive', versions: '1.2', lastUpdate: '2024-02-20' },
    { id: 2, title: 'AI motion gallery', description: 'AI-generated motion gallery using TensorFlow.js and Canvas.', image: 'https://picsum.photos/300/300?random=2', link: '#', creationDate: '2024-02-10', features: 'TensorFlow.js, canvas animations', versions: '0.9', lastUpdate: '2024-03-01' },
    { id: 3, title: 'Weather p2p', description: 'Peer-to-peer weather sharing app with WebRTC and OpenWeather API.', image: 'https://picsum.photos/300/300?random=3', link: '#', creationDate: '2023-12-05', features: 'WebRTC, geolocation', versions: '2.0', lastUpdate: '2024-01-18' },
    { id: 4, title: 'Eco tracker', description: 'Eco tracker for carbon footprint using Leaflet maps and local storage.', image: 'https://picsum.photos/300/300?random=4', link: '#', creationDate: '2024-03-01', features: 'Leaflet, local storage', versions: '1.1', lastUpdate: '2024-03-10' }
  ]
};

// Helper functions
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isValidPassword(pass) { return pass.length >= 6; }
function setButtonsLoading(loading) {
  loginBtn.disabled = loading;
  saveSettingsBtn.disabled = loading;
  loginBtn.textContent = loading ? '⏳' : 'Login';
}

// Load settings and apply to UI
async function loadSettingsAndApply() {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC);
    const docSnap = await getDoc(docRef);
    let settings = defaultSettings;
    if (docSnap.exists()) {
      settings = { ...defaultSettings, ...docSnap.data() };
    } else {
      await setDoc(docRef, settings);
    }
    // Update visibility
    updateMenuVisibility(settings.menu);
    applyFeatures(settings.features);
    applyFooter(settings.footer);
    // Update profile
    updateProfile(settings.profile);
    // Update work & education
    updateWorkEducation(settings.work, settings.education);
    // Update projects
    updateProjects(settings.projects);
    // Fill edit forms if admin
    if (auth.currentUser && auth.currentUser.email === ADMIN_EMAIL) {
      fillEditForms(settings);
    }
  } catch (error) {
    console.warn('Firebase error, using defaults', error);
    updateMenuVisibility(defaultSettings.menu);
    applyFeatures(defaultSettings.features);
    applyFooter(defaultSettings.footer);
    updateProfile(defaultSettings.profile);
    updateWorkEducation(defaultSettings.work, defaultSettings.education);
    updateProjects(defaultSettings.projects);
  }
}

function updateProfile(profile) {
  profilePhoto.src = profile.profilePhoto || 'riyad.png';
  coverPhoto.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${profile.coverPhoto || 'cover.jpg'}')`;
  bioHeading.textContent = profile.name || 'FAIZUL ISLAM RIYAD';
  bioParagraph.textContent = profile.bio || '';
  skillsList.innerHTML = profile.skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
}

function updateWorkEducation(work, education) {
  workDisplay.innerHTML = work.map(w => `<li><strong>${w.title}</strong> ${w.company ? 'at ' + w.company : ''}<br>${w.startDate} - ${w.endDate}<br>${w.description}</li>`).join('');
  educationDisplay.innerHTML = education.map(e => `<li><strong>${e.degree}</strong> – ${e.institution}, ${e.year}</li>`).join('');
}

function updateProjects(projects) {
  projectsGrid.innerHTML = projects.map(p => `
    <div class="project-card" data-id="${p.id}" onclick="showProjectDetails(this)"
         data-description="${p.description}"
         data-link="${p.link}"
         data-creation="${p.creationDate}"
         data-features="${p.features}"
         data-versions="${p.versions}"
         data-lastupdate="${p.lastUpdate}">
      <div class="card-image">
        <img src="${p.image}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;">
      </div>
      <div class="card-title">${p.title}</div>
    </div>
  `).join('');
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
  const bio = document.getElementById('bio-paragraph');
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

// Save visibility settings
async function saveSettingsToFirebase() {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) {
    alert('Only admin can save settings.');
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
    await setDoc(doc(db, 'settings', SETTINGS_DOC), settings, { merge: true });
    alert('Visibility settings saved to Firebase!');
    updateMenuVisibility(menu);
    applyFeatures(features);
    applyFooter(footer);
  } catch (error) {
    console.error(error);
    alert('Error saving: ' + error.message);
  }
}

// Fill edit forms with current settings
function fillEditForms(settings) {
  editName.value = settings.profile.name;
  editBio.value = settings.profile.bio;
  editProfilePhoto.value = settings.profile.profilePhoto;
  editCoverPhoto.value = settings.profile.coverPhoto;
  editSkills.value = settings.profile.skills.join(', ');
  
  // Work list
  workListDiv.innerHTML = settings.work.map((w, i) => `
    <div class="work-entry">
      <input type="text" placeholder="Title" value="${w.title}" data-index="${i}" class="work-title">
      <input type="text" placeholder="Company" value="${w.company}" data-index="${i}" class="work-company">
      <input type="text" placeholder="Start" value="${w.startDate}" data-index="${i}" class="work-start">
      <input type="text" placeholder="End" value="${w.endDate}" data-index="${i}" class="work-end">
      <input type="text" placeholder="Description" value="${w.description}" data-index="${i}" class="work-desc">
      <button class="remove-work" data-index="${i}">Remove</button>
    </div>
  `).join('');
  
  // Education list
  educationListDiv.innerHTML = settings.education.map((e, i) => `
    <div class="edu-entry">
      <input type="text" placeholder="Degree" value="${e.degree}" data-index="${i}" class="edu-degree">
      <input type="text" placeholder="Institution" value="${e.institution}" data-index="${i}" class="edu-institution">
      <input type="text" placeholder="Year" value="${e.year}" data-index="${i}" class="edu-year">
      <button class="remove-edu" data-index="${i}">Remove</button>
    </div>
  `).join('');
  
  // Projects list
  projectsListDiv.innerHTML = settings.projects.map((p, i) => `
    <div class="project-entry">
      <input type="text" placeholder="Title" value="${p.title}" data-index="${i}" class="proj-title">
      <input type="text" placeholder="Description" value="${p.description}" data-index="${i}" class="proj-desc">
      <input type="text" placeholder="Image URL" value="${p.image}" data-index="${i}" class="proj-image">
      <input type="text" placeholder="Link" value="${p.link}" data-index="${i}" class="proj-link">
      <input type="text" placeholder="Creation Date" value="${p.creationDate}" data-index="${i}" class="proj-creation">
      <input type="text" placeholder="Features" value="${p.features}" data-index="${i}" class="proj-features">
      <input type="text" placeholder="Versions" value="${p.versions}" data-index="${i}" class="proj-versions">
      <input type="text" placeholder="Last Update" value="${p.lastUpdate}" data-index="${i}" class="proj-lastupdate">
      <button class="remove-project" data-index="${i}">Remove</button>
    </div>
  `).join('');
  
  // Attach remove events
  document.querySelectorAll('.remove-work').forEach(btn => btn.addEventListener('click', removeWorkEntry));
  document.querySelectorAll('.remove-edu').forEach(btn => btn.addEventListener('click', removeEduEntry));
  document.querySelectorAll('.remove-project').forEach(btn => btn.addEventListener('click', removeProjectEntry));
}

function removeWorkEntry(e) {
  e.target.closest('.work-entry').remove();
}
function removeEduEntry(e) {
  e.target.closest('.edu-entry').remove();
}
function removeProjectEntry(e) {
  e.target.closest('.project-entry').remove();
}

// Save profile
saveProfileBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) return alert('Admin only');
  
  const settingsRef = doc(db, 'settings', SETTINGS_DOC);
  const docSnap = await getDoc(settingsRef);
  const current = docSnap.exists() ? docSnap.data() : defaultSettings;
  
  const updatedProfile = {
    name: editName.value,
    bio: editBio.value,
    profilePhoto: editProfilePhoto.value,
    coverPhoto: editCoverPhoto.value,
    skills: editSkills.value.split(',').map(s => s.trim())
  };
  
  await setDoc(settingsRef, { ...current, profile: updatedProfile }, { merge: true });
  alert('Profile saved');
  loadSettingsAndApply();
});

// Save work
saveWorkBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) return alert('Admin only');
  
  const entries = Array.from(document.querySelectorAll('.work-entry')).map(div => ({
    title: div.querySelector('.work-title').value,
    company: div.querySelector('.work-company').value,
    startDate: div.querySelector('.work-start').value,
    endDate: div.querySelector('.work-end').value,
    description: div.querySelector('.work-desc').value
  }));
  
  const settingsRef = doc(db, 'settings', SETTINGS_DOC);
  const docSnap = await getDoc(settingsRef);
  const current = docSnap.exists() ? docSnap.data() : defaultSettings;
  
  await setDoc(settingsRef, { ...current, work: entries }, { merge: true });
  alert('Work saved');
  loadSettingsAndApply();
});

// Save education
saveEducationBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) return alert('Admin only');
  
  const entries = Array.from(document.querySelectorAll('.edu-entry')).map(div => ({
    degree: div.querySelector('.edu-degree').value,
    institution: div.querySelector('.edu-institution').value,
    year: div.querySelector('.edu-year').value
  }));
  
  const settingsRef = doc(db, 'settings', SETTINGS_DOC);
  const docSnap = await getDoc(settingsRef);
  const current = docSnap.exists() ? docSnap.data() : defaultSettings;
  
  await setDoc(settingsRef, { ...current, education: entries }, { merge: true });
  alert('Education saved');
  loadSettingsAndApply();
});

// Save projects
saveProjectsBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) return alert('Admin only');
  
  const entries = Array.from(document.querySelectorAll('.project-entry')).map((div, idx) => ({
    id: idx + 1,
    title: div.querySelector('.proj-title').value,
    description: div.querySelector('.proj-desc').value,
    image: div.querySelector('.proj-image').value,
    link: div.querySelector('.proj-link').value,
    creationDate: div.querySelector('.proj-creation').value,
    features: div.querySelector('.proj-features').value,
    versions: div.querySelector('.proj-versions').value,
    lastUpdate: div.querySelector('.proj-lastupdate').value
  }));
  
  const settingsRef = doc(db, 'settings', SETTINGS_DOC);
  const docSnap = await getDoc(settingsRef);
  const current = docSnap.exists() ? docSnap.data() : defaultSettings;
  
  await setDoc(settingsRef, { ...current, projects: entries }, { merge: true });
  alert('Projects saved');
  loadSettingsAndApply();
});

// Add new empty work entry
addWorkBtn.addEventListener('click', () => {
  const div = document.createElement('div');
  div.className = 'work-entry';
  div.innerHTML = `
    <input type="text" placeholder="Title" class="work-title">
    <input type="text" placeholder="Company" class="work-company">
    <input type="text" placeholder="Start" class="work-start">
    <input type="text" placeholder="End" class="work-end">
    <input type="text" placeholder="Description" class="work-desc">
    <button class="remove-work">Remove</button>
  `;
  workListDiv.appendChild(div);
  div.querySelector('.remove-work').addEventListener('click', removeWorkEntry);
});

// Add new empty education entry
addEducationBtn.addEventListener('click', () => {
  const div = document.createElement('div');
  div.className = 'edu-entry';
  div.innerHTML = `
    <input type="text" placeholder="Degree" class="edu-degree">
    <input type="text" placeholder="Institution" class="edu-institution">
    <input type="text" placeholder="Year" class="edu-year">
    <button class="remove-edu">Remove</button>
  `;
  educationListDiv.appendChild(div);
  div.querySelector('.remove-edu').addEventListener('click', removeEduEntry);
});

// Add new empty project entry
addProjectBtn.addEventListener('click', () => {
  const div = document.createElement('div');
  div.className = 'project-entry';
  div.innerHTML = `
    <input type="text" placeholder="Title" class="proj-title">
    <input type="text" placeholder="Description" class="proj-desc">
    <input type="text" placeholder="Image URL" class="proj-image">
    <input type="text" placeholder="Link" class="proj-link">
    <input type="text" placeholder="Creation Date" class="proj-creation">
    <input type="text" placeholder="Features" class="proj-features">
    <input type="text" placeholder="Versions" class="proj-versions">
    <input type="text" placeholder="Last Update" class="proj-lastupdate">
    <button class="remove-project">Remove</button>
  `;
  projectsListDiv.appendChild(div);
  div.querySelector('.remove-project').addEventListener('click', removeProjectEntry);
});

// Project modal with full details
window.showProjectDetails = function(cardElement) {
  const title = cardElement.querySelector('.card-title').innerText;
  const description = cardElement.dataset.description || 'No description.';
  const link = cardElement.dataset.link || '#';
  const creation = cardElement.dataset.creation || 'Unknown';
  const features = cardElement.dataset.features || 'Not specified';
  const versions = cardElement.dataset.versions || 'Not specified';
  const lastUpdate = cardElement.dataset.lastupdate || 'Unknown';

  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-desc').innerHTML = `
    <p><strong>Description:</strong> ${description}</p>
    <p><strong>Creation Date:</strong> ${creation}</p>
    <p><strong>Features:</strong> ${features}</p>
    <p><strong>Versions:</strong> ${versions}</p>
    <p><strong>Last Update:</strong> ${lastUpdate}</p>
  `;
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

// ---------- UPDATED AUTH LOGIC ----------
loginBtn.addEventListener('click', async () => {
  const email = loginEmail.value.trim();
  const pass = loginPassword.value.trim();
  if (!isValidEmail(email)) return alert('Valid email required.');
  if (!isValidPassword(pass)) return alert('Password must be at least 6 characters.');
  setButtonsLoading(true);
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged will handle the rest
  } catch (err) {
    alert('Login failed: ' + err.message);
  } finally {
    setButtonsLoading(false);
  }
});

logoutBtn.addEventListener('click', () => signOut(auth));

// Monitor auth state and enforce admin-only
onAuthStateChanged(auth, user => {
  if (user) {
    // Check if the logged-in user is the specific admin
    if (user.email !== ADMIN_EMAIL) {
      // Not allowed – sign out and show message
      signOut(auth);
      alert('Access denied. Only the admin (mdriyadboss1234@gmail.com) can log in.');
      return;
    }
    // Admin is logged in – show UI
    loginSection.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    userInfo.textContent = `Hi, ${user.email}`;
    hirePanel.style.display = 'block';
    adminPanel.style.display = 'block';
    profileEdit.style.display = 'block';
    workEdit.style.display = 'block';
    educationEdit.style.display = 'block';
    projectsEdit.style.display = 'block';
    loadAdminTasks();
    loadSettingsAndApply(); // reload with admin rights
  } else {
    // Not logged in – show public view
    loginSection.style.display = 'block';
    logoutBtn.style.display = 'none';
    userInfo.textContent = '';
    hirePanel.style.display = 'none';
    adminPanel.style.display = 'none';
    profileEdit.style.display = 'none';
    workEdit.style.display = 'none';
    educationEdit.style.display = 'none';
    projectsEdit.style.display = 'none';
    // Load default public view
    updateMenuVisibility(defaultSettings.menu);
    applyFeatures(defaultSettings.features);
    applyFooter(defaultSettings.footer);
    updateProfile(defaultSettings.profile);
    updateWorkEducation(defaultSettings.work, defaultSettings.education);
    updateProjects(defaultSettings.projects);
  }
});

async function loadAdminTasks() {
  try {
    const querySnapshot = await getDocs(collection(db, 'settings'));
    let html = '<ul>';
    querySnapshot.forEach((doc) => {
      html += `<li><strong>${doc.id}</strong>: ${JSON.stringify(doc.data()).substring(0,100)}…</li>`;
    });
    html += '</ul>';
    adminTaskList.innerHTML = html || '<p>No settings found</p>';
  } catch (e) {
    adminTaskList.innerHTML = '<p>Error loading tasks</p>';
  }
}

saveSettingsBtn.addEventListener('click', saveSettingsToFirebase);

// Initial load for public
loadSettingsAndApply();