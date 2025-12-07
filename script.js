// script.js - public site behavior with chapter navigation and *italic* parsing
document.addEventListener('DOMContentLoaded', ()=> {
  // apply theme
  if(window._AS && window._AS.loadTheme) window._AS.loadTheme();

  // ensure top bar visible and not overlapping
  document.querySelectorAll('.top-bar').forEach(tb=>{
    tb.style.position='sticky'; tb.style.top='0'; tb.style.zIndex='50';
  });

  function readQueryParam(name){
    return new URLSearchParams(location.search).get(name);
  }
  const storyId = readQueryParam('id');
  const chIndexParam = parseInt(readQueryParam('ch') || '0', 10);

  // parser: convert *text* to <em>text</em>
  function parseInlineItalic(html){
    // avoid replacing inside tags by operating on text nodes
    const container = document.createElement('div');
    container.innerHTML = html;
    function walk(node){
      if(node.nodeType === Node.TEXT_NODE){
        // replace *...* with <em>...</em>
        const parts = node.nodeValue.split(/(\*[^*]+\*)/g);
        if(parts.length>1){
          const frag = document.createDocumentFragment();
          parts.forEach(p=>{
            if(p.startsWith('*') && p.endsWith('*') && p.length>1){
              const em = document.createElement('em');
              em.textContent = p.slice(1,-1);
              frag.appendChild(em);
            } else {
              frag.appendChild(document.createTextNode(p));
            }
          });
          node.replaceWith(frag);
        }
        return;
      }
      node.childNodes && Array.from(node.childNodes).forEach(walk);
    }
    walk(container);
    return container.innerHTML;
  }

  function renderStoryAndChapter(story, chIndex){
    if(!story) return;
    const titleEl = document.getElementById('storyTitleEl');
    const meta = document.getElementById('storyMeta');
    const contentEl = document.getElementById('storyContent');
    const chapterNav = document.getElementById('chapterNav');

    titleEl.textContent = story.title || 'Untitled';
    meta.innerHTML = '<p class="small">Tags: '+(story.tags||[]).join(', ')+'</p>';

    const chapters = story.chapters || [{id:'c1', title:'Chapter 1', content: story.content||''}];
    const idx = (typeof chIndex === 'number' && !isNaN(chIndex) && chIndex>=0 && chIndex<chapters.length) ? chIndex : 0;
    const ch = chapters[idx];

    // render content with inline italic parsing
    contentEl.innerHTML = parseInlineItalic(ch.content || '');

    // chapter nav
    chapterNav.classList.remove('hidden');
    chapterNav.innerHTML = '<strong>Chapters</strong><div class="btn-group" style="margin-top:8px"></div>';
    const listDiv = chapterNav.querySelector('.btn-group');
    chapters.forEach((c, i)=>{
      const b = document.createElement('button');
      b.className = 'btn small-link';
      b.textContent = (i+1)+'. '+c.title;
      if(i===idx) b.style.outline='2px solid rgba(0,0,0,0.08)';
      b.addEventListener('click', ()=> {
        location.search = '?id='+story.id+'&ch='+i;
      });
      listDiv.appendChild(b);
    });

    // next/prev controls
    const controls = document.createElement('div');
    controls.className='controls';
    const prev = document.createElement('button'); prev.className='btn'; prev.textContent='Previous';
    const next = document.createElement('button'); next.className='btn'; next.textContent='Next';
    prev.disabled = idx===0;
    next.disabled = idx>=chapters.length-1;
    prev.addEventListener('click', ()=> {
      location.search = '?id='+story.id+'&ch='+(Math.max(0, idx-1));
    });
    next.addEventListener('click', ()=> {
      location.search = '?id='+story.id+'&ch='+(Math.min(chapters.length-1, idx+1));
    });
    controls.appendChild(prev); controls.appendChild(next);
    contentEl.parentNode.insertBefore(controls, contentEl.nextSibling);

    // rating & comments (reuse previous simple logic)
    const avgEl = document.getElementById('avgRatingText');
    const ratingResult = document.getElementById('rating-result');
    const starsWidget = document.getElementById('starsWidget');
    avgEl.textContent = 'Average: ' + (window._AS.avgRating(story)||0).toFixed(1);
    ratingResult.textContent = 'Your rating: 0';
    starsWidget.innerHTML='';
    for(let i=1;i<=5;i++){
      const s = document.createElement('span'); s.className='star'; s.textContent='★';
      s.addEventListener('click', ()=> {
        window._AS.rateStory(story.id, i);
        avgEl.textContent = 'Average: ' + (window._AS.avgRating(window._AS.getById(story.id))||0).toFixed(1);
        ratingResult.textContent = 'Your rating: '+i;
      });
      starsWidget.appendChild(s);
    }

    // comments renderers
    const commentsList = document.getElementById('commentsList');
    function renderComments(){
      const arr = story.comments || [];
      commentsList.innerHTML = '';
      if(!arr.length){ commentsList.innerHTML = '<li class="small">No comments yet</li>'; return; }
      arr.slice().reverse().forEach(c=>{
        const li = document.createElement('li');
        li.className='comment';
        li.innerHTML = '<strong>'+escapeHtml(c.author)+'</strong> <span class="small">'+new Date(c.ts).toLocaleString()+'</span><div>'+escapeHtml(c.text)+'</div>';
        commentsList.appendChild(li);
      });
    }
    renderComments();
  }

  // initial load
  const story = storyId ? window._AS.getById(storyId) : (window._AS.getAll()[0] || null);
  renderStoryAndChapter(story, isNaN(chIndexParam)?0:chIndexParam);

  // comment form logic
  const commentForm = document.getElementById('commentForm');
  if(commentForm){
    commentForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const author = document.getElementById('commentAuthor').value.trim() || 'Anonymous';
      const text = document.getElementById('commentText').value.trim();
      if(!text) return;
      const sid = storyId || (window._AS.getAll()[0] && window._AS.getAll()[0].id);
      window._AS.addComment(sid, author, text);
      location.reload();
    });
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

});
