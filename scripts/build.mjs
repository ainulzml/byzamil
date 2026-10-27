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
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      copySite(from, to, path.join(relative, entry.name));
    } else {
      fs.copyFileSync(from, to);
    }
  }
}
copySite(ROOT, OUT);

// CMS admin remains available at /admin/ in the deployment.
// CMS media_folder is public/uploads, while public_folder is /uploads.
const uploadSource = path.join(ROOT, 'public', 'uploads');
if (fs.existsSync(uploadSource)) {
  fs.cpSync(uploadSource, path.join(OUT, 'uploads'), { recursive: true });
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function parseFrontmatter(raw, file) {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)([\s\S]*)$/);
  if (!match) return { title: path.basename(file, '.md'), description: '', date: '', category: '', status: '', cover: '', project_url: '', body: raw.trim(), slug: path.basename(file, '.md') };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (item) meta[item[1]] = item[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return { ...meta, body: match[2].trim(), slug: path.basename(file, '.md') };
}
function loadCollection(folder) {
  const absolute = path.join(ROOT, 'content', folder);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute).filter(name => name.toLowerCase().endsWith('.md')).map(name => {
    const full = path.join(absolute, name);
    return parseFrontmatter(fs.readFileSync(full, 'utf8'), name);
  }).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(a.title || '').localeCompare(String(b.title || '')));
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
  const lines = String(markdown || '').replace(/\r/g, '').split('\n');
  const out = [];
  let paragraph = [];
  let listType = null;
  const flushParagraph = () => { if (paragraph.length) { out.push(`<p>${paragraph.map(markdownInline).join(' ')}</p>`); paragraph = []; } };
  const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = null; } };
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { flushParagraph(); closeList(); continue; }
    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    const bullet = trimmed.match(/^[-*+]\s+(.+)$/);
    const numbered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (heading) { flushParagraph(); closeList(); const level = heading[1].length; out.push(`<h${level}>${markdownInline(heading[2])}</h${level}>`); }
    else if (bullet || numbered) { flushParagraph(); const wanted = bullet ? 'ul' : 'ol'; if (listType !== wanted) { closeList(); listType = wanted; out.push(`<${listType}>`); } out.push(`<li>${markdownInline((bullet || numbered)[1])}</li>`); }
    else { closeList(); paragraph.push(trimmed); }
  }
  flushParagraph(); closeList();
  return out.join('\n');
}
function formatDate(date) {
  if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) return 'Tanggal belum diisi';
  const d = new Date(`${date.slice(0, 10)}T12:00:00Z`);
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}
function safeUrl(url) {
  const value = String(url || '').trim();
  return /^(https?:\/\/|\/uploads\/|\/assets\/)/i.test(value) ? escapeHtml(value) : '';
}

const notes = loadCollection('notes');
const projects = loadCollection('projects');

const notesPath = path.join(OUT, 'notes.html');
let notesHtml = fs.readFileSync(notesPath, 'utf8');
const latest = notes[0];
let noteFeature = '';
if (latest) {
  const cover = safeUrl(latest.cover);
  noteFeature = `<article class="note-card note-card-dark"><span class="note-number">NOTE / ${escapeHtml(formatDate(latest.date).toUpperCase())}</span><span class="note-status">${escapeHtml(latest.category || 'NOTE')}</span>${cover ? `<img src="${cover}" alt="Sampul ${escapeHtml(latest.title || 'catatan')}" loading="lazy" style="width:100%;max-height:220px;object-fit:cover;border-radius:8px;margin-top:20px">` : ''}<h2>${escapeHtml(latest.title || 'Catatan')}</h2><p>${escapeHtml(latest.description || '')}</p><div class="note-body">${markdownToHtml(latest.body)}</div><span class="note-card-footer">${escapeHtml(formatDate(latest.date))} · byzamil</span></article>`;
} else {
  noteFeature = `<article class="note-card note-card-dark"><span class="note-number">NOTES / READY TO GROW</span><span class="note-status">NO PUBLISHED NOTES</span><h2>Catatan berikutnya dimulai di sini.</h2><p>Konten yang diterbitkan melalui CMS akan muncul otomatis di bagian ini.</p><span class="note-card-footer">byzamil</span></article>`;
}
const notesGrid = `<section class="container notes-page-grid">${noteFeature}<div class="notes-side"><p class="section-kicker">EDITORIAL APPROACH</p><h2>Catatan yang punya konteks.</h2><p>Setiap catatan sebaiknya memiliki pertanyaan yang jelas, gagasan yang bisa dijelaskan, atau pelajaran yang berguna bagi pembaca.</p><div class="note-rule"><span>01</span><p>Bedakan fakta, opini, dan hipotesis.</p></div><div class="note-rule"><span>02</span><p>Sertakan sumber jika mengutip atau membahas gagasan orang lain.</p></div><div class="note-rule"><span>03</span><p>Jelaskan batas pengalaman dan apa yang belum diketahui.</p></div></div></section>`;
notesHtml = notesHtml.replace(/<section class="container notes-page-grid">[\s\S]*?<\/section>/, notesGrid);
const archive = notes.slice(1);
const archiveSection = archive.length ? `<section class="container future-section notes-archive"><p class="section-kicker">MORE NOTES</p><h2>Arsip catatan</h2><div class="notes-archive-grid">${archive.map(note => `<article class="note-archive-card">${safeUrl(note.cover) ? `<img src="${safeUrl(note.cover)}" alt="Sampul ${escapeHtml(note.title || 'catatan')}" loading="lazy">` : ''}<p class="section-kicker">${escapeHtml(note.category || 'NOTE')} · ${escapeHtml(formatDate(note.date))}</p><h3>${escapeHtml(note.title || 'Catatan')}</h3><p>${escapeHtml(note.description || '')}</p><div class="note-body">${markdownToHtml(note.body)}</div></article>`).join('')}</div></section>` : `<section class="container future-section"><p class="section-kicker">MORE NOTES, OVER TIME</p><h2>Arsip akan bertambah seiring proses.</h2><p>Catatan baru akan muncul di sini setelah dipublikasikan melalui CMS.</p></section>`;
notesHtml = notesHtml.replace(/<section class="container future-section">[\s\S]*?<\/section>/, archiveSection);
fs.writeFileSync(notesPath, notesHtml);

const projectsPath = path.join(OUT, 'projects.html');
let projectsHtml = fs.readFileSync(projectsPath, 'utf8');
const projectCards = projects.map((project, index) => {
  const category = ['digital', 'strategy', 'experiments'].includes(project.category) ? project.category : 'digital';
  const status = String(project.status || 'ongoing');
  const statusLabel = ({ ongoing: 'ONGOING', completed: 'COMPLETED', paused: 'PAUSED' })[status] || status.toUpperCase();
  const cover = safeUrl(project.cover);
  const artClass = category === 'strategy' ? 'art-paper' : category === 'experiments' ? 'art-lilac' : 'art-blue';
  const art = cover ? `<img src="${cover}" alt="${escapeHtml(project.title || 'Project')}" loading="lazy" style="width:100%;height:100%;object-fit:cover">` : `<span class="art-index">CMS / ${String(index + 1).padStart(2, '0')}</span><div class="art-window"><i></i><i></i><i></i><div class="art-window-lines"><b></b><b></b><b></b></div></div><span class="art-bottom">${escapeHtml(category.toUpperCase())} · ${escapeHtml(statusLabel)}</span>`;
  const url = safeUrl(project.project_url);
  return `<article class="project-row" id="cms-${escapeHtml(project.slug)}" data-category="${category}"><div class="project-row-visual ${artClass}">${art}</div><div class="project-row-copy"><p class="section-kicker">${escapeHtml(category.toUpperCase())} · ${escapeHtml(statusLabel)}</p><h2>${escapeHtml(project.title || 'Project')}</h2><p>${escapeHtml(project.description || '')}</p><dl><div><dt>Tanggal</dt><dd>${escapeHtml(formatDate(project.date))}</dd></div><div><dt>Status</dt><dd>${escapeHtml(statusLabel)}</dd></div></dl>${url ? `<a class="text-link" href="${url}" target="_blank" rel="noopener noreferrer">Lihat proyek <span aria-hidden="true">↗</span></a>` : ''}<div class="note-body">${markdownToHtml(project.body)}</div><span class="tag ${status === 'ongoing' ? 'tag-active' : ''}">${escapeHtml(statusLabel)}</span></div></article>`;
}).join('\n');
if (projectCards) {
  projectsHtml = projectsHtml.replace('<section class="container projects-list">', `<section class="container projects-list">${projectCards}`);
}
fs.writeFileSync(projectsPath, projectsHtml);

// Small styles for CMS-rendered long-form content, preserving the site's design system.
const cssPath = path.join(OUT, 'assets', 'styles.css');
if (fs.existsSync(cssPath)) {
  fs.appendFileSync(cssPath, `\n/* CMS-rendered content */\n.note-body{margin-top:14px;font-size:13px;line-height:1.85;overflow-wrap:anywhere}.note-body p{margin:0 0 12px}.note-body h1,.note-body h2,.note-body h3,.note-body h4{margin:18px 0 9px;color:inherit}.note-body ul,.note-body ol{padding-left:22px;margin:10px 0}.note-body a{color:inherit;text-decoration:underline}.note-body code{font-family:var(--mono);font-size:.92em;background:rgba(127,145,170,.14);padding:2px 4px;border-radius:3px}.notes-archive-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;margin-top:24px}.note-archive-card{padding:24px;border:1px solid var(--line);border-radius:12px;background:#fff;min-width:0}.note-archive-card>img{width:100%;max-height:230px;object-fit:cover;border-radius:8px;margin-bottom:16px}.note-archive-card h3{font:700 25px/1.2 var(--display);color:var(--navy);margin:10px 0}.note-archive-card>p:not(.section-kicker){font-size:13px;color:#697486;line-height:1.8}.note-archive-card .note-body{color:#4e5a6c}.note-card-dark .note-body{color:#e3e9f3}.note-card-dark .note-body h1,.note-card-dark .note-body h2,.note-card-dark .note-body h3,.note-card-dark .note-body h4{color:#fff}.project-row-visual>img{display:block}@media(max-width:680px){.notes-archive-grid{grid-template-columns:1fr}.note-archive-card{padding:20px}}\n`);
}

console.log(`Build complete: ${notes.length} notes and ${projects.length} projects processed into ${OUT}`);
