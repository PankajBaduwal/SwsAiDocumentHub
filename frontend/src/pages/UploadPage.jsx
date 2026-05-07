import { useState, useRef } from 'react';
import axios from 'axios';
import './UploadPage.css';

export default function UploadPage() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [bulkBanner, setBulkBanner] = useState('');
    const [toast, setToast] = useState('');
    const inputRef = useRef();

    const handleFiles = (selected) => {
        const arr = Array.from(selected).map(f => ({
            file: f, id: Math.random().toString(36).slice(2),
            progress: 0, status: 'pending'
        }));
        setFiles(prev => [...prev, ...arr]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        const pending = files.filter(f => f.status === 'pending');
        if (pending.length === 0) return;

        setUploading(true);
        const isBulk = pending.length > 3;

        if (isBulk) setBulkBanner(`Upload in progress — processing ${pending.length} files in background.`);

        const formData = new FormData();
        pending.forEach(f => formData.append('files', f.file));

        // Update status to uploading
        setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'uploading' } : f));

        try {
            await axios.post('http://localhost:5000/api/documents/upload', formData, {
                onUploadProgress: (e) => {
                    const pct = Math.round((e.loaded / e.total) * 100);
                    setFiles(prev => prev.map(f =>
                        f.status === 'uploading' ? { ...f, progress: pct } : f
                    ));
                }
            });

            setFiles(prev => prev.map(f =>
                f.status === 'uploading' ? { ...f, status: 'complete', progress: 100 } : f
            ));

            if (!isBulk) {
                setToast(`${pending.length} file(s) uploaded successfully!`);
                setTimeout(() => setToast(''), 3000);
            }
            setBulkBanner('');
        } catch (err) {
            setFiles(prev => prev.map(f =>
                f.status === 'uploading' ? { ...f, status: 'failed' } : f
            ));
        }
        setUploading(false);
    };

    const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));
    const clearAll = () => setFiles([]);

    const fmt = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

    return (
        <div className="upload-page">
            <h1 className="page-title">Upload Documents</h1>
            <p className="page-sub">Upload company PDF documents. Supports single or bulk upload.</p>

            {bulkBanner && <div className="bulk-banner">⏳ {bulkBanner}</div>}
            {toast && <div className="toast">✅ {toast}</div>}

            {/* Drop Zone */}
            <div className="dropzone" onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => inputRef.current.click()}>
                <input ref={inputRef} type="file" accept=".pdf" multiple hidden onChange={e => handleFiles(e.target.files)} />
                <div className="drop-icon">📂</div>
                <p>Drag & drop PDF files here, or <span className="link">click to browse</span></p>
                <p className="drop-sub">Supports multiple files · PDF only · Max 50MB each</p>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="file-list">
                    <div className="file-list-header">
                        <span>{files.length} file(s) selected</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-outline" onClick={clearAll}>Clear All</button>
                            <button className="btn-primary" onClick={handleUpload} disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Upload All'}
                            </button>
                        </div>
                    </div>

                    {files.map(f => (
                        <div key={f.id} className="file-row">
                            <div className="file-info">
                                <span className="file-icon">📄</span>
                                <div>
                                    <p className="file-name">{f.file.name}</p>
                                    <p className="file-meta">{fmt(f.file.size)} · PDF</p>
                                </div>
                            </div>
                            <div className="file-right">
                                <span className={`status-badge ${f.status}`}>{f.status}</span>
                                {f.status !== 'pending' && (
                                    <div className="progress-wrap">
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${f.progress}%`, background: f.status === 'failed' ? 'var(--error)' : f.status === 'complete' ? 'var(--success)' : 'var(--primary)' }} />
                                        </div>
                                        <span className="progress-pct">{f.progress}%</span>
                                    </div>
                                )}
                                {f.status === 'pending' && (
                                    <button className="remove-btn" onClick={() => removeFile(f.id)}>✕</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}