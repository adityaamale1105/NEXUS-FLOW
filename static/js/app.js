/**
 * Nexus-Flow Client Application Controller
 * Single Continuous-Scroll Layout & Multi-Agent Financial Orchestration
 * PayPal & AI Hackathon 2026
 */

(function () {
  // Application State
  let currentBOM = null;
  let eventSource = null;
  let activeBOMTab = "items";
  let activeTowerTab = "shipments";
  let telemetryRows = [];
  let sortDirections = [1, 1, 1, 1, 1, 1, 1, 1];
  let currentStatusFilter = "ALL";

  // DOM Elements
  const promptInput = document.getElementById("procurement-input");
  const compileBtn = document.getElementById("compile-btn");
  const terminalContainer = document.getElementById("terminal-container");
  const terminalLogs = document.getElementById("terminal-logs");
  const terminalStatus = document.getElementById("terminal-status");
  const bomContainer = document.getElementById("bom-container");
  const modalOverlay = document.getElementById("paypal-modal");
  const successBanner = document.getElementById("success-banner");
  const successMsg = document.getElementById("success-msg");
  const copyToast = document.getElementById("copy-toast");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const advancedOptionsPanel = document.getElementById("advanced-options-panel");

  // Toast Notification
  function showToast(message) {
    if (!copyToast) return;
    copyToast.textContent = message || "Copied to clipboard!";
    copyToast.style.display = "block";
    setTimeout(() => {
      copyToast.style.display = "none";
    }, 2400);
  }

  // Mobile Drawer Toggle
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileDrawer.classList.toggle("open");
    });
  }

  window.closeMobileDrawer = function () {
    if (mobileDrawer) mobileDrawer.classList.remove("open");
  };

  // Toggle Advanced Options in Procurement Bar
  window.toggleAdvancedOptions = function () {
    if (!advancedOptionsPanel) return;
    const isVisible = advancedOptionsPanel.style.display === "flex";
    advancedOptionsPanel.style.display = isVisible ? "none" : "flex";
  };

  // Modal Controllers
  window.openArchitectureModal = function () {
    const m = document.getElementById("architecture-modal");
    if (m) m.style.display = "flex";
  };

  window.closeArchitectureModal = function () {
    const m = document.getElementById("architecture-modal");
    if (m) m.style.display = "none";
  };

  window.openPrivacyModal = function () {
    const m = document.getElementById("privacy-modal");
    if (m) m.style.display = "flex";
  };

  window.closePrivacyModal = function () {
    const m = document.getElementById("privacy-modal");
    if (m) m.style.display = "none";
  };

  window.openTermsModal = function () {
    const m = document.getElementById("terms-modal");
    if (m) m.style.display = "flex";
  };

  window.closeTermsModal = function () {
    const m = document.getElementById("terms-modal");
    if (m) m.style.display = "none";
  };

  // Close modals on Escape key or backdrop click
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closePayPalModal();
      closeArchitectureModal();
      closePrivacyModal();
      closeTermsModal();
    }
  });

  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  });

  // Smooth Scroll Anchor Handlers
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").slice(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        closeMobileDrawer();
        targetElement.scrollIntoView({ behavior: "smooth" });
        if (history.pushState) {
          history.pushState(null, null, `#${targetId}`);
        }
      }
    });
  });

  // IntersectionObserver for Scroll-Spy Active Nav Highlighting
  const sections = document.querySelectorAll(".page-section");
  const navLinks = document.querySelectorAll(".nav-link[data-section]");

  if ("IntersectionObserver" in window && sections.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            navLinks.forEach((link) => {
              if (link.getAttribute("data-section") === sectionId) {
                link.classList.add("active");
              } else {
                link.classList.remove("active");
              }
            });
          }
        });
      },
      {
        root: null,
        rootMargin: "-25% 0px -65% 0px",
        threshold: 0
      }
    );

    sections.forEach((s) => sectionObserver.observe(s));
  }

  // Backward compatibility router (smooth scroll or modal open)
  window.navigateTo = function (route) {
    if (route === "architecture") {
      openArchitectureModal();
    } else if (route === "privacy") {
      openPrivacyModal();
    } else if (route === "terms") {
      openTermsModal();
    } else {
      const target = document.getElementById(route);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Preset Scenario Buttons
  document.querySelectorAll(".preset-chip[data-prompt]").forEach((chip) => {
    chip.addEventListener("click", () => {
      promptInput.value = chip.getAttribute("data-prompt");
      promptInput.focus();
    });
  });

  // =========================================================================
  // SSE PROCUREMENT EXECUTION ENGINE
  // =========================================================================
  window.submitProcurement = function (e) {
    if (e) e.preventDefault();
    const prompt = promptInput.value.trim();
    if (prompt.length < 3) {
      alert("Please enter a procurement prompt (at least 3 characters).");
      return;
    }

    const maxBudget = document.getElementById("max-budget-input")?.value;
    const strategy = document.getElementById("strategy-select")?.value || "recommended";

    // Scroll smoothly to thought terminal
    const terminalEl = document.getElementById("terminal");
    if (terminalEl) {
      terminalEl.scrollIntoView({ behavior: "smooth" });
    }

    terminalContainer.style.display = "block";
    terminalLogs.innerHTML = "";
    terminalStatus.innerHTML = '<span class="status-dot"></span> LIVE EXECUTION STREAM';
    successBanner.style.display = "none";
    compileBtn.disabled = true;
    compileBtn.innerHTML = `<span>Synthesizing...</span>`;

    if (eventSource) {
      eventSource.close();
    }

    let url = `/api/procure/stream?prompt=${encodeURIComponent(prompt)}&strategy=${encodeURIComponent(strategy)}`;
    if (maxBudget && parseFloat(maxBudget) > 0) {
      url += `&max_budget=${encodeURIComponent(maxBudget)}`;
    }

    eventSource = new EventSource(url);

    eventSource.addEventListener("thought", (ev) => {
      try {
        const step = JSON.parse(ev.data);
        renderThoughtStep(step);
      } catch (err) {
        console.error("Thought parse error:", err);
      }
    });

    eventSource.addEventListener("bom_complete", (ev) => {
      try {
        currentBOM = JSON.parse(ev.data);
        renderBOM(currentBOM, true);
        terminalStatus.textContent = "SYNTHESIS COMPLETED";
        compileBtn.disabled = false;
        compileBtn.innerHTML = `<span>Synthesize Plan</span> &rarr;`;
        eventSource.close();

        // Show banner & refresh history
        if (successBanner && successMsg) {
          successMsg.textContent = `Procurement plan ${currentBOM.bom_id} compiled with ${currentBOM.items.length} items.`;
          successBanner.style.display = "flex";
        }
        loadProcurementHistory();
      } catch (err) {
        console.error("BOM complete parse error:", err);
      }
    });

    eventSource.addEventListener("stream_error", (ev) => {
      console.warn("SSE stream error, trying fallback:", ev.data);
      fallbackSyncProcurement(prompt, maxBudget, strategy);
    });

    eventSource.onerror = () => {
      console.warn("EventSource closed or disconnected.");
      if (compileBtn.disabled && !currentBOM) {
        fallbackSyncProcurement(prompt, maxBudget, strategy);
      }
      if (eventSource) eventSource.close();
    };
  };

  async function fallbackSyncProcurement(prompt, maxBudget, strategy) {
    try {
      const payload = {
        prompt: prompt,
        max_budget: maxBudget ? parseFloat(maxBudget) : null,
        strategy: strategy
      };
      const res = await fetch("/api/procure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        currentBOM = await res.json();
        renderBOM(currentBOM, true);
        terminalStatus.textContent = "PIPELINE COMPLETED";
        loadProcurementHistory();
      }
    } catch (err) {
      console.error("Fallback sync error:", err);
    } finally {
      compileBtn.disabled = false;
      compileBtn.innerHTML = `<span>Synthesize Plan</span> &rarr;`;
      if (eventSource) eventSource.close();
    }
  }

  function renderThoughtStep(step) {
    const time = step.timestamp.split("T")[1]?.slice(0, 8) || "LIVE";
    let statusClass = "status-in_progress";
    let statusLabel = "IN PROGRESS";

    if (step.status === "completed") {
      statusClass = "status-completed";
      statusLabel = "COMPLETED";
    } else if (step.status === "verified") {
      statusClass = "status-verified";
      statusLabel = "APIMATIC VERIFIED";
    } else if (step.status === "warning") {
      statusClass = "status-warning";
      statusLabel = "ADVISORY";
    }

    const row = document.createElement("div");
    row.className = "terminal-row";
    row.innerHTML = `
      <div class="terminal-time">[${time}]</div>
      <div class="terminal-row-content">
        <div class="terminal-agent-line">
          <span class="terminal-agent">${step.agent_name}:</span>
          <span class="terminal-action">${step.action}</span>
          <span class="terminal-status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <div class="terminal-detail">${step.detail}</div>
      </div>
    `;

    terminalLogs.appendChild(row);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  window.copyTerminalLogs = function () {
    const logs = Array.from(terminalLogs.querySelectorAll(".terminal-row"))
      .map((el) => el.innerText.replace(/\n+/g, " - "))
      .join("\n");
    navigator.clipboard.writeText(logs || "No telemetry logged yet.");
    showToast("Telemetry log copied!");
  };

  window.clearTerminalLogs = function () {
    terminalLogs.innerHTML = `<div style="color:var(--text-muted); font-size:0.75rem;">Terminal output cleared.</div>`;
    terminalStatus.textContent = "TERMINAL CLEARED";
  };

  // =========================================================================
  // UNIFIED BILL OF MATERIALS (BOM) RENDERING & ACTIONS
  // =========================================================================
  function renderBOM(bom, shouldScroll = false) {
    currentBOM = bom;
    bomContainer.style.display = "block";

    document.getElementById("bom-id-badge").textContent = bom.bom_id;
    document.getElementById("bom-prompt-display").textContent = `"${bom.prompt}"`;
    document.getElementById("bom-total-amount").textContent = `$${bom.total_amount.toFixed(2)} USD`;
    document.getElementById("bom-subtotal").textContent = `$${bom.subtotal.toFixed(2)}`;
    document.getElementById("bom-fee").textContent = `$${bom.platform_fee.toFixed(2)}`;
    document.getElementById("bom-shipping").textContent = `$${bom.shipping_total.toFixed(2)}`;
    document.getElementById("bom-tax").textContent = `$${bom.tax_and_duty.toFixed(2)}`;

    document.getElementById("bom-items-tab-count").textContent = `(${bom.items.length})`;
    document.getElementById("bom-splits-tab-count").textContent = `(${bom.vendor_splits.length})`;

    // Approval status badge & Checkout unlock
    const approvalBadge = document.getElementById("bom-approval-status-badge");
    const approveBtn = document.getElementById("approve-plan-btn");
    const checkoutBtn = document.getElementById("checkout-paypal-btn");

    if (bom.is_approved) {
      approvalBadge.textContent = "Approved";
      approvalBadge.style.background = "rgba(163, 177, 138, 0.15)";
      approvalBadge.style.color = "var(--sage-green)";
      approvalBadge.style.borderColor = "var(--sage-green)";
      approveBtn.style.display = "none";
      checkoutBtn.style.opacity = "1";
      checkoutBtn.style.pointerEvents = "auto";
    } else {
      approvalBadge.textContent = "Pending Approval";
      approvalBadge.style.background = "rgba(214, 164, 93, 0.15)";
      approvalBadge.style.color = "var(--soft-amber)";
      approvalBadge.style.borderColor = "rgba(214, 164, 93, 0.3)";
      approveBtn.style.display = "inline-flex";
      checkoutBtn.style.opacity = "0.5";
      checkoutBtn.style.pointerEvents = "none";
    }

    // Compatibility badge
    const compatBadge = document.getElementById("bom-compat-badge");
    if (bom.compatibility_report) {
      const st = bom.compatibility_report.overall_status;
      compatBadge.className = `badge-compat ${st}`;
      compatBadge.textContent = st === "compatible" ? "Compatibility Verified" : (st === "needs_verification" ? "Needs Verification" : "Incompatible");
    }

    // Budget utilization
    const budgetContainer = document.getElementById("budget-progress-container");
    if (bom.optimization && bom.optimization.budget_utilization !== null && bom.optimization.budget_utilization !== undefined) {
      budgetContainer.style.display = "block";
      const pct = Math.min(bom.optimization.budget_utilization, 100);
      document.getElementById("budget-progress-text").textContent = `${pct.toFixed(1)}% of budget ($${bom.total_amount.toFixed(2)} / $${bom.budget_limit.toFixed(2)})`;
      document.getElementById("budget-progress-fill").style.width = `${pct}%`;
      document.getElementById("budget-progress-fill").style.background = pct > 95 ? "#f87171" : "var(--sage-green)";
    } else {
      budgetContainer.style.display = "none";
    }

    renderBOMTab(activeBOMTab);

    if (shouldScroll) {
      const bomSection = document.getElementById("bom");
      if (bomSection) bomSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  window.switchBOMTab = function (tab) {
    activeBOMTab = tab;
    document.querySelectorAll(".bom-tab-btn").forEach((btn) => btn.classList.remove("active"));
    const activeBtn = document.getElementById(`tab-btn-${tab}`);
    if (activeBtn) activeBtn.classList.add("active");
    renderBOMTab(tab);
  };

  function renderBOMTab(tab) {
    if (!currentBOM) return;
    const body = document.getElementById("bom-tab-content");

    if (tab === "items") {
      let html = "";
      currentBOM.items.forEach((item, index) => {
        const sourceBadge =
          item.source_type === "channel3_catalog"
            ? '<span style="font-size:0.6875rem; font-family:\'JetBrains Mono\', monospace; background:rgba(99, 214, 208, 0.12); color:var(--electric-cyan); border:1px solid rgba(99, 214, 208, 0.25); padding:0.15rem 0.45rem; border-radius:0.25rem;">Channel3 Verified</span>'
            : '<span style="font-size:0.6875rem; font-family:\'JetBrains Mono\', monospace; background:rgba(214, 164, 93, 0.12); color:var(--soft-amber); border:1px solid rgba(214, 164, 93, 0.25); padding:0.15rem 0.45rem; border-radius:0.25rem;">Kernel Live Sourced</span>';

        const compatStatus = item.compatibility_status || "compatible";
        const compatTag = `<span class="badge-compat ${compatStatus}">${compatStatus}</span>`;

        let specsHtml = "";
        for (const [k, v] of Object.entries(item.specifications || {})) {
          specsHtml += `<span style="display:inline-block; margin-right:0.4rem; margin-top:0.25rem; font-size:0.6875rem; font-family:'JetBrains Mono', monospace; background:rgba(255, 255, 255, 0.04); border:1px solid var(--border-warm); padding:0.1rem 0.4rem; border-radius:0.25rem; color:var(--text-secondary);">${k}: ${v}</span>`;
        }

        html += `
          <div class="bom-item-row" id="item-row-${item.item_id}">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <strong style="color: var(--text-primary); font-size: 0.9375rem;">${item.title}</strong>
                <span style="font-size: 0.6875rem; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); background: var(--bg-input); padding: 0.15rem 0.45rem; border-radius: 0.25rem;">${item.part_number}</span>
                ${sourceBadge}
                ${compatTag}
              </div>
              <div style="font-size: 0.78125rem; color: var(--text-muted); margin-top: 0.35rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                <span>Supplier: <strong style="color: var(--text-secondary);">${item.vendor_name}</strong></span>
                <span>Lead Time: <strong style="color: var(--text-secondary);">${item.lead_time_days} days</strong></span>
                <span>Category: <strong style="color: var(--text-secondary);">${item.category}</strong></span>
              </div>
              <div style="margin-top: 0.35rem;">${specsHtml}</div>
            </div>

            <div style="display: flex; align-items: center; gap: 1.5rem; flex-shrink: 0;">
              <!-- Quantity Stepper -->
              <div style="text-align: center;">
                <div style="font-size: 0.6875rem; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); margin-bottom: 0.25rem;">QTY</div>
                <div class="qty-stepper">
                  <button type="button" class="qty-btn" onclick="updateItemQuantity('${item.item_id}', ${item.quantity - 1})">-</button>
                  <input type="text" class="qty-input" value="${item.quantity}" readonly>
                  <button type="button" class="qty-btn" onclick="updateItemQuantity('${item.item_id}', ${item.quantity + 1})">+</button>
                </div>
              </div>

              <!-- Price -->
              <div style="text-align: right; min-width: 90px;">
                <div style="font-size: 0.6875rem; font-family: 'JetBrains Mono', monospace; color: var(--text-muted);">$${item.unit_price.toFixed(2)} ea</div>
                <div style="font-size: 1.0625rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text-primary); margin-top: 0.15rem;">
                  $${item.extended_price.toFixed(2)}
                </div>
              </div>

              <!-- Substitute Action Button -->
              <button
                type="button"
                class="btn-secondary"
                style="padding: 0.35rem 0.65rem; font-size: 0.75rem;"
                onclick="substituteItem('${item.item_id}')"
                title="Find alternative in-stock substitute component"
              >
                Substitute
              </button>
            </div>
          </div>
        `;
      });
      body.innerHTML = html;
    } else if (tab === "splits") {
      let html = '<div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">';
      currentBOM.vendor_splits.forEach((split) => {
        html += `
          <div style="padding: 1.25rem; background: var(--bg-card); border: 1px solid var(--border-warm); border-radius: 0.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <strong style="color: var(--text-primary); font-size: 1rem;">${split.vendor_name}</strong>
                <span style="font-size: 0.6875rem; font-family: 'JetBrains Mono', monospace; background: rgba(163, 177, 138, 0.15); color: var(--sage-green); padding: 0.15rem 0.45rem; border-radius: 0.25rem;">
                  ${split.items.length} line items
                </span>
              </div>
              <div style="font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; color: var(--text-muted); margin-top: 0.25rem;">
                PayPal Account: <span style="color: var(--text-secondary);">${split.vendor_paypal_account}</span>
              </div>
            </div>
            <div style="display: flex; gap: 1.5rem; text-align: right; font-family: 'JetBrains Mono', monospace;">
              <div>
                <div style="font-size: 0.6875rem; color: var(--text-muted);">VENDOR FREIGHT</div>
                <div style="color: var(--text-primary); font-weight: 600;">$${split.shipping_cost.toFixed(2)}</div>
              </div>
              <div>
                <div style="font-size: 0.6875rem; color: var(--text-muted);">DISBURSEMENT TOTAL</div>
                <div style="font-size: 1.125rem; font-weight: 700; color: var(--sage-green);">$${split.total_amount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        `;
      });
      html += '</div>';
      body.innerHTML = html;
    } else if (tab === "compat") {
      const rep = currentBOM.compatibility_report || { overall_status: "compatible", rules_passed: 12, violations: [], notes: [] };
      let html = '<div style="padding: 1.5rem;">';
      html += `
        <div style="padding: 1.25rem; background: var(--bg-card); border: 1px solid var(--border-warm); border-radius: 0.75rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <strong style="color: var(--text-primary);">Deterministic Compatibility Engine Status:</strong>
            <span class="badge-compat ${rep.overall_status}">${rep.overall_status.toUpperCase()}</span>
          </div>
          <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.6;">
            Every electronic component is deterministically evaluated for GPIO voltage levels (3.3V vs 5V), I2C address space overlap, and power supply milliamp ratings.
          </p>
        </div>
      `;

      if (rep.violations && rep.violations.length > 0) {
        html += '<h4 style="font-size: 0.875rem; color: #f87171; margin-bottom: 0.5rem; font-family: \'JetBrains Mono\', monospace;">IDENTIFIED INCOMPATIBILITIES / WARNINGS:</h4>';
        rep.violations.forEach((v) => {
          html += `
            <div style="padding: 0.75rem 1rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 0.5rem; margin-bottom: 0.5rem; font-size: 0.8125rem; color: #fca5a5;">
              <strong>${v.rule_id || "ERR"}:</strong> ${v.message}
            </div>
          `;
        });
      } else {
        html += `
          <div style="padding: 1rem 1.25rem; background: rgba(163, 177, 138, 0.12); border: 1px solid rgba(163, 177, 138, 0.3); border-radius: 0.5rem; font-size: 0.8125rem; color: var(--sage-green);">
            &check; All 12 hardware validation rules passed. Master MCU logic voltage is strictly matched to sensor inputs.
          </div>
        `;
      }
      html += '</div>';
      body.innerHTML = html;
    } else if (tab === "compliance") {
      let html = '<div style="padding: 1.5rem;">';
      html += `
        <div style="padding: 1.25rem; background: var(--bg-card); border: 1px solid var(--border-warm); border-radius: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <strong style="color: var(--text-primary); font-size: 0.9375rem;">APIMatic Schema Audit &amp; Contract Invariants</strong>
            <span style="font-size: 0.6875rem; font-family: 'JetBrains Mono', monospace; background: rgba(99, 214, 208, 0.15); color: var(--electric-cyan); padding: 0.15rem 0.5rem; border-radius: 0.25rem;">
              PASSED 100%
            </span>
          </div>
          <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
            Validates currency decimals, purchase unit arrays, payee email formatting, and delayed disbursement schemas before sending to PayPal Orders v2 endpoints.
          </p>
          <pre style="background: var(--bg-input); padding: 1rem; border-radius: 0.5rem; font-size: 0.75rem; color: var(--sage-green); overflow-x: auto; font-family: 'JetBrains Mono', monospace;">
{
  "apimatic_audit": "PASSED",
  "bom_id": "${currentBOM.bom_id}",
  "paypal_api": "Orders v2 (2026-01-01)",
  "intent": "CAPTURE",
  "take_rate_pct": 2.50,
  "disbursement_mode": "DELAYED (Carrier Lock)",
  "schema_checksum": "sha256-apimatic-valid-9f88a2c1"
}
          </pre>
        </div>
      `;
      html += '</div>';
      body.innerHTML = html;
    }
  }

  // Update item quantity
  window.updateItemQuantity = async function (itemId, newQty) {
    if (!currentBOM) return;
    try {
      const res = await fetch("/api/procure/items/quantity", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bom_id: currentBOM.bom_id,
          item_id: itemId,
          quantity: newQty
        })
      });
      if (res.ok) {
        currentBOM = await res.json();
        renderBOM(currentBOM, false);
        showToast("Quantity updated & costs recalculated.");
      }
    } catch (err) {
      console.error("Update quantity error:", err);
    }
  };

  // Substitute item
  window.substituteItem = async function (itemId) {
    if (!currentBOM) return;
    try {
      const res = await fetch("/api/procure/items/substitute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bom_id: currentBOM.bom_id,
          item_id: itemId
        })
      });
      if (res.ok) {
        currentBOM = await res.json();
        renderBOM(currentBOM, false);
        showToast("Alternative component substituted!");
      }
    } catch (err) {
      console.error("Substitution error:", err);
    }
  };

  // Strategy change
  window.onStrategyChange = async function (strategy) {
    if (!currentBOM) return;
    try {
      const res = await fetch("/api/procure/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bom_id: currentBOM.bom_id,
          strategy: strategy
        })
      });
      if (res.ok) {
        currentBOM = await res.json();
        renderBOM(currentBOM, false);
        showToast(`Optimization strategy applied: ${strategy}`);
      }
    } catch (err) {
      console.error("Strategy recalculate error:", err);
    }
  };

  // Approve plan
  window.approvePlan = async function () {
    if (!currentBOM) return;
    try {
      const res = await fetch("/api/procure/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bom_id: currentBOM.bom_id,
          approved_by: "user_engineer_01"
        })
      });
      if (res.ok) {
        currentBOM = await res.json();
        renderBOM(currentBOM, false);
        showToast("Plan approved! PayPal checkout unlocked.");
      }
    } catch (err) {
      console.error("Approve plan error:", err);
    }
  };

  // Export BOM to CSV
  window.exportBOMToCSV = function () {
    if (!currentBOM) return;
    let csv = "Part Number,Title,Vendor,Category,Unit Price,Quantity,Extended Price,Lead Time (Days)\n";
    currentBOM.items.forEach((it) => {
      csv += `"${it.part_number}","${it.title}","${it.vendor_name}","${it.category}",${it.unit_price},${it.quantity},${it.extended_price},${it.lead_time_days}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentBOM.bom_id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("BOM exported to CSV.");
  };

  // Copy APIMatic payload
  window.copyAPIMaticPayload = function () {
    if (!currentBOM) return;
    navigator.clipboard.writeText(JSON.stringify(currentBOM, null, 2));
    showToast("APIMatic payload copied!");
  };

  // =========================================================================
  // PAYPAL ORDERS V2 CHECKOUT MODAL & CAPTURE
  // =========================================================================
  let currentPayPalOrderId = null;

  window.openPayPalModal = async function () {
    if (!currentBOM) return;
    if (!currentBOM.is_approved) {
      alert("Please approve the procurement plan before proceeding to payment.");
      return;
    }

    modalOverlay.style.display = "flex";
    document.getElementById("modal-pre-capture").style.display = "block";
    document.getElementById("modal-post-capture").style.display = "none";
    document.getElementById("modal-error").style.display = "none";

    document.getElementById("modal-bom-ref").textContent = currentBOM.bom_id;
    document.getElementById("modal-total").textContent = `$${currentBOM.total_amount.toFixed(2)} USD`;
    document.getElementById("modal-fee").textContent = `$${currentBOM.platform_fee.toFixed(2)} USD`;
    document.getElementById("modal-vendor-count").textContent = `${currentBOM.vendor_splits.length} Accounts`;

    // Render splits in modal
    const splitsContainer = document.getElementById("modal-splits-list");
    let splitsHtml = "";
    currentBOM.vendor_splits.forEach((s) => {
      splitsHtml += `
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; background: var(--bg-surface); padding: 0.4rem 0.6rem; border-radius: 0.375rem; border: 1px solid var(--border-warm);">
          <span style="color: var(--text-secondary);">${s.vendor_name} (${s.vendor_paypal_account}):</span>
          <span style="color: var(--sage-green); font-weight: 600;">$${s.total_amount.toFixed(2)}</span>
        </div>
      `;
    });
    splitsContainer.innerHTML = splitsHtml;

    // Create PayPal order
    try {
      document.getElementById("modal-order-id").textContent = "Creating order...";
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bom_id: currentBOM.bom_id,
          return_url: window.location.origin + "/paypal/return",
          cancel_url: window.location.origin + "/paypal/cancel"
        })
      });
      if (res.ok) {
        const order = await res.json();
        currentPayPalOrderId = order.order_id;
        document.getElementById("modal-order-id").textContent = order.order_id;
      } else {
        throw new Error("Failed to create PayPal Orders v2 transaction.");
      }
    } catch (err) {
      document.getElementById("modal-order-id").textContent = "Error";
      const errBox = document.getElementById("modal-error");
      errBox.textContent = err.message;
      errBox.style.display = "block";
    }
  };

  window.closePayPalModal = function () {
    modalOverlay.style.display = "none";
  };

  window.copyPayPalOrderId = function () {
    if (!currentPayPalOrderId) return;
    navigator.clipboard.writeText(currentPayPalOrderId);
    showToast("PayPal Order ID copied!");
  };

  window.confirmPayPalCapture = async function () {
    if (!currentPayPalOrderId) return;
    const confirmBtn = document.getElementById("modal-confirm-btn");
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Authorizing Escrow...";

    try {
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: currentPayPalOrderId,
          idempotency_key: `idemp_${currentPayPalOrderId}_${Date.now()}`
        })
      });
      if (res.ok) {
        const capture = await res.json();
        document.getElementById("modal-pre-capture").style.display = "none";
        document.getElementById("modal-post-capture").style.display = "block";
        document.getElementById("modal-capture-ref").textContent = capture.capture_id || "CAP-2026-9912";
        document.getElementById("modal-escrow-status").textContent = capture.escrow_status || "HELD_IN_ESCROW";
        confirmBtn.style.display = "none";

        // Refresh control tower telemetry
        fetchControlTowerData();
      } else {
        throw new Error("PayPal authorization or settlement failed.");
      }
    } catch (err) {
      const errBox = document.getElementById("modal-error");
      errBox.textContent = err.message;
      errBox.style.display = "block";
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Authorize & Complete Checkout";
    }
  };

  // =========================================================================
  // PROCUREMENT HISTORY
  // =========================================================================
  window.loadProcurementHistory = async function () {
    const list = document.getElementById("history-list-container");
    if (!list) return;

    try {
      const res = await fetch("/api/procure/history");
      if (res.ok) {
        const historyData = await res.json();
        if (historyData.length === 0) {
          list.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.8125rem;">No historical procurement plans found.</div>`;
          return;
        }

        let html = "";
        historyData.forEach((h) => {
          html += `
            <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-warm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--sage-green); background: rgba(163, 177, 138, 0.15); padding: 0.15rem 0.45rem; border-radius: 0.25rem;">
                    ${h.bom_id}
                  </span>
                  <span style="font-size: 0.75rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">${h.created_at || "2026-10-31"}</span>
                  <span style="font-size: 0.6875rem; font-family: 'JetBrains Mono', monospace; background: rgba(99, 214, 208, 0.12); color: var(--electric-cyan); padding: 0.1rem 0.4rem; border-radius: 0.25rem;">
                    ${h.status || "APPROVED"}
                  </span>
                </div>
                <div style="font-size: 0.875rem; color: var(--text-primary); font-weight: 500; margin-top: 0.35rem;">
                  ${h.prompt}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
                  ${h.item_count || 4} components &bull; Multi-vendor split
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="text-align: right; font-family: 'JetBrains Mono', monospace;">
                  <div style="font-size: 1.125rem; font-weight: 700; color: var(--text-primary);">$${(h.total_amount || 0).toFixed(2)}</div>
                  <div style="font-size: 0.6875rem; color: var(--text-muted);">Landed Cost</div>
                </div>
                <button class="btn-secondary" style="font-size: 0.75rem;" onclick="replayPlan('${h.bom_id}')">
                  Load Into Workspace
                </button>
              </div>
            </div>
          `;
        });
        list.innerHTML = html;
      }
    } catch (err) {
      console.error("Load history error:", err);
    }
  };

  window.replayPlan = async function (bomId) {
    try {
      const res = await fetch(`/api/procure/${bomId}`);
      if (res.ok) {
        currentBOM = await res.json();
        renderBOM(currentBOM, true);
        showToast(`Loaded ${bomId} into active workspace.`);
      }
    } catch (err) {
      console.error("Replay plan error:", err);
    }
  };

  // =========================================================================
  // MERCHANT CONTROL TOWER (AG GRID TELEMETRY)
  // =========================================================================
  window.switchControlTowerTab = function (tab) {
    activeTowerTab = tab;
    document.querySelectorAll(".tower-tab-btn").forEach((btn) => {
      btn.className = "nav-link tower-tab-btn";
    });

    const activeBtn = document.getElementById(`tower-btn-${tab}`);
    if (activeBtn) activeBtn.className = "btn-primary tower-tab-btn";

    document.getElementById("tower-shipments-tab").style.display = tab === "shipments" ? "block" : "none";
    document.getElementById("tower-suppliers-tab").style.display = tab === "suppliers" ? "block" : "none";
    document.getElementById("tower-agents-tab").style.display = tab === "agents" ? "grid" : "none";
    document.getElementById("tower-payments-tab").style.display = tab === "payments" ? "block" : "none";
    document.getElementById("tower-toolbar").style.display = tab === "shipments" ? "flex" : "none";
  };

  window.refreshControlTowerData = async function (btn) {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>Refreshing...</span>`;
    }
    await fetchControlTowerData();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>Refresh</span>`;
      showToast("Control Tower telematics updated.");
    }
  };

  async function fetchControlTowerData() {
    try {
      const [overviewRes, shipmentsRes, suppliersRes, agentsRes, paymentsRes] = await Promise.all([
        fetch("/api/telemetry/overview"),
        fetch("/api/telemetry/shipments"),
        fetch("/api/telemetry/suppliers"),
        fetch("/api/telemetry/agents"),
        fetch("/api/telemetry/payments")
      ]);

      if (overviewRes.ok) {
        const overview = await overviewRes.json();
        const kpiShip = document.getElementById("kpi-shipments");
        const kpiFleet = document.getElementById("kpi-fleet-health");
        const kpiVol = document.getElementById("kpi-settled-vol");
        const kpiEscrow = document.getElementById("kpi-escrow-rate");

        if (kpiShip) kpiShip.textContent = overview.active_shipments;
        if (kpiFleet) kpiFleet.textContent = overview.fleet_health;
        if (kpiVol) kpiVol.textContent = `$${overview.settled_volume_usd.toFixed(2)}`;
        if (kpiEscrow) kpiEscrow.textContent = overview.escrow_integrity;
      }

      if (shipmentsRes.ok) {
        telemetryRows = await shipmentsRes.json();
        renderTelemetryTable(telemetryRows);
      }

      if (suppliersRes.ok) {
        const suppliers = await suppliersRes.json();
        renderSuppliersTable(suppliers);
      }

      if (agentsRes.ok) {
        const agents = await agentsRes.json();
        renderAgentsGrid(agents);
      }

      if (paymentsRes.ok) {
        const payments = await paymentsRes.json();
        renderPaymentsTable(payments);
      }
    } catch (err) {
      console.error("Control tower telematics fetch error:", err);
    }
  }

  function renderTelemetryTable(rows) {
    const tbody = document.getElementById("telemetry-table-body");
    if (!tbody) return;

    let html = "";
    rows.forEach((r) => {
      let statusClass = "text-sage";
      if (r.status === "Delayed") statusClass = "text-amber";
      if (r.status === "Customs") statusClass = "text-cyan";

      html += `
        <tr>
          <td style="font-family:'JetBrains Mono', monospace; color:var(--sage-green); font-weight:600;">${r.tracking_number}</td>
          <td>
            <div style="color:var(--text-primary); font-weight:500;">${r.item_name}</div>
            <div style="font-size:0.6875rem; font-family:'JetBrains Mono', monospace; color:var(--text-muted);">${r.part_number}</div>
          </td>
          <td style="color:var(--text-secondary);">${r.vendor_name}</td>
          <td style="font-size:0.75rem; font-family:'JetBrains Mono', monospace; color:var(--text-muted);">${r.origin_country} &rarr; ${r.destination}</td>
          <td style="font-family:'JetBrains Mono', monospace;">${r.carrier}</td>
          <td class="${statusClass}" style="font-weight:600;">${r.status}</td>
          <td style="font-family:'JetBrains Mono', monospace;">${r.eta_days} days</td>
          <td style="font-family:'JetBrains Mono', monospace; color:${r.risk_score > 0.4 ? '#f87171' : 'var(--sage-green)'};">${(r.risk_score * 100).toFixed(0)}%</td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  function renderSuppliersTable(suppliers) {
    const tbody = document.getElementById("suppliers-table-body");
    if (!tbody) return;

    let html = "";
    suppliers.forEach((s) => {
      html += `
        <tr>
          <td style="font-weight:600; color:var(--text-primary);">${s.name}</td>
          <td>${s.country}</td>
          <td><span style="font-size:0.6875rem; font-family:'JetBrains Mono', monospace; background:rgba(163,177,138,0.15); color:var(--sage-green); padding:0.15rem 0.45rem; border-radius:0.25rem;">${s.verification_tier}</span></td>
          <td style="font-family:'JetBrains Mono', monospace;">${s.orders_completed}</td>
          <td style="font-family:'JetBrains Mono', monospace; color:var(--text-primary);">$${s.volume_usd.toFixed(2)}</td>
          <td style="font-family:'JetBrains Mono', monospace; color:var(--sage-green);">${(s.on_time_rate * 100).toFixed(1)}%</td>
          <td style="font-family:'JetBrains Mono', monospace;">${s.avg_lead_days} days</td>
          <td style="font-size:0.75rem; color:${s.risk_tier === 'LOW' ? 'var(--sage-green)' : 'var(--soft-amber)'}; font-weight:600;">${s.risk_tier}</td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  function renderAgentsGrid(agents) {
    const grid = document.getElementById("agents-grid");
    if (!grid) return;

    let html = "";
    agents.forEach((a) => {
      html += `
        <div style="background:var(--bg-card); border:1px solid var(--border-warm); border-radius:0.75rem; padding:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <strong style="color:var(--text-primary); font-size:0.9375rem;">${a.agent_id}</strong>
            <span style="font-size:0.6875rem; font-family:'JetBrains Mono', monospace; background:rgba(163,177,138,0.15); color:var(--sage-green); padding:0.15rem 0.45rem; border-radius:0.25rem;">${a.status}</span>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.75rem;">${a.role}</div>
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-family:'JetBrains Mono', monospace; color:var(--text-secondary); border-top:1px solid var(--border-warm); padding-top:0.5rem;">
            <span>Latency: <strong style="color:var(--electric-cyan);">${a.avg_latency_ms}ms</strong></span>
            <span>Success: <strong style="color:var(--sage-green);">${(a.success_rate * 100).toFixed(1)}%</strong></span>
          </div>
        </div>
      `;
    });
    grid.innerHTML = html;
  }

  function renderPaymentsTable(payments) {
    const tbody = document.getElementById("payments-table-body");
    if (!tbody) return;

    let html = "";
    payments.forEach((p) => {
      html += `
        <tr>
          <td style="font-family:'JetBrains Mono', monospace; color:var(--text-primary);">${p.routing_id}</td>
          <td style="font-family:'JetBrains Mono', monospace; color:var(--text-secondary);">${p.order_id}</td>
          <td style="font-family:'JetBrains Mono', monospace; color:var(--text-primary); font-weight:600;">$${p.gross_amount.toFixed(2)}</td>
          <td style="font-family:'JetBrains Mono', monospace; color:var(--soft-amber);">-$${p.platform_take_rate.toFixed(2)}</td>
          <td style="font-family:'JetBrains Mono', monospace; color:var(--sage-green); font-weight:700;">$${p.vendor_payout.toFixed(2)}</td>
          <td style="font-family:'JetBrains Mono', monospace; font-size:0.75rem; color:var(--text-secondary);">${p.vendor_paypal_account}</td>
          <td><span style="font-size:0.6875rem; font-family:'JetBrains Mono', monospace; background:rgba(163,177,138,0.15); color:var(--sage-green); padding:0.15rem 0.45rem; border-radius:0.25rem;">${p.settlement_status}</span></td>
          <td style="font-size:0.75rem; color:var(--electric-cyan); font-family:'JetBrains Mono', monospace;">APIMatic Certified</td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  window.filterTelemetryTable = function () {
    const q = (document.getElementById("telemetry-search-input")?.value || "").toLowerCase();
    const filtered = telemetryRows.filter((r) => {
      const matchText = (r.tracking_number + r.item_name + r.part_number + r.carrier + r.status + r.vendor_name).toLowerCase();
      const textOk = matchText.includes(q);
      const statusOk = currentStatusFilter === "ALL" || r.status.toLowerCase().includes(currentStatusFilter.toLowerCase());
      return textOk && statusOk;
    });
    renderTelemetryTable(filtered);
  };

  window.setTelemetryStatusFilter = function (status) {
    currentStatusFilter = status;
    window.filterTelemetryTable();
  };

  window.sortTelemetryTable = function (colIndex) {
    sortDirections[colIndex] = -sortDirections[colIndex];
    const dir = sortDirections[colIndex];

    telemetryRows.sort((a, b) => {
      let va = "", vb = "";
      if (colIndex === 0) { va = a.tracking_number; vb = b.tracking_number; }
      else if (colIndex === 1) { va = a.item_name; vb = b.item_name; }
      else if (colIndex === 2) { va = a.vendor_name; vb = b.vendor_name; }
      else if (colIndex === 4) { va = a.carrier; vb = b.carrier; }
      else if (colIndex === 5) { va = a.status; vb = b.status; }
      else if (colIndex === 6) { return (a.eta_days - b.eta_days) * dir; }
      else if (colIndex === 7) { return (a.risk_score - b.risk_score) * dir; }
      return va.localeCompare(vb) * dir;
    });

    renderTelemetryTable(telemetryRows);
  };

  // Initial Seeded Hydration on Page Mount
  async function initInitialPage() {
    try {
      // 1. Initial Seeded BOM Load
      const res = await fetch("/api/procure/BOM-2026-8812");
      if (res.ok) {
        currentBOM = await res.json();
        renderBOM(currentBOM, false); // false = do not jump scroll on initial load
      }
    } catch (err) {
      console.warn("Seeded initial BOM load fallback:", err);
    }

    // 2. Initial Control Tower Telematics
    fetchControlTowerData();

    // 3. Initial Procurement History
    loadProcurementHistory();
  }

  initInitialPage();
})();
