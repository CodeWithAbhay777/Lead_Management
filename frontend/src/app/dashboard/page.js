'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { leadsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PlusCircle, 
  Search, 
  LogOut, 
  Phone, 
  MapPin, 
  Globe, 
  Pencil, 
  Trash2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, byNiche: [], byStatus: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const LEADS_PER_PAGE = 50;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    } else if (isAuthenticated) {
      fetchLeads();
      fetchStats();
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [currentPage, nicheFilter, statusFilter, searchTerm]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getAll({
        page: currentPage,
        limit: LEADS_PER_PAGE,
        niche: nicheFilter,
        status: statusFilter,
        search: searchTerm
      });
      setLeads(response.leads || []);
      setTotalPages(response.totalPages || 1);
      setTotalLeads(response.total || 0);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await leadsAPI.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await leadsAPI.delete(id);
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Failed to delete lead');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setNicheFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getNicheBadgeColor = (niche) => {
    const colors = {
      coaching: 'bg-blue-100 text-blue-800',
      clinic: 'bg-green-100 text-green-800',
      restaurant: 'bg-orange-100 text-orange-800',
      retail: 'bg-purple-100 text-purple-800',
      service: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[niche] || colors.other;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'not-contacted': 'bg-gray-100 text-gray-800',
      'contacted': 'bg-blue-100 text-blue-800',
      'interested': 'bg-yellow-100 text-yellow-800',
      'not-interested': 'bg-red-100 text-red-800',
      'converted': 'bg-green-100 text-green-800'
    };
    return colors[status] || colors['not-contacted'];
  };

  if (isLoading || (loading && currentPage === 1)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lead Dashboard</h1>
            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={() => router.push('/dashboard/add-lead')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 text-sm"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Lead</span>
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Leads</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-2xl sm:text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Converted</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {stats.byStatus?.find(s => s._id === 'converted')?.count || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Current Page</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{currentPage}/{totalPages}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Showing</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{leads.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Select 
                  value={nicheFilter} 
                  onChange={(e) => {
                    setNicheFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 sm:h-11 text-sm sm:text-base"
                >
                  <option value="all">All Niches</option>
                  <option value="coaching">Coaching</option>
                  <option value="clinic">Clinic</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="retail">Retail</option>
                  <option value="service">Service</option>
                  <option value="other">Other</option>
                </Select>
                <Select 
                  value={statusFilter} 
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 sm:h-11 text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="not-contacted">Not Contacted</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="not-interested">Not Interested</option>
                  <option value="converted">Converted</option>
                </Select>
                {(searchTerm || nicheFilter !== 'all' || statusFilter !== 'all') && (
                  <Button 
                    onClick={clearFilters} 
                    variant="outline" 
                    className="h-10 sm:h-11 text-sm sm:text-base whitespace-nowrap"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-gray-600 text-sm">Loading leads...</p>
          </div>
        )}

        {/* Leads Grid */}
        {!loading && leads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center px-4">
              <p className="text-gray-500 mb-4 text-sm sm:text-base">No leads found.</p>
              <Button onClick={() => router.push('/dashboard/add-lead')} className="text-sm sm:text-base">
                Add Your First Lead
              </Button>
            </CardContent>
          </Card>
        ) : !loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {leads.map((lead) => (
                <Card key={lead._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg mb-2 truncate">{lead.businessOwnerName}</CardTitle>
                        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getNicheBadgeColor(lead.niche)}`}>
                            {lead.niche}
                          </span>
                          <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(lead.status)}`}>
                            {lead.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex items-start gap-2">
                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mt-0.5 shrink-0" />
                        <a href={`tel:${lead.phoneNumber}`} className="text-blue-600 hover:underline break-all">
                          {lead.phoneNumber}
                        </a>
                      </div>
                      {lead.website && (
                        <div className="flex items-start gap-2">
                          <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mt-0.5 shrink-0" />
                          <a 
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {lead.website}
                          </a>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mt-0.5 shrink-0" />
                        <span className="text-gray-600 wrap-break-word line-clamp-2">{lead.address}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-gray-700 font-medium text-xs mb-1">Problem:</p>
                        <p className="text-gray-600 text-xs line-clamp-2">{lead.problem}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-4">
                      <Button
                        onClick={() => router.push(`/dashboard/edit-lead/${lead._id}`)}
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(lead._id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 h-8 sm:h-9 px-2 sm:px-3"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                  Showing page {currentPage} of {totalPages} ({totalLeads} total leads)
                </div>
                <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                  <Button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    First
                  </Button>
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="h-8 sm:h-9 px-2 sm:px-3"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="h-8 sm:h-9 w-8 sm:w-9 p-0 text-xs sm:text-sm"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="h-8 sm:h-9 px-2 sm:px-3"
                  >
                    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
