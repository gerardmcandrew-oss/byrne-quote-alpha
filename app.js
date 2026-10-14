/* ============================================================
   Trayclear demo, Byrne Building Services
   Classroom prototype. No backend, no API keys, no AI service.
   All data is fictional. All rates are demonstration assumptions.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- demo clock ------------------------------------------------
     The case week runs 7-11 Sep 2026 and the WhatsApp export ends 18 Sep.
     We anchor "today" so days-waiting is reproducible in class and matches
     the evidence, rather than drifting with the real date.                */
  var DEMO_TODAY = "2026-09-18";
  var STORE_KEY = "byrne-quoteflow-alpha:v1";

  /* ---------- demonstration assumptions (NOT Byrne's real rates) -------- */
  var DEMO = {
    rateElectrician: 52,
    ratePlumber: 52,
    rateApprentice: 29,
    markupPct: 18,
    vatPct: 13.5,
    adminMinutesPerJob: 25      // used only in a clearly-labelled estimate
  };

  var STATUS = {
    "needs-info": { label: "Needs info", pill: "pill-red" },
    "with-gerry": { label: "With Gerry", pill: "pill-amber" },
    "approved":   { label: "Approved",   pill: "pill-green" },
    "sent":       { label: "Sent",       pill: "pill-blue" }
  };
  var PIPELINE = ["new", "needs-info", "with-gerry", "approved", "sent"];
  var PIPELINE_LABEL = {
    "new": "New", "needs-info": "Needs info", "with-gerry": "With Gerry",
    "approved": "Approved", "sent": "Sent"
  };

  /* =====================================================================
     HELPERS
     ===================================================================== */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  function esc(s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function eur(n) {
    if (!isFinite(n)) n = 0;
    return "€" + n.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function eur0(n) {
    if (!isFinite(n)) n = 0;
    return "€" + Math.round(n).toLocaleString("en-IE");
  }
  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
  function todayISO() { return DEMO_TODAY; }
  function daysBetween(aISO, bISO) {
    var a = new Date(aISO + "T00:00:00"), b = new Date(bISO + "T00:00:00");
    return Math.round((b - a) / 86400000);
  }
  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return esc(iso);
    return d.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
  }
  function fmtShort(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return esc(iso);
    return d.toLocaleDateString("en-IE", { day: "numeric", month: "short" });
  }
  function uid() { return "j" + Math.random().toString(36).slice(2, 9); }

  /* =====================================================================
     SEED DATA  (fictional, built from the Case C evidence pack)
     ===================================================================== */
  function seed() {
    function L(desc, hours, rate, role) { return { desc: desc, hours: hours, rate: rate, role: role || "" }; }
    function M(desc, qty, unit, cost) { return { desc: desc, qty: qty, unit: unit, cost: cost }; }
    function H(at, who, what) { return { at: at, who: who, what: what }; }

    return [
      {
        id: "j_kff", ref: "0641", customer: "Kildare Farm Foods", site: "Kilmeague, Co. Kildare",
        type: "Commercial", trade: "Electrical", urgency: "Priority",
        description: "Rewire to old process area",
        scope: "Replace distribution board and sub-mains to the original process room. Existing wiring is pre-1990 rubber-sheathed and partly buried in the fabric.",
        siteNotes: "Food production. Access out of hours only. Gerry walked the job on 14 Aug.",
        submittedBy: "Sandra Nolan", submittedAt: "2026-08-14", completedAt: "",
        status: "with-gerry",
        materials: [
          M("Twin & earth 2.5mm², 100m drum", 4, "drum", 92),
          M("SWA 4-core 6mm², 50m", 1, "drum", 310),
          M("Metal clad socket outlets IP66", 18, "ea", 21.5),
          M("20-way TP&N distribution board", 1, "ea", 685),
          M("MCBs and RCBOs, assorted", 1, "lot", 420),
          M("Galvanised tray, fixings and containment", 1, "lot", 265)
        ],
        labour: [L("Electrician, strip out and first fix", 56, DEMO.rateElectrician, "Electrician"),
                 L("Apprentice, assisting", 42, DEMO.rateApprentice, "Apprentice")],
        other: [{ desc: "Scissor lift hire, 3 days", amount: 345 },
                { desc: "Out-of-hours access premium", amount: 280 }],
        markupPct: DEMO.markupPct, vatApplied: true, vatPct: DEMO.vatPct,
        override: null, overrideReason: "",
        notes: "", assumptions: "",
        history: [
          H("2026-08-14", "Sandra Nolan", "Job sheet logged and placed in Gerry's tray."),
          H("2026-09-11", "Sandra Nolan", "Flagged on WhatsApp as the oldest job in the tray."),
          H("2026-09-17", "Gerry Byrne", "Wiring is old. Not yet decided what is fair to charge.")
        ]
      },
      {
        id: "j_scoil", ref: "0716", customer: "Scoil Bhríde", site: "Naas",
        type: "Commercial", trade: "Electrical", urgency: "Standard",
        description: "Hand dryers x4, plus price for corridor PIR lighting",
        scope: "Four hand dryers fitted Mon 7 Sep. Principal has asked for a price to put the corridor lights on PIR sensors.",
        siteNotes: "School. Work outside term time where possible.",
        submittedBy: "Seanie", submittedAt: "2026-09-07", completedAt: "2026-09-07",
        status: "with-gerry",
        materials: [
          M("Hand dryer units", 4, "ea", 168),
          M("Twin & earth 2.5mm², 50m", 1, "drum", 48),
          M("PIR occupancy sensors", 6, "ea", 38.5),
          M("LED corridor batten, 5ft", 6, "ea", 42),
          M("Containment and sundries", 1, "lot", 95)
        ],
        labour: [L("Electrician", 22, DEMO.rateElectrician, "Electrician"),
                 L("Apprentice", 14, DEMO.rateApprentice, "Apprentice")],
        other: [],
        markupPct: DEMO.markupPct, vatApplied: true, vatPct: DEMO.vatPct,
        override: null, overrideReason: "", notes: "", assumptions: "",
        history: [
          H("2026-09-07", "Seanie", "Dryers fitted. Principal asked for a price for corridor PIR."),
          H("2026-09-07", "Gerry Byrne", "Said he would price it himself."),
          H("2026-09-14", "Sandra Nolan", "Seanie asked if it was priced. Paperwork still in the tray.")
        ]
      },
      {
        id: "j_brady22", ref: "0722", customer: "Brady's Butchers", site: "Naas",
        type: "Commercial", trade: "Electrical", urgency: "Standard",
        description: "Counter fridge trip, return with part",
        scope: "Fan motor assembly replaced on the counter fridge. Second visit to fit the part.",
        siteNotes: "To be priced with sheet 0717. Gerry wants to see the damp wall before pricing.",
        submittedBy: "Deccy", submittedAt: "2026-09-08", completedAt: "2026-09-08",
        status: "with-gerry",
        materials: [M("Fan motor assembly", 1, "ea", 186), M("Contactor", 1, "ea", 54), M("Sundries", 1, "lot", 28)],
        labour: [L("Electrician", 5.5, DEMO.rateElectrician, "Electrician")],
        other: [],
        markupPct: DEMO.markupPct, vatApplied: true, vatPct: DEMO.vatPct,
        override: null, overrideReason: "", notes: "", assumptions: "",
        history: [
          H("2026-09-08", "Deccy", "Part fitted, fridge back in service."),
          H("2026-09-17", "Gerry Byrne", "Still considering it.")
        ]
      },
      {
        id: "j_ncu", ref: "0720", customer: "Naas Credit Union", site: "Naas",
        type: "Commercial", trade: "Electrical", urgency: "Standard",
        description: "Door access fault",
        scope: "Access controller and maglock replaced on the staff door.",
        siteNotes: "Security sign-in required at reception.",
        submittedBy: "Tony Keogh", submittedAt: "2026-09-08", completedAt: "2026-09-08",
        status: "with-gerry",
        materials: [M("Door access controller", 1, "ea", 240), M("Maglock", 1, "ea", 118), M("Cable and sundries", 1, "lot", 46)],
        labour: [L("Electrician", 7, DEMO.rateElectrician, "Electrician")],
        other: [],
        markupPct: DEMO.markupPct, vatApplied: true, vatPct: DEMO.vatPct,
        override: null, overrideReason: "", notes: "", assumptions: "",
        history: [H("2026-09-08", "Tony Keogh", "Fault cleared, door tested.")]
      },
      {
        id: "j_lidl", ref: "0726", customer: "Lidl Newhall", site: "Newhall, Naas",
        type: "Sub-contract", trade: "Electrical", urgency: "Priority",
        description: "Fit-out sub-contract, days 1 and 2",
        scope: "First fix containment, cabling and emergency lighting to the main sales floor. Part of the 0726-0730 bundle.",
        siteNotes: "Main contractor has not issued the second fix specification. Figures cover first fix only.",
        submittedBy: "Sandra Nolan", submittedAt: "2026-09-11", completedAt: "",
        status: "with-gerry",
        materials: [
          M("Containment and first fix cable", 1, "lot", 1850),
          M("Emergency lighting units", 14, "ea", 96),
          M("Sundries and fixings", 1, "lot", 310)
        ],
        labour: [L("Electrician", 64, DEMO.rateElectrician, "Electrician"),
                 L("Apprentice", 32, DEMO.rateApprentice, "Apprentice")],
        other: [],
        markupPct: DEMO.markupPct, vatApplied: true, vatPct: DEMO.vatPct,
        override: null, overrideReason: "",
        notes: "", assumptions: "Second fix excluded pending the main contractor's specification.",
        history: [H("2026-09-11", "Sandra Nolan", "Bundle 0726-0730 placed in Gerry's tray.")]
      },
      {
        id: "j_brady17", ref: "0717", customer: "Brady's Butchers", site: "Naas",
        type: "Commercial", trade: "Electrical", urgency: "Standard",
        description: "Counter fridge trip, first visit",
        scope: "Fault investigated. Damp noted to the rear wall.",
        siteNotes: "Materials column on the sheet is blank. To be priced with 0722.",
        submittedBy: "Deccy", submittedAt: "2026-09-07", completedAt: "2026-09-07",
        status: "needs-info",
        materials: [],
        labour: [L("Electrician", 3, DEMO.rateElectrician, "Electrician")],
        other: [],
        markupPct: DEMO.markupPct, vatApplied: true, vatPct: DEMO.vatPct,
        override: null, overrideReason: "", notes: "", assumptions: "",
        history: [
          H("2026-09-07", "Deccy", "Sheet handed in with the materials column blank."),
          H("2026-09-09", "Sandra Nolan", "Materials requested from Deccy. No reply yet.")
        ]
      },
      {
        id: "j_centra", ref: "0719", customer: "Centra Sallins", site: "Sallins",
        type: "Commercial", trade: "Electrical", urgency: "Urgent",
        description: "Coldroom door heater",
        scope: "Door heater element replaced. Original job sheet was lost.",
        siteNotes: "Sheet was soaked when a bottle leaked in the van (10 Sep). Deccy to redo it.",
        submittedBy: "Deccy", submittedAt: "2026-09-07", completedAt: "2026-09-07",
        status: "needs-info",
        materials: [], labour: [], other: [],
        markupPct: DEMO.markupPct, vatApplied: true, vatPct: DEMO.vatPct,
        override: null, overrideReason: "", notes: "", assumptions: "",
        history: [
          H("2026-09-10", "Deccy", "Sheet destroyed in the van. Agreed to redo it."),
          H("2026-09-16", "Sandra Nolan", "Manager rang looking for the invoice. Customer wants to pay, nothing to send.")
        ]
      },
      {
        id: "j_dental", ref: "0723", customer: "Monread Dental", site: "Monread, Naas",
        type: "Commercial", trade: "Plumbing", urgency: "Standard",
        description: "Compressor line",
        scope: "New compressor line run and isolation valve fitted.",
        siteNotes: "",
        submittedBy: "Seanie", submittedAt: "2026-09-08", completedAt: "2026-09-08",
        status: "approved",
        materials: [M("Copper tube 15mm, 20m", 1, "lot", 88), M("Fittings", 1, "lot", 64), M("Isolation valve", 1, "ea", 42)],
        labour: [L("Plumber", 6, DEMO.ratePlumber, "Plumber")],
        other: [],
        markupPct: DEMO.markupPct, vatApplied: true, vatPct: DEMO.vatPct,
        override: 525, overrideReason: "Rounded down. Long-standing account, small job.",
        notes: "", assumptions: "",
        approvedAt: "2026-09-17", approvedBy: "Gerry Byrne",
        history: [
          H("2026-09-08", "Seanie", "Work completed and signed off."),
          H("2026-09-17", "Gerry Byrne", "Priced and approved at €525.00 ex VAT.")
        ]
      },
      {
        id: "j_osprey", ref: "0718", customer: "Osprey Hotel", site: "Naas",
        type: "Commercial", trade: "Electrical", urgency: "Standard",
        description: "Emergency lighting, 3 day install",
        scope: "Emergency lighting replaced throughout the ground floor and corridors, with test key switches.",
        siteNotes: "Work completed over three days with the hotel operating.",
        submittedBy: "John B.", submittedAt: "2026-09-07", completedAt: "2026-09-09",
        status: "sent",
        materials: [M("Emergency lighting units", 22, "ea", 96), M("Test key switches", 4, "ea", 34), M("Cable and containment", 1, "lot", 480)],
        labour: [L("Electrician", 38, DEMO.rateElectrician, "Electrician"),
                 L("Apprentice", 19, DEMO.rateApprentice, "Apprentice")],
        other: [{ desc: "Tower scaffold hire", amount: 220 }],
        markupPct: DEMO.markupPct, vatApplied: true, vatPct: DEMO.vatPct,
        override: 5950, overrideReason: "Rounded for the hotel. Long account, repeat work.",
        notes: "", assumptions: "",
        approvedAt: "2026-09-17", approvedBy: "Gerry Byrne", sentAt: "2026-09-17",
        history: [
          H("2026-09-09", "John B.", "Install completed and tested."),
          H("2026-09-17", "Gerry Byrne", "Priced and approved at €5,950.00 ex VAT."),
          H("2026-09-17", "Sandra Nolan", "Quote sent to the customer.")
        ]
      }
    ];
  }

  /* =====================================================================
     STORE
     ===================================================================== */
  var state = { jobs: [], metrics: { priceEvents: [] } };

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.jobs) && parsed.jobs.length) {
          state = parsed;
          if (!state.metrics) state.metrics = { priceEvents: [] };
          if (!Array.isArray(state.metrics.priceEvents)) state.metrics.priceEvents = [];
          return;
        }
      }
    } catch (e) { /* fall through to seed */ }
    state = { jobs: seed(), metrics: { priceEvents: [] } };
    save();
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (e) { toast("Could not save locally. Private browsing may be on."); }
  }
  function getJob(id) {
    for (var i = 0; i < state.jobs.length; i++) if (state.jobs[i].id === id) return state.jobs[i];
    return null;
  }
  function logTo(job, who, what) {
    job.history = job.history || [];
    job.history.push({ at: todayISO(), who: who, what: what });
  }

  /* =====================================================================
     CALCULATION
     ===================================================================== */
  function calc(job) {
    var matNet = 0, i;
    for (i = 0; i < (job.materials || []).length; i++) {
      matNet += num(job.materials[i].qty) * num(job.materials[i].cost);
    }
    var markup = num(job.markupPct);
    var matCharged = matNet * (1 + markup / 100);
    var matUplift = matCharged - matNet;

    var lab = 0;
    for (i = 0; i < (job.labour || []).length; i++) {
      lab += num(job.labour[i].hours) * num(job.labour[i].rate);
    }
    var oth = 0;
    for (i = 0; i < (job.other || []).length; i++) oth += num(job.other[i].amount);

    var calculated = matCharged + lab + oth;
    var hasOverride = job.override !== null && job.override !== undefined && job.override !== "";
    var exVat = hasOverride ? num(job.override) : calculated;
    var vat = job.vatApplied ? exVat * num(job.vatPct) / 100 : 0;

    return {
      matNet: matNet, matUplift: matUplift, matCharged: matCharged,
      labour: lab, other: oth, calculated: calculated,
      hasOverride: hasOverride, exVat: exVat, vat: vat, incVat: exVat + vat
    };
  }

  function missingInfo(job) {
    var m = [];
    if (!(job.materials || []).length) m.push("no materials recorded");
    if (!(job.labour || []).length) m.push("no labour recorded");
    if (!job.completedAt && job.status !== "needs-info") m.push("no completion date");
    return m;
  }

  /* =====================================================================
     UI PRIMITIVES
     ===================================================================== */
  var toastTimer = null;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  var lastFocus = null;
  function dialog(title, bodyHTML, actions) {
    lastFocus = document.activeElement;
    $("#dlgTitle").textContent = title;
    $("#dlgBody").innerHTML = bodyHTML;
    var wrap = $("#dlgActions"); wrap.innerHTML = "";
    (actions || []).forEach(function (a) {
      var b = el("button", "btn " + (a.cls || "btn-line"), esc(a.label));
      b.type = "button";
      b.addEventListener("click", function () { closeDialog(); if (a.fn) a.fn(); });
      wrap.appendChild(b);
    });
    $("#overlay").hidden = false;
    var first = wrap.querySelector("button");
    if (first) first.focus();
  }
  function closeDialog() {
    $("#overlay").hidden = true;
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !$("#overlay").hidden) closeDialog();
  });
  $("#overlay").addEventListener("mousedown", function (e) {
    if (e.target === $("#overlay")) closeDialog();
  });

  function statusPill(status) {
    var s = STATUS[status] || { label: status, pill: "pill-grey" };
    return '<span class="pill ' + s.pill + '">' + esc(s.label) + "</span>";
  }
  function urgencyPill(u) {
    var cls = u === "Urgent" ? "pill-red" : (u === "Priority" ? "pill-amber" : "pill-grey");
    return '<span class="pill ' + cls + '">' + esc(u) + "</span>";
  }
  function pipelineHTML(job) {
    var idx = PIPELINE.indexOf(job.status);
    var parts = [];
    var steps = job.status === "needs-info"
      ? ["new", "needs-info", "with-gerry", "approved", "sent"]
      : ["new", "with-gerry", "approved", "sent"];
    steps.forEach(function (s, i) {
      var si = PIPELINE.indexOf(s);
      var cls = si < idx ? "done" : (si === idx ? "now" : "");
      parts.push('<span class="pipe-step ' + cls + '">' + esc(PIPELINE_LABEL[s]) + "</span>");
      if (i < steps.length - 1) parts.push('<span class="pipe-arrow">›</span>');
    });
    return '<div class="pipe">' + parts.join("") + "</div>";
  }

  /* =====================================================================
     VIEWS
     ===================================================================== */
  var main = $("#main");

  function render() {
    var hash = location.hash || "#/tray";
    var parts = hash.replace(/^#\//, "").split("/");
    var route = parts[0] || "tray";

    document.querySelectorAll(".nav-item").forEach(function (a) {
      var r = a.getAttribute("data-route");
      if (r === route || (route === "job" && r === "tray")) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    var staleDock = document.getElementById("approveDock");
    if (staleDock) staleDock.remove();

    if (route === "job") viewJob(parts[1]);
    else if (route === "intake") viewIntake();
    else if (route === "office") viewOffice();
    else if (route === "history") viewHistory();
    else viewTray();

    updateBadges();
    main.scrollIntoView({ block: "start" });
  }

  function updateBadges() {
    var tray = state.jobs.filter(function (j) { return j.status === "with-gerry"; }).length;
    var need = state.jobs.filter(function (j) { return j.status === "needs-info"; }).length;
    var bt = $("#badgeTray"), bo = $("#badgeOffice");
    bt.textContent = tray; bt.setAttribute("data-zero", tray === 0 ? "1" : "0");
    bo.textContent = need; bo.setAttribute("data-zero", need === 0 ? "1" : "0");
  }

  /* ---------- job card ---------- */
  function jobCard(job) {
    var waited = daysBetween(job.submittedAt, todayISO());
    var c = calc(job);
    var hot = waited >= 21;
    var b = el("button", "job");
    b.type = "button";
    b.setAttribute("data-urgency", (job.urgency || "Standard").toLowerCase());
    if (hot) b.classList.add("is-hot");
    b.setAttribute("aria-label", "Open job " + job.ref + ", " + job.customer);
    b.innerHTML =
      '<div class="job-top"><span class="job-ref">' + esc(job.ref) + "</span>" +
      '<span class="rowbtns">' + urgencyPill(job.urgency) + statusPill(job.status) + "</span></div>" +
      '<p class="job-cust">' + esc(job.customer) + "</p>" +
      '<p class="job-desc">' + esc(job.description) + "</p>" +
      '<div class="job-meta' + (hot ? " waiting-hot" : "") + '">' +
        "<span>In tray <b>" + fmtShort(job.submittedAt) + "</b></span>" +
        "<span>Waiting <b>" + waited + " day" + (waited === 1 ? "" : "s") + "</b></span>" +
        "<span>" + (c.calculated > 0
            ? "Est. value <b class=\"num\">" + eur0(c.exVat) + "</b> ex VAT"
            : "<b>No figures yet</b>") +
        "</span></div>";
    b.addEventListener("click", function () { location.hash = "#/job/" + job.id; });
    return b;
  }

  /* ---------- A. GERRY'S TRAY ---------- */
  function viewTray() {
    main.innerHTML = "";
    var waiting = state.jobs.filter(function (j) { return j.status === "with-gerry"; })
      .sort(function (a, b) { return a.submittedAt < b.submittedAt ? -1 : 1; });

    var head = el("div", "page-head");
    head.innerHTML = "<h1>Gerry's tray</h1><p>" +
      (waiting.length ? waiting.length + " commercial job" + (waiting.length === 1 ? "" : "s") + " waiting on a price. Oldest first."
                      : "Nothing waiting on a price.") + "</p>";
    main.appendChild(head);

    if (!waiting.length) {
      var e = el("div", "empty");
      e.innerHTML = "<h3>Tray is clear</h3><p>Every commercial job has been priced.</p>";
      main.appendChild(e);
      return;
    }

    var oldest = waiting[0];
    var oldDays = daysBetween(oldest.submittedAt, todayISO());
    if (oldDays >= 21) {
      var n = el("div", "notice warn");
      n.innerHTML = "<strong>" + esc(oldest.customer) + "</strong> has been waiting <strong>" +
        oldDays + " days</strong>. That is the oldest job in the tray.";
      main.appendChild(n);
    }

    var grid = el("div", "job-grid");
    waiting.forEach(function (j) { grid.appendChild(jobCard(j)); });
    main.appendChild(grid);

    var needs = state.jobs.filter(function (j) { return j.status === "needs-info"; });
    if (needs.length) {
      main.appendChild(el("div", "section-label", "Held in the office, not yet priceable"));
      var g2 = el("div", "job-grid");
      needs.forEach(function (j) { g2.appendChild(jobCard(j)); });
      main.appendChild(g2);
    }
  }

  /* ---------- C. PRICING WORKSPACE ---------- */
  function viewJob(id) {
    var job = getJob(id);
    main.innerHTML = "";
    if (!job) {
      var e = el("div", "empty");
      e.innerHTML = "<h3>Job not found</h3><p>It may have been removed by a demo reset.</p>";
      main.appendChild(e);
      return;
    }

    var back = el("button", "back", "‹ Back to tray");
    back.type = "button";
    back.addEventListener("click", function () { history.length > 1 ? history.back() : (location.hash = "#/tray"); });
    main.appendChild(back);

    var waited = daysBetween(job.submittedAt, todayISO());
    var head = el("div", "page-head");
    head.innerHTML =
      '<div class="rowbtns" style="margin-bottom:8px">' +
        '<span class="job-ref">' + esc(job.ref) + "</span>" + urgencyPill(job.urgency) + statusPill(job.status) +
      "</div>" +
      "<h1>" + esc(job.customer) + "</h1>" +
      "<p>" + esc(job.description) + " · " + esc(job.site) + "</p>";
    main.appendChild(head);
    main.insertAdjacentHTML("beforeend", pipelineHTML(job));

    var miss = missingInfo(job);
    if (miss.length) {
      main.insertAdjacentHTML("beforeend",
        '<div class="notice warn" style="margin-top:12px"><strong>Missing from the job sheet:</strong> ' +
        esc(miss.join(", ")) + ". You can still price it, but the office should chase this.</div>");
    }

    var wrap = el("div", "two-col");
    var left = el("div");
    var right = el("div");

    /* --- summary --- */
    var sum = el("div", "card card-pad");
    sum.innerHTML =
      '<div class="section-label" style="margin-top:0">Job summary</div>' +
      '<div class="summary-grid">' +
        row("Customer", job.customer) + row("Site", job.site) +
        row("Type", job.type + " · " + job.trade) +
        row("Submitted by", job.submittedBy) +
        row("In tray since", fmtDate(job.submittedAt) + " (" + waited + " day" + (waited === 1 ? "" : "s") + ")") +
        row("Work completed", job.completedAt ? fmtDate(job.completedAt) : "Not recorded") +
      "</div>" +
      (job.scope ? '<p style="margin-top:12px;font-size:14.5px">' + esc(job.scope) + "</p>" : "") +
      (job.siteNotes ? '<p style="font-size:13.5px;color:var(--ink-soft);margin:0"><strong>Site notes:</strong> ' + esc(job.siteNotes) + "</p>" : "");
    left.appendChild(sum);

    function row(k, v) {
      return '<div class="sg-row"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + "</span></div>";
    }

    var locked = (job.status === "approved" || job.status === "sent");

    /* --- materials --- */
    left.appendChild(lineCard(job, "materials", "Materials", locked));
    /* --- labour --- */
    left.appendChild(lineCard(job, "labour", "Labour", locked));
    /* --- other --- */
    left.appendChild(lineCard(job, "other", "Other costs", locked));

    /* --- notes --- */
    var notes = el("div", "card card-pad");
    notes.innerHTML =
      '<div class="section-label" style="margin-top:0">Notes and assumptions</div>' +
      '<div class="field"><label for="jNotes">Gerry\'s notes on this quote</label>' +
      '<textarea id="jNotes" ' + (locked ? "disabled" : "") + ' placeholder="Anything the customer should see, or that explains the price.">' + esc(job.notes || "") + "</textarea></div>" +
      '<div class="field" style="margin-bottom:0"><label for="jAssume">Assumptions and exclusions</label>' +
      '<textarea id="jAssume" ' + (locked ? "disabled" : "") + ' placeholder="What this price does not include.">' + esc(job.assumptions || "") + "</textarea></div>";
    left.appendChild(notes);

    /* --- totals panel --- */
    var panel = el("div", "card card-pad");
    panel.id = "totalsPanel";
    right.appendChild(panel);

    wrap.appendChild(right); wrap.appendChild(left);   // price first on phone; CSS reorders on desktop
    main.appendChild(wrap);

    drawTotals(job, locked);
    drawDock(job, locked);

    notes.querySelector("#jNotes").addEventListener("input", function () { job.notes = this.value; save(); });
    notes.querySelector("#jAssume").addEventListener("input", function () { job.assumptions = this.value; save(); });

    if (challenge.active && challenge.jobId === job.id) {
      setHint("Check the figures, then press Approve this price.");
    }
  }

  /* ---------- sticky approve dock (phones only) ---------- */
  function drawDock(job, locked) {
    var old = document.getElementById("approveDock");
    if (old) old.remove();
    var spacerOld = document.getElementById("dockSpacer");
    if (spacerOld) spacerOld.remove();
    if (locked) return;
    if (job.status !== "with-gerry" && job.status !== "needs-info") return;

    var c = calc(job);
    var dock = el("div", "approve-dock");
    dock.id = "approveDock";
    dock.innerHTML =
      '<div class="dock-total"><span class="k">Total inc VAT</span>' +
      '<span class="v num" id="dockVal">' + eur(c.incVat) + "</span></div>" +
      '<button type="button" class="btn btn-approve" id="dockApprove" style="width:auto;flex:1;min-height:50px">Approve this price</button>';
    document.body.appendChild(dock);
    var sp = el("div"); sp.id = "dockSpacer"; sp.style.height = "74px";
    main.appendChild(sp);
    dock.querySelector("#dockApprove").addEventListener("click", function () { approve(job); });
  }
  function refreshDock(job) {
    var v = document.getElementById("dockVal");
    if (v) v.textContent = eur(calc(job).incVat);
  }

  /* ---------- editable line tables ---------- */
  function lineCard(job, key, title, locked) {
    var card = el("div", "card card-pad");
    var isMat = key === "materials", isLab = key === "labour";

    function build() {
      var rows = job[key] || [];
      var html = '<div class="section-label" style="margin-top:0">' + esc(title) + "</div>";

      if (!rows.length) {
        html += '<p style="color:var(--muted);font-size:14px;margin-bottom:10px">Nothing recorded by the office.</p>';
      } else {
        html += '<table class="lines"><thead><tr><th>Description</th>';
        if (isMat) html += '<th class="r" style="width:64px">Qty</th><th class="r" style="width:92px">Unit €</th>';
        else if (isLab) html += '<th class="r" style="width:64px">Hrs</th><th class="r" style="width:92px">Rate €</th>';
        else html += '<th class="r" style="width:102px">Amount €</th>';
        html += '<th class="r" style="width:96px">Line</th>' + (locked ? "" : '<th style="width:36px"></th>') + "</tr></thead><tbody>";

        rows.forEach(function (r, i) {
          var line = isMat ? num(r.qty) * num(r.cost) : (isLab ? num(r.hours) * num(r.rate) : num(r.amount));
          html += "<tr>" +
            '<td class="c-desc"><input type="text" value="' + esc(r.desc) + '" data-k="desc" data-i="' + i + '" aria-label="Description" ' + (locked ? "disabled" : "") + "></td>";
          if (isMat) {
            html += '<td data-lab="Qty"><input class="n" type="number" step="0.01" min="0" inputmode="decimal" value="' + esc(r.qty) + '" data-k="qty" data-i="' + i + '" aria-label="Quantity" ' + (locked ? "disabled" : "") + "></td>" +
                    '<td data-lab="Unit \u20AC"><input class="n" type="number" step="0.01" min="0" inputmode="decimal" value="' + esc(r.cost) + '" data-k="cost" data-i="' + i + '" aria-label="Unit cost" ' + (locked ? "disabled" : "") + "></td>";
          } else if (isLab) {
            html += '<td data-lab="Hours"><input class="n" type="number" step="0.25" min="0" inputmode="decimal" value="' + esc(r.hours) + '" data-k="hours" data-i="' + i + '" aria-label="Hours" ' + (locked ? "disabled" : "") + "></td>" +
                    '<td data-lab="Rate \u20AC"><input class="n" type="number" step="0.5" min="0" inputmode="decimal" value="' + esc(r.rate) + '" data-k="rate" data-i="' + i + '" aria-label="Hourly rate" ' + (locked ? "disabled" : "") + "></td>";
          } else {
            html += '<td data-lab="Amount \u20AC"><input class="n" type="number" step="0.01" min="0" inputmode="decimal" value="' + esc(r.amount) + '" data-k="amount" data-i="' + i + '" aria-label="Amount" ' + (locked ? "disabled" : "") + "></td>";
          }
          html += '<td class="r num" data-line="' + i + '">' + eur(line) + "</td>";
          if (!locked) html += '<td><button type="button" class="del" data-del="' + i + '" aria-label="Remove line">×</button></td>';
          html += "</tr>";
        });
        html += "</tbody></table>";
      }

      if (!locked) {
        html += '<button type="button" class="btn btn-line btn-sm" data-add="1" style="margin-top:10px">+ Add ' +
          (isMat ? "material" : isLab ? "labour" : "cost") + "</button>";
      }
      card.innerHTML = html;

      card.querySelectorAll("input").forEach(function (inp) {
        inp.addEventListener("input", function () {
          var i = +this.getAttribute("data-i"), k = this.getAttribute("data-k");
          job[key][i][k] = (k === "desc") ? this.value : num(this.value);
          var r = job[key][i];
          var line = isMat ? num(r.qty) * num(r.cost) : (isLab ? num(r.hours) * num(r.rate) : num(r.amount));
          var cell = card.querySelector('[data-line="' + i + '"]');
          if (cell) cell.textContent = eur(line);
          save(); drawTotals(job, locked); refreshDock(job);
        });
      });
      var addBtn = card.querySelector("[data-add]");
      if (addBtn) addBtn.addEventListener("click", function () {
        if (isMat) job[key].push({ desc: "", qty: 1, unit: "ea", cost: 0 });
        else if (isLab) job[key].push({ desc: "", hours: 0, rate: DEMO.rateElectrician, role: "Electrician" });
        else job[key].push({ desc: "", amount: 0 });
        save(); build(); drawTotals(job, locked); refreshDock(job);
        var ins = card.querySelectorAll('input[data-k="desc"]');
        if (ins.length) ins[ins.length - 1].focus();
      });
      card.querySelectorAll("[data-del]").forEach(function (b) {
        b.addEventListener("click", function () {
          job[key].splice(+this.getAttribute("data-del"), 1);
          save(); build(); drawTotals(job, locked); refreshDock(job);
        });
      });
    }

    build();
    return card;
  }

  /* ---------- totals panel ---------- */
  function drawTotals(job, locked) {
    var p = $("#totalsPanel");
    if (!p) return;
    var c = calc(job);

    var html =
      '<div class="section-label" style="margin-top:0">The price</div>' +
      '<div class="totals" style="border-top:0;margin-top:0;padding-top:0" aria-live="polite">' +
        trow("Materials, net", eur(c.matNet)) +
        trow("Materials markup " + num(job.markupPct) + "%", eur(c.matUplift)) +
        trow("Labour", eur(c.labour)) +
        trow("Other costs", eur(c.other)) +
        '<div class="trow sub"><span class="lab">Calculated price, ex VAT</span><span class="val num">' + eur(c.calculated) + "</span></div>" +
      "</div>";

    if (!locked) {
      html +=
        '<div class="field" style="margin-top:14px"><label for="mk">Materials markup</label>' +
        '<div class="override-row"><input id="mk" class="n" type="number" min="0" max="100" step="0.5" value="' + esc(job.markupPct) + '" style="max-width:110px"><span class="pfx" style="font-size:16px">%</span></div>' +
        '<p class="hint">Demonstration assumption, not a Byrne\'s rate.</p></div>';
    }

    html +=
      '<div class="override">' +
        "<h3>Gerry's price</h3>" +
        '<p class="hint">The figure above is a starting point. Type your own price here and it replaces it.</p>' +
        (locked
          ? '<p style="font-size:20px;font-weight:700;margin:0" class="num">' + eur(c.exVat) + " ex VAT</p>"
          : '<div class="override-row"><span class="pfx">€</span>' +
            '<input id="ovr" class="n" type="number" min="0" step="0.01" inputmode="decimal" placeholder="' +
            c.calculated.toFixed(2) + '" value="' + (c.hasOverride ? esc(job.override) : "") + '" aria-label="Gerry\'s own price, ex VAT"></div>' +
            '<div class="field" style="margin:10px 0 0"><label for="ovrWhy">Why (optional)</label>' +
            '<input id="ovrWhy" type="text" value="' + esc(job.overrideReason || "") + '" placeholder="e.g. old wiring, not fair to charge standard"></div>') +
        (c.hasOverride && job.overrideReason ? '<p class="hint" style="margin:8px 0 0"><strong>Reason:</strong> ' + esc(job.overrideReason) + "</p>" : "") +
      "</div>";

    html +=
      '<div class="totals">' +
        '<div class="trow"><span class="lab">Quoted, ex VAT</span><span class="val num">' + eur(c.exVat) + "</span></div>" +
        '<div class="trow vat"><span class="lab">VAT at ' + num(job.vatPct) + "%" + (job.vatApplied ? "" : " (not applied)") + '</span><span class="val num">' + eur(c.vat) + "</span></div>" +
        '<div class="trow grand"><span class="lab">Total</span><span class="val num">' + eur(c.incVat) + "</span></div>" +
      "</div>";

    if (job.status === "with-gerry" || job.status === "needs-info") {
      html += '<div style="margin-top:16px"><button type="button" class="btn btn-approve" id="approveBtn">Approve this price</button>' +
        '<p class="hint" style="text-align:center;margin-top:8px">Nothing is sent to a customer until you press this.</p></div>';
    } else if (job.status === "approved") {
      html += '<div style="margin-top:16px"><div class="notice" style="margin-bottom:10px"><strong>Approved by ' +
        esc(job.approvedBy || "Gerry Byrne") + "</strong> on " + fmtDate(job.approvedAt) + ".</div>" +
        '<button type="button" class="btn btn-primary" id="sendBtn">Mark quote as sent</button>' +
        '<button type="button" class="btn btn-line btn-sm" id="reopenBtn" style="width:100%;margin-top:8px">Reopen for re-pricing</button></div>';
    } else if (job.status === "sent") {
      html += '<div style="margin-top:16px"><div class="notice"><strong>Quote sent</strong> on ' + fmtDate(job.sentAt) +
        ". Approved by " + esc(job.approvedBy || "Gerry Byrne") + ".</div>" +
        '<button type="button" class="btn btn-line btn-sm" id="reopenBtn" style="width:100%;margin-top:8px">Reopen for re-pricing</button></div>';
    }

    html += '<div class="assumption" style="margin-top:14px"><strong>Demonstration assumptions</strong>' +
      "Labour rates, the " + num(job.markupPct) + "% materials markup and the " + num(job.vatPct) +
      "% VAT line are placeholders for this prototype. They are not Byrne's commercial rates.</div>";

    p.innerHTML = html;

    function trow(k, v) { return '<div class="trow"><span class="lab">' + esc(k) + '</span><span class="val num">' + v + "</span></div>"; }

    var mk = p.querySelector("#mk");
    if (mk) mk.addEventListener("input", function () { job.markupPct = num(this.value); save(); drawTotals(job, locked); refreshDock(job); });

    var ovr = p.querySelector("#ovr");
    if (ovr) ovr.addEventListener("input", function () {
      job.override = this.value === "" ? null : num(this.value);
      save();
      var cc = calc(job);
      var rows = p.querySelectorAll(".totals .trow");
      // refresh only the three summary rows to keep focus in the input
      var tot = p.querySelectorAll(".totals");
      var last = tot[tot.length - 1];
      last.querySelectorAll(".val")[0].textContent = eur(cc.exVat);
      last.querySelectorAll(".val")[1].textContent = eur(cc.vat);
      last.querySelectorAll(".val")[2].textContent = eur(cc.incVat);
      refreshDock(job);
    });
    var ovrWhy = p.querySelector("#ovrWhy");
    if (ovrWhy) ovrWhy.addEventListener("input", function () { job.overrideReason = this.value; save(); });

    var ab = p.querySelector("#approveBtn");
    if (ab) ab.addEventListener("click", function () { approve(job); });
    var sb = p.querySelector("#sendBtn");
    if (sb) sb.addEventListener("click", function () { sendQuote(job); });
    var rb = p.querySelector("#reopenBtn");
    if (rb) rb.addEventListener("click", function () { reopen(job); });
  }

  /* ---------- actions ---------- */
  function approve(job) {
    var c = calc(job);
    if (c.exVat <= 0) {
      dialog("Nothing to approve",
        "<p>This job has no figures yet. Add materials or labour, or type your own price, before approving.</p>",
        [{ label: "Back to the job", cls: "btn-primary" }]);
      return;
    }
    dialog("Approve this price?",
      "<p>You are approving <strong>" + eur(c.exVat) + "</strong> ex VAT for <strong>" + esc(job.customer) + "</strong>" +
      " (" + eur(c.incVat) + " including VAT).</p>" +
      "<p class=\"hint\">Nothing is sent to the customer by this app. The office sends the quote after you approve.</p>",
      [
        { label: "Not yet" },
        { label: "Yes, approve", cls: "btn-accent", fn: function () {
            job.status = "approved";
            job.approvedAt = todayISO();
            job.approvedBy = "Gerry Byrne";
            job.quotedExVat = c.exVat;
            job.quotedIncVat = c.incVat;
            logTo(job, "Gerry Byrne", "Priced and approved at " + eur(c.exVat) + " ex VAT" +
              (job.overrideReason ? " (" + job.overrideReason + ")" : "") + ".");
            state.metrics.priceEvents.push({ jobId: job.id, at: Date.now(), seconds: challenge.active ? elapsedSeconds() : null });
            save();
            if (challenge.active && challenge.jobId === job.id) finishChallenge(true);
            else { toast("Approved. " + eur(c.exVat) + " ex VAT."); render(); }
          } }
      ]);
  }

  function sendQuote(job) {
    job.status = "sent";
    job.sentAt = todayISO();
    logTo(job, "Sandra Nolan", "Quote sent to the customer.");
    save(); toast("Marked as sent."); render();
  }

  function reopen(job) {
    dialog("Reopen this job?",
      "<p>This puts the job back in Gerry's tray so the price can be changed.</p>",
      [{ label: "Cancel" }, { label: "Reopen", cls: "btn-accent", fn: function () {
          job.status = "with-gerry";
          logTo(job, "Gerry Byrne", "Reopened for re-pricing.");
          save(); toast("Back in the tray."); render();
        } }]);
  }

  /* ---------- B. OFFICE INTAKE ---------- */
  function viewIntake() {
    main.innerHTML = "";
    var head = el("div", "page-head");
    head.innerHTML = "<h1>New quotation request</h1><p>Office intake. Fill in what came back on the job sheet. Anything missing is flagged for chasing rather than blocking the job.</p>";
    main.appendChild(head);

    var nextRef = String(Math.max.apply(null, state.jobs.map(function (j) { return parseInt(j.ref, 10) || 700; })) + 1);

    var form = el("form", "card card-pad");
    form.noValidate = true;
    form.innerHTML =
      '<div class="section-label" style="margin-top:0">Customer and job</div>' +
      '<div class="grid2">' +
        f("ref", "Job sheet number", '<input type="text" id="ref" value="' + esc(nextRef) + '" required>') +
        f("customer", "Customer or company <span class=\"req\">*</span>", '<input type="text" id="customer" required autocomplete="off" placeholder="e.g. Naas Credit Union">') +
      "</div>" +
      '<div class="grid2">' +
        f("site", "Site or address", '<input type="text" id="site" placeholder="e.g. Monread, Naas">') +
        f("type", "Job type <span class=\"req\">*</span>",
          '<select id="type" required><option value="">Choose…</option><option>Commercial</option><option>Domestic</option><option>Call-out</option><option>Maintenance</option><option>Sub-contract</option></select>') +
      "</div>" +
      '<div class="grid2">' +
        f("trade", "Trade", '<select id="trade"><option>Electrical</option><option>Plumbing</option><option>Both</option></select>') +
        f("urgency", "Urgency", '<select id="urgency"><option>Standard</option><option>Priority</option><option>Urgent</option></select>') +
      "</div>" +
      f("description", "Short job description <span class=\"req\">*</span>", '<input type="text" id="description" required placeholder="e.g. Door access fault">') +
      f("scope", "Scope, measurements or quantities", '<textarea id="scope" placeholder="What was actually done, and how much of it."></textarea>') +

      '<div class="section-label">Dates</div>' +
      '<div class="grid2">' +
        f("submittedAt", "Date sheet received <span class=\"req\">*</span>", '<input type="date" id="submittedAt" value="' + todayISO() + '" required>') +
        f("completedAt", "Date work completed", '<input type="date" id="completedAt">') +
      "</div>" +

      '<div class="section-label">What the sheet gave us</div>' +
      f("materials", "Materials", '<textarea id="materials" placeholder="One per line:  description | qty | unit cost&#10;e.g.  Maglock | 1 | 118"></textarea>' +
        '<p class="hint">Leave blank if the sheet did not list them. The job will be flagged as needing info.</p>') +
      '<div class="grid2">' +
        f("labHours", "Labour estimate, hours", '<input type="number" id="labHours" min="0" step="0.25" inputmode="decimal" placeholder="e.g. 7">') +
        f("labRole", "Who", '<select id="labRole"><option>Electrician</option><option>Plumber</option><option>Apprentice</option></select>') +
      "</div>" +
      f("siteNotes", "Site notes and comments", '<textarea id="siteNotes" placeholder="Access, customer contact, anything Gerry should know."></textarea>') +

      '<div class="notice" style="margin-top:4px">Gerry prices every commercial job. Saving this puts it in his tray. It does not price it and it does not contact the customer.</div>' +
      '<div class="form-foot"><button type="submit" class="btn btn-primary">Save and place in Gerry\'s tray</button></div>';

    function f(id, label, control) {
      return '<div class="field"><label for="' + id + '">' + label + "</label>" + control +
        '<div class="err" id="err-' + id + '" hidden></div></div>';
    }
    main.appendChild(form);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var ok = true;
      ["customer", "type", "description", "submittedAt"].forEach(function (id) {
        var inp = form.querySelector("#" + id), err = form.querySelector("#err-" + id);
        if (!inp.value.trim()) {
          inp.setAttribute("aria-invalid", "true");
          err.textContent = "This one is needed."; err.hidden = false;
          ok = false;
        } else {
          inp.removeAttribute("aria-invalid"); err.hidden = true;
        }
      });
      if (!ok) {
        var bad = form.querySelector('[aria-invalid="true"]');
        if (bad) bad.focus();
        toast("A few fields still need filling in.");
        return;
      }

      var mats = [];
      form.querySelector("#materials").value.split("\n").forEach(function (line) {
        line = line.trim(); if (!line) return;
        var p = line.split("|");
        mats.push({ desc: (p[0] || "").trim(), qty: num(p[1] !== undefined ? p[1] : 1) || 1, unit: "ea", cost: num(p[2]) });
      });

      var hrs = num(form.querySelector("#labHours").value);
      var role = form.querySelector("#labRole").value;
      var rate = role === "Apprentice" ? DEMO.rateApprentice : (role === "Plumber" ? DEMO.ratePlumber : DEMO.rateElectrician);
      var lab = hrs > 0 ? [{ desc: role, hours: hrs, rate: rate, role: role }] : [];

      var job = {
        id: uid(),
        ref: form.querySelector("#ref").value.trim() || nextRef,
        customer: form.querySelector("#customer").value.trim(),
        site: form.querySelector("#site").value.trim(),
        type: form.querySelector("#type").value,
        trade: form.querySelector("#trade").value,
        urgency: form.querySelector("#urgency").value,
        description: form.querySelector("#description").value.trim(),
        scope: form.querySelector("#scope").value.trim(),
        siteNotes: form.querySelector("#siteNotes").value.trim(),
        submittedBy: "Office",
        submittedAt: form.querySelector("#submittedAt").value,
        completedAt: form.querySelector("#completedAt").value,
        status: (mats.length || lab.length) ? "with-gerry" : "needs-info",
        materials: mats, labour: lab, other: [],
        markupPct: DEMO.markupPct, vatApplied: true, vatPct: DEMO.vatPct,
        override: null, overrideReason: "", notes: "", assumptions: "",
        history: [{ at: todayISO(), who: "Office", what: "Job sheet logged." }]
      };
      if (job.status === "needs-info") {
        job.history.push({ at: todayISO(), who: "Office", what: "Held: no materials or labour on the sheet." });
      } else {
        job.history.push({ at: todayISO(), who: "Office", what: "Placed in Gerry's tray." });
      }

      state.jobs.push(job); save();
      toast(job.status === "needs-info" ? "Saved. Flagged as needing info." : "Saved into Gerry's tray.");
      location.hash = "#/job/" + job.id;
    });
  }

  /* ---------- D. SANDRA'S OFFICE VIEW ---------- */
  function viewOffice() {
    main.innerHTML = "";
    var head = el("div", "page-head");
    head.innerHTML = "<h1>Office view</h1><p>Sandra Nolan. Where every quotation stands, what is missing, and what to chase. This view cannot change a price Gerry has approved.</p>";
    main.appendChild(head);

    var waiting = state.jobs.filter(function (j) { return j.status === "with-gerry"; });
    var needs = state.jobs.filter(function (j) { return j.status === "needs-info"; });
    var priced = state.jobs.filter(function (j) { return j.status === "approved" || j.status === "sent"; });
    var oldest = waiting.concat(needs).sort(function (a, b) { return a.submittedAt < b.submittedAt ? -1 : 1; })[0];
    var oldestDays = oldest ? daysBetween(oldest.submittedAt, todayISO()) : 0;

    var secs = state.metrics.priceEvents.filter(function (e) { return e.seconds; }).map(function (e) { return e.seconds; });
    var avg = secs.length ? Math.round(secs.reduce(function (a, b) { return a + b; }, 0) / secs.length) : null;

    main.appendChild(el("div", "section-label", "Demo insights"));
    var stats = el("div", "stats");
    stats.innerHTML =
      stat("Jobs waiting", waiting.length, "with Gerry, awaiting a price") +
      stat("Oldest outstanding", oldestDays ? oldestDays + " days" : "—", oldest ? oldest.customer : "nothing waiting", oldestDays >= 21) +
      stat("Jobs priced", priced.length, "approved or sent") +
      stat("Average time to price", avg ? avg + "s" : "—", avg ? "in this demo session" : "no timed runs yet");
    main.appendChild(stats);

    var openJobs = waiting.length + needs.length;
    var mins = openJobs * DEMO.adminMinutesPerJob;
    main.insertAdjacentHTML("beforeend",
      '<div class="assumption"><strong>Estimate, not a measurement</strong>' +
      "If each of the " + openJobs + " open job" + (openJobs === 1 ? "" : "s") + " took " + DEMO.adminMinutesPerJob +
      " minutes of chasing and re-handling, that is about " + Math.round(mins / 60 * 10) / 10 +
      " hours of office time. The " + DEMO.adminMinutesPerJob + " minutes is an assumption made for this prototype. " +
      "It has not been measured at Byrne's, and no saving has been demonstrated.</div>");

    if (needs.length) {
      main.appendChild(el("div", "section-label", "Missing information, chase these"));
      needs.forEach(function (j) {
        var miss = missingInfo(j);
        var c = el("div", "card card-pad");
        c.style.marginBottom = "10px";
        c.innerHTML =
          '<div class="job-top"><span class="job-ref">' + esc(j.ref) + "</span>" + urgencyPill(j.urgency) + "</div>" +
          '<p class="job-cust">' + esc(j.customer) + "</p>" +
          '<p class="job-desc">' + esc(j.description) + "</p>" +
          '<p style="font-size:13.5px;color:var(--red);margin:9px 0 0"><strong>Missing:</strong> ' + esc(miss.join(", ")) + "</p>" +
          (j.siteNotes ? '<p style="font-size:13px;color:var(--ink-soft);margin:5px 0 0">' + esc(j.siteNotes) + "</p>" : "") +
          '<div class="rowbtns" style="margin-top:11px"><button type="button" class="btn btn-line btn-sm" data-open="' + j.id + '">Open and complete</button>' +
          '<button type="button" class="btn btn-line btn-sm" data-chase="' + j.id + '">Log a chase</button></div>';
        main.appendChild(c);
      });
    }

    main.appendChild(el("div", "section-label", "Waiting on Gerry"));
    if (!waiting.length) {
      main.insertAdjacentHTML("beforeend", '<div class="card card-pad"><p style="margin:0;color:var(--muted)">Nothing waiting on a price.</p></div>');
    } else {
      var tbl = el("div", "card card-pad");
      var rows = waiting.sort(function (a, b) { return a.submittedAt < b.submittedAt ? -1 : 1; }).map(function (j) {
        var d = daysBetween(j.submittedAt, todayISO());
        var c = calc(j);
        return '<div class="sg-row"><span class="k"><strong>' + esc(j.ref) + "</strong> " + esc(j.customer) +
          '<br><span style="font-size:12.5px;color:var(--muted)">' + esc(j.description) + "</span></span>" +
          '<span class="v">' + (d >= 21 ? '<span style="color:var(--red)">' : "<span>") + d + " days</span>" +
          '<br><span style="font-weight:500;color:var(--ink-soft);font-size:13px" class="num">' +
          (c.calculated > 0 ? eur0(c.exVat) + " est." : "no figures") + "</span></span></div>";
      }).join("");
      tbl.innerHTML = rows;
      main.appendChild(tbl);
    }

    main.querySelectorAll("[data-open]").forEach(function (b) {
      b.addEventListener("click", function () { location.hash = "#/job/" + this.getAttribute("data-open"); });
    });
    main.querySelectorAll("[data-chase]").forEach(function (b) {
      b.addEventListener("click", function () {
        var j = getJob(this.getAttribute("data-chase"));
        logTo(j, "Sandra Nolan", "Chased for the missing paperwork.");
        save(); toast("Chase logged against " + j.ref + "."); render();
      });
    });

    function stat(k, v, s, hot) {
      return '<div class="stat' + (hot ? " hot" : "") + '"><div class="k">' + esc(k) + '</div><div class="v">' +
        esc(v) + '</div><div class="s">' + esc(s) + "</div></div>";
    }
  }

  /* ---------- E. HISTORY ---------- */
  function viewHistory() {
    main.innerHTML = "";
    var head = el("div", "page-head");
    head.innerHTML = "<h1>Quote history</h1><p>Every job, its status, and what happened to it.</p>";
    main.appendChild(head);

    var order = { "needs-info": 0, "with-gerry": 1, "approved": 2, "sent": 3 };
    var jobs = state.jobs.slice().sort(function (a, b) {
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return a.submittedAt < b.submittedAt ? -1 : 1;
    });

    jobs.forEach(function (j) {
      var c = calc(j);
      var card = el("div", "card card-pad");
      card.style.marginBottom = "10px";
      var hid = "h-" + j.id;
      card.innerHTML =
        '<div class="job-top"><span class="job-ref">' + esc(j.ref) + "</span>" +
        '<span class="rowbtns">' + statusPill(j.status) + "</span></div>" +
        '<p class="job-cust">' + esc(j.customer) + "</p>" +
        '<p class="job-desc">' + esc(j.description) + "</p>" +
        pipelineHTML(j) +
        '<div class="sg-row" style="margin-top:8px"><span class="k">Sheet received</span><span class="v">' + fmtDate(j.submittedAt) + "</span></div>" +
        '<div class="sg-row"><span class="k">' + (j.status === "approved" || j.status === "sent" ? "Quoted" : "Estimated") +
          ', ex VAT</span><span class="v num">' + (c.exVat > 0 ? eur(c.exVat) : "—") + "</span></div>" +
        (j.override !== null && j.overrideReason
          ? '<div class="sg-row"><span class="k">Gerry\'s reason</span><span class="v" style="font-weight:500">' + esc(j.overrideReason) + "</span></div>"
          : "") +
        '<div class="rowbtns" style="margin-top:11px">' +
          '<button type="button" class="btn btn-line btn-sm" data-open="' + j.id + '">Open job</button>' +
          '<button type="button" class="btn btn-line btn-sm" aria-expanded="false" aria-controls="' + hid + '" data-log="' + j.id + '">Activity (' + (j.history || []).length + ")</button>" +
        "</div>" +
        '<ul class="log" id="' + hid + '" hidden>' +
          (j.history || []).map(function (h) {
            return "<li><span class=\"when\">" + fmtShort(h.at) + '</span><span><span class="who">' + esc(h.who) + "</span> · " + esc(h.what) + "</span></li>";
          }).join("") +
        "</ul>";
      main.appendChild(card);
    });

    main.querySelectorAll("[data-open]").forEach(function (b) {
      b.addEventListener("click", function () { location.hash = "#/job/" + this.getAttribute("data-open"); });
    });
    main.querySelectorAll("[data-log]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ul = document.getElementById("h-" + this.getAttribute("data-log"));
        var open = ul.hidden;
        ul.hidden = !open;
        this.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  /* =====================================================================
     THE 2-MINUTE CHALLENGE
     ===================================================================== */
  var challenge = { active: false, jobId: null, start: 0, timer: null, taps: 0 };
  var LIMIT = 120;

  function elapsedSeconds() { return Math.round((Date.now() - challenge.start) / 1000); }
  function setHint(t) { var h = $("#cbHint"); if (h) h.textContent = t; }

  function startChallenge() {
    // Prefer the oldest job still waiting on a price.
    var waiting = state.jobs.filter(function (j) { return j.status === "with-gerry"; })
      .sort(function (a, b) { return a.submittedAt < b.submittedAt ? -1 : 1; });

    if (!waiting.length) {
      dialog("No job waiting",
        "<p>Every job has been priced. Reset the demo to put them back in the tray.</p>",
        [{ label: "Cancel" }, { label: "Reset demo", cls: "btn-accent", fn: doReset }]);
      return;
    }
    var job = waiting[0];
    var days = daysBetween(job.submittedAt, todayISO());

    dialog("Gerry's 2-Minute Challenge",
      "<p>You are Gerry. <strong>" + esc(job.customer) + "</strong> (sheet " + esc(job.ref) +
      ") has been in your tray <strong>" + days + " days</strong>.</p>" +
      "<p>Open it, check the figures, change anything you want, and approve a price. The clock stops when you approve.</p>" +
      "<p class=\"hint\">Nothing is sent to the customer. You can run this as often as you like.</p>",
      [
        { label: "Cancel" },
        { label: "Start the clock", cls: "btn-accent", fn: function () { runChallenge(job); } }
      ]);
  }

  function runChallenge(job) {
    challenge.active = true;
    challenge.jobId = job.id;
    challenge.start = Date.now();
    challenge.taps = 0;

    var bar = $("#challengeBar");
    bar.hidden = false;
    bar.classList.remove("danger");
    setHint("Check the figures, then press Approve this price.");
    tick();
    challenge.timer = setInterval(tick, 250);
    location.hash = "#/job/" + job.id;
  }

  function tick() {
    var left = LIMIT - Math.floor((Date.now() - challenge.start) / 1000);
    var bar = $("#challengeBar");
    if (left <= 0) {
      $("#cbClock").textContent = "0:00";
      bar.classList.add("danger");
      finishChallenge(false);
      return;
    }
    if (left <= 20) bar.classList.add("danger");
    var m = Math.floor(left / 60), s = left % 60;
    $("#cbClock").textContent = m + ":" + (s < 10 ? "0" : "") + s;
  }

  function stopClock() {
    clearInterval(challenge.timer);
    challenge.timer = null;
    challenge.active = false;
    $("#challengeBar").hidden = true;
    $("#challengeBar").classList.remove("danger");
  }

  function finishChallenge(approved) {
    var secs = elapsedSeconds();
    var taps = challenge.taps;
    stopClock();
    render();

    if (!approved) {
      dialog("Time is up",
        '<p class="big fail">2:00</p><p>The job was not approved inside two minutes. Nothing was changed or sent.</p>',
        [{ label: "Close" }, { label: "Try again", cls: "btn-accent", fn: startChallenge }]);
      return;
    }
    var pass = secs <= LIMIT;
    var m = Math.floor(secs / 60), s = secs % 60;
    dialog(pass ? "Priced and approved" : "Approved, but over time",
      '<p class="big ' + (pass ? "pass" : "fail") + '">' + m + ":" + (s < 10 ? "0" : "") + s + "</p>" +
      "<p>" + (pass ? "Inside the two minutes." : "Over the two minutes.") +
      " Taken in <strong>" + taps + "</strong> tap" + (taps === 1 ? "" : "s") + ".</p>" +
      '<p class="hint">For comparison, the app the lads abandoned in January took eleven taps just to close a job.</p>',
      [{ label: "Close" }, { label: "Run it again", cls: "btn-accent", fn: startChallenge }]);
  }

  document.addEventListener("click", function (e) {
    if (!challenge.active) return;
    if (e.target.closest("button, a, input, select, textarea")) challenge.taps++;
  }, true);

  /* =====================================================================
     RESET
     ===================================================================== */
  function doReset() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    state = { jobs: seed(), metrics: { priceEvents: [] } };
    save();
    if (challenge.active) stopClock();
    location.hash = "#/tray";
    render();
    toast("Demo reset. Nine jobs restored.");
  }

  /* =====================================================================
     BOOT
     ===================================================================== */
  $("#startChallenge").addEventListener("click", startChallenge);
  $("#cbQuit").addEventListener("click", function () {
    stopClock(); toast("Challenge stopped."); render();
  });
  $("#resetDemo").addEventListener("click", function () {
    dialog("Reset the demo?",
      "<p>This clears anything you have entered and puts the nine example jobs back.</p>",
      [{ label: "Cancel" }, { label: "Reset", cls: "btn-accent", fn: doReset }]);
  });

  window.addEventListener("hashchange", render);

  load();
  if (!location.hash) location.hash = "#/tray";
  render();

  // exposed for testing only
  window.__qf = { calc: calc, state: function () { return state; }, reset: doReset };
})();
