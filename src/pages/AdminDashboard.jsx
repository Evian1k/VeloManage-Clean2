import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useService } from '@/contexts/ServiceContext';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStats from '@/components/admin/AdminStats';
import RequestList from '@/components/admin/RequestList';
import StatusUpdateDialog from '@/components/admin/StatusUpdateDialog';
import AdminMessages from '@/components/admin/AdminMessages';
import { Wrench, MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
  const { requests, updateRequestStatus } = useService();
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    request: null,
    actionType: '',
  });

  const handleStatusUpdate = (request, action) => {
    setDialogState({ isOpen: true, request, actionType: action });
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const completedRequests = requests.filter(req => req.status === 'completed');

  const requestTabs = [
    { value: 'pending', label: 'Pending', data: pendingRequests, emptyMessage: 'No pending requests. All requests have been processed.' },
    { value: 'approved', label: 'Approved', data: approvedRequests, emptyMessage: 'No requests are currently approved.' },
    { value: 'completed', label: 'Completed', data: completedRequests, emptyMessage: 'No requests have been completed yet.' },
    { value: 'all', label: 'All Requests', data: requests, emptyMessage: 'No service requests in the system.' },
  ];

  return (
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Admin Dashboard - AutoCare Pro</title>
        <meta name="description" content="Administrative dashboard for managing service requests, approvals, and system oversight." />
      </Helmet>
      
      <AdminHeader />
      <AdminStats requests={requests} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-red-900/30">
            <TabsTrigger value="requests" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Wrench className="w-4 h-4 mr-2" /> Service Requests
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" /> Messages
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests">
            <Tabs defaultValue="pending" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-black/50 border border-red-900/30">
                {requestTabs.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                    {tab.label} ({tab.data.length})
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {requestTabs.map(tab => (
                <TabsContent key={tab.value} value={tab.value} className="space-y-4">
                  <RequestList 
                    requests={tab.data}
                    onStatusUpdate={handleStatusUpdate}
                    emptyMessage={tab.emptyMessage}
                    statusFilter={tab.value !== 'all' ? tab.value : undefined}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          <TabsContent value="messages">
            <AdminMessages />
          </TabsContent>
        </Tabs>
      </motion.div>
      
      <StatusUpdateDialog
        dialogState={dialogState}
        setDialogState={setDialogState}
        updateRequestStatus={updateRequestStatus}
      />
    </div>
  );
};

export default AdminDashboard;