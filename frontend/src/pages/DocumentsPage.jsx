import { useState, useEffect } from 'react';
import axios from 'axios';
import './DocumentsPage.css';

export default function DocumentsPage() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDocs = async () => {
        const res = await axios.get('http://localhost:5000/api/documents');
        setDocs(res.data);
        setLoading(false);
    };

    useEffect(() => { fetchDocs(); }, []);

    const deleteDoc = async (id) => {
        if (!confirm('Delete this document?')) return;
        await axios.delete(`http://localhost:5000/api/documents/${id}`);
        setDocs(prev => prev.filter(d => d._id !== id));
    };

    const fmt = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div>
            <h1 className="page-title">All Documents</h1>
            <p className="page-sub">{docs.length} document(s) uploaded</p>

            {loading && <div className="loader">Loading...</div>}

            {!loading && docs.length === 0 && (
                <div className="empty-state">
                    <div style={{ fontSize: '3rem' }}>📭</div>
                    <p>No documents uploaded yet. <a href="/">Upload some PDFs</a></p>
                </div>
            )}

            {docs.length > 0 && (
                <table className="doc-table">
                    <thead>
                        <tr><th>Name</th><th>Size</th><th>Uploaded</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {docs.map(d => (
                            <tr key={d._id}>
                                <td><span className="doc-name">📄 {d.originalName}</span></td>
                                <td>{fmt(d.size)}</td>
                                <td>{fmtDate(d.uploadedAt)}</td>
                                <td><span className="status-badge complete">{d.status}</span></td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <a href={`http://localhost:5000/uploads/${d.name}`} target="_blank" rel="noreferrer" className="action-btn download">⬇ Download</a>
                                        <button className="action-btn delete" onClick={() => deleteDoc(d._id)}>🗑 Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}