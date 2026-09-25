/* ==========================================================================
   Ascend Staffing — app.js
   Shared component loader + UI interactions (jQuery)
   ========================================================================== */

(function ($) {
  "use strict";

  /* ------------------------------------------------------------------
     1. Load shared components (header, navbar, footer)
     ------------------------------------------------------------------
     The shared markup lives in js/components.js as window.COMPONENTS.*.
     It is injected with jQuery's .html() so it works over BOTH http:// and
     file:// (no AJAX, so no CORS blocking when opening the files directly).
     ------------------------------------------------------------------ */
  var loadComponents = function () {
    if (window.COMPONENTS) {
      $("#header").html(window.COMPONENTS.header);
      $("#navbar").html(window.COMPONENTS.navbar);
      $("#footer").html(window.COMPONENTS.footer);
      bindNavbar();
      highlightActiveNav();
      setYear();
    }
  };

  /* ------------------------------------------------------------------
     2. Navbar: active link + scroll effect
     ------------------------------------------------------------------ */
  var highlightActiveNav = function () {
    var path = window.location.pathname.split("/").pop() || "index.html";
    $("#mainNav .nav-link").each(function () {
      var href = $(this).attr("href");
      if (href && href.indexOf(path) === 0) {
        $(this).addClass("active");
      }
    });
    if (!path || path === "") {
      $('#mainNav .nav-link[href="index.html"]').addClass("active");
    }
  };

  var bindNavbar = function () {
    var nav = $("#mainNav");
    var updateNav = function () {
      if ($(window).scrollTop() > 30) {
        nav.addClass("is-scrolled");
      } else {
        nav.removeClass("is-scrolled");
      }
    };
    updateNav();
    $(window).on("scroll.nav", updateNav);

    // Close mobile menu when a link is clicked
    nav.find(".nav-link").on("click", function () {
      var collapse = $("#navMenu");
      if (collapse.hasClass("show")) {
        var bs = window.bootstrap && bootstrap.Collapse.getOrCreateInstance(collapse[0]);
        if (bs) bs.hide();
      }
    });
  };

  /* ------------------------------------------------------------------
     3. Footer year
     ------------------------------------------------------------------ */
  var setYear = function () {
    $("#year").text(new Date().getFullYear());
  };

  /* ------------------------------------------------------------------
     4. Reveal on scroll
     ------------------------------------------------------------------ */
  var revealElements = function () {
    var items = $(".reveal");
    if (!items.length) return;

    var onScroll = function () {
      var vh = $(window).height();
      items.each(function () {
        var el = $(this);
        if (!el.hasClass("is-visible")) {
          if (el.offset().top < $(window).scrollTop() + vh - 70) {
            el.addClass("is-visible");
          }
        }
      });
    };
    onScroll();
    $(window).on("scroll.reveal", onScroll);
  };

  /* ------------------------------------------------------------------
     5. Animated counters (only when visible)
     ------------------------------------------------------------------ */
  var initCounters = function () {
    var counters = $("[data-count]");
    if (!counters.length) return;

    var started = {};
    var runCounter = function (el) {
      var $el = $(el);
      var id = $el.attr("data-count");
      if (started[id]) return;
      started[id] = true;

      var target = parseFloat($el.data("count"));
      var decimals = ($el.data("decimals") !== undefined) ? parseInt($el.data("decimals"), 10) : 0;
      var duration = parseInt($el.data("duration"), 10) || 1800;
      var start = null;

      var step = function (ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        var value = target * eased;
        $el.text(decimals ? value.toFixed(decimals) : Math.floor(value).toLocaleString());
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          $el.text(decimals ? target.toFixed(decimals) : target.toLocaleString());
        }
      };
      requestAnimationFrame(step);
    };

    var check = function () {
      var vh = $(window).height();
      counters.each(function () {
        if (!started[$(this).attr("data-count")]) {
          if ($(this).offset().top < $(window).scrollTop() + vh - 60) {
            runCounter(this);
          }
        }
      });
    };
    check();
    $(window).on("scroll.counters", check);
  };

  /* ------------------------------------------------------------------
     6. Back to top
     ------------------------------------------------------------------ */
  var initBackToTop = function () {
    var btn = $(
      '<button class="back-to-top" aria-label="Back to top">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>' +
      "</button>"
    );
    $("body").append(btn);

    $(window).on("scroll.totop", function () {
      if ($(window).scrollTop() > 480) {
        btn.addClass("show");
      } else {
        btn.removeClass("show");
      }
    });
    btn.on("click", function () {
      $("html, body").animate({ scrollTop: 0 }, 600);
    });
  };

  /* ------------------------------------------------------------------
     7. Job filtering (jobs page)
     ------------------------------------------------------------------ */
  var initJobFilter = function () {
    var grid = $("#jobGrid");
    if (!grid.length) return;

    var keyword = $("#filterSearch");
    var location = $("#filterLocation");
    var tech = $("#filterTech");
    var experience = $("#filterExperience");
    var type = $("#filterType");
    var results = $("#resultCount");

    var applyFilters = function () {
      var kw = (keyword.val() || "").toLowerCase().trim();
      var loc = location.val();
      var tch = tech.val();
      var exp = experience.val();
      var typ = type.val();

      var visible = 0;
      grid.find(".job-item").each(function () {
        var $job = $(this);
        var text = ($job.data("search") || "").toLowerCase();
        var match = true;

        if (kw && text.indexOf(kw) === -1) match = false;
        if (loc !== "all" && $job.data("location") !== loc) match = false;
        if (tch !== "all" && $job.data("tech") !== tch) match = false;
        if (exp !== "all" && $job.data("experience") !== exp) match = false;
        if (typ !== "all" && $job.data("type") !== typ) match = false;

        $job.toggle(match);
        if (match) visible++;
      });

      if (results.length) results.text(visible);
      $("#noResults").toggle(visible === 0);
    };

    keyword.on("keyup", applyFilters);
    location.on("change", applyFilters);
    tech.on("change", applyFilters);
    experience.on("change", applyFilters);
    type.on("change", applyFilters);
    $("#resetFilters").on("click", function () {
      keyword.val("");
      location.val("all");
      tech.val("all");
      experience.val("all");
      type.val("all");
      applyFilters();
    });

    applyFilters();
  };

  /* ------------------------------------------------------------------
     8. Form validation + dynamic success alert
     ------------------------------------------------------------------ */
  var initValidation = function () {
    $("form[data-validate]").each(function () {
      var form = $(this);

      var setError = function (field, show, message) {
        var group = field.closest(".form-group");
        var errorEl = group.find(".form-error");
        if (show) {
          field.addClass("is-invalid");
          errorEl.text(message || "This field is required.").show();
        } else {
          field.removeClass("is-invalid");
          errorEl.hide();
        }
      };

      var validateField = function (field) {
        var val = field.val();
        var required = field.data("required") !== undefined || field.is("[required]");
        var type = field.data("validate") || "";

        if (required && !val) {
          setError(field, true, "This field is required.");
          return false;
        }
        if (val && type === "email") {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            setError(field, true, "Please enter a valid email address.");
            return false;
          }
        }
        if (val && type === "phone") {
          if (!/^[+()\-.\s\d]{7,20}$/.test(val)) {
            setError(field, true, "Please enter a valid phone number.");
            return false;
          }
        }
        setError(field, false);
        return true;
      };

      form.find("input, select, textarea").on("blur", function () {
        validateField($(this));
      }).on("input change", function () {
        if ($(this).hasClass("is-invalid")) validateField($(this));
      });

      form.on("submit", function (e) {
        e.preventDefault();
        var valid = true;
        form.find("input, select, textarea").each(function () {
          if (!validateField($(this))) valid = false;
        });
        if (!valid) {
          form.find(".is-invalid").first().trigger("focus");
          return;
        }

        var btn = form.find('button[type="submit"]');
        var original = btn.html();
        btn.prop("disabled", true).html(
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending…'
        );
        setTimeout(function () {
          btn.prop("disabled", false).html(original);
          form[0].reset();
          showAlert(form, "Thank you! Your message has been sent. Our team will be in touch shortly.", "success");
        }, 900);
      });
    });
  };

  // Reusable dismissible alert
  var showAlert = function (context, message, type) {
    var color = type === "success" ? "alert-success" : "alert-danger";
    var alert = $(
      '<div class="alert ' + color + ' alert-dismissible fade show mt-3" role="alert">' +
      message +
      '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
      "</div>"
    );
    var host = context.closest(".form-wrap");
    host.find(".form-success").remove();
    if (host.length) {
      host.append(alert);
    } else {
      context.after(alert);
    }
    setTimeout(function () { alert.alert("close"); }, 6000);
  };

  /* ------------------------------------------------------------------
     9. Smooth scroll for in-page anchors
     ------------------------------------------------------------------ */
  var initSmoothScroll = function () {
    $(document).on("click", 'a[href^="#"]', function (e) {
      var hash = $(this).attr("href");
      if (hash.length > 1) {
        var target = $(hash);
        if (target.length) {
          e.preventDefault();
          var offset = target.offset().top - 82;
          $("html, body").animate({ scrollTop: offset }, 620);
        }
      }
    });
  };

  /* ------------------------------------------------------------------
     10. Init
     ------------------------------------------------------------------ */
  $(function () {
    loadComponents();
    revealElements();
    initCounters();
    initBackToTop();
    initJobFilter();
    initValidation();
    initSmoothScroll();
    setYear();
  });
})(jQuery);
