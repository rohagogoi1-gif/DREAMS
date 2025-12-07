// script_admin.js - admin panel with chapter editor
document.addEventListener('DOMContentLoaded', ()=>{
  const DEFAULT_ADMIN = {username: 'ROHAN', password: '1234567890'};

  if(window._AS && window._AS.getUsers){
    const users = window._AS.getUsers();
    if(!users.find(u=>u.username===DEFAULT_ADMIN.username)){
      window._AS.createUser(DEFAULT_ADMIN.username, DEFAULT_ADMIN.password, true);
    }
  }

  // elements
  const authUser = document.getElementById('authUser');
  const authPass = document.getElementById('authPass');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const loggedAs = document.getElementById('loggedAs');
  const changePassSection = document.getElementById('changePassSection');
  const newPass = document.getElementById('newPass');
  const changePassBtn = document.getElementById('changePassBtn');

  const adminPanel = document.getElementById('adminPanel');
  const storyTitle = document.getElementById('storyTitle');
  const storyTags = document.getElementById('storyTags');
  const storyThumbnail = document.getElementById('storyThumbnail');
  const storyContentInput = document.getElementById('storyContentInput');
  const addStoryBtn = document.getElementById('addStoryBtn');
  const updateStoryBtn = document.getElementById('updateStoryBtn');
  const exportAllBtn = document.getElementById('exportAllBtn');
  const importStoriesBtn = document.getElementById('importStoriesBtn');
  const storyList = document.getElementById('storyList');

  const noticeInput = document.getElementById('noticeInput');
  const noticeLevel = document.getElementById('noticeLevel');
  const noticeHex = document.getElementById('noticeHex');
  const saveNoticeAdmin = document.getElementById('saveNoticeAdmin');
  const clearAllBtn = document.getElementById('clearAllBtn');

  // create a chapters container under adminPanel
  const chaptersContainer = document.createElement('div');
  chaptersContainer.id = 'chaptersContainer';
  chaptersContainer.innerHTML = '<h3>Chapters</h3><div id="chapterList"></div><div style="margin-top:8px"><input id="newChapterTitle" placeholder="Chapter title"><button id="addChapterBtn" class="btn">Add Chapter</button></div>';
  adminPanel.insertBefore(chaptersContainer, adminPanel.querySelector('h3'));

  function setSession(user){
    sessionStorage.setItem('anime_session', JSON.stringify(user));
    renderAuth();
  }
  function clearSession(){ sessionStorage.removeItem('anime_session'); renderAuth(); }
  function getSession(){ try{ return JSON.parse(sessionStorage.getItem('anime_session')); }catch(e){return null;} }

  function renderAuth(){
    const s = getSession();
    if(s){
      authUser.value = s.username;
      authPass.value = '';
      loginBtn.classList.add('hidden');
      registerBtn.classList.add('hidden');
      logoutBtn.classList.remove('hidden');
      loggedAs.textContent = 'Logged as: ' + s.username + (s.isAdmin? ' (admin)':'');
      changePassSection.classList.remove('hidden');
      adminPanel.classList.remove('hidden');
      loadStoriesList();
      loadNotice();
    } else {
      loginBtn.classList.remove('hidden');
      registerBtn.classList.remove('hidden');
      logoutBtn.classList.add('hidden');
      loggedAs.textContent = '';
      changePassSection.classList.add('hidden');
      adminPanel.classList.add('hidden');
    }
  }

  loginBtn.addEventListener('click', ()=>{
    const u = authUser.value.trim();
    const p = authPass.value;
    const v = window._AS.validateUser(u, p);
    if(v){ setSession(v); } else { alert('Invalid credentials'); }
  });
  registerBtn.addEventListener('click', ()=>{
    const u = authUser.value.trim();
    const p = authPass.value;
    if(!u || !p){ alert('Enter username and password'); return; }
    const ok = window._AS.createUser(u,p,false);
    if(ok) alert('Registered.'); else alert('User exists.');
  });
  logoutBtn.addEventListener('click', ()=> clearSession());
  changePassBtn.addEventListener('click', ()=>{
    const s = getSession();
    if(!s) return alert('Not logged in');
    const users = window._AS.getUsers().map(u=>{ if(u.username===s.username) u.password = newPass.value || u.password; return u; });
    localStorage.setItem('anime_users_v1', JSON.stringify(users));
    alert('Password changed.');
  });

  // stories list
  function loadStoriesList(){
    const all = window._AS.getAll();
    storyList.innerHTML = '';
    all.forEach(st=>{
      const el = document.createElement('div');
      el.className='preview';
      el.innerHTML = '<strong>'+escapeHtml(st.title)+'</strong> <div class="small">Tags: '+(st.tags||[]).join(', ')+'</div>';
      const btns = document.createElement('div'); btns.className='btn-group';
      const edit = document.createElement('button'); edit.className='btn'; edit.textContent='Edit';
      const del = document.createElement('button'); del.className='btn'; del.textContent='Delete';
      edit.addEventListener('click', ()=> loadStoryIntoEditor(st.id) );
      del.addEventListener('click', ()=> { if(confirm('Delete story?')){ window._AS.deleteStory(st.id); loadStoriesList(); } });
      btns.appendChild(edit); btns.appendChild(del); el.appendChild(btns);
      storyList.appendChild(el);
    });
  }

  // load story into editor and chapter manager
  let currentEditingStoryId = null;
  function loadStoryIntoEditor(id){
    const s = window._AS.getById(id);
    if(!s) return;
    currentEditingStoryId = id;
    storyTitle.value = s.title;
    storyTags.value = (s.tags||[]).join(',');
    storyContentInput.value = s.chapters && s.chapters[0] ? s.chapters[0].content : (s.content||'');
    // show chapters list
    renderChapterList(s);
    addStoryBtn.classList.add('hidden');
    updateStoryBtn.classList.remove('hidden');
    updateStoryBtn.dataset.id = s.id;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function renderChapterList(story){
    const cl = document.getElementById('chapterList');
    cl.innerHTML = '';
    (story.chapters || []).forEach((c, i)=>{
      const row = document.createElement('div'); row.className='preview';
      row.innerHTML = '<strong>'+escapeHtml((i+1)+'. '+c.title)+'</strong>';
      const btns = document.createElement('div'); btns.className='btn-group';
      const edit = document.createElement('button'); edit.className='btn'; edit.textContent='Edit';
      const del = document.createElement('button'); del.className='btn'; del.textContent='Delete';
      const up = document.createElement('button'); up.className='btn'; up.textContent='↑';
      const down = document.createElement('button'); down.className='btn'; down.textContent='↓';
      edit.addEventListener('click', ()=> {
        const newTitle = prompt('Chapter title', c.title);
        const newContent = prompt('Chapter content (HTML allowed)', c.content);
        if(newTitle!==null && newContent!==null){
          window._AS.updateChapter(story.id, c.id, { title: newTitle, content: newContent });
          renderChapterList(window._AS.getById(story.id));
        }
      });
      del.addEventListener('click', ()=> {
        if(confirm('Delete chapter?')){ window._AS.deleteChapter(story.id, c.id); renderChapterList(window._AS.getById(story.id)); }
      });
      up.addEventListener('click', ()=>{
        const ids = (window._AS.getById(story.id).chapters||[]).map(x=>x.id);
        const idx = ids.indexOf(c.id);
        if(idx>0){ ids.splice(idx-1,0, ids.splice(idx,1)[0]); window._AS.reorderChapters(story.id, ids); renderChapterList(window._AS.getById(story.id)); }
      });
      down.addEventListener('click', ()=>{
        const ids = (window._AS.getById(story.id).chapters||[]).map(x=>x.id);
        const idx = ids.indexOf(c.id);
        if(idx<ids.length-1){ ids.splice(idx+1,0, ids.splice(idx,1)[0]); window._AS.reorderChapters(story.id, ids); renderChapterList(window._AS.getById(story.id)); }
      });
      btns.appendChild(edit); btns.appendChild(del); btns.appendChild(up); btns.appendChild(down);
      row.appendChild(btns);
      cl.appendChild(row);
    });
  }

  // add new chapter button (requires current editing story)
  document.getElementById('addChapterBtn').addEventListener('click', ()=>{
    const title = document.getElementById('newChapterTitle').value.trim() || 'New Chapter';
    if(!currentEditingStoryId){
      alert('Please create or select a story to add chapters.');
      return;
    }
    window._AS.addChapter(currentEditingStoryId, { title, content: '<p></p>' });
    renderChapterList(window._AS.getById(currentEditingStoryId));
    document.getElementById('newChapterTitle').value = '';
  });

  addStoryBtn.addEventListener('click', ()=>{
    const st = {
      title: storyTitle.value.trim() || 'Untitled',
      tags: storyTags.value.split(',').map(x=>x.trim()).filter(Boolean),
      chapters: [{ id: (Date.now()+'').slice(-6), title: 'Chapter 1', content: storyContentInput.value || '' }]
    };
    window._AS.addStory(st);
    storyTitle.value=''; storyTags.value=''; storyContentInput.value='';
    loadStoriesList();
  });

  updateStoryBtn.addEventListener('click', ()=>{
    const id = updateStoryBtn.dataset.id;
    if(!id) return;
    const updates = {
      title: storyTitle.value.trim(),
      tags: storyTags.value.split(',').map(x=>x.trim()).filter(Boolean)
    };
    window._AS.updateStory(id, updates);
    loadStoriesList();
    addStoryBtn.classList.remove('hidden');
    updateStoryBtn.classList.add('hidden');
  });

  exportAllBtn.addEventListener('click', ()=>{
    const blob = new Blob([window._AS.exportStoriesJSON()], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='stories_export.json'; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });

  importStoriesBtn.addEventListener('click', ()=>{
    const txt = prompt('Paste stories JSON here');
    if(!txt) return;
    const ok = window._AS.importStoriesJSON(txt);
    if(ok){ alert('Imported.'); loadStoriesList(); } else alert('Invalid JSON.');
  });

  function loadNotice(){
    const n = window._AS.getNotice();
    if(n){
      noticeInput.value = n.text||'';
      noticeLevel.value = n.level||'info';
      noticeHex.value = n.color || '#2196F3';
    }
  }
  saveNoticeAdmin.addEventListener('click', ()=>{
    const obj = { text: noticeInput.value.trim(), level: noticeLevel.value, color: noticeHex.value };
    window._AS.saveNotice(obj);
    alert('Notice saved.');
  });

  clearAllBtn.addEventListener('click', ()=>{
    if(confirm('Clear ALL site data (stories, users, notice)?')){ localStorage.clear(); sessionStorage.clear(); location.reload(); }
  });

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  renderAuth();
});
