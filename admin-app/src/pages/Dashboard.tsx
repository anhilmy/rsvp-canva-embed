import { useState, useEffect } from 'react';
import { websiteApi, guestApi, rsvpApi, wishApi, broadcastTemplateApi, fillBroadcastTemplate } from '../api';
import type { Website, Guest, GuestWithRSVP, RSVPStats, Wish, BroadcastTemplate, InvitationStatus } from '../api';

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

interface TemplateModalProps {
    websiteId: string;
    template?: BroadcastTemplate | null;
    onClose: () => void;
    onSave: () => void;
}

function TemplateModal({ websiteId, template, onClose, onSave }: TemplateModalProps) {
    const [form, setForm] = useState({
        name: template?.name || '',
        body: template?.body || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Sample data for preview
    const sampleGuest = {
        name: 'John Doe',
        greeting: 'Bapak',
        link: 'https://example.com/rsvp?code=ABC123',
    };

    const getPreview = () => {
        return form.body
            .replace(/\[to\]/g, sampleGuest.name)
            .replace(/\[greeting\]/g, sampleGuest.greeting)
            .replace(/\[link\]/g, sampleGuest.link);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (template) {
                await broadcastTemplateApi.update(template._id, form);
            } else {
                await broadcastTemplateApi.create(websiteId, form);
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
            <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{template ? 'Edit Template' : 'Create Template'}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="alert alert-error">{error}</div>}
                        <div className="form-group">
                            <label className="form-label">Template Name *</label>
                            <input
                                className="form-input"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Wedding Invitation"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Message Body *</label>
                            <textarea
                                className="form-textarea"
                                style={{ minHeight: '150px', fontFamily: 'monospace' }}
                                value={form.body}
                                onChange={(e) => setForm({ ...form, body: e.target.value })}
                                placeholder="Kepada Yth. [greeting] [to],&#10;&#10;Kami mengundang Anda...&#10;&#10;Link RSVP: [link]"
                                required
                            />
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                <strong>Variables:</strong> [to] = Guest name, [greeting] = Honorific, [link] = RSVP link
                            </p>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Preview</label>
                            <div style={{
                                background: '#f5f5f5',
                                padding: '12px',
                                borderRadius: '4px',
                                whiteSpace: 'pre-wrap',
                                fontSize: '13px',
                                maxHeight: '150px',
                                overflow: 'auto',
                            }}>
                                {getPreview() || 'Enter message body to see preview...'}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function GuestModal({ websiteId, onClose, onSave }: GuestModalProps) {
    const [mode, setMode] = useState<'single' | 'bulk'>('single');
    const [form, setForm] = useState({ name: '', email: '', phone: '', greeting: '', maxAttendees: 1, personalLink: '', label: '' });
    const [bulkText, setBulkText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const parseBulkLine = (line: string) => {
        const parts = line.split(',').map(p => p.trim());
        return {
            name: parts[0],
            email: parts[1] || undefined,
            phone: parts[2] || undefined,
            greeting: parts[3] || undefined,
            maxAttendees: parts[4] ? parseInt(parts[4]) : 1,
            personalLink: parts[5] || undefined,
            label: parts[6] || undefined,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (mode === 'single') {
                await guestApi.create(websiteId, {
                    name: form.name,
                    email: form.email || undefined,
                    phone: form.phone || undefined,
                    greeting: form.greeting || undefined,
                    maxAttendees: form.maxAttendees,
                    personalLink: form.personalLink || undefined,
                    label: form.label || undefined,
                });
            } else {
                const lines = bulkText.split('\n').filter((l) => l.trim());
                const guests = lines.map(parseBulkLine);
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
                                    <label className="form-label">Phone</label>
                                    <input
                                        className="form-input"
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="+628123456789"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Greeting (max 16 chars)</label>
                                    <input
                                        className="form-input"
                                        value={form.greeting}
                                        onChange={(e) => setForm({ ...form, greeting: e.target.value.slice(0, 16) })}
                                        placeholder="Bapak, Ibu, Kakak, etc."
                                        maxLength={16}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Label</label>
                                    <input
                                        className="form-input"
                                        value={form.label}
                                        onChange={(e) => setForm({ ...form, label: e.target.value.slice(0, 50) })}
                                        placeholder="Family, Friends, Work, VIP, etc."
                                        maxLength={50}
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
                                <div className="form-group">
                                    <label className="form-label">Personal Link (optional)</label>
                                    <input
                                        className="form-input"
                                        value={form.personalLink}
                                        onChange={(e) => setForm({ ...form, personalLink: e.target.value })}
                                        placeholder="Custom RSVP link override"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="form-group">
                                <label className="form-label">Guest List (one per line)</label>
                                <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                    Format: name, email, phone, greeting, maxAttendees, personalLink, label<br />
                                    All fields after name are optional.
                                </p>
                                <textarea
                                    className="form-textarea"
                                    style={{ minHeight: '150px' }}
                                    value={bulkText}
                                    onChange={(e) => setBulkText(e.target.value)}
                                    placeholder="John Doe, john@example.com, +628123456789, Bapak, 3, , Family&#10;Jane Smith, jane@example.com, , Ibu, 2, , Friends&#10;Bob Wilson"
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

interface EditGuestModalProps {
    guest: Guest;
    onClose: () => void;
    onSave: () => void;
}

function EditGuestModal({ guest, onClose, onSave }: EditGuestModalProps) {
    const [form, setForm] = useState({
        name: guest.name,
        email: guest.email || '',
        phone: guest.phone || '',
        greeting: guest.greeting || '',
        maxAttendees: guest.maxAttendees,
        personalLink: guest.personalLink || '',
        label: guest.label || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await guestApi.update(guest._id, {
                name: form.name,
                email: form.email || undefined,
                phone: form.phone || undefined,
                greeting: form.greeting || undefined,
                maxAttendees: form.maxAttendees,
                personalLink: form.personalLink || undefined,
                label: form.label || undefined,
            });
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
                    <h3 className="modal-title">Edit Guest</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="alert alert-error">{error}</div>}
                        <div className="form-group">
                            <label className="form-label">Code (cannot be changed)</label>
                            <input
                                className="form-input"
                                value={guest.uniqueCode}
                                disabled
                                style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                        </div>
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
                            <label className="form-label">Phone</label>
                            <input
                                className="form-input"
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="+628123456789"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Greeting (max 16 chars)</label>
                            <input
                                className="form-input"
                                value={form.greeting}
                                onChange={(e) => setForm({ ...form, greeting: e.target.value.slice(0, 16) })}
                                placeholder="Bapak, Ibu, Kakak, etc."
                                maxLength={16}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Label</label>
                            <input
                                className="form-input"
                                value={form.label}
                                onChange={(e) => setForm({ ...form, label: e.target.value.slice(0, 50) })}
                                placeholder="Family, Friends, Work, VIP, etc."
                                maxLength={50}
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
                        <div className="form-group">
                            <label className="form-label">Personal Link (optional)</label>
                            <input
                                className="form-input"
                                value={form.personalLink}
                                onChange={(e) => setForm({ ...form, personalLink: e.target.value })}
                                placeholder="Custom RSVP link override"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
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
    const [activeTab, setActiveTab] = useState<'guests' | 'rsvp' | 'wishes' | 'broadcast'>('guests');
    const [guests, setGuests] = useState<Guest[]>([]);
    const [guestsWithRSVP, setGuestsWithRSVP] = useState<GuestWithRSVP[]>([]);
    const [rsvpStats, setRsvpStats] = useState<RSVPStats | null>(null);
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWebsiteModal, setShowWebsiteModal] = useState(false);
    const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
    const [showGuestModal, setShowGuestModal] = useState(false);

    // Broadcast template state
    const [templates, setTemplates] = useState<BroadcastTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set());
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<BroadcastTemplate | null>(null);
    const [exporting, setExporting] = useState(false);

    // v1.3 state
    const [availableLabels, setAvailableLabels] = useState<string[]>([]);
    const [selectedLabelFilter, setSelectedLabelFilter] = useState<string>('');
    const [showEditGuestModal, setShowEditGuestModal] = useState(false);
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const [selectedWishIds, setSelectedWishIds] = useState<Set<string>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // Load websites
    useEffect(() => {
        loadWebsites();
    }, []);

    // Load data when website changes
    useEffect(() => {
        if (selectedWebsite) {
            loadTabData();
            loadTemplates();
        }
    }, [selectedWebsite, activeTab]);

    // Reload guests when label filter changes
    useEffect(() => {
        if (selectedWebsite && activeTab === 'guests') {
            loadTabData();
        }
    }, [selectedLabelFilter]);

    // Clear selection when website changes
    useEffect(() => {
        setSelectedGuestIds(new Set());
        setSelectedTemplateId('');
        setSelectedLabelFilter('');
        setSelectedWishIds(new Set());
        setAvailableLabels([]);
    }, [selectedWebsite]);

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
                const data = await guestApi.getByWebsite(selectedWebsite._id, 1, 50, selectedLabelFilter || undefined);
                setGuests(data.guests);
                setAvailableLabels(data.labels || []);
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

    const loadTemplates = async () => {
        if (!selectedWebsite) return;
        try {
            const data = await broadcastTemplateApi.getAllByWebsite(selectedWebsite._id);
            setTemplates(data.templates);
        } catch (err) {
            console.error('Failed to load templates:', err);
        }
    };

    const getSelectedTemplate = () => {
        return templates.find(t => t._id === selectedTemplateId);
    };

    const handleCopyBroadcast = async (guest: Guest) => {
        if (!selectedWebsite) return;
        const template = getSelectedTemplate();
        if (!template) {
            alert('Please select a template first');
            return;
        }

        const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
        const filledMessage = fillBroadcastTemplate(template.body, guest, backendUrl, selectedWebsite.publishId);

        try {
            await navigator.clipboard.writeText(filledMessage);

            // Mark invitation as sent
            if (guest.invitationStatus !== 'invitation_sent') {
                try {
                    await guestApi.markInvitationSent(guest._id);
                    // Update local state
                    setGuests(prev => prev.map(g =>
                        g._id === guest._id
                            ? { ...g, invitationStatus: 'invitation_sent' as InvitationStatus, invitationSentAt: new Date().toISOString() }
                            : g
                    ));
                } catch (err) {
                    console.error('Failed to update invitation status:', err);
                }
            }

            alert(`Broadcast message copied for ${guest.name}!`);
        } catch (err) {
            prompt('Copy this message:', filledMessage);
        }
    };

    const handleToggleGuestSelection = (guestId: string) => {
        setSelectedGuestIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(guestId)) {
                newSet.delete(guestId);
            } else {
                newSet.add(guestId);
            }
            return newSet;
        });
    };

    const handleSelectAllGuests = () => {
        if (selectedGuestIds.size === guests.length) {
            setSelectedGuestIds(new Set());
        } else {
            setSelectedGuestIds(new Set(guests.map(g => g._id)));
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

    const handleExportGuests = async () => {
        if (!selectedWebsite || selectedGuestIds.size === 0) return;
        setExporting(true);
        try {
            const blob = await guestApi.exportToExcel(
                selectedWebsite._id,
                Array.from(selectedGuestIds),
                selectedTemplateId || undefined
            );
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `guests-${selectedWebsite.publishId}-${Date.now()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            alert('Failed to export');
        } finally {
            setExporting(false);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('Delete this template?')) return;
        try {
            await broadcastTemplateApi.delete(id);
            loadTemplates();
            if (selectedTemplateId === id) {
                setSelectedTemplateId('');
            }
        } catch (err) {
            alert('Failed to delete');
        }
    };

    // Bulk delete handlers
    const handleBulkDeleteGuests = async () => {
        if (!selectedWebsite || selectedGuestIds.size === 0) return;
        if (!confirm(`Delete ${selectedGuestIds.size} selected guest(s)? This cannot be undone.`)) return;
        setBulkDeleting(true);
        try {
            await guestApi.bulkDelete(selectedWebsite._id, Array.from(selectedGuestIds));
            setSelectedGuestIds(new Set());
            loadTabData();
        } catch (err) {
            alert('Failed to delete guests');
        } finally {
            setBulkDeleting(false);
        }
    };

    const handleBulkDeleteWishes = async () => {
        if (!selectedWebsite || selectedWishIds.size === 0) return;
        if (!confirm(`Delete ${selectedWishIds.size} selected wish(es)? This cannot be undone.`)) return;
        setBulkDeleting(true);
        try {
            await wishApi.bulkDelete(selectedWebsite._id, Array.from(selectedWishIds));
            setSelectedWishIds(new Set());
            loadTabData();
        } catch (err) {
            alert('Failed to delete wishes');
        } finally {
            setBulkDeleting(false);
        }
    };

    const handleToggleWishSelection = (id: string) => {
        setSelectedWishIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAllWishes = () => {
        if (selectedWishIds.size === wishes.length && wishes.length > 0) {
            setSelectedWishIds(new Set());
        } else {
            setSelectedWishIds(new Set(wishes.map(w => w._id)));
        }
    };

    // Edit guest handler
    const handleEditGuest = (guest: Guest) => {
        setEditingGuest(guest);
        setShowEditGuestModal(true);
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
                            <button
                                className={`btn ${activeTab === 'broadcast' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('broadcast')}
                            >
                                Broadcast
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
                                            <div className="flex gap-2 items-center">
                                                <select
                                                    className="form-input"
                                                    style={{ width: 'auto', minWidth: '120px' }}
                                                    value={selectedLabelFilter}
                                                    onChange={(e) => setSelectedLabelFilter(e.target.value)}
                                                >
                                                    <option value="">All Labels</option>
                                                    {availableLabels.map(label => (
                                                        <option key={label} value={label}>{label}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    className="form-input"
                                                    style={{ width: 'auto', minWidth: '200px' }}
                                                    value={selectedTemplateId}
                                                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                                                >
                                                    <option value="">Select Template...</option>
                                                    {templates.map(t => (
                                                        <option key={t._id} value={t._id}>{t.name}</option>
                                                    ))}
                                                </select>
                                                <button className="btn btn-primary" onClick={() => setShowGuestModal(true)}>
                                                    + Add Guest
                                                </button>
                                            </div>
                                        </div>
                                        {guests.length === 0 ? (
                                            <div className="empty-state">No guests yet</div>
                                        ) : (
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '40px' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedGuestIds.size === guests.length && guests.length > 0}
                                                                onChange={handleSelectAllGuests}
                                                            />
                                                        </th>
                                                        <th>Name</th>
                                                        <th>Phone</th>
                                                        <th>Label</th>
                                                        <th>Greeting</th>
                                                        <th>Status</th>
                                                        <th>Type</th>
                                                        <th>Code</th>
                                                        <th>Max</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {guests.map((g) => (
                                                        <tr key={g._id}>
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedGuestIds.has(g._id)}
                                                                    onChange={() => handleToggleGuestSelection(g._id)}
                                                                />
                                                            </td>
                                                            <td>{g.name}</td>
                                                            <td>{g.phone || '-'}</td>
                                                            <td>
                                                                {g.label ? (
                                                                    <span className="badge badge-info">{g.label}</span>
                                                                ) : '-'}
                                                            </td>
                                                            <td>{g.greeting || '-'}</td>
                                                            <td>
                                                                <span
                                                                    className={`badge ${g.invitationStatus === 'invitation_sent' ? 'badge-success' : 'badge-gray'}`}
                                                                    title={g.invitationSentAt ? `Sent: ${new Date(g.invitationSentAt).toLocaleString()}` : ''}
                                                                >
                                                                    {g.invitationStatus === 'invitation_sent' ? 'Sent' : 'Created'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${g.isManual ? 'badge-warning' : 'badge-success'}`}>
                                                                    {g.isManual ? 'Walk-in' : 'Invited'}
                                                                </span>
                                                            </td>
                                                            <td><code>{g.uniqueCode}</code></td>
                                                            <td>{g.maxAttendees}</td>
                                                            <td>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        className="btn btn-sm btn-secondary"
                                                                        onClick={() => handleEditGuest(g)}
                                                                        title="Edit guest"
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                    {!g.isManual && (
                                                                        <button
                                                                            className="btn btn-sm btn-secondary"
                                                                            onClick={() => handleShareGuest(g)}
                                                                            title="Copy shareable RSVP link"
                                                                        >
                                                                            📤
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        className="btn btn-sm btn-secondary"
                                                                        onClick={() => handleCopyBroadcast(g)}
                                                                        title={selectedTemplateId ? 'Copy broadcast message' : 'Select a template first'}
                                                                        disabled={!selectedTemplateId}
                                                                    >
                                                                        📋
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-danger"
                                                                        onClick={() => handleDeleteGuest(g._id)}
                                                                        title="Delete guest"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                        {selectedGuestIds.size > 0 && (
                                            <div style={{ padding: '12px', borderTop: '1px solid #eee', background: '#f9f9f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span>{selectedGuestIds.size} guest(s) selected</span>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={handleBulkDeleteGuests}
                                                    disabled={bulkDeleting}
                                                >
                                                    {bulkDeleting ? 'Deleting...' : `🗑️ Delete Selected (${selectedGuestIds.size})`}
                                                </button>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={handleExportGuests}
                                                    disabled={exporting}
                                                >
                                                    {exporting ? 'Exporting...' : `📥 Export Selected (${selectedGuestIds.size})`}
                                                </button>
                                            </div>
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
                                        <div className="card-header">
                                            <h3 className="card-title">Wishes ({wishes.length})</h3>
                                            {selectedWishIds.size > 0 && (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={handleBulkDeleteWishes}
                                                    disabled={bulkDeleting}
                                                >
                                                    {bulkDeleting ? 'Deleting...' : `🗑️ Delete Selected (${selectedWishIds.size})`}
                                                </button>
                                            )}
                                        </div>
                                        {wishes.length === 0 ? (
                                            <div className="empty-state">No wishes yet</div>
                                        ) : (
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '40px' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedWishIds.size === wishes.length && wishes.length > 0}
                                                                onChange={handleSelectAllWishes}
                                                            />
                                                        </th>
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
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedWishIds.has(w._id)}
                                                                    onChange={() => handleToggleWishSelection(w._id)}
                                                                />
                                                            </td>
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

                                {activeTab === 'broadcast' && (
                                    <div className="card">
                                        <div className="card-header">
                                            <h3 className="card-title">Broadcast Templates ({templates.length})</h3>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => {
                                                    setEditingTemplate(null);
                                                    setShowTemplateModal(true);
                                                }}
                                            >
                                                + Create Template
                                            </button>
                                        </div>
                                        {templates.length === 0 ? (
                                            <div className="empty-state">
                                                <p>No templates yet</p>
                                                <p style={{ fontSize: '14px', color: '#666' }}>
                                                    Create a broadcast template to send personalized messages to your guests.
                                                </p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gap: '16px', padding: '16px' }}>
                                                {templates.map((t) => (
                                                    <div
                                                        key={t._id}
                                                        style={{
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '8px',
                                                            padding: '16px',
                                                            background: '#fff',
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                            <h4 style={{ margin: 0, fontSize: '16px' }}>{t.name}</h4>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-secondary"
                                                                    onClick={() => {
                                                                        setEditingTemplate(t);
                                                                        setShowTemplateModal(true);
                                                                    }}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDeleteTemplate(t._id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div
                                                            style={{
                                                                background: '#f5f5f5',
                                                                padding: '12px',
                                                                borderRadius: '4px',
                                                                whiteSpace: 'pre-wrap',
                                                                fontSize: '13px',
                                                                maxHeight: '150px',
                                                                overflow: 'auto',
                                                            }}
                                                        >
                                                            {t.body}
                                                        </div>
                                                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                                                            Created: {new Date(t.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
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

            {showTemplateModal && selectedWebsite && (
                <TemplateModal
                    websiteId={selectedWebsite._id}
                    template={editingTemplate}
                    onClose={() => {
                        setShowTemplateModal(false);
                        setEditingTemplate(null);
                    }}
                    onSave={() => {
                        setShowTemplateModal(false);
                        setEditingTemplate(null);
                        loadTemplates();
                    }}
                />
            )}

            {showEditGuestModal && editingGuest && (
                <EditGuestModal
                    guest={editingGuest}
                    onClose={() => {
                        setShowEditGuestModal(false);
                        setEditingGuest(null);
                    }}
                    onSave={() => {
                        setShowEditGuestModal(false);
                        setEditingGuest(null);
                        loadTabData();
                    }}
                />
            )}
        </div>
    );
}
