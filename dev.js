(function () {
  // ----- THEME TOGGLE with localStorage -----
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const themeText = document.getElementById("themeText");
  const body = document.body;

  const savedTheme = localStorage.getItem("devTheme");
  if (savedTheme === "dark") {
    body.classList.add("dark");
    themeIcon.className = "fas fa-moon";
    themeText.innerText = "Dark";
  } else {
    body.classList.remove("dark");
    themeIcon.className = "fas fa-sun";
    themeText.innerText = "Light";
  }

  function toggleTheme() {
    if (body.classList.contains("dark")) {
      body.classList.remove("dark");
      themeIcon.className = "fas fa-sun";
      themeText.innerText = "Light";
      localStorage.setItem("devTheme", "light");
    } else {
      body.classList.add("dark");
      themeIcon.className = "fas fa-moon";
      themeText.innerText = "Dark";
      localStorage.setItem("devTheme", "dark");
    }
  }

  themeToggle.addEventListener("click", toggleTheme);
  themeToggle.addEventListener("keypress", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTheme();
    }
  });

  // ----- CONTACT FORM (opens email client) -----
  const contactForm = document.getElementById("contactForm");
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("nameInput").value.trim();
    const email = document.getElementById("emailInput").value.trim();
    const message = document.getElementById("msgInput").value.trim();

    if (!name || !email || !message) {
      alert("⚠️ Please fill out all fields.");
      return;
    }

    const recipient = "mdriyadboss1234@gmail.com";
    const subject = `Message from ${name} (via portfolio)`;
    const body = `Name: ${name}%0AEmail: ${email}%0A%0AMessage:%0A${message}`;
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${body}`;

    window.location.href = mailtoLink;
  });
})();