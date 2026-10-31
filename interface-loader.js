(async function () {
  const interfaces = [
    ["interface-onboarding", "/interfaces/onboarding.html"],
    ["interface-header", "/interfaces/header.html"],
    ["interface-home", "/interfaces/home.html"],
    ["interface-search", "/interfaces/search.html"],
    ["interface-year-album", "/interfaces/year-album.html"],
    ["interface-profile", "/interfaces/profile.html"],
    ["interface-bottom-nav", "/interfaces/bottom-nav.html"],
    ["interface-assets-drawer", "/interfaces/assets-drawer.html"],
    ["interface-modals", "/interfaces/modals.html"]
  ];

  try {
    await Promise.all(interfaces.map(async ([targetId, file]) => {
      const response = await fetch(file, { cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to load ${file}: ${response.status}`);
      document.getElementById(targetId).innerHTML = await response.text();
    }));

    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/script.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load script.js"));
      document.body.appendChild(script);
    });

    // script.js originally registers DOMContentLoaded handlers.
    // Because the interfaces were fetched before it, fire the same event after
    // the original script has been registered so its startup behavior is unchanged.
    if (document.readyState !== "loading") {
      document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
    }
  } catch (error) {
    console.error(error);
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<div style="position:fixed;inset:0;z-index:99999;background:#2C2520;color:white;padding:24px;font-family:system-ui">Failed to load the scrapbook interfaces. Please make sure all files and the <code>interfaces</code> folder were uploaded to Netlify.</div>'
    );
  }
})();
