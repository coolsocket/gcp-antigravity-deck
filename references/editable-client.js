/**
 * Editable Deck Auto-Persistence Client
 * 
 * This script is automatically injected into index_offline.html. It:
 * 1. Attaches event listeners to all elements with contenteditable="true"
 * 2. Prevents Reveal.js keyboard actions from bubbling up during active typing
 * 3. Monitors changes and debounces them before sending a POST save request to server.py
 * 4. Animates an elegant floating save status indicator on screen
 */
(function() {
  console.log("🪄 Editable Deck client initialized! Monitoring contenteditable changes...");

  const SAVE_DELAY_MS = 1000; // Time in ms to wait after user stops typing
  let saveTimeout = null;

  // Helper to update the floating status indicator on screen
  function updateSaveStatus(state, message = "") {
    const indicator = document.getElementById("save-status-indicator");
    if (!indicator) return;

    const dot = indicator.querySelector(".dot");
    const text = indicator.querySelector(".text");

    indicator.className = ""; // Reset classes
    indicator.classList.add(state);

    if (state === "saved") {
      text.textContent = message || "Saved to Disk";
    } else if (state === "saving") {
      text.textContent = message || "Saving changes...";
    } else if (state === "error") {
      text.textContent = message || "Error saving!";
    }
  }

  // Find the closest parent <section> that has a 'data-slide-index' attribute
  function getActiveSlideInfo(element) {
    const section = element.closest("section");
    if (!section) return null;

    // Retrieve slide index. If missing, look up its position relative to siblings
    let slideNum = section.getAttribute("data-slide-index");
    if (!slideNum) {
      // Find all top-level sections
      const sections = Array.from(document.querySelectorAll(".reveal .slides > section"));
      const index = sections.indexOf(section);
      if (index !== -1) {
        slideNum = index + 1;
      }
    }
    return {
      slideNum: parseInt(slideNum, 10),
      element: section
    };
  }

  // Send content update back to local python server
  function persistSlideChange(slideNum, sectionElement) {
    updateSaveStatus("saving");

    // Clean up temporary DOM properties before saving
    const cleanSection = sectionElement.cloneNode(true);
    
    // Remove injected data-slide-index if it was dynamically set
    cleanSection.removeAttribute("data-slide-index");

    // Retrieve clean HTML content of the section
    const htmlContent = cleanSection.outerHTML;

    fetch("/api/save-slide", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        slideNum: slideNum,
        content: htmlContent
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.status === "success") {
        updateSaveStatus("saved", `Saved Slide ${slideNum}`);
        // Reset status text back to default after 2 seconds
        setTimeout(() => {
          updateSaveStatus("saved");
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to persist slide.");
      }
    })
    .catch(error => {
      console.error("❌ Error persisting change:", error);
      updateSaveStatus("error", `Save Failed: ${error.message}`);
    });
  }

  // Attach event listeners to all editable elements
  function bindEditableElements() {
    const editableElements = document.querySelectorAll("[contenteditable='true']");
    
    editableElements.forEach(element => {
      // 1. Prevent Reveal.js from hijacking key events when focusing on text fields
      element.addEventListener("keydown", function(e) {
        e.stopPropagation();
      });

      // 2. Prevent focus-out or keyboard event bubbles
      element.addEventListener("keypress", function(e) {
        e.stopPropagation();
      });

      // 3. Monitor input typing events and trigger debounced autosave
      element.addEventListener("input", function() {
        const slideInfo = getActiveSlideInfo(element);
        if (!slideInfo) return;

        updateSaveStatus("saving", "Typing...");

        // Clear existing debounce timeout
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }

        // Schedule new save
        saveTimeout = setTimeout(() => {
          persistSlideChange(slideInfo.slideNum, slideInfo.element);
        }, SAVE_DELAY_MS);
      });

      // 4. Force immediate persistence on blur (focus loss)
      element.addEventListener("blur", function() {
        const slideInfo = getActiveSlideInfo(element);
        if (!slideInfo) return;

        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }
        persistSlideChange(slideInfo.slideNum, slideInfo.element);
      });
    });
  }

  // Initial setup: Wait for DOM or Reveal.js ready events
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEditableElements);
  } else {
    bindEditableElements();
  }

  // Re-bind whenever slides change, in case dynamic templates are rendered
  if (window.Reveal) {
    Reveal.on("slidechanged", function() {
      bindEditableElements();
    });
  }
})();
