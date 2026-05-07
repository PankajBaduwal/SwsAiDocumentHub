import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import './UploadPage.css';

const API = 'http://localhost:5000';

const fmt = (bytes) =>
    bytes < 1024 * 1024
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const fmtDate = (d) =>
    new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function UploadPage() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [bulkBanner, setBulkBanner] = useState('');
    const [toast, setToast] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [docs, setDocs] = useState([]);
    const [docsLoading, setDocsLoading] = useState(true);
    const inputRef = useRef();

    const fetchDocs = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/api/documents`);
            setDocs(res.data);
        } catch (_) {}
        setDocsLoading(false);
    }, []);

    useEffect(() => { fetchDocs(); }, [fetchDocs]);

    const handleFiles = (selected) => {
        const arr = Array.from(selected).map(f => ({
            file: f,
            id: Math.random().toString(36).slice(2),
            progress: 0,
            status: 'pending',
        }));
        setFiles(prev => [...prev, ...arr]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleUpload = async () => {
        const pending = files.filter(f => f.status === 'pending');
        if (pending.length === 0) return;

        setUploading(true);
        const isBulk = pending.length > 3;

        if (isBulk) {
            setBulkBanner(`Upload in progress — processing ${pending.length} files in background.`);
        }

        // Mark as uploading
        setFiles(prev =>
            prev.map(f => f.status === 'pending' ? { ...f, status: 'uploading' } : f)
        );

        // Upload each file individually so we get per-file progress
        const results = await Promise.allSettled(
            pending.map(item =>
                axios.post(`${API}/api/documents/upload`, (() => {
                    const fd = new FormData();
                    fd.append('files', item.file);
                    return fd;
                })(), {
                    onUploadProgress: (e) => {
                        const pct = Math.round((e.loaded / e.total) * 100);
                        setFiles(prev =>
                            prev.map(f => f.id === item.id ? { ...f, progress: pct } : f)
                        );
                    },
                })
            )
        );

        results.forEach((result, idx) => {
            const id = pending[idx].id;
            setFiles(prev =>
                prev.map(f =>
                    f.id === id
                        ? { ...f, status: result.status === 'fulfilled' ? 'complete' : 'failed', progress: result.status === 'fulfilled' ? 100 : f.progress }
                        : f
                )
            );
        });

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        setBulkBanner('');

        if (successCount > 0) {
            if (!isBulk) {
                setToast(`${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully!`);
                setTimeout(() => setToast(''), 4000);
            }
            await fetchDocs();
        }

        setUploading(false);
    };

    const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

    const clearCompleted = () =>
        setFiles(prev => prev.filter(f => f.status === 'pending' || f.status === 'uploading'));

    const deleteDoc = async (id) => {
        if (!window.confirm('Delete this document?')) return;
        await axios.delete(`${API}/api/documents/${id}`);
        setDocs(prev => prev.filter(d => d._id !== id));
    };

    const pendingCount = files.filter(f => f.status === 'pending').length;

    return (
        <div className="upload-page">

            {/* Info Banner */}
            <div className="info-banner">
                <svg className="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>
                    Upload <strong>1–3 files</strong> to see individual per-file progress bars.
                    Upload <strong>4 or more files</strong> to trigger the bulk notification flow.
                </p>
            </div>

            {/* Bulk banner */}
            {bulkBanner && (
                <div className="bulk-banner">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {bulkBanner}
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="toast-banner">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {toast}
                </div>
            )}

            {/* Dropzone */}
            <div
                className={`dropzone ${dragOver ? 'drag-over' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => inputRef.current.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    hidden
                    onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
                />
                <div className="drop-icon-wrap">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                </div>
                <p className="drop-title">Drop files here or click to browse</p>
                <p className="drop-sub">PDF only · Up to 50 MB per file</p>
                <div className="drop-pills">
                    <span className="pill">Single file</span>
                    <span className="pill">Bulk upload</span>
                    <span className="pill pill-primary">Try 4+ files to trigger notifications</span>
                </div>
            </div>

            {/* Upload Queue */}
            {files.length > 0 && (
                <div className="queue-section">
                    <div className="queue-header">
                        <span className="queue-title">Upload Queue</span>
                        <button className="clear-btn" onClick={clearCompleted}>Clear all</button>
                    </div>

                    <div className="queue-list">
                        {files.map(f => (
                            <div key={f.id} className={`queue-card ${f.status}`}>
                                {/* Status icon */}
                                <div className={`q-icon ${f.status}`}>
                                    {f.status === 'complete' ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    ) : f.status === 'failed' ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    ) : f.status === 'uploading' ? (
                                        <span className="spinner" />
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                    )}
                                </div>

                                {/* File info */}
                                <div className="q-info">
                                    <span className="q-name">{f.file.name}</span>
                                    <span className="q-sub">
                                        {f.status === 'complete' ? (
                                            <span className="q-status-text complete">Upload complete</span>
                                        ) : f.status === 'failed' ? (
                                            <span className="q-status-text failed">Upload failed</span>
                                        ) : f.status === 'uploading' ? (
                                            <span className="q-status-text uploading">Uploading… {f.progress}%</span>
                                        ) : (
                                            <span className="q-status-text pending">Ready to upload</span>
                                        )}
                                    </span>
                                    {f.status === 'uploading' && (
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${f.progress}%` }} />
                                        </div>
                                    )}
                                </div>

                                {/* Size + dismiss */}
                                <div className="q-right">
                                    <span className="q-size">{fmt(f.file.size)}</span>
                                    {(f.status === 'pending' || f.status === 'complete' || f.status === 'failed') && (
                                        <button className="dismiss-btn" onClick={() => removeFile(f.id)}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {pendingCount > 0 && !uploading && (
                        <div className="queue-actions">
                            <button className="btn-primary" onClick={handleUpload}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="16 16 12 12 8 16"/>
                                    <line x1="12" y1="12" x2="12" y2="21"/>
                                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                                </svg>
                                Upload {pendingCount} file{pendingCount !== 1 ? 's' : ''}
                            </button>
                        </div>
                    )}

                    {uploading && (
                        <div className="queue-actions">
                            <button className="btn-primary" disabled>
                                <span className="spinner spinner-sm" />
                                Uploading…
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Document Library */}
            <div className="library-section">
                <div className="library-header">
                    <span className="library-title">Document Library</span>
                    {docs.length > 0 && (
                        <span className="library-count">{docs.length} document{docs.length !== 1 ? 's' : ''}</span>
                    )}
                </div>

                {docsLoading ? (
                    <div className="lib-loading">
                        <span className="spinner" />
                        <span>Loading documents…</span>
                    </div>
                ) : docs.length === 0 ? (
                    <div className="lib-empty">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                        <p>No documents yet</p>
                        <span>Upload files above — they'll appear here once complete</span>
                    </div>
                ) : (
                    <table className="doc-table">
                        <thead>
                            <tr>
                                <th>NAME</th>
                                <th>SIZE</th>
                                <th>UPLOADED AT</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {docs.map(d => (
                                <tr key={d._id}>
                                    <td>
                                        <div className="doc-name-cell">
                                            <div className="doc-file-icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                    <polyline points="14 2 14 8 20 8"/>
                                                </svg>
                                            </div>
                                            <span className="doc-name-text">{d.originalName}</span>
                                        </div>
                                    </td>
                                    <td className="doc-size">{fmt(d.size)}</td>
                                    <td className="doc-date">{fmtDate(d.uploadedAt)}</td>
                                    <td>
                                        <div className="doc-actions">
                                            <a
                                                href={`${API}/uploads/${d.name}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="icon-btn download-btn"
                                                title="Download"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                    <polyline points="7 10 12 15 17 10"/>
                                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                                </svg>
                                            </a>
                                            <button
                                                className="icon-btn delete-btn"
                                                title="Delete"
                                                onClick={() => deleteDoc(d._id)}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                                    <path d="M10 11v6M14 11v6"/>
                                                    <path d="M9 6V4h6v2"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}