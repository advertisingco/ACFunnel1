// script.js

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 1. UTM HANDLING & PARAMETER PRESERVATION
  // -------------------------------------------------------------
  const UTM_PARAMS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'fbclid',
    'gclid',
    'ttclid',
    'msclkid'
  ];

  // Capture UTM parameters from URL and save in sessionStorage
  function captureUTMParams() {
    const urlParams = new URLSearchParams(window.location.search);
    let capturedAny = false;

    UTM_PARAMS.forEach(param => {
      if (urlParams.has(param)) {
        sessionStorage.setItem(param, urlParams.get(param));
        capturedAny = true;
      }
    });

    if (capturedAny) {
      console.log('UTM parameters captured and stored in sessionStorage.');
    }
  }

  // Get current stored UTM parameters as a query string
  function getUTMQueryString() {
    const params = new URLSearchParams();
    UTM_PARAMS.forEach(param => {
      const val = sessionStorage.getItem(param);
      if (val) {
        params.append(param, val);
      }
    });
    const qStr = params.toString();
    return qStr ? '?' + qStr : '';
  }

  // Append stored UTM parameters to all internal links
  function appendUTMsToInternalLinks() {
    const queryStr = getUTMQueryString();
    if (!queryStr) return;

    const links = document.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('booking.html') || href.startsWith('thank-you.html') || href.startsWith('privacy.html') || href.startsWith('terms.html') || href.startsWith('/booking.html') || href.startsWith('/thank-you.html'))) {
        try {
          const url = new URL(link.href);
          // Only append if it doesn't already have query parameters
          if (!url.search) {
            link.href = link.href + queryStr;
          }
        } catch (e) {
          // Fallback if URL constructor fails (e.g. relative path on local file)
          if (!href.includes('?')) {
            link.setAttribute('href', href + queryStr);
          }
        }
      }
    });
  }

  // Run UTM capturing first (if landing on index.html)
  captureUTMParams();
  // Update all internal links on page
  appendUTMsToInternalLinks();

  // Helper to redirect with UTM query parameters appended
  window.redirectWithUTMs = function(targetUrl) {
    const queryStr = getUTMQueryString();
    window.location.href = targetUrl + queryStr;
  };


  // -------------------------------------------------------------
  // 2. STICKY BOTTOM CTA BANNER
  // -------------------------------------------------------------
  const stickyCta = document.getElementById('sticky-cta-banner');
  const heroSection = document.getElementById('hero-section');

  if (stickyCta && heroSection) {
    window.addEventListener('scroll', () => {
      const heroHeight = heroSection.offsetHeight;
      const scrollPosition = window.scrollY;

      // Show sticky CTA after scrolling past the hero
      if (scrollPosition > heroHeight - 100) {
        stickyCta.classList.add('show');
      } else {
        stickyCta.classList.remove('show');
      }
    });
  }


  // -------------------------------------------------------------
  // 3. FAQ ACCORDION
  // -------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        // Close other items if desired
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
          }
        });

        // Toggle current item
        item.classList.toggle('active');
      });
    }
  });


  // -------------------------------------------------------------
  // 4. MULTI-STEP QUALIFICATION FORM
  // -------------------------------------------------------------
  const formElement = document.getElementById('qualification-form');
  const formSteps = document.querySelectorAll('.form-step');
  const progressBarFill = document.getElementById('form-progress-fill');

  if (formElement && formSteps.length > 0) {
    let currentStepIndex = 0;

    const totalSteps = formSteps.length;

    // Set initial progress
    updateProgress();

    // Attach click events to card options to auto-advance if applicable
    const cardOptions = formElement.querySelectorAll('.form-option-card');
    cardOptions.forEach(card => {
      card.addEventListener('click', () => {
        // Toggle active design
        const siblingCards = card.parentNode.querySelectorAll('.form-option-card');
        siblingCards.forEach(s => s.classList.remove('selected'));
        card.classList.add('selected');

        // Check the radio input
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
        }

        // Auto-advance with small visual delay for smooth response
        setTimeout(() => {
          if (currentStepIndex < totalSteps - 1) {
            goToStep(currentStepIndex + 1);
          }
        }, 300);
      });
    });

    // Back button triggers
    const backBtns = formElement.querySelectorAll('.btn-back');
    backBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStepIndex > 0) {
          goToStep(currentStepIndex - 1);
        }
      });
    });

    // Next button triggers (for text fields or fallback)
    const nextBtns = formElement.querySelectorAll('.btn-next');
    nextBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Basic validation: make sure at least something is selected or filled
        const activeStep = formSteps[currentStepIndex];
        const textInput = activeStep.querySelector('input[type="text"]');
        const selectedRadio = activeStep.querySelector('input[type="radio"]:checked');

        if (textInput && textInput.value.trim() === '') {
          textInput.focus();
          textInput.style.borderColor = '#ef4444';
          return;
        } else if (textInput) {
          textInput.style.borderColor = 'var(--border-color)';
        }

        if (currentStepIndex < totalSteps - 1) {
          goToStep(currentStepIndex + 1);
        }
      });
    });

    // Handle form submission
    formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Basic validation for the final step (e.g. text input for business url / contact)
      const activeStep = formSteps[currentStepIndex];
      const finalInput = activeStep.querySelector('input[type="text"]');
      if (finalInput && finalInput.value.trim() === '') {
        finalInput.focus();
        finalInput.style.borderColor = '#ef4444';
        return;
      }

      // Collect data and redirect to booking page
      console.log('Qualification form completed successfully!');
      
      // Preserve UTMs in redirect
      window.redirectWithUTMs('booking.html');
    });

    function goToStep(index) {
      formSteps[currentStepIndex].classList.remove('active');
      currentStepIndex = index;
      formSteps[currentStepIndex].classList.add('active');
      updateProgress();
    }

    function updateProgress() {
      if (progressBarFill) {
        const percentage = ((currentStepIndex + 1) / totalSteps) * 100;
        progressBarFill.style.width = `${percentage}%`;
      }
    }
  }


  // -------------------------------------------------------------
  // 5. INTERACTIVE BOOKING CALENDAR WIDGET
  // -------------------------------------------------------------
  const daysGrid = document.getElementById('calendar-days-grid');
  const timeslotsList = document.getElementById('timeslots-list');
  const selectedDateText = document.getElementById('selected-date-text');
  const confirmBookingBtn = document.getElementById('confirm-booking-btn');

  if (daysGrid && timeslotsList) {
    let selectedDay = null;
    let selectedTime = null;

    // Standard days in July 2026
    const daysCount = 31;
    // Let's seed available days (only Mon-Fri to match client acquisition agencies)
    const startDayOfWeek = 3; // July 1, 2026 is a Wednesday

    for (let d = 1; d <= daysCount; d++) {
      const dayCell = document.createElement('div');
      dayCell.classList.add('day-cell');
      dayCell.innerText = d;

      // Determine day of week
      const currentDayOfWeek = (startDayOfWeek + d - 1) % 7;
      const isWeekend = (currentDayOfWeek === 0 || currentDayOfWeek === 6);

      // Make past days inactive (let's say July 1 to 6 are past days since local date is July 7, 2026)
      if (isWeekend || d < 7) {
        dayCell.classList.add('inactive');
      } else {
        dayCell.classList.add('available');
        
        dayCell.addEventListener('click', () => {
          // Clear current selection
          document.querySelectorAll('.day-cell').forEach(c => c.classList.remove('selected'));
          dayCell.classList.add('selected');
          selectedDay = d;

          // Update display text
          if (selectedDateText) {
            selectedDateText.innerText = `Select Time for Wednesday, July ${d}, 2026`;
          }

          // Load simulated timeslots
          loadSimulatedTimeslots(d);
          
          // Clear previous time selection
          selectedTime = null;
          if (confirmBookingBtn) {
            confirmBookingBtn.disabled = true;
          }
        });
      }

      daysGrid.appendChild(dayCell);
    }

    // Load static simulated timeslots for selected day
    function loadSimulatedTimeslots(dayNum) {
      timeslotsList.innerHTML = '';
      
      const slots = [
        '09:00 AM EST',
        '10:30 AM EST',
        '11:00 AM EST',
        '01:30 PM EST',
        '03:00 PM EST',
        '04:30 PM EST'
      ];

      slots.forEach(slot => {
        const slotBtn = document.createElement('button');
        slotBtn.classList.add('timeslot-btn');
        slotBtn.innerText = slot;

        slotBtn.addEventListener('click', () => {
          document.querySelectorAll('.timeslot-btn').forEach(b => b.classList.remove('active'));
          slotBtn.classList.add('active');
          selectedTime = slot;

          // Enable confirmation button
          if (confirmBookingBtn) {
            confirmBookingBtn.disabled = false;
            confirmBookingBtn.innerText = `Confirm Booking for 07/${dayNum} at ${slot}`;
          }
        });

        timeslotsList.appendChild(slotBtn);
      });
    }

    // Confirm Booking Redirect
    if (confirmBookingBtn) {
      confirmBookingBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (selectedDay && selectedTime) {
          console.log(`Booking confirmed for July ${selectedDay} at ${selectedTime}`);
          // Redirect to thank-you page with UTMs preserved
          window.redirectWithUTMs('thank-you.html');
        }
      });
    }
  }
});
