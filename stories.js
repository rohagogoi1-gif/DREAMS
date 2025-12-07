// stories.js - data layer with chapters support
(function(){
  const KEY = 'anime_stories_v2';
  const USERS_KEY = 'anime_users_v1';
  const NOTICE_KEY = 'anime_notice_v1';
  const THEME_KEY = 'anime_theme_v1';

  function uid(){return 's_'+Math.random().toString(36).slice(2,9);}

  function defaultStories(){
    return [{
      id: uid(),
      title: 'Sample Story: The Flame',
      tags: ['fantasy','intro'],
      thumbnail: '',
      chapters: [
        { id: uid(), title: 'Chapter 1 - Ember', content: '<p>The flame remembered its first spark. It was *fragile*, yet bright.</p>' },
        { id: uid(), title: 'Chapter 2 - Blaze', content: '<p>It grew into a blaze, *unstoppable*.</p>' }
      ],
      created: Date.now(),
      ratings: [],
      comments: []
    }];
  }

  function read(){
    try{
      const raw = localStorage.getItem(KEY);
      return raw? JSON.parse(raw) : defaultStories();
    }catch(e){return defaultStories();}
  }
  function write(data){ localStorage.setItem(KEY, JSON.stringify(data)); }

  function getAll(){ return read(); }
  function getById(id){ return read().find(s => s.id === id); }
  function addStory(story){
    const arr = read();
    story.id = story.id || uid();
    story.created = story.created || Date.now();
    story.chapters = story.chapters || [{ id: uid(), title: 'Chapter 1', content: story.content || '' }];
    story.ratings = story.ratings || [];
    story.comments = story.comments || [];
    arr.unshift(story);
    write(arr);
    return story;
  }
  function updateStory(id, updates){
    const arr = read();
    const i = arr.findIndex(s=>s.id===id);
    if(i===-1) return null;
    arr[i] = Object.assign({}, arr[i], updates);
    write(arr);
    return arr[i];
  }
  function deleteStory(id){
    const arr = read().filter(s=>s.id!==id);
    write(arr);
  }

  // chapter CRUD
  function addChapter(storyId, chapter){
    const s = getById(storyId);
    if(!s) return null;
    chapter.id = chapter.id || uid();
    s.chapters = s.chapters || [];
    s.chapters.push(chapter);
    updateStory(storyId, {chapters: s.chapters});
    return chapter;
  }
  function updateChapter(storyId, chapterId, updates){
    const s = getById(storyId);
    if(!s) return null;
    s.chapters = s.chapters || [];
    const i = s.chapters.findIndex(c=>c.id===chapterId);
    if(i===-1) return null;
    s.chapters[i] = Object.assign({}, s.chapters[i], updates);
    updateStory(storyId, {chapters: s.chapters});
    return s.chapters[i];
  }
  function deleteChapter(storyId, chapterId){
    const s = getById(storyId);
    if(!s) return null;
    s.chapters = (s.chapters||[]).filter(c=>c.id!==chapterId);
    updateStory(storyId, {chapters: s.chapters});
  }
  function reorderChapters(storyId, newOrderIds){
    const s = getById(storyId);
    if(!s) return null;
    const map = (s.chapters||[]).reduce((acc,c)=>{acc[c.id]=c;return acc;},{});
    s.chapters = newOrderIds.map(id=>map[id]).filter(Boolean);
    updateStory(storyId, {chapters: s.chapters});
    return s.chapters;
  }

  // ratings & comments (same as before)
  function rateStory(id, value){
    const s = getById(id);
    if(!s) return null;
    s.ratings = s.ratings || [];
    s.ratings.push(Number(value));
    updateStory(id, {ratings: s.ratings});
    return s.ratings;
  }
  function avgRating(s){
    if(!s || !s.ratings || s.ratings.length===0) return 0;
    return (s.ratings.reduce((a,b)=>a+b,0) / s.ratings.length);
  }
  function addComment(id, author, text){
    const s = getById(id);
    if(!s) return null;
    const c = {id: uid(), author: author||'Anonymous', text, ts: Date.now()};
    s.comments = s.comments || [];
    s.comments.push(c);
    updateStory(id, {comments: s.comments});
    return c;
  }
  function clearComments(id){
    updateStory(id, {comments: []});
  }

  // users
  function getUsers(){
    try{
      const r = localStorage.getItem(USERS_KEY);
      return r? JSON.parse(r): [];
    }catch(e){return [];}
  }
  function saveUsers(u){ localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
  function createUser(username, password, isAdmin){
    const u = getUsers();
    if(u.find(x=>x.username===username)) return false;
    u.push({username, password, isAdmin: !!isAdmin});
    saveUsers(u);
    return true;
  }
  function validateUser(username, password){
    const u = getUsers().find(x=>x.username===username && x.password===password);
    return u || null;
  }

  // notice & theme
  function saveNotice(obj){
    localStorage.setItem(NOTICE_KEY, JSON.stringify(obj));
  }
  function getNotice(){
    try{ return JSON.parse(localStorage.getItem(NOTICE_KEY)); }catch(e){return null;}
  }
  function saveTheme(t){
    localStorage.setItem(THEME_KEY, t);
    document.body.classList.remove('light','dark');
    document.body.classList.add(t || 'light');
  }
  function loadTheme(){
    const t = localStorage.getItem(THEME_KEY) || 'light';
    document.body.classList.remove('light','dark');
    document.body.classList.add(t);
    return t;
  }

  // export/import json
  function exportStoriesJSON(){
    return JSON.stringify(read(), null, 2);
  }
  function importStoriesJSON(json){
    try{
      const parsed = JSON.parse(json);
      if(!Array.isArray(parsed)) return false;
      write(parsed);
      return true;
    }catch(e){ return false; }
  }

  window._AS = {
    getAll, getById, addStory, updateStory, deleteStory,
    addChapter, updateChapter, deleteChapter, reorderChapters,
    rateStory, avgRating, addComment, clearComments,
    createUser, getUsers, validateUser,
    saveNotice, getNotice,
    saveTheme, loadTheme,
    exportStoriesJSON, importStoriesJSON
  };
})();
