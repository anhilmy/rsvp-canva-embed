import { useState, useEffect } from 'react';
import { websiteApi, guestApi, rsvpApi, wishApi } from '../api';
import type { Website, Guest, GuestWithRSVP, RSVPStats, Wish } from '../api';

interface WebsiteModalProps {
    website?: Website | null;
    onClose: () => void;
    onSave: () => void;
}

function WebsiteModal({ website, onClose, onSave }: WebsiteModalProps) {
    const [form, setForm] = useState({
        publishId: website?.publishId || '',
        name: website?.name || '',
        description: website?.description || '',
        eventDate: website?.eventDate?.split('T')[0] || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (website) {
                await websiteApi.update(website._id, form);
            } else {
                await websiteApi.create(form);
            }
            onSave();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{website ? 'Edit Website' : 'Add Website'}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="alert alert-error">{error}</div>}
                        <div className="form-group">
                            <label className="form-label">Publish ID *</label>
                            <input
                                className="form-input"
                                value={form.publishId}
                                onChange={(e) => setForm({ ...form, publishId: e.target.value })}
                                placeholder="my-wedding"
                                disabled={!!website}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Event Name *</label>
                            <input
                                className="form-input"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="John & Jane's Wedding"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Event Date</label>
                            <input
                                className="form-input"
                                type="date"
                                value={form.eventDate}
                                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-textarea"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Optional description..."
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface GuestModalProps {
    websiteId: string;
    onClose: () => void;
    onSave: () => void;
}

function GuestModal({ websiteId, onClose, onSave }: GuestModalProps) {
    const [mode, setMode] = useState<'single' | 'bulk'>('single');
    const [form, setForm] = useState({ name: '', email: '', maxAttendees: 1 });
    const [bulkText, setBulkText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (mode === 'single') {
                await guestApi.create(websiteId, form);
            } else {
                const lines = bulkText.split('\n').filter((l) => l.trim());
                const guests = lines.map((line) => {
                    const [name, email] = line.split(',').map((s) => s.trim());
                    return { name, email: email || undefined, maxAttendees: 1 };
                });
                await guestApi.createBulk(websiteId, guests);
            }
            onSave();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Add Guests</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="alert alert-error">{error}</div>}
                        <div className="flex gap-2 mb-2">
                            <button
                                type="button"
                                className={`btn btn-sm ${mode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setMode('single')}
                            >
                                Single
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm ${mode === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setMode('bulk')}
                            >
                                Bulk Import
                            </button>
                        </div>
                        {mode === 'single' ? (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Name *</label>
                                    <input
                                        className="form-input"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        className="form-input"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Max Attendees</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={form.maxAttendees}
                                        onChange={(e) => setForm({ ...form, maxAttendees: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="form-group">
                                <label className="form-label">Guest List (one per line: name, email)</label>
                                <textarea
                                    className="form-textarea"
                                    style={{ minHeight: '150px' }}
                                    value={bulkText}
                                    onChange={(e) => setBulkText(e.target.value)}
                                    placeholder="John Doe, john@example.com&#10;Jane Smith&#10;Bob Wilson, bob@example.com"
                                />
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [websites, setWebsites] = useState<Website[]>([]);
    const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
    const [activeTab, setActiveTab] = useState<'guests' | 'rsvp' | 'wishes'>('guests');
    const [guests, setGuests] = useState<Guest[]>([]);
    const [guestsWithRSVP, setGuestsWithRSVP] = useState<GuestWithRSVP[]>([]);
    const [rsvpStats, setRsvpStats] = useState<RSVPStats | null>(null);
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWebsiteModal, setShowWebsiteModal] = useState(false);
    const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
    const [showGuestModal, setShowGuestModal] = useState(false);

    // Load websites
    useEffect(() => {
        loadWebsites();
    }, []);

    // Load data when website changes
    useEffect(() => {
        if (selectedWebsite) {
            loadTabData();
        }
    }, [selectedWebsite, activeTab]);

    const loadWebsites = async () => {
        try {
            const data = await websiteApi.getAll();
            setWebsites(data.websites);
            if (data.websites.length > 0 && !selectedWebsite) {
                setSelectedWebsite(data.websites[0]);
            }
        } catch (err) {
            console.error('Failed to load websites:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadTabData = async () => {
        if (!selectedWebsite) return;
        setLoading(true);
        try {
            if (activeTab === 'guests') {
                const data = await guestApi.getByWebsite(selectedWebsite._id);
                setGuests(data.guests);
            } else if (activeTab === 'rsvp') {
                const data = await rsvpApi.getGuestStatus(selectedWebsite._id);
                setGuestsWithRSVP(data.guests);
                setRsvpStats(data.stats);
            } else if (activeTab === 'wishes') {
                const data = await wishApi.getByWebsite(selectedWebsite._id);
                setWishes(data.wishes);
            }
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWebsite = async (id: string) => {
        if (!confirm('Delete this website and all its data?')) return;
        try {
            await websiteApi.delete(id);
            loadWebsites();
            if (selectedWebsite?._id === id) {
                setSelectedWebsite(null);
            }
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleDeleteGuest = async (id: string) => {
        if (!confirm('Delete this guest?')) return;
        try {
            await guestApi.delete(id);
            loadTabData();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleShareGuest = async (guest: Guest) => {
        if (!selectedWebsite) return;

        // Build shareable URL with guest code and name
        const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
        const shareUrl = `${backendUrl}/api/embed/form/${selectedWebsite.publishId}?code=${guest.uniqueCode}&name=${encodeURIComponent(guest.name)}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            alert(`Link copied!\n\nShare this with ${guest.name}:\n${shareUrl}`);
        } catch (err) {
            // Fallback for browsers that don't support clipboard API
            prompt('Copy this link to share:', shareUrl);
        }
    };

    const handleToggleWishApproval = async (id: string) => {
        try {
            await wishApi.toggleApproval(id);
            loadTabData();
        } catch (err) {
            alert('Failed to update');
        }
    };

    const handleDeleteWish = async (id: string) => {
        if (!confirm('Delete this wish?')) return;
        try {
            await wishApi.delete(id);
            loadTabData();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="app">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>RSVP & Wishes</h1>
                    <p>Admin Dashboard</p>
                </div>
                <ul className="sidebar-nav">
                    {websites.map((w) => (
                        <li key={w._id}>
                            <a
                                href="#"
                                className={selectedWebsite?._id === w._id ? 'active' : ''}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedWebsite(w);
                                }}
                            >
                                {w.name}
                            </a>
                        </li>
                    ))}
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setEditingWebsite(null);
                                setShowWebsiteModal(true);
                            }}
                            style={{ color: 'var(--primary)' }}
                        >
                            + Add Website
                        </a>
                    </li>
                </ul>
            </aside>

            <main className="main-content">
                {!selectedWebsite ? (
                    <div className="empty-state">
                        <h3>No website selected</h3>
                        <p>Select or create a website to get started</p>
                    </div>
                ) : (
                    <>
                        <div className="page-header flex justify-between items-center">
                            <div>
                                <h1 className="page-title">{selectedWebsite.name}</h1>
                                <p className="page-subtitle">
                                    {selectedWebsite.publishId}.canva.site
                                    {selectedWebsite.eventDate && ` • ${new Date(selectedWebsite.eventDate).toLocaleDateString()}`}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setEditingWebsite(selectedWebsite);
                                        setShowWebsiteModal(true);
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDeleteWebsite(selectedWebsite._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-2">
                            <button
                                className={`btn ${activeTab === 'guests' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('guests')}
                            >
                                Guests
                            </button>
                            <button
                                className={`btn ${activeTab === 'rsvp' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('rsvp')}
                            >
                                RSVPs
                            </button>
                            <button
                                className={`btn ${activeTab === 'wishes' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('wishes')}
                            >
                                Wishes
                            </button>
                        </div>

                        {loading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <>
                                {activeTab === 'guests' && (
                                    <div className="card">
                                        <div className="card-header">
                                            <h3 className="card-title">Guests ({guests.length})</h3>
                                            <button className="btn btn-primary" onClick={() => setShowGuestModal(true)}>
                                                + Add Guest
                                            </button>
                                        </div>
                                        {guests.length === 0 ? (
                                            <div className="empty-state">No guests yet</div>
                                        ) : (
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Type</th>
                                                        <th>Code</th>
                                                        <th>Max Guests</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {guests.map((g) => (
                                                        <tr key={g._id}>
                                                            <td>{g.name}</td>
                                                            <td>
                                                                <span className={`badge ${g.isManual ? 'badge-warning' : 'badge-success'}`}>
                                                                    {g.isManual ? 'Walk-in' : 'Invited'}
                                                                </span>
                                                            </td>
                                                            <td><code>{g.uniqueCode}</code></td>
                                                            <td>{g.maxAttendees}</td>
                                                            <td>
                                                                <div className="flex gap-2">
                                                                    {!g.isManual && (
                                                                        <button
                                                                            className="btn btn-sm btn-secondary"
                                                                            onClick={() => handleShareGuest(g)}
                                                                            title="Copy shareable RSVP link"
                                                                        >
                                                                            Share
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        className="btn btn-sm btn-danger"
                                                                        onClick={() => handleDeleteGuest(g._id)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'rsvp' && (
                                    <>
                                        {rsvpStats && (
                                            <div className="stats-grid">
                                                <div className="stat-card">
                                                    <div className="stat-label">Total Guests</div>
                                                    <div className="stat-value">{rsvpStats.total}</div>
                                                </div>
                                                <div className="stat-card">
                                                    <div className="stat-label">Attending</div>
                                                    <div className="stat-value success">{rsvpStats.attending}</div>
                                                </div>
                                                <div className="stat-card">
                                                    <div className="stat-label">Not Attending</div>
                                                    <div className="stat-value danger">{rsvpStats.notAttending}</div>
                                                </div>
                                                <div className="stat-card">
                                                    <div className="stat-label">Maybe</div>
                                                    <div className="stat-value warning">{rsvpStats.maybe}</div>
                                                </div>
                                                <div className="stat-card">
                                                    <div className="stat-label">Pending</div>
                                                    <div className="stat-value">{rsvpStats.pending}</div>
                                                </div>
                                                <div className="stat-card">
                                                    <div className="stat-label">Total Attendees</div>
                                                    <div className="stat-value success">{rsvpStats.totalAttendees}</div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="card">
                                            <h3 className="card-title mb-2">RSVP Status</h3>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Guest</th>
                                                        <th>Type</th>
                                                        <th>Status</th>
                                                        <th>Attendees</th>
                                                        <th>Submitted</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {guestsWithRSVP.map((g) => (
                                                        <tr key={g._id}>
                                                            <td>{g.name}</td>
                                                            <td>
                                                                <span className={`badge ${g.isManual ? 'badge-warning' : 'badge-success'}`}>
                                                                    {g.isManual ? 'Walk-in' : 'Invited'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {g.rsvp ? (
                                                                    <span className={`badge badge-${g.rsvp.status === 'attending' ? 'success' :
                                                                        g.rsvp.status === 'not_attending' ? 'danger' : 'warning'
                                                                        }`}>
                                                                        {g.rsvp.status === 'attending' ? 'Attending' :
                                                                            g.rsvp.status === 'not_attending' ? 'Not Attending' : 'Maybe'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="badge badge-gray">Pending</span>
                                                                )}
                                                            </td>
                                                            <td>{g.rsvp?.attendeeCount || '-'}</td>
                                                            <td>
                                                                {g.rsvp?.submittedAt
                                                                    ? new Date(g.rsvp.submittedAt).toLocaleDateString()
                                                                    : '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'wishes' && (
                                    <div className="card">
                                        <h3 className="card-title mb-2">Wishes ({wishes.length})</h3>
                                        {wishes.length === 0 ? (
                                            <div className="empty-state">No wishes yet</div>
                                        ) : (
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>From</th>
                                                        <th>Message</th>
                                                        <th>Status</th>
                                                        <th>Date</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {wishes.map((w) => (
                                                        <tr key={w._id}>
                                                            <td>{w.guestName}</td>
                                                            <td style={{ maxWidth: '300px' }}>{w.message}</td>
                                                            <td>
                                                                <span className={`badge ${w.isApproved ? 'badge-success' : 'badge-warning'}`}>
                                                                    {w.isApproved ? 'Approved' : 'Pending'}
                                                                </span>
                                                            </td>
                                                            <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                                                            <td>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        className="btn btn-sm btn-secondary"
                                                                        onClick={() => handleToggleWishApproval(w._id)}
                                                                    >
                                                                        {w.isApproved ? 'Unapprove' : 'Approve'}
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-danger"
                                                                        onClick={() => handleDeleteWish(w._id)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>

            {showWebsiteModal && (
                <WebsiteModal
                    website={editingWebsite}
                    onClose={() => {
                        setShowWebsiteModal(false);
                        setEditingWebsite(null);
                    }}
                    onSave={() => {
                        setShowWebsiteModal(false);
                        setEditingWebsite(null);
                        loadWebsites();
                    }}
                />
            )}

            {showGuestModal && selectedWebsite && (
                <GuestModal
                    websiteId={selectedWebsite._id}
                    onClose={() => setShowGuestModal(false)}
                    onSave={() => {
                        setShowGuestModal(false);
                        loadTabData();
                    }}
                />
            )}
        </div>
    );
}
