'use client';

import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Song = { id: string; title: string; artist: string; platform: 'youtube'|'spotify'|'soundcloud'; url: string; cover_url: string|null; release_date: string|null; published: boolean };
const empty = { title:'', artist:'', platform:'youtube' as const, url:'', cover_url:'', release_date:'', published:true };

function validPlatformUrl(platform: string, value: string) {
  try {
    const u = new URL(value);
    if (platform === 'youtube') return ['youtube.com','www.youtube.com','youtu.be','m.youtube.com'].includes(u.hostname);
    if (platform === 'spotify') return ['open.spotify.com','spotify.com'].includes(u.hostname);
    if (platform === 'soundcloud') return ['soundcloud.com','www.soundcloud.com','m.soundcloud.com'].includes(u.hostname);
  } catch {}
  return false;
}

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({data}) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next)).data;
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadSongs() {
    if (!supabase) return;
    const { data, error } = await supabase.from('songs').select('*').order('created_at',{ascending:false});
    if (error) setMessage(error.message); else setSongs((data as Song[]) || []);
  }
  useEffect(() => { if (session) loadSongs(); }, [session]);

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage('');
    if (!supabase) { setMessage('Add Supabase environment variables first.'); setBusy(false); return; }
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({ email:String(fd.get('email')), password:String(fd.get('password')) });
    setMessage(error ? error.message : 'Signed in.'); setBusy(false);
  }

  async function saveSong(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    if (!supabase) { setMessage('Supabase is not configured.'); setBusy(false); return; }
    if (!validPlatformUrl(form.platform, form.url)) { setMessage('Please paste a valid URL for the selected platform.'); setBusy(false); return; }
    const payload = { title:form.title.trim(), artist:form.artist.trim(), platform:form.platform, url:form.url.trim(), cover_url:form.cover_url.trim() || null, release_date:form.release_date || null, published:form.published };
    const result = editing ? await supabase.from('songs').update(payload).eq('id',editing) : await supabase.from('songs').insert(payload);
    if (result.error) setMessage(result.error.message); else { setMessage(editing ? 'Song updated.' : 'Song added.'); setForm(empty); setEditing(null); await loadSongs(); }
    setBusy(false);
  }

  function edit(song: Song) { setEditing(song.id); setForm({title:song.title,artist:song.artist,platform:song.platform,url:song.url,cover_url:song.cover_url||'',release_date:song.release_date||'',published:song.published}); window.scrollTo({top:0,behavior:'smooth'}); }
  async function remove(id:string) { if (!supabase || !window.confirm('Delete this song?')) return; const {error}=await supabase.from('songs').delete().eq('id',id); setMessage(error ? error.message : 'Song deleted.'); await loadSongs(); }
  async function logout() { await supabase?.auth.signOut(); setSongs([]); }

  if (!session) return <main className="admin-page"><a className="brand" href="/">SADAT <span>BEIGH</span></a><section className="login-card"><p className="eyebrow">PRIVATE AREA</p><h1>Admin <em>login</em></h1><p className="muted">Sign in to manage your releases.</p><form onSubmit={login} className="stack"><label>Email<input name="email" type="email" autoComplete="username" required placeholder="admin@email.com"/></label><label>Password<input name="password" type="password" autoComplete="current-password" required placeholder="Your password"/></label><button className="primary full" disabled={busy}>{busy?'Signing in…':'Sign in →'}</button></form>{message && <p className="message">{message}</p>}<a className="back" href="/">← Back to website</a></section></main>;

  return <main className="admin-page"><header className="admin-header"><a className="brand" href="/">SADAT <span>BEIGH</span></a><div><span className="muted">{session.user.email}</span><button className="ghost" onClick={logout}>Sign out</button></div></header><section className="admin-content"><p className="eyebrow">CONTROL ROOM</p><h1>Music <em>manager</em></h1><p className="muted">Add a release using its official Spotify, YouTube or SoundCloud URL.</p>
    <form className="song-form" onSubmit={saveSong}><h2>{editing?'Edit release':'Add new release'}</h2><div className="form-grid"><label>Song title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required maxLength={120} placeholder="Song title"/></label><label>Artist name<input value={form.artist} onChange={e=>setForm({...form,artist:e.target.value})} required maxLength={120} placeholder="Artist name"/></label><label>Platform<select value={form.platform} onChange={e=>setForm({...form,platform:e.target.value as Song['platform']})}><option value="youtube">YouTube</option><option value="spotify">Spotify</option><option value="soundcloud">SoundCloud</option></select></label><label>Release date<input type="date" value={form.release_date} onChange={e=>setForm({...form,release_date:e.target.value})}/></label><label className="wide">Music URL<input type="url" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} required placeholder="https://…"/></label><label className="wide">Cover image URL <span className="optional">(optional)</span><input type="url" value={form.cover_url} onChange={e=>setForm({...form,cover_url:e.target.value})} placeholder="https://…/cover.jpg"/></label></div><label className="check"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> Publish on website</label><div className="actions"><button className="primary" disabled={busy}>{busy?'Saving…':editing?'Save changes':'Add release'}</button>{editing&&<button type="button" className="ghost" onClick={()=>{setEditing(null);setForm(empty)}}>Cancel edit</button>}</div>{message&&<p className="message">{message}</p>}</form>
    <div className="manage-list"><div className="section-head"><h2>Your releases</h2><span className="count">{songs.length.toString().padStart(2,'0')} TOTAL</span></div>{songs.length===0?<p className="muted">No songs yet. Add your first release above.</p>:songs.map(song=><article className="manage-row" key={song.id}><div className="manage-title"><strong>{song.title}</strong><span>{song.artist} · {song.platform} · {song.published?'Published':'Draft'}</span></div><button className="ghost" onClick={()=>edit(song)}>Edit</button><button className="danger" onClick={()=>remove(song.id)}>Delete</button></article>)}</div>
    <a className="back" href="/">← View public website</a></section></main>;
}
