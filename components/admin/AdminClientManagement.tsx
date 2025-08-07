'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getClientsWithStats, getAllContent } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import {
    Users,
    Search,
    Eye,
    Download,
    Calendar,
    Store,
    Upload,
    ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Client {
    id: string;
    email: string;
    role: string;
    created_at: string;
    stores?: {
        id: string;
        name: string;
        brand_company: string;
        address: string;
    }[];
    content_count?: number;
    latest_upload?: string;
}

export function AdminClientManagement() {
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const fetchClients = useCallback(async () => {
        try {
            const clientsWithData = await getClientsWithStats();
            setClients(clientsWithData);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const filterClients = useCallback(() => {
        if (!searchTerm) {
            setFilteredClients(clients);
            return;
        }

        const filtered = clients.filter(client =>
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.stores?.some(store =>
                store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.brand_company.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setFilteredClients(filtered);
    }, [clients, searchTerm]);



    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    useEffect(() => {
        filterClients();
    }, [filterClients]);

    const downloadClientData = async (clientId: string, clientEmail: string) => {
        try {
            // Fetch all content and filter by client
            const allContent = await getAllContent();
            const content = allContent.filter(item => item.user_id === clientId);

            // Create CSV data
            const csvData = [
                ['Title', 'Type', 'Store', 'Company', 'Address', 'Start Date', 'End Date', 'Recurrence', 'File URL', 'Upload Date'],
                ...content.map(item => [
                    item.title,
                    item.type,
                    item.stores?.name || '',
                    item.stores?.brand_company || '',
                    item.stores?.address || '',
                    item.start_date,
                    item.end_date,
                    item.recurrence_type,
                    item.file_url,
                    format(new Date(item.created_at), 'yyyy-MM-dd HH:mm:ss')
                ])
            ];

            // Convert to CSV string
            const csvString = csvData.map(row =>
                row.map(field => `"${field}"`).join(',')
            ).join('\n');

            // Download CSV
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `client-data-${clientEmail}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading client data:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8">Loading clients...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search clients by email or store..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="grid gap-4">
                {filteredClients.map(client => (
                    <Card key={client.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{client.email}</h3>
                                        <Badge variant="secondary">Client</Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Joined {format(new Date(client.created_at), 'MMM dd, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Store className="w-4 h-4" />
                                            <span>{client.stores?.length || 0} store{client.stores?.length !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Upload className="w-4 h-4" />
                                            <span>{client.content_count || 0} upload{client.content_count !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>

                                    {client.stores && client.stores.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-sm font-medium text-gray-700 mb-1">Stores:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {client.stores.map(store => (
                                                    <Badge key={store.id} variant="outline" className="text-xs">
                                                        {store.name} ({store.brand_company})
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {client.latest_upload && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Last upload: {format(new Date(client.latest_upload), 'MMM dd, yyyy HH:mm')}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Tooltip content="View client dashboard" variant="dark">
                                        <Link href={`/dashboard?admin_view=${client.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Dashboard
                                            </Button>
                                        </Link>
                                    </Tooltip>

                                    <Tooltip content="Download client data as CSV" variant="dark">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadClientData(client.id, client.email)}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Data
                                        </Button>
                                    </Tooltip>

                                    <Tooltip content="View detailed client information" variant="dark">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => setSelectedClient(client)}
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Details
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredClients.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                    <p className="text-gray-600">
                        {searchTerm ? 'Try adjusting your search terms.' : 'No clients have registered yet.'}
                    </p>
                </div>
            )}

            {/* Client Details Modal */}
            {selectedClient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Client Details
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedClient(null)}
                                >
                                    ×
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <strong>Email:</strong> {selectedClient.email}
                                </div>
                                <div>
                                    <strong>Role:</strong> {selectedClient.role}
                                </div>
                                <div>
                                    <strong>Joined:</strong> {format(new Date(selectedClient.created_at), 'MMM dd, yyyy HH:mm')}
                                </div>
                                <div>
                                    <strong>Total Uploads:</strong> {selectedClient.content_count || 0}
                                </div>
                            </div>

                            {selectedClient.stores && selectedClient.stores.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Stores ({selectedClient.stores.length})</h4>
                                    <div className="space-y-2">
                                        {selectedClient.stores.map(store => (
                                            <div key={store.id} className="p-3 bg-gray-50 rounded">
                                                <div className="font-medium">{store.name}</div>
                                                <div className="text-sm text-gray-600">{store.brand_company}</div>
                                                <div className="text-xs text-gray-500">{store.address}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <Link href={`/dashboard?admin_view=${selectedClient.id}`} className="flex-1">
                                    <Button variant="default" className="w-full">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Dashboard
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    onClick={() => downloadClientData(selectedClient.id, selectedClient.email)}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Data
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
