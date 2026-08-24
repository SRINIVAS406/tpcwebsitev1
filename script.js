/*
 * =========================================================
 *  COLLEGE WEBSITE - RENDERER
 * =========================================================
 *  Reads all content from window.COLLEGE_CONFIG (config.js).
 *  This file contains NO college-specific data - it can be
 *  reused for any college by only changing config.js.
 * =========================================================
 */

(function () {

    "use strict";


    // ---------------------------------------------------------
    // GET CONFIG
    // ---------------------------------------------------------

    var config = window.COLLEGE_CONFIG || window.TIMES_PU_CONFIG;

    if (!config) {
        console.error(
            "COLLEGE_CONFIG not found. Ensure config.js is loaded before script.js."
        );
        return;
    }

    function useConfig(next) {
        if (next && typeof next === "object") {
            config = next;
            window.COLLEGE_CONFIG   = next;
            window.TIMES_PU_CONFIG  = next;
        }
        return config;
    }


    // ---------------------------------------------------------
    // HELPERS
    // ---------------------------------------------------------

    function byId(id) {
        return document.getElementById(id);
    }

    function query(selector) {
        return document.querySelector(selector);
    }

    function queryAll(selector) {
        return Array.prototype.slice.call(
            document.querySelectorAll(selector)
        );
    }

    function isEmpty(value) {
        return (
            value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim() === "")
        );
    }

    function pickFirst() {
        for (var i = 0; i < arguments.length; i++) {
            if (!isEmpty(arguments[i])) {
                return arguments[i];
            }
        }
        return "";
    }

    function setText(id, value) {
        var el = byId(id);
        if (!el) return;
        el.textContent = isEmpty(value) ? "" : String(value);
    }

    function setHTML(id, html) {
        var el = byId(id);
        if (!el) return;
        el.innerHTML = html || "";
    }

    function setImage(id, source, alt) {
        var el = byId(id);
        if (!el) return;

        if (isEmpty(source)) {
            el.removeAttribute("src");
            el.style.display = "none";
            return;
        }

        el.src = source;
        el.style.display = "";
        if (alt !== undefined) el.alt = alt || "";
    }

    function show(el) {
        if (el && el.classList) el.classList.remove("d-none");
    }

    function hide(el) {
        if (el && el.classList) el.classList.add("d-none");
    }

    function showById(id) { show(byId(id)); }
    function hideById(id) { hide(byId(id)); }

    function escapeHTML(value) {
        if (isEmpty(value)) return "";
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function safeSrc(url) {
        return isEmpty(url) ? "" : url;
    }

    function telHref(number) {
        return "tel:" + String(number).replace(/[^0-9+]/g, "");
    }

    function toEmbedMapUrl(url) {
        if (isEmpty(url)) return "";
        if (url.indexOf("/maps/embed") !== -1) return url;

        try {
            var parsed = new URL(url);
            var q = parsed.searchParams.get("query")
                 || parsed.searchParams.get("q");

            if (q) {
                return "https://www.google.com/maps?q=" +
                    encodeURIComponent(q) + "&output=embed";
            }
        } catch (err) {
            // fall through
        }

        return url;
    }


    // ---------------------------------------------------------
    // SEO + <head>
    // ---------------------------------------------------------

    function loadSEO() {

        var seo     = config.seo     || {};
        var college = config.college || {};
        var website = config.website || {};

        document.title = pickFirst(seo.title, college.name, "College");

        setMeta("description", seo.description);
        setMeta("keywords",    seo.keywords);
        setMeta("author",      seo.author);

        // Favicon
        var favicon = byId("favicon") || query('link[rel="icon"]');
        var faviconHref = pickFirst(website.favicon, website.logo);

        if (favicon && !isEmpty(faviconHref)) {
            favicon.href = faviconHref;
        }
    }

    function setMeta(name, value) {
        if (isEmpty(value)) return;
        var meta = query('meta[name="' + name + '"]');
        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", name);
            document.head.appendChild(meta);
        }
        meta.setAttribute("content", value);
    }


    // ---------------------------------------------------------
    // LOGO (all elements with data-college-logo)
    // ---------------------------------------------------------

    function loadLogo() {

        var logo = pickFirst(
            (config.website || {}).logo,
            (config.images  || {}).logo
        );

        var altText =
            ((config.college || {}).name || "College") + " logo";

        queryAll("[data-college-logo]").forEach(function (img) {
            if (!isEmpty(logo)) {
                img.src = logo;
                img.alt = altText;
            } else {
                img.removeAttribute("src");
            }
        });
    }


    // ---------------------------------------------------------
    // NAVBAR + LOADER text
    // ---------------------------------------------------------

    function loadNavbar() {

        var college = config.college || {};
        var navbar  = config.navbar  || {};

        setText(
            "navCollegeName",
            pickFirst(navbar.brandName, college.shortName, college.name)
        );
    }

    function loadLoader() {

        var loader = (config.website || {}).loader || {};

        setText("loaderTitle",    loader.title);
        setText("loaderSubtitle", loader.subtitle);
    }


    // ---------------------------------------------------------
    // HERO
    // ---------------------------------------------------------

    function loadHero() {

        var hero    = config.hero    || {};
        var college = config.college || {};

        setText("heroTitle",       pickFirst(hero.title, college.name));
        setText("heroSubtitle",    hero.subtitle);
        setText("heroDescription", hero.description);

        setImage(
            "heroImage",
            pickFirst(hero.image, (config.images || {}).hero),
            (college.name || "") + " campus"
        );

        setButton(
            "heroPrimaryBtn",
            hero.primaryButton,
            { text: "Explore", target: "#about" }
        );

        setButton(
            "heroSecondaryBtn",
            hero.secondaryButton,
            { text: "Admissions", target: "#admissions" }
        );

        var locationText = pickFirst(
            hero.locationText,
            [college.city, college.district].filter(Boolean).join(", ")
        );

        if (!isEmpty(locationText)) {
            setText("heroLocation", locationText);
            showById("heroLocationWrap");
        } else {
            hideById("heroLocationWrap");
        }

        if (!isEmpty(college.establishedYear)) {
            setText("heroEstYear", college.establishedYear);
            showById("heroEstYearWrap");
        } else {
            hideById("heroEstYearWrap");
        }
    }

    function setButton(id, cfg, fallback) {
        var btn = byId(id);
        if (!btn) return;

        cfg      = cfg      || {};
        fallback = fallback || {};

        var text   = pickFirst(cfg.text,   fallback.text);
        var target = pickFirst(cfg.target, fallback.target, "#");

        if (isEmpty(text)) {
            hide(btn);
            return;
        }

        show(btn);
        btn.textContent = text;
        btn.href = target;
    }


    // ---------------------------------------------------------
    // STATISTICS
    // ---------------------------------------------------------

    function loadStatistics() {

        var container = byId("statsGrid");
        if (!container) return;

        container.innerHTML = "";

        var stats = normalizeStatistics(config.statistics);

        var visible = stats.filter(function (s) {
            return !isEmpty(s.value) && !isNaN(Number(s.value));
        });

        if (visible.length === 0) {
            hideById("statsSection");
            return;
        }

        showById("statsSection");

        var colClass =
            visible.length === 1 ? "col-12" :
            visible.length === 2 ? "col-6" :
            visible.length === 3 ? "col-6 col-lg-4" :
            "col-6 col-lg-3";

        visible.forEach(function (stat) {

            var card = document.createElement("div");
            card.className = colClass;

            card.innerHTML =
                '<div class="stat-card">' +
                    '<div class="stat-number"' +
                        ' data-counter="' + escapeHTML(stat.value) + '"' +
                        ' data-suffix="' + escapeHTML(stat.suffix || "") + '">0</div>' +
                    '<div class="stat-label">' + escapeHTML(stat.label || "") + '</div>' +
                '</div>';

            container.appendChild(card);
        });

        startCounters();
    }

    // Accepts either the new array form or the legacy object form.
    function normalizeStatistics(stats) {

        if (Array.isArray(stats)) return stats;

        if (stats && typeof stats === "object") {
            return [
                { key: "students",   value: stats.students,           label: "Students",           suffix: "+" },
                { key: "faculty",    value: stats.faculty,            label: "Faculty",            suffix: "+" },
                { key: "years",      value: stats.yearsOfExcellence,  label: "Years of Excellence", suffix: "+" },
                { key: "result",     value: stats.resultPercentage,   label: "Results",            suffix: "%" },
                { key: "classrooms", value: stats.classrooms,         label: "Classrooms",         suffix: "" }
            ];
        }

        return [];
    }

    function startCounters() {

        queryAll("[data-counter]").forEach(function (el) {

            var target = Number(el.dataset.counter);
            var suffix = el.dataset.suffix || "";

            if (isNaN(target)) {
                el.textContent = el.dataset.counter + suffix;
                return;
            }

            var duration = 1400;
            var steps    = 40;
            var stepMs   = duration / steps;
            var inc      = target / steps;
            var current  = 0;

            var timer = setInterval(function () {
                current += inc;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                el.textContent = Math.floor(current) + suffix;
            }, stepMs);
        });
    }


    // ---------------------------------------------------------
    // ABOUT
    // ---------------------------------------------------------

    function loadAbout() {

        var about = config.about || {};

        setText("aboutTitle",       about.title);
        setText("aboutDescription", about.description);

        setImage(
            "aboutImage",
            pickFirst(about.image, (config.images || {}).classroom),
            "About " + ((config.college || {}).name || "the college")
        );

        var list = byId("aboutHighlights");
        if (!list) return;

        list.innerHTML = "";

        if (!Array.isArray(about.highlights)) return;

        about.highlights.forEach(function (item) {
            if (isEmpty(item)) return;
            var li = document.createElement("li");
            li.innerHTML =
                '<i class="bi bi-check-circle-fill"></i>' +
                '<span>' + escapeHTML(item) + '</span>';
            list.appendChild(li);
        });
    }


    // ---------------------------------------------------------
    // VISION & MISSION
    // ---------------------------------------------------------

    function loadVisionMission() {

        var vm = config.visionMission || {};

        setText("visionText",  vm.vision);
        setText("missionText", vm.mission);

        var container = byId("valuesGrid");
        if (!container) return;

        container.innerHTML = "";

        if (!Array.isArray(vm.values)) return;

        vm.values.forEach(function (value) {
            if (isEmpty(value)) return;
            var pill = document.createElement("span");
            pill.className   = "value-pill";
            pill.textContent = value;
            container.appendChild(pill);
        });
    }


    // ---------------------------------------------------------
    // PRINCIPAL
    // ---------------------------------------------------------

    function loadPrincipal() {

        var p = config.principal || {};

        var hasName    = !isEmpty(p.name);
        var hasMessage = !isEmpty(p.message);

        setText("principalName",        p.name);
        setText("principalDesignation", hasName ? p.designation : "");
        setText("principalMessage",     p.message);

        setImage(
            "principalImage",
            pickFirst(p.photo, (config.images || {}).principal),
            hasName ? p.name : "Principal"
        );

        var placeholder = byId("principalPlaceholder");
        if (!placeholder) return;

        if (!hasName && !hasMessage) {
            show(placeholder);
        } else {
            hide(placeholder);
        }
    }


    // ---------------------------------------------------------
    // COURSES
    // ---------------------------------------------------------

    function loadCourses() {

        var container = byId("coursesGrid");
        if (!container) return;

        container.innerHTML = "";

        if (!Array.isArray(config.courses) || config.courses.length === 0) {
            container.innerHTML = emptyState(
                "bi-mortarboard",
                "Courses",
                "Course details will be added here."
            );
            return;
        }

        config.courses.forEach(function (course, index) {

            var col = document.createElement("div");
            col.className = "col-md-6 col-xl-4";

            col.innerHTML =
                '<div class="course-card">' +

                    '<div class="course-number">' +
                        String(index + 1).padStart(2, "0") +
                    '</div>' +

                    '<div class="course-icon">' +
                        '<i class="bi bi-mortarboard-fill"></i>' +
                    '</div>' +

                    '<h3>' + escapeHTML(course.name) + '</h3>' +

                    (!isEmpty(course.fullName)
                        ? '<p class="course-full-name">' + escapeHTML(course.fullName) + '</p>'
                        : ""
                    ) +

                    (!isEmpty(course.description)
                        ? '<p class="text-secondary">' + escapeHTML(course.description) + '</p>'
                        : ""
                    ) +

                    '<div class="course-meta">' +
                        (!isEmpty(course.duration)
                            ? '<span><i class="bi bi-clock"></i>' + escapeHTML(course.duration) + '</span>'
                            : ""
                        ) +
                        (!isEmpty(course.eligibility)
                            ? '<span><i class="bi bi-check2-circle"></i>' + escapeHTML(course.eligibility) + '</span>'
                            : ""
                        ) +
                    '</div>' +

                '</div>';

            container.appendChild(col);
        });
    }


    // ---------------------------------------------------------
    // FACILITIES
    // ---------------------------------------------------------

    function loadFacilities() {

        var container = byId("facilitiesGrid");
        if (!container) return;

        container.innerHTML = "";

        if (!Array.isArray(config.facilities) || config.facilities.length === 0) {
            container.innerHTML = emptyState(
                "bi-building",
                "Facilities",
                "Facilities will be updated here."
            );
            return;
        }

        config.facilities.forEach(function (facility) {

            var col = document.createElement("div");
            col.className = "col-sm-6 col-lg-4";

            col.innerHTML =
                '<div class="facility-card">' +
                    '<div class="facility-icon">' +
                        '<i class="bi ' +
                            escapeHTML(facility.icon || "bi-building") +
                        '"></i>' +
                    '</div>' +
                    '<h3>' + escapeHTML(facility.name || "") + '</h3>' +
                    '<p>' + escapeHTML(facility.description || "") + '</p>' +
                '</div>';

            container.appendChild(col);
        });
    }


    // ---------------------------------------------------------
    // FACULTY
    // ---------------------------------------------------------

    function loadFaculty() {

        var container = byId("facultyGrid");
        if (!container) return;

        container.innerHTML = "";

        if (!Array.isArray(config.faculty) || config.faculty.length === 0) {
            container.innerHTML = emptyState(
                "bi-people",
                "Faculty",
                "Faculty profiles will be updated here."
            );
            return;
        }

        config.faculty.forEach(function (person) {

            var col = document.createElement("div");
            col.className = "col-sm-6 col-lg-4";

            var photo = safeSrc(
                pickFirst(person.photo, (config.images || {}).principal)
            );

            col.innerHTML =
                '<div class="faculty-card">' +
                    (photo
                        ? '<img src="' + escapeHTML(photo) +
                          '" alt="' + escapeHTML(person.name || "Faculty member") +
                          '" loading="lazy">'
                        : ""
                    ) +
                    '<div class="faculty-content">' +
                        '<h3>' + escapeHTML(person.name || "") + '</h3>' +
                        (!isEmpty(person.designation)
                            ? '<div class="faculty-role">' + escapeHTML(person.designation) + '</div>'
                            : ""
                        ) +
                        (!isEmpty(person.subject)
                            ? '<div class="faculty-subject">' + escapeHTML(person.subject) + '</div>'
                            : ""
                        ) +
                    '</div>' +
                '</div>';

            container.appendChild(col);
        });
    }


    // ---------------------------------------------------------
    // ACHIEVEMENTS
    // ---------------------------------------------------------

    function loadAchievements() {

        var container = byId("achievementsGrid");
        var section   = byId("achievementsSection");

        if (!container) return;

        if (!Array.isArray(config.achievements) || config.achievements.length === 0) {
            if (section) hide(section);
            return;
        }

        if (section) show(section);

        container.innerHTML = "";

        config.achievements.forEach(function (item) {

            var col = document.createElement("div");
            col.className = "col-md-6";

            col.innerHTML =
                '<div class="achievement-card">' +
                    (!isEmpty(item.image)
                        ? '<img src="' + escapeHTML(item.image) +
                          '" alt="' + escapeHTML(item.title || "Achievement") +
                          '" loading="lazy">'
                        : ""
                    ) +
                    '<div class="achievement-content">' +
                        (!isEmpty(item.year)
                            ? '<span class="achievement-year">' +
                                escapeHTML(item.year) + '</span>'
                            : ""
                        ) +
                        '<h3>' + escapeHTML(item.title || "") + '</h3>' +
                        (!isEmpty(item.description)
                            ? '<p class="text-secondary">' + escapeHTML(item.description) + '</p>'
                            : ""
                        ) +
                    '</div>' +
                '</div>';

            container.appendChild(col);
        });
    }


    // ---------------------------------------------------------
    // GALLERY
    // ---------------------------------------------------------

    function loadGallery() {

        var container = byId("galleryGrid");
        var filters   = byId("galleryFilters");

        if (!container) return;

        container.innerHTML = "";
        if (filters) filters.innerHTML = "";

        if (!Array.isArray(config.gallery) || config.gallery.length === 0) {
            container.innerHTML = emptyState(
                "bi-images",
                "Gallery",
                "College photographs will appear here."
            );
            return;
        }

        // Filter buttons
        if (filters) {

            var categories = ["All"];
            config.gallery.forEach(function (item) {
                if (!isEmpty(item.category) &&
                    categories.indexOf(item.category) === -1) {
                    categories.push(item.category);
                }
            });

            categories.forEach(function (cat, index) {
                var btn = document.createElement("button");
                btn.type      = "button";
                btn.className = "gallery-filter" + (index === 0 ? " active" : "");
                btn.dataset.filter  = cat;
                btn.textContent     = cat;
                filters.appendChild(btn);
            });

            filters.addEventListener("click", function (evt) {
                var target = evt.target.closest(".gallery-filter");
                if (!target) return;

                queryAll(".gallery-filter").forEach(function (b) {
                    b.classList.remove("active");
                });
                target.classList.add("active");

                applyGalleryFilter(target.dataset.filter);
            });
        }

        // Gallery cards
        config.gallery.forEach(function (item, index) {

            var col = document.createElement("div");
            col.className = "col-6 col-md-4 col-lg-3 gallery-item";
            col.dataset.category = item.category || "Other";

            var src = safeSrc(
                pickFirst(item.image, (config.images || {}).fallback)
            );

            col.innerHTML =
                '<button type="button" class="gallery-card" data-gallery-index="' + index + '"' +
                    ' aria-label="Open ' + escapeHTML(item.title || "gallery image") + '">' +

                    '<img src="' + escapeHTML(src) + '"' +
                        ' alt="' + escapeHTML(item.alt || item.title || "Gallery image") + '"' +
                        ' loading="lazy">' +

                    '<div class="gallery-overlay">' +
                        '<div>' +
                            (!isEmpty(item.category)
                                ? '<span>' + escapeHTML(item.category) + '</span>'
                                : ""
                            ) +
                            '<strong>' + escapeHTML(item.title || "") + '</strong>' +
                        '</div>' +
                        '<i class="bi bi-zoom-in"></i>' +
                    '</div>' +

                '</button>';

            container.appendChild(col);
        });

        container.addEventListener("click", function (evt) {
            var target = evt.target.closest(".gallery-card");
            if (!target) return;
            openGalleryModal(Number(target.dataset.galleryIndex));
        });
    }

    function applyGalleryFilter(category) {
        queryAll(".gallery-item").forEach(function (item) {
            var visible = category === "All" ||
                          item.dataset.category === category;
            item.style.display = visible ? "" : "none";
        });
    }

    function openGalleryModal(index) {

        var item = config.gallery[index];
        if (!item) return;

        var img = byId("galleryModalImage");
        if (img) {
            img.src = safeSrc(item.image);
            img.alt = item.alt || item.title || "Gallery image";
        }

        setText("galleryModalTitle",       item.title || "");
        setText("galleryModalDescription", item.description || "");

        var modalEl = byId("galleryModal");
        if (modalEl && window.bootstrap) {
            var modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    }


    // ---------------------------------------------------------
    // REVIEWS
    // ---------------------------------------------------------

    function loadReviews() {

        var container = byId("reviewsGrid");
        if (!container) return;

        container.innerHTML = "";

        if (!Array.isArray(config.reviews) || config.reviews.length === 0) {
            container.innerHTML = emptyState(
                "bi-chat-quote",
                "Student Reviews",
                "Student testimonials will be displayed here."
            );
            return;
        }

        config.reviews.slice(0, 6).forEach(function (review) {

            var col = document.createElement("div");
            col.className = "col-md-6 col-xl-4";

            var rating = Math.max(0, Math.min(5,
                Number(review.rating) || 0));

            var stars = "\u2605".repeat(rating) +
                        "\u2606".repeat(5 - rating);

            var reviewText = review.review || review.text || "";

            var avatar;
            if (!isEmpty(review.photo)) {
                avatar =
                    '<img src="' + escapeHTML(review.photo) +
                    '" alt="' + escapeHTML(review.name || "Student") +
                    '" loading="lazy">';
            } else {
                var initial = review.name
                    ? String(review.name).charAt(0).toUpperCase()
                    : "S";
                avatar =
                    '<div class="review-avatar">' + escapeHTML(initial) + '</div>';
            }

            col.innerHTML =
                '<div class="review-card">' +
                    '<div class="review-stars">' + stars + '</div>' +
                    '<blockquote>&ldquo;' +
                        escapeHTML(reviewText) +
                    '&rdquo;</blockquote>' +
                    '<div class="review-user">' +
                        avatar +
                        '<div>' +
                            '<strong>' + escapeHTML(review.name || "") + '</strong>' +
                            '<small>' +
                                escapeHTML(review.course || "") +
                                (!isEmpty(review.year)
                                    ? ' &bull; ' + escapeHTML(review.year)
                                    : ""
                                ) +
                            '</small>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            container.appendChild(col);
        });
    }


    // ---------------------------------------------------------
    // ADMISSIONS
    // ---------------------------------------------------------

    function loadAdmissions() {

        var a = config.admission || {};

        setText("admissionTitle",       pickFirst(a.title, "Admissions"));
        setText("admissionDescription", a.description);
        setText("admissionEligibility", a.eligibility);

        // Process
        var processEl = byId("admissionProcess");
        if (processEl) {
            processEl.innerHTML = "";

            if (Array.isArray(a.process)) {
                a.process.forEach(function (step, index) {
                    if (isEmpty(step)) return;
                    var li = document.createElement("li");
                    li.innerHTML =
                        '<span class="step-number">' + (index + 1) + '</span>' +
                        '<span>' + escapeHTML(step) + '</span>';
                    processEl.appendChild(li);
                });
            }
        }

        // Documents
        var docsEl   = byId("admissionDocuments");
        var docTitle = byId("admissionDocumentsTitle");
        var hasDocs  = Array.isArray(a.documents) && a.documents.length > 0;

        if (docsEl) {
            docsEl.innerHTML = "";

            if (hasDocs) {
                a.documents.forEach(function (doc) {
                    if (isEmpty(doc)) return;
                    var li = document.createElement("li");
                    li.innerHTML =
                        '<i class="bi bi-file-earmark-check-fill"></i>' +
                        '<span>' + escapeHTML(doc) + '</span>';
                    docsEl.appendChild(li);
                });
            }
        }

        if (docTitle) {
            if (hasDocs) show(docTitle); else hide(docTitle);
        }
    }


    // ---------------------------------------------------------
    // CONTACT
    // ---------------------------------------------------------

    function loadContact() {

        var c       = config.contact || {};
        var college = config.college || {};

        // Address (contact.address falls back to college.address)
        var address = pickFirst(c.address, college.address);
        if (!isEmpty(address)) {
            setText("contactAddress", address);
            showById("contactAddressWrap");
        } else {
            hideById("contactAddressWrap");
        }

        // Phones
        setContactLink("contactPhone1", "contactPhone1Wrap", c.phone1, telHref);
        setContactLink("contactPhone2", "contactPhone2Wrap", c.phone2, telHref);

        // Email
        setContactLink(
            "contactEmail",
            "contactEmailWrap",
            c.email,
            function (v) { return "mailto:" + v; }
        );

        // Office hours
        if (!isEmpty(c.officeHours)) {
            setText("officeHours", c.officeHours);
            showById("officeHoursWrap");
        } else {
            hideById("officeHoursWrap");
        }

        // Map
        var map = byId("mapFrame");
        if (map) {
            var embed = toEmbedMapUrl(c.mapUrl);
            if (!isEmpty(embed)) {
                map.src = embed;
                map.style.display = "";
            } else {
                map.style.display = "none";
            }
        }
    }

    function setContactLink(anchorId, wrapId, value, hrefBuilder) {
        var anchor = byId(anchorId);
        var wrap   = byId(wrapId);

        if (isEmpty(value)) {
            hide(wrap);
            return;
        }

        show(wrap);

        if (anchor) {
            anchor.textContent = value;
            anchor.href        = hrefBuilder(value);
        }
    }


    // ---------------------------------------------------------
    // SOCIAL MEDIA
    // ---------------------------------------------------------

    // Icon + link-builder defaults for each supported platform.
    // Everything is data-driven: add a new key here (or add an entry
    // in config.socialMedia with an explicit url/icon) and it just works.
    var SOCIAL_PLATFORMS = {
        facebook:  { icon: "bi-facebook",   label: "Facebook",  external: true },
        instagram: { icon: "bi-instagram",  label: "Instagram", external: true },
        youtube:   { icon: "bi-youtube",    label: "YouTube",   external: true },
        linkedin:  { icon: "bi-linkedin",   label: "LinkedIn",  external: true },
        twitter:   { icon: "bi-twitter-x",  label: "Twitter",   external: true },
        x:         { icon: "bi-twitter-x",  label: "X",         external: true },
        whatsapp:  { icon: "bi-whatsapp",   label: "WhatsApp",  external: true,
                     build: buildWhatsAppHref },
        email:     { icon: "bi-envelope",   label: "Email",     external: false,
                     build: buildEmailHref },
        phone:     { icon: "bi-telephone",  label: "Phone",     external: false,
                     build: buildPhoneHref }
    };

    function buildWhatsAppHref(item) {
        var raw = pickFirst(item.number, item.phone, item.url);
        if (isEmpty(raw)) return "";
        var digits = String(raw).replace(/[^0-9]/g, "");
        if (isEmpty(digits)) return "";
        var href = "https://wa.me/" + digits;
        if (!isEmpty(item.message)) {
            href += "?text=" + encodeURIComponent(item.message);
        }
        return href;
    }

    function buildEmailHref(item) {
        var address = pickFirst(item.email, item.address, item.url);
        if (isEmpty(address)) {
            var contact = config.contact || {};
            address = contact.email;
        }
        if (isEmpty(address)) return "";
        var href = "mailto:" + String(address).trim();
        var params = [];
        if (!isEmpty(item.subject)) {
            params.push("subject=" + encodeURIComponent(item.subject));
        }
        if (!isEmpty(item.body)) {
            params.push("body=" + encodeURIComponent(item.body));
        }
        if (params.length) href += "?" + params.join("&");
        return href;
    }

    function buildPhoneHref(item) {
        var raw = pickFirst(item.number, item.phone, item.url);
        if (isEmpty(raw)) {
            var contact = config.contact || {};
            raw = pickFirst(contact.phone1, contact.phone2);
        }
        if (isEmpty(raw)) return "";
        return telHref(raw);
    }

    function loadSocialMedia() {

        var container = byId("socialLinks");
        if (!container) return;

        container.innerHTML = "";

        var items = normalizeSocial(config.socialMedia)
            .map(resolveSocialItem)
            .filter(function (item) {
                return item && item.enabled !== false && !isEmpty(item.href);
            });

        if (items.length === 0) {
            hide(container);
            return;
        }
        show(container);

        items.forEach(function (item) {
            var a = document.createElement("a");
            a.className = "social-link";
            a.href      = item.href;
            a.dataset.platform = item.platform;
            if (item.external) {
                a.target = "_blank";
                a.rel    = "noopener noreferrer";
            }
            a.setAttribute("aria-label", item.label);
            a.setAttribute("title",      item.label);
            a.innerHTML = '<i class="bi ' + escapeHTML(item.icon) + '"></i>';
            container.appendChild(a);
        });
    }

    function resolveSocialItem(raw) {
        if (!raw || typeof raw !== "object") return null;
        if (!isEnabledFlag(raw.enabled)) return { enabled: false };

        var key      = String(raw.platform || "").toLowerCase().trim();
        var defaults = SOCIAL_PLATFORMS[key] || {};

        var href;
        if (typeof defaults.build === "function") {
            href = defaults.build(raw);
        } else {
            href = raw.url;
        }

        return {
            enabled:  true,
            platform: key,
            icon:     pickFirst(raw.icon, defaults.icon, "bi-link-45deg"),
            label:    pickFirst(raw.label, defaults.label, key || "Link"),
            external: raw.external !== undefined
                        ? !!raw.external
                        : (defaults.external !== false),
            href:     href
        };
    }

    // Treats missing/true as enabled; false, "false", 0, "0", "no" as disabled.
    function isEnabledFlag(value) {
        if (value === undefined || value === null || value === "") return true;
        if (value === false || value === 0) return false;
        if (typeof value === "string") {
            var v = value.trim().toLowerCase();
            return !(v === "false" || v === "0" || v === "no" || v === "off");
        }
        return !!value;
    }

    function normalizeSocial(sm) {

        if (Array.isArray(sm)) return sm;

        if (sm && typeof sm === "object") {
            var result = [];
            Object.keys(sm).forEach(function (key) {
                var value = sm[key];
                if (value && typeof value === "object") {
                    result.push(Object.assign({ platform: key }, value));
                } else {
                    result.push({ platform: key, url: value });
                }
            });
            return result;
        }

        return [];
    }


    // ---------------------------------------------------------
    // FOOTER
    // ---------------------------------------------------------

    function loadFooter() {

        var website = config.website || {};
        var college = config.college || {};

        setText("footerText",
            pickFirst(website.footerText, college.name));

        setText("footerCollegeName",
            pickFirst(college.shortName, college.name));

        setText("currentYear", new Date().getFullYear());
    }


    // ---------------------------------------------------------
    // JSON-LD structured data
    // ---------------------------------------------------------

    function loadStructuredData() {

        var college = config.college || {};
        var seo     = config.seo     || {};
        var contact = config.contact || {};
        var website = config.website || {};

        var data = {
            "@context":    "https://schema.org",
            "@type":       "EducationalOrganization",
            "name":        college.name || "",
            "url":         seo.canonicalUrl || "",
            "logo":        website.logo || "",
            "description": seo.description || ""
        };

        if (college.address) {
            data.address = {
                "@type":           "PostalAddress",
                "streetAddress":   college.address,
                "addressLocality": college.city || "",
                "addressRegion":   college.state || "",
                "postalCode":      college.pincode || "",
                "addressCountry":  college.country || "IN"
            };
        }

        if (!isEmpty(contact.phone1)) data.telephone = contact.phone1;
        if (!isEmpty(contact.email))  data.email     = contact.email;

        var script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }


    // ---------------------------------------------------------
    // BEHAVIOUR: smooth scroll, nav highlight, navbar shadow
    // ---------------------------------------------------------

    function enableSmoothScroll() {

        queryAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener("click", function (evt) {

                var href = link.getAttribute("href");
                if (!href || href === "#") return;

                var target = document.querySelector(href);
                if (!target) return;

                evt.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block:    "start"
                });

                // Collapse mobile nav
                var nav = byId("mainNav");
                if (nav && nav.classList.contains("show") && window.bootstrap) {
                    var collapse = window.bootstrap.Collapse.getInstance(nav) ||
                                   new window.bootstrap.Collapse(nav, { toggle: false });
                    collapse.hide();
                }
            });
        });
    }

    function enableActiveNav() {

        var sections = queryAll("section[id], header[id]");
        var links    = queryAll(".navbar-nav a[href^='#']");

        if (sections.length === 0 || links.length === 0) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var id = entry.target.id;
                links.forEach(function (link) {
                    link.classList.toggle(
                        "active",
                        link.getAttribute("href") === "#" + id
                    );
                });
            });
        }, { threshold: 0.25 });

        sections.forEach(function (s) { observer.observe(s); });
    }

    function enableNavbarShadow() {

        var navbar = byId("mainNavbar") || query(".navbar");
        if (!navbar) return;

        function update() {
            navbar.classList.toggle(
                "navbar-scrolled",
                window.scrollY > 30
            );
        }

        window.addEventListener("scroll", update, { passive: true });
        update();
    }


    // ---------------------------------------------------------
    // IMAGE FALLBACK
    // ---------------------------------------------------------

    function enableImageFallback() {

        var fallback =
            (config.images || {}).fallback ||
            "assets/images/image-placeholder.svg";

        document.addEventListener("error", function (evt) {
            var el = evt.target;
            if (!el || el.tagName !== "IMG") return;
            if (el.dataset.fallbackApplied) return;

            el.dataset.fallbackApplied = "1";
            el.src = fallback;
        }, true);
    }


    // ---------------------------------------------------------
    // LOADER
    // ---------------------------------------------------------

    function hideLoader() {
        var loader = byId("pageLoader");
        if (!loader) return;

        loader.classList.add("hide");
        setTimeout(function () {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 700);
    }


    // ---------------------------------------------------------
    // EMPTY STATE helper
    // ---------------------------------------------------------

    function emptyState(icon, title, message) {
        return (
            '<div class="col-12">' +
                '<div class="empty-state">' +
                    '<i class="bi ' + escapeHTML(icon) + '"></i>' +
                    '<h3>' + escapeHTML(title) + '</h3>' +
                    '<p>' + escapeHTML(message) + '</p>' +
                '</div>' +
            '</div>'
        );
    }


    // ---------------------------------------------------------
    // INIT
    // ---------------------------------------------------------

    function renderAll(nextConfig) {
        useConfig(nextConfig);
        try {
            loadSEO();
            loadLogo();
            loadNavbar();
            loadLoader();

            loadHero();
            loadStatistics();
            loadAbout();
            loadVisionMission();
            loadPrincipal();
            loadCourses();
            loadFacilities();
            loadFaculty();
            loadAchievements();
            loadGallery();
            loadReviews();
            loadAdmissions();
            loadContact();
            loadSocialMedia();
            loadFooter();

            loadStructuredData();
        } catch (err) {
            console.error("Website render error:", err);
        }
    }

    function init() {
        renderAll();
        enableSmoothScroll();
        enableActiveNav();
        enableNavbarShadow();
        enableImageFallback();
    }

    // Expose a minimal public API for tools (visual editor, etc.).
    window.CollegeSite = {
        render:     renderAll,
        getConfig:  function () { return config; },
        setConfig:  function (next) { renderAll(next); }
    };


    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    window.addEventListener("load", function () {
        setTimeout(hideLoader, 400);
    });

})();
