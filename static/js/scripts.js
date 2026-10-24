
const content_dir = 'contents/'
const config_file = 'config.yml'

const allowedUrlProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
const configOnlyKeys = ['nav', 'sections', 'backgrounds', 'background-interval-ms', 'background-overlay'];

function stringifyValue(value) {
    return value == null ? '' : value.toString();
}

function decodeText(value) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = String(value);
    return textarea.value;
}

function setElementValue(element, value) {
    if (value && typeof value === 'object') {
        if ('text' in value) {
            element.textContent = decodeText(value.text);
        }
        if ('href' in value && element instanceof HTMLAnchorElement) {
            element.href = value.href;
        }
        return;
    }

    element.textContent = decodeText(value);
}

function renderNavigation(navItems) {
    const navbarItems = document.getElementById('navbar-items');
    if (!navbarItems || !Array.isArray(navItems)) {
        return;
    }

    navbarItems.replaceChildren();

    navItems.forEach((item) => {
        if (!item || !item.text || !item.href) {
            return;
        }

        const listItem = document.createElement('li');
        const link = document.createElement('a');

        listItem.className = 'nav-item';
        link.className = 'nav-link me-lg-3';
        link.href = item.href === '#page-top' ? '#home' : item.href;
        link.textContent = decodeText(item.text);

        listItem.appendChild(link);
        navbarItems.appendChild(listItem);
    });
}

function normalizeSections(sections) {
    if (!Array.isArray(sections)) {
        return [];
    }

    return sections
        .map((section) => {
            if (typeof section === 'string' && section.trim() !== '') {
                return {
                    id: section,
                    nav: section.toUpperCase(),
                    href: '#' + section,
                };
            }

            if (!section || typeof section !== 'object' || !section.id) {
                return null;
            }

            return {
                id: section.id,
                nav: section.nav || section.text || section.id.toUpperCase(),
                title: section.title || section.heading || section.nav || section.text || section.id.toUpperCase(),
                icon: section.icon || '',
                href: section.href || '#' + section.id,
            };
        })
        .filter(Boolean);
}

function getNavigationItems(yml) {
    const sections = normalizeSections(yml.sections);
    if (sections.length > 0) {
        return sections.map((section) => ({
            text: section.nav,
            href: section.href,
        }));
    }

    return Array.isArray(yml.nav) ? yml.nav : [];
}

function activateScrollSpy() {
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        bootstrap.ScrollSpy.getInstance(document.body)?.dispose();
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    }
}

function bindResponsiveNavbar() {
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );

    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
                bootstrap.Collapse.getInstance(document.getElementById('navbarResponsive'))?.hide();
            }
        });
    });
}

function renderSections(sections) {
    const sectionsContainer = document.getElementById('sections');
    if (!sectionsContainer) {
        return;
    }

    sectionsContainer.replaceChildren();

    sections.forEach((section, index) => {
        const sectionElement = document.createElement('section');
        const container = document.createElement('div');
        const header = document.createElement('header');
        const isProfile = section.id === 'home';
        const title = document.createElement(isProfile ? 'h1' : 'h2');
        const body = document.createElement('div');

        sectionElement.id = section.id;
        sectionElement.className = isProfile ? 'profile-section top-section' : 'content-section';
        sectionElement.setAttribute('aria-labelledby', section.id + '-heading');

        container.className = 'container px-5';

        title.id = section.id + '-heading';
        title.textContent = decodeText(section.title);
        body.className = 'main-body';
        body.id = section.id + '-md';

        header.appendChild(title);

        if (isProfile) {
            container.classList.add('profile-grid');
            title.className = 'profile-title';
            const names = title.textContent.split('|').map(name => name.trim());
            if (names.length === 2) {
                const secondaryName = document.createElement('span');
                secondaryName.className = 'name-secondary';
                secondaryName.textContent = names[1];
                title.replaceChildren(document.createTextNode(names[0] + ' '), secondaryName);
            }
            const profile = document.getElementById('profile-template').content.cloneNode(true);
            header.prepend(profile.querySelector('.profile-field'));
            const copy = document.createElement('div');
            copy.className = 'profile-copy';
            copy.append(header, body);
            container.append(copy, profile.querySelector('#avatar'));
            sectionElement.append(profile);
        } else {
            header.className = 'section-header';
            const labels = {
                publications: 'Publications', projects: 'Projects', awards: 'Honors & awards',
                skills: 'Skills & certificates', 'student-work': 'Activities',
            };
            const kicker = document.createElement('span');
            kicker.className = 'section-kicker';
            const number = document.createElement('span');
            number.className = 'section-number';
            number.textContent = String(index).padStart(2, '0');
            kicker.append(number, document.createTextNode(labels[section.id] || section.id));
            header.append(kicker);
            container.append(header, body);
        }
        sectionElement.appendChild(container);
        sectionsContainer.appendChild(sectionElement);
    });
}

// Enhance the presentation after parsing; the Markdown remains the source of truth.
function groupMarkdownSections(target, className) {
    const groups = [];
    let group;
    [...target.children].forEach(node => {
        if (node.matches('h4')) {
            group = document.createElement('div');
            group.className = className;
            const heading = document.createElement('h3');
            heading.append(...node.childNodes);
            node.replaceWith(group);
            group.append(heading);
            groups.push(group);
        } else if (group) {
            group.append(node);
        }
    });
    return groups;
}

function makeProfileLink(href, text, iconClass) {
    const link = document.createElement('a');
    link.href = href;
    const icon = document.createElement('i');
    icon.className = 'bi ' + iconClass;
    icon.setAttribute('aria-hidden', 'true');
    link.append(icon, document.createTextNode(text));
    return link;
}

function enhanceProfile(target) {
    const badge = target.querySelector('a img');
    let githubLink;
    if (badge) {
        githubLink = makeProfileLink(badge.closest('a').href, 'GitHub · ' + badge.alt, 'bi-github');
        badge.closest('p').remove();
    }
    const intro = target.querySelector('p');
    if (intro) {
        intro.classList.add('profile-intro');
        const phrases = intro.textContent.match(/^(.*大学)\s+(.*专业)\s+(.*)$/);
        if (phrases) {
            intro.replaceChildren();
            phrases.slice(1).forEach((text, index) => {
                const phrase = document.createElement('span');
                phrase.textContent = text;
                if (index > 0) intro.append(document.createTextNode(' '));
                intro.append(phrase);
            });
        }
    }

    const groups = groupMarkdownSections(target, 'profile-group');
    const contacts = groups.find(group => group.querySelector('h3').textContent === '联系方式');
    const education = groups.find(group => group.querySelector('h3').textContent === '教育经历');
    const research = groups.find(group => group.querySelector('h3').textContent === '研究方向');

    if (research) {
        research.classList.add('profile-research');
        const paragraph = research.querySelector('p');
        if (paragraph) {
            const topics = document.createElement('div');
            topics.className = 'research-list';
            paragraph.textContent.split('；').forEach((text, index) => {
                if (index > 0) {
                    const separator = document.createElement('span');
                    separator.className = 'visually-hidden';
                    separator.textContent = '；';
                    topics.append(separator);
                }
                const topic = document.createElement('span');
                topic.className = 'research-topic';
                topic.textContent = text.trim();
                topics.append(topic);
            });
            paragraph.replaceWith(topics);
        }
        target.append(research);
    }
    if (contacts) {
        contacts.classList.add('profile-contact');
        const paragraph = contacts.querySelector('p');
        const email = paragraph?.textContent.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]+/);
        const phone = paragraph?.textContent.match(/电话：\s*([\d+ -]+)/);
        if (email && phone) {
            const links = document.createElement('div');
            links.className = 'profile-links';
            if (githubLink) links.append(githubLink);
            links.append(
                makeProfileLink('mailto:' + email[0], '邮箱：' + email[0], 'bi-envelope'),
                makeProfileLink('tel:' + phone[1].trim(), '电话：' + phone[1].trim(), 'bi-telephone')
            );
            paragraph.replaceWith(links);
        } else if (githubLink) {
            contacts.append(githubLink);
        }
        target.append(contacts);
    } else if (githubLink) {
        target.append(githubLink);
    }
    if (education) {
        education.classList.add('profile-education');
        // A trailing Markdown hard-break marker has no visual meaning here.
        const lastNode = education.querySelector('p')?.lastChild;
        if (lastNode?.nodeType === Node.TEXT_NODE) {
            lastNode.textContent = lastNode.textContent.replace(/\\\s*$/, '');
        }
        target.append(education);
    }
}

function enhanceFigures(target) {
    target.querySelectorAll('p > img:only-child').forEach(image => {
        const paragraph = image.parentElement;
        const caption = paragraph.nextElementSibling;
        const figure = document.createElement('figure');
        figure.className = 'research-figure';
        const link = document.createElement('a');
        link.className = 'figure-link';
        link.href = image.src;
        link.target = '_blank';
        link.rel = 'noopener';
        link.setAttribute('aria-label', '查看原图：' + image.alt);
        image.loading = 'lazy';
        link.append(image);
        figure.append(link);
        paragraph.replaceWith(figure);
        if (caption && caption.matches('p') && caption.querySelector('em:only-child')) {
            const figcaption = document.createElement('figcaption');
            figcaption.append(...caption.childNodes);
            figure.append(figcaption);
            caption.remove();
        }
    });
}

function enhancePublications(target) {
    enhanceFigures(target);
    const status = target.querySelector('h4');
    const title = status?.nextElementSibling;
    const description = title?.nextElementSibling;
    const figure = target.querySelector('figure');
    // Leave other Markdown structures readable without imposing this paper layout.
    if (!status || !title?.matches('p') || !description?.matches('p') || !figure) return;

    const label = document.createElement('div');
    label.className = 'publication-status';
    label.textContent = status.textContent;
    status.replaceWith(label);
    title.className = 'publication-title';
    const overview = document.createElement('article');
    overview.className = 'publication-overview';
    const copy = document.createElement('div');
    copy.className = 'publication-description';
    // Capture the remaining nodes before moving the thumbnail and description.
    const remaining = [...target.children].filter(node => ![label, title, description, figure].includes(node));
    copy.append(title, description);
    overview.append(figure, copy);
    label.after(overview);

    const details = document.createElement('details');
    details.className = 'publication-details';
    const summary = document.createElement('summary');
    summary.textContent = '方法与实验详情';
    const detailBody = document.createElement('div');
    detailBody.className = 'publication-detail-body';
    const frameworkCaption = figure.querySelector('figcaption');
    if (frameworkCaption) {
        const caption = document.createElement('p');
        caption.append(...frameworkCaption.childNodes);
        detailBody.append(caption);
        frameworkCaption.remove();
    }
    remaining.forEach(node => {
        if (node.matches('h4') && !node.nextElementSibling) {
            node.classList.add('publication-empty');
            return;
        }
        detailBody.append(node);
    });
    details.append(summary, detailBody);
    overview.after(details);
}

function enhanceProjects(target) {
    const groups = groupMarkdownSections(target, 'project-entry');
    groups.forEach(group => {
        const title = group.querySelector('h3');
        const meta = title.nextElementSibling;
        const content = document.createElement('div');
        content.className = 'entry-content';
        if (meta?.matches('p')) {
            const aside = document.createElement('div');
            aside.className = 'entry-meta';
            aside.append(meta);
            group.prepend(aside);
        }
        content.append(title);
        [...group.children].filter(node => !node.matches('.entry-meta')).forEach(node => content.append(node));
        group.append(content);
    });
}

function enhanceSection(name, target) {
    if (name === 'home') enhanceProfile(target);
    else if (name === 'publications') enhancePublications(target);
    else if (name === 'projects') enhanceProjects(target);
    else if (['skills', 'student-work'].includes(name)) {
        groupMarkdownSections(target, 'content-group');
        target.classList.add('grouped-content');
    }
}

function normalizeBackgrounds(backgrounds) {
    if (Array.isArray(backgrounds)) {
        return backgrounds.filter((background) => typeof background === 'string' && background.trim() !== '');
    }

    if (typeof backgrounds === 'string' && backgrounds.trim() !== '') {
        return [backgrounds];
    }

    return [];
}

function chooseInitialBackgroundIndex(backgroundCount) {
    if (!Number.isFinite(backgroundCount) || backgroundCount <= 1) {
        return 0;
    }

    return Math.floor(Math.random() * backgroundCount);
}

window.chooseInitialBackgroundIndex = chooseInitialBackgroundIndex;

function initBackgroundSlideshow(yml) {
    const backgrounds = normalizeBackgrounds(yml.backgrounds);
    const layers = [...document.querySelectorAll('.top-section-bg')];
    const interval = Number(yml['background-interval-ms']) || 7000;
    const overlay = Number(yml['background-overlay']);

    if (Number.isFinite(overlay)) {
        document.documentElement.style.setProperty('--top-section-overlay', Math.min(0.85, Math.max(0, overlay)));
    }

    if (backgrounds.length === 0 || layers.length === 0) {
        return;
    }

    let activeLayer = 0;
    let activeBackground = chooseInitialBackgroundIndex(backgrounds.length);

    layers[activeLayer].style.backgroundImage = `url("${backgrounds[activeBackground]}")`;

    if (backgrounds.length === 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    window.setInterval(() => {
        const nextLayer = activeLayer === 0 ? 1 : 0;
        activeBackground = (activeBackground + 1) % backgrounds.length;

        layers[nextLayer].style.backgroundImage = `url("${backgrounds[activeBackground]}")`;
        layers[nextLayer].classList.add('top-section-bg-active');
        layers[activeLayer].classList.remove('top-section-bg-active');
        activeLayer = nextLayer;
    }, Math.max(2500, interval));
}

function sanitizeMarkdownHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html;

    template.content.querySelectorAll('script, style, iframe, object, embed, link, meta, base, form, input, button').forEach((node) => {
        node.remove();
    });

    template.content.querySelectorAll('*').forEach((node) => {
        [...node.attributes].forEach((attribute) => {
            const name = attribute.name.toLowerCase();
            const value = attribute.value.trim();

            if (name.startsWith('on')) {
                node.removeAttribute(attribute.name);
                return;
            }

            if (['href', 'src'].includes(name)) {
                try {
                    const url = new URL(value, window.location.href);
                    if (!allowedUrlProtocols.includes(url.protocol)) {
                        node.removeAttribute(attribute.name);
                    }
                } catch {
                    node.removeAttribute(attribute.name);
                }
            }
        });
    });

    return template.innerHTML;
}

function typesetMath() {
    if (!window.MathJax || !MathJax.startup || !MathJax.typesetPromise) {
        return Promise.resolve();
    }

    return MathJax.startup.promise.then(() => MathJax.typesetPromise());
}

function loadConfig() {
    return fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => jsyaml.load(text) || {})
        .catch(error => {
            console.log(error);
            return {};
        });
}

function applyConfig(yml) {
    Object.keys(yml).forEach(key => {
        if (configOnlyKeys.includes(key)) {
            return;
        }

        const element = document.getElementById(key);
        const value = yml[key];

        if (!element) {
            console.log("Unknown id and value: " + key + "," + stringifyValue(value))
            return;
        }

        try {
            setElementValue(element, value);
        } catch {
            console.log("Invalid id and value: " + key + "," + stringifyValue(value))
        }
    });
}

function getConfiguredSections(yml) {
    const sections = normalizeSections(yml.sections);
    if (sections.length > 0) {
        return sections.map((section) => section.id);
    }

    return [...document.querySelectorAll('[id$="-md"]')].map((element) => {
        return element.id.replace(/-md$/, '');
    });
}

function loadMarkdownSection(name) {
    return fetch(content_dir + name + '.md')
        .then(response => {
            if (!response.ok) throw new Error('Content could not be loaded: ' + name);
            return response.text();
        })
        .then(markdown => {
            const target = document.getElementById(name + '-md');
            if (!target) {
                console.log("Unknown markdown section: " + name);
                return;
            }

            const html = sanitizeMarkdownHtml(marked.parse(markdown));
            target.innerHTML = html;
            enhanceSection(name, target);
        })
        .catch(error => {
            console.error(error);
            const target = document.getElementById(name + '-md');
            if (target) {
                const message = document.createElement('p');
                message.className = 'load-error';
                message.textContent = '内容暂时无法加载，请刷新页面重试。';
                target.replaceChildren(message);
            }
        });
}

function markSiteReady() {
    document.body.classList.remove('site-loading');
    document.body.classList.add('site-ready');
    // Hash targets do not exist during the browser's first navigation pass.
    let targetId;
    try {
        targetId = decodeURIComponent(window.location.hash.slice(1));
    } catch {
        return;
    }
    const target = targetId && document.getElementById(targetId);
    if (target) {
        window.requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant', block: 'start' }));
    }
}

window.addEventListener('DOMContentLoaded', event => {
    marked.use({ mangle: false, headerIds: false });

    loadConfig()
        .then((yml) => {
            const sections = normalizeSections(yml.sections);

            renderNavigation(getNavigationItems(yml));
            renderSections(sections);
            applyConfig(yml);
            initBackgroundSlideshow(yml);
            bindResponsiveNavbar();

            return Promise.all(getConfiguredSections(yml).map(loadMarkdownSection));
        })
        .then(() => {
            activateScrollSpy();
            // Math rendering should not delay the biography or loading completion.
            typesetMath().catch(error => console.error(error));
        })
        .catch(error => console.log(error))
        .finally(() => markSiteReady());

}); 
