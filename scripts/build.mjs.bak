import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'dist');
const EXCLUDE = new Set(['.git', 'node_modules', 'dist', 'content', 'public', 'scripts']);
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
function copySite(source, target, relative = '') {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (!relative && EXCLUDE.has(entry.name)) continue;
    if (entry.name === '.DS_Store') continue;
    const from = path.join(source, entry.name), to = path.join(target, entry.name);
    if (entry.isDirectory()) { fs.mkdirSync(to, { recursive: true }); copySite(from, to, path.join(relative, entry.name)); }
    else fs.copyFileSync(from, to);
  }
}
copySite(ROOT, OUT);
const uploadSource = path.join(ROOT, 'public', 'uploads');
if (fs.existsSync(uploadSource)) fs.cpSync(uploadSource, path.join(OUT, 'uploads'), { recursive: true });

function escapeHtml(value = '') { return String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
function parseFrontmatter(raw, file) {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)([\s\S]*)$/);
  const fallback = { title: path.basename(file, '.md'), description: '', date: '', category: '', status: '', cover: '', project_url: '', body: raw.trim() };
  if (!match) return { ...fallback, slug: path.basename(file, '.md') };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (item) meta[item[1]] = item[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return { ...fallback, ...meta, body: match[2].trim(), slug: path.basename(file, '.md') };
}
function loadCollection(folder) {
  const absolute = path.join(ROOT, 'content', folder);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute).filter(n => n.toLowerCase().endsWith('.md')).map(name => parseFrontmatter(fs.readFileSync(path.join(absolute, name), 'utf8'), name))
    .sort((a,b) => String(b.date || '').localeCompare(String(a.date || '')) || String(a.title || '').localeCompare(String(b.title || '')));
}
function markdownInline(text) {
  let result = escapeHtml(text);
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  result = result.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return result;
}
function markdownToHtml(markdown) {
  const lines = String(markdown || '').replace(/\r/g, '').split('\n'), out = [];
  let paragraph = [], listType = null;
  const flush = () => { if (paragraph.length) { out.push(`<p>${paragraph.map(markdownInline).join(' ')}</p>`); paragraph = []; } };
  const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = null; } };
  for (const line of lines) {
    const t = line.trim();
    if (!t) { flush(); closeList(); continue; }
    const heading = t.match(/^(#{1,4})\s+(.+)$/), bullet = t.match(/^[-*+]\s+(.+)$/), numbered = t.match(/^\d+\.\s+(.+)$/);
    if (heading) { flush(); closeList(); const n = heading[1].length; out.push(`<h${n}>${markdownInline(heading[2])}</h${n}>`); }
    else if (bullet || numbered) { flush(); const wanted = bullet ? 'ul' : 'ol'; if (listType !== wanted) { closeList(); listType = wanted; out.push(`<${listType}>`); } out.push(`<li>${markdownInline((bullet || numbered)[1])}</li>`); }
    else { closeList(); paragraph.push(t); }
  }
  flush(); closeList(); return out.join('\n');
}
function formatDate(date) {
  if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) return 'Tanggal belum diisi';
  const d = new Date(`${date.slice(0,10)}T12:00:00Z`);
  return new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }).format(d);
}
function safeUrl(url) { const v = String(url || '').trim(); return /^(https?:\/\/|\/uploads\/|\/assets\/)/i.test(v) ? escapeHtml(v) : ''; }
function slugify(value) {
  const s = String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
  return s || 'konten';
}
function uniqueSlugs(items, fromTitle = false) {
  const seen = new Set();
  return items.map(item => {
    const desired = slugify((fromTitle ? item.title : item.slug) || item.title);
    let slug = desired, n = 2;
    while (seen.has(slug)) slug = `${desired}-${n++}`;
    seen.add(slug); return { ...item, pageSlug: slug };
  });
}
function getShell(sourceHtml, title, description, canonicalPath) {
  const header = (sourceHtml.match(/<header class="site-header">[\s\S]*?<\/header>/) || [''])[0];
  const footer = (sourceHtml.match(/<footer class="site-footer">[\s\S]*?<\/footer>/) || [''])[0];
  const headerActive = header.replace(' class="active"', '');
  const head = `<meta name="description" content="${escapeHtml(description || title)}"><meta property="og:type" content="article"><meta property="og:title" content="${escapeHtml(title)} — byzamil"><meta property="og:description" content="${escapeHtml(description || title)}"><meta property="og:url" content="https://byzamil.web.id${canonicalPath}">`;
  const templateHead = ((sourceHtml.match(/<head>[\s\S]*?<\/head>/) || ['<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>'])[0])
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)} — byzamil</title>`)
    .replace(/(href|src)="assets\//g, '$1="/assets/')
    .replace('</head>', `${head}</head>`);
  const rootedHeader = headerActive.replace(/(href|src)="assets\//g, '$1="/assets/').replace(/href="(index|notes|projects|about|contact)\.html/g, 'href="/$1.html');
  const rootedFooter = footer.replace(/(href|src)="assets\//g, '$1="/assets/').replace(/href="(index|notes|projects|about|contact)\.html/g, 'href="/$1.html');
  return { head: templateHead, header: rootedHeader, footer: rootedFooter };
}
function detailPage({ sourceHtml, kind, item, allItems, canonicalPath }) {
  const title = item.title || (kind === 'notes' ? 'Catatan' : 'Proyek');
  const description = item.description || '';
  const shell = getShell(sourceHtml, title, description, canonicalPath);
  const cover = safeUrl(item.cover);
  const date = formatDate(item.date);
  const category = escapeHtml(item.category || (kind === 'notes' ? 'NOTE' : 'PROJECT'));
  const status = escapeHtml(String(item.status || 'ongoing').toUpperCase());
  const external = kind === 'projects' && safeUrl(item.project_url) ? `<a class="text-link detail-external" href="${safeUrl(item.project_url)}" target="_blank" rel="noopener noreferrer">Buka tautan proyek <span aria-hidden="true">↗</span></a>` : '';
  const siblings = allItems.filter(x => x.pageSlug !== item.pageSlug).slice(0, 3);
  const siblingBlock = siblings.length ? `<section class="container detail-related"><p class="section-kicker">MORE ${kind === 'notes' ? 'NOTES' : 'PROJECTS'}</p><div class="detail-related-grid">${siblings.map(x => `<a class="detail-related-card" href="/${kind}/${x.pageSlug}.html"><span>${escapeHtml(x.category || kind.toUpperCase())} · ${escapeHtml(formatDate(x.date))}</span><strong>${escapeHtml(x.title || 'Untitled')}</strong><span class="text-link">Baca selengkapnya →</span></a>`).join('')}</div></section>` : '';
  const body = `<main id="main"><article class="container detail-article"><a class="detail-back" href="/${kind === 'notes' ? 'notes' : 'projects'}.html">← Kembali ke ${kind === 'notes' ? 'Notes' : 'Projects'}</a><header class="detail-hero"><p class="section-kicker">${category} · ${escapeHtml(date)}${kind === 'projects' ? ` · ${status}` : ''}</p><h1>${escapeHtml(title)}<span>.</span></h1>${description ? `<p class="detail-lede">${escapeHtml(description)}</p>` : ''}${cover ? `<img class="detail-cover" src="${cover}" alt="Sampul ${escapeHtml(title)}">` : ''}</header><div class="detail-content">${markdownToHtml(item.body)}</div>${external}<footer class="detail-footer"><span class="detail-brand">byzamil</span><span class="detail-footer-action"><a class="text-link" href="/${kind === 'notes' ? 'notes' : 'projects'}.html">Lihat semua ${kind === 'notes' ? 'Notes' : 'Projects'} →</a></span></footer></article>${siblingBlock}</main>`;
  return `<!doctype html><html lang="id">${shell.head}<body><a class="skip-link" href="#main">Lewati ke konten</a>${shell.header}${body}${shell.footer}</body></html>`;
}
function writeDetails(items, kind, sourceHtml) {
  const folder = path.join(OUT, kind); fs.mkdirSync(folder, { recursive: true });
  for (const item of items) {
    const filename = `${item.pageSlug}.html`;
    const canonical = `/${kind}/${filename}`;
    fs.writeFileSync(path.join(folder, filename), detailPage({ sourceHtml, kind, item, allItems: items, canonicalPath: canonical }));
  }
}

const notes = uniqueSlugs(loadCollection('notes'), true);
const projects = uniqueSlugs(loadCollection('projects'));
const notesPath = path.join(OUT, 'notes.html');
let notesHtml = fs.readFileSync(notesPath, 'utf8');
const noteCards = notes.map(note => {
  const cover = safeUrl(note.cover), href = `/notes/${note.pageSlug}.html`;
  return `<article class="note-list-card">${cover ? `<a class="note-list-cover" href="${href}"><img src="${cover}" alt="Sampul ${escapeHtml(note.title || 'catatan')}" loading="lazy"></a>` : ''}<div class="note-list-copy"><p class="section-kicker">${escapeHtml(note.category || 'NOTE')} · ${escapeHtml(formatDate(note.date))}</p><h2><a href="${href}">${escapeHtml(note.title || 'Catatan')}</a></h2>${note.description ? `<p>${escapeHtml(note.description)}</p>` : ''}<a class="text-link" href="${href}">Baca selengkapnya <span aria-hidden="true">→</span></a></div></article>`;
}).join('\n');
// Preserve the original Notes mockup/layout. Add CMS notes as a separate,
// visually consistent card grid below it instead of replacing the original section.
const noteListing = notes.length ? `<section class="container cms-note-list"><div class="cms-list-heading"><p class="section-kicker">CATATAN DARI CMS</p><p>${notes.length} catatan</p></div><div class="cms-note-grid">${notes.map(note => {
  const cover = safeUrl(note.cover), href = `/notes/${note.pageSlug}.html`;
  return `<article class="cms-note-card">${cover ? `<a class="cms-note-card-cover" href="${href}"><img src="${cover}" alt="Sampul ${escapeHtml(note.title || 'catatan')}" loading="lazy"></a>` : '<div class="cms-note-card-cover cms-note-card-cover-empty" aria-hidden="true"></div>'}<div class="cms-note-card-copy"><p class="section-kicker">${escapeHtml(note.category || 'NOTE')} · ${escapeHtml(formatDate(note.date))}</p><h2><a href="${href}">${escapeHtml(note.title || 'Catatan')}</a></h2>${note.description ? `<p class="cms-note-summary">${escapeHtml(note.description)}</p>` : ''}<a class="text-link" href="${href}">Baca selengkapnya <span aria-hidden="true">→</span></a></div></article>`;
}).join('')}</div></section>` : '';
notesHtml = notesHtml.replace('</main>', `${noteListing}</main>`);
fs.writeFileSync(notesPath, notesHtml);
writeDetails(notes, 'notes', notesHtml);

const projectsPath = path.join(OUT, 'projects.html');
let projectsHtml = fs.readFileSync(projectsPath, 'utf8');
const projectCards = projects.map(project => {
  const category = ['digital','strategy','experiments'].includes(project.category) ? project.category : 'digital';
  const status = String(project.status || 'ongoing');
  const statusLabel = ({ ongoing:'ONGOING', completed:'COMPLETED', paused:'PAUSED' })[status] || status.toUpperCase();
  const cover = safeUrl(project.cover), href = `/projects/${project.pageSlug}.html`;
  const artClass = category === 'strategy' ? 'art-paper' : category === 'experiments' ? 'art-lilac' : 'art-blue';
  const art = cover ? `<img src="${cover}" alt="${escapeHtml(project.title || 'Project')}" loading="lazy">` : `<span class="art-index">${escapeHtml(category.toUpperCase())}</span><div class="art-window"><i></i><i></i><i></i><div class="art-window-lines"><b></b><b></b><b></b></div></div><span class="art-bottom">${escapeHtml(statusLabel)}</span>`;
  return `<article class="project-row cms-project-row" data-category="${category}"><a class="project-row-visual ${artClass} cms-project-visual" href="${href}" aria-label="Lihat detail ${escapeHtml(project.title || 'proyek')}">${art}</a><div class="project-row-copy"><p class="section-kicker">${escapeHtml(category.toUpperCase())} · ${escapeHtml(statusLabel)}</p><h2><a href="${href}">${escapeHtml(project.title || 'Project')}</a></h2><p>${escapeHtml(project.description || '')}</p><p class="project-meta">${escapeHtml(formatDate(project.date))}</p><a class="text-link" href="${href}">Lihat detail proyek <span aria-hidden="true">→</span></a></div></article>`;
}).join('\n');
if (projectCards) {
  projectsHtml = projectsHtml.replace('<section class="container projects-list">', `<section class="container projects-list">${projectCards}`);
}
fs.writeFileSync(projectsPath, projectsHtml);
writeDetails(projects, 'projects', projectsHtml);

const cssPath = path.join(OUT, 'assets', 'styles.css');
if (fs.existsSync(cssPath)) fs.appendFileSync(cssPath, `\n/* CMS detail pages and balanced collection cards */
.cms-note-list{padding-top:24px;padding-bottom:72px}.cms-list-heading{display:flex;justify-content:space-between;align-items:center;gap:16px;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:22px}.cms-list-heading p{margin:0}.cms-note-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.cms-note-card{display:flex;flex-direction:column;min-width:0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff}.cms-note-card-cover{display:block;aspect-ratio:16/9;overflow:hidden;background:#edf0f5}.cms-note-card-cover img{display:block;width:100%;height:100%;object-fit:cover}.cms-note-card-copy{display:flex;flex:1;flex-direction:column;align-items:flex-start;padding:20px}.cms-note-card-copy .section-kicker{font-size:11px;line-height:1.5;margin:0 0 8px}.cms-note-card-copy h2{font:700 clamp(21px,2.5vw,28px)/1.2 var(--display);margin:0 0 10px;color:var(--navy);overflow-wrap:anywhere}.cms-note-card-copy h2 a,.project-row-copy h2 a{color:inherit;text-decoration:none}.cms-note-card-copy h2 a:hover,.project-row-copy h2 a:hover{text-decoration:underline;text-underline-offset:4px}.cms-note-summary{font-size:14px;line-height:1.75;color:#697486;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;margin:0 0 16px}.cms-note-card-copy .text-link{margin-top:auto;padding-top:12px}.cms-empty{padding:48px 0}.detail-article{max-width:850px;padding-top:36px;padding-bottom:70px}.detail-back{display:inline-block;color:#697486;text-decoration:none;font-size:13px;margin-bottom:28px}.detail-back:hover{text-decoration:underline}.detail-hero{max-width:760px;margin-bottom:34px}.detail-hero h1{font:700 clamp(38px,6vw,68px)/1.04 var(--display);letter-spacing:-.035em;color:var(--navy);margin:14px 0 18px;overflow-wrap:anywhere}.detail-hero h1 span{color:var(--blue,#5287c7)}.detail-lede{font-size:clamp(17px,2vw,21px);line-height:1.75;color:#667286;max-width:68ch}.detail-cover{display:block;width:100%;max-height:520px;object-fit:cover;border-radius:14px;margin-top:28px}.detail-content{max-width:720px;font-size:16px;line-height:1.95;color:#354155;overflow-wrap:anywhere}.detail-content p{margin:0 0 1.35em}.detail-content h1,.detail-content h2,.detail-content h3,.detail-content h4{font-family:var(--display);line-height:1.25;color:var(--navy);margin:1.7em 0 .65em}.detail-content h1{font-size:2em}.detail-content h2{font-size:1.65em}.detail-content h3{font-size:1.3em}.detail-content ul,.detail-content ol{padding-left:1.5em;margin:0 0 1.4em}.detail-content li{padding-left:.25em;margin:.35em 0}.detail-content a{color:#285d9b;text-decoration:underline;text-underline-offset:3px}.detail-content code{font-family:var(--mono);font-size:.9em;background:#edf0f5;padding:2px 5px;border-radius:4px}.detail-external{display:inline-block;margin-top:18px}.detail-footer{display:flex;justify-content:space-between;align-items:center;column-gap:28px;row-gap:12px;border-top:1px solid var(--line);padding-top:22px;margin-top:44px;color:#697486;font-size:13px}.detail-brand{display:inline-block;white-space:nowrap;margin-right:12px}.detail-footer .text-link{display:inline-block;margin-left:8px}.detail-related{padding-top:28px;padding-bottom:64px;border-top:1px solid var(--line)}.detail-related-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:20px}.detail-related-card{display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding:20px;border:1px solid var(--line);border-radius:10px;text-decoration:none;color:inherit;min-width:0}.detail-related-card>span:first-child{font-size:11px;color:#697486;text-transform:uppercase;letter-spacing:.06em}.detail-related-card strong{font:700 19px/1.3 var(--display);color:var(--navy);overflow-wrap:anywhere}.detail-related-card .text-link{margin-top:auto}.cms-project-visual{display:block;position:relative;overflow:hidden}.cms-project-visual>img{display:block;width:100%;height:100%;min-height:220px;object-fit:cover}.project-meta{font-size:12px;color:#697486}.cms-project-row .project-row-copy{align-self:center}.cms-project-row .project-row-copy>p:not(.section-kicker){max-width:65ch;line-height:1.8}@media(max-width:680px){.cms-note-grid{grid-template-columns:1fr}.cms-note-card-copy h2{font-size:25px}.detail-article{padding-top:24px;padding-bottom:48px}.detail-content{font-size:16px}.detail-related-grid{grid-template-columns:1fr}.detail-footer{align-items:flex-start;flex-direction:column}.detail-cover{max-height:320px}}

/* v5: preserve the original Notes/Projects mockups; media never dictates listing height. */
.cms-note-grid{grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;gap:22px}
.cms-note-card{height:100%;min-height:0;display:flex;flex-direction:column}
.cms-note-card-cover{height:176px;min-height:176px;max-height:176px;aspect-ratio:auto;flex:0 0 176px;display:block;overflow:hidden;background:#edf0f5}
.cms-note-card-cover img{display:block;width:100%;height:100%;max-width:none;max-height:none;object-fit:cover;object-position:center}
.cms-note-card-cover-empty{background:linear-gradient(135deg,#edf1f7,#dce5f1)}
.cms-note-card-copy{flex:1;min-height:220px}
.cms-note-card-copy h2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.cms-note-summary{max-height:5.25em;overflow:hidden}
.cms-project-row .cms-project-visual{height:250px;min-height:250px;max-height:250px;overflow:hidden}
.cms-project-row .cms-project-visual>img{width:100%;height:100%;min-height:0;max-height:100%;object-fit:cover}
.detail-footer{display:flex!important;justify-content:flex-start;align-items:center;gap:28px!important;flex-wrap:wrap;padding-top:24px}
.detail-brand{display:inline-block;flex:0 0 auto;white-space:nowrap;margin:0!important;padding:0!important}
.detail-footer-action{display:inline-flex;align-items:center;flex:0 0 auto;margin:0!important;padding:0!important}
.detail-footer-action .text-link{display:inline-block;margin:0!important;padding:6px 0}
@media(max-width:680px){.cms-note-grid{grid-template-columns:1fr}.cms-note-card-cover{height:190px;min-height:190px;max-height:190px;flex-basis:190px}.cms-project-row .cms-project-visual{height:210px;min-height:210px;max-height:210px}.detail-footer{gap:18px!important}}
`);
console.log(`Build complete: ${notes.length} note detail pages and ${projects.length} project detail pages generated into ${OUT}`);
