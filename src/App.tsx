import React, { useState, useEffect } from 'react';
import { Equipment, BorrowRecord, PMRecord, User, ThemeTemplate, UserPermissionRole, EquipmentCatalogItem, MaintenanceRecord } from './types';
import { StorageService } from './services/storage';
import { THEME_CONFIGS } from './services/theme';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EquipmentList } from './components/EquipmentList';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { BorrowReturnModal } from './components/BorrowReturnModal';
import { BorrowList } from './components/BorrowList';
import { PMCalAlerts } from './components/PMCalAlerts';
import { PMCalModal } from './components/PMCalModal';
import { StickerPrintModal } from './components/StickerPrintModal';
import { QRScannerModal } from './components/QRScannerModal';
import { CustomerCallModal } from './components/CustomerCallModal';
import { CustomerCallTracker } from './components/CustomerCallTracker';
import { UserManagement } from './components/UserManagement';
import { AuthModal } from './components/AuthModal';
import { PendingApprovalView } from './components/PendingApprovalView';
import { MaintenanceView } from './components/MaintenanceView';
import { ReportsAnalyticsView } from './components/ReportsAnalyticsView';
import { MasterCatalogModal } from './components/MasterCatalogModal';
import { DataBackupModal } from './components/DataBackupModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(StorageService.getCurrentUser());
  const [users, setUsers] = useState<User[]>(StorageService.getAllUsers());
  const [currentTheme, setCurrentTheme] = useState<ThemeTemplate>('clinical-light');

  // Auth modal & session state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => localStorage.getItem('medequip_session_active') === 'true'
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Data states
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [pmRecords, setPmRecords] = useState<PMRecord[]>([]);
  const [catalog, setCatalog] = useState<EquipmentCatalogItem[]>([]);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceRecord[]>([]);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [detailEquipment, setDetailEquipment] = useState<Equipment | null>(null);
  const [borrowReturnModalConfig, setBorrowReturnModalConfig] = useState<{
    isOpen: boolean;
    mode: 'BORROW' | 'RETURN';
    equipment: Equipment | null;
    borrowRecord: BorrowRecord | null;
  }>({
    isOpen: false,
    mode: 'BORROW',
    equipment: null,
    borrowRecord: null,
  });

  const [pmModalEquipment, setPmModalEquipment] = useState<Equipment | null>(null);
  const [stickerModalEquipment, setStickerModalEquipment] = useState<Equipment | null>(null);
  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [callModalBorrowRecord, setCallModalBorrowRecord] = useState<BorrowRecord | null>(null);
  const [isMasterCatalogModalOpen, setIsMasterCatalogModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Refresh all state
  const refreshData = () => {
    setEquipmentList(StorageService.getEquipmentList());
    setBorrowRecords(StorageService.getBorrowRecords());
    setPmRecords(StorageService.getPMRecords());
    setCatalog(StorageService.getEquipmentCatalog());
    setMaintenanceList(StorageService.getMaintenanceRecords());
    setUsers(StorageService.getAllUsers());
    setCurrentUser(StorageService.getCurrentUser());
    setCurrentTheme(StorageService.getTheme());
  };

  useEffect(() => {
    StorageService.initStorage();
    refreshData();
  }, []);

  // Update theme class on HTML element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-clinical-light', 'theme-dark-slate', 'theme-emerald-health', 'theme-ocean-blue', 'dark');
    root.classList.add(`theme-${currentTheme}`);
  }, [currentTheme]);

  // Handlers for Theme & Auth
  const handleSelectTheme = (theme: ThemeTemplate) => {
    StorageService.setTheme(theme);
    setCurrentTheme(theme);
  };

  const handleSelectUser = (user: User) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('medequip_session_active', 'true');
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('medequip_session_active', 'false');
    setIsAuthModalOpen(true);
  };

  const handleRegisterUser = (userData: {
    name: string;
    email: string;
    password?: string;
    department: string;
    phone?: string;
    requestedRole: UserPermissionRole;
  }) => {
    const newUser = StorageService.registerUser(userData);
    refreshData();
    return newUser;
  };

  const handleApproveUser = (userId: string, assignedRole: UserPermissionRole) => {
    StorageService.approveUser(userId, assignedRole);
    refreshData();
  };

  const handleRejectUser = (userId: string) => {
    StorageService.rejectUser(userId);
    refreshData();
  };

  const handleDeleteUser = (userId: string) => {
    StorageService.deleteUser(userId);
    refreshData();
  };

  const handleResetData = () => {
    StorageService.resetToDefault();
    refreshData();
  };

  const handleSaveEquipment = (equipmentData: Partial<Equipment>) => {
    StorageService.saveEquipment(equipmentData);
    refreshData();
  };

  const handleDeleteEquipment = (id: string) => {
    StorageService.deleteEquipment(id);
    refreshData();
  };

  const handleDeleteAllEquipment = () => {
    StorageService.deleteAllEquipment();
    refreshData();
  };

  const handleDeleteBorrowRecord = (borrowId: string) => {
    StorageService.deleteBorrowRecord(borrowId);
    refreshData();
  };

  const handleDeleteMaintenanceRecord = (ticketId: string) => {
    StorageService.deleteMaintenanceRecord(ticketId);
    refreshData();
  };

  const handleConfirmBorrow = (params: any) => {
    StorageService.borrowEquipment(params);
    refreshData();
  };

  const handleConfirmReturn = (params: any) => {
    StorageService.returnEquipment(params);
    refreshData();
  };

  const handleSavePM = (params: any) => {
    StorageService.recordPMCompletion(params);
    refreshData();
  };

  const handleSaveCallLog = (params: any) => {
    StorageService.addCustomerCallLog(params);
    refreshData();
  };

  const handleToggleCustomerCallStatus = (borrowId: string, called: boolean) => {
    StorageService.toggleCustomerCallStatus(borrowId, called);
    refreshData();
  };

  // Open sticker modal for single or all equipment
  const handleOpenStickerModalForEquipment = (equipment: Equipment | null) => {
    setStickerModalEquipment(equipment);
    setIsStickerModalOpen(true);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingCallsCount = borrowRecords.filter((b) => b.status === 'ACTIVE' && !b.isCustomerCalled).length;
  const duePmCalCount = equipmentList.filter(
    (e) => (e.nextPmDate && e.nextPmDate < todayStr) || (e.nextCalDate && e.nextCalDate < todayStr)
  ).length;
  const pendingUsersCount = users.filter((u) => u.approvalStatus === 'PENDING_APPROVAL').length;
  const pendingRepairsCount = maintenanceList.filter((r) => r.status === 'PENDING').length;

  const activeThemeConfig = THEME_CONFIGS[currentTheme] || THEME_CONFIGS['clinical-light'];
  const isPendingApproval = currentUser.approvalStatus === 'PENDING_APPROVAL';

  return (
    <div className={`min-h-screen ${activeThemeConfig.appBg} font-sans antialiased flex flex-col selection:bg-blue-500 selection:text-white transition-colors duration-300`}>
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        users={users}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        onSelectUser={handleSelectUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onResetData={handleResetData}
        onOpenScanner={() => setIsQRScannerOpen(true)}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        equipmentList={equipmentList}
        borrowRecords={borrowRecords}
        onOpenEquipmentDetail={(eq) => setDetailEquipment(eq)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Layout Container with Sidebar ON THE LEFT SIDE */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        
        {/* Sidebar (Menu items header topics on the right hand side) */}
        <Sidebar
          activeTab={activeTab}
          currentTheme={currentTheme}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'stickers') {
              setIsStickerModalOpen(true);
            }
          }}
          onOpenAddEquipment={() => {
            setActiveTab('equipment');
          }}
          pendingCallsCount={pendingCallsCount}
          duePmCalCount={duePmCalCount}
          pendingRepairsCount={pendingRepairsCount}
          pendingUsersCount={pendingUsersCount}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          
          {/* Unapproved User Screen Guard */}
          {isPendingApproval ? (
            <PendingApprovalView
              currentUser={currentUser}
              onLogoutOrSwitch={() => setIsAuthModalOpen(true)}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  equipmentList={equipmentList}
                  borrowRecords={borrowRecords}
                  onOpenEquipmentDetail={(eq) => setDetailEquipment(eq)}
                  onOpenBorrowModal={(eq) =>
                    setBorrowReturnModalConfig({ isOpen: true, mode: 'BORROW', equipment: eq, borrowRecord: null })
                  }
                  onOpenReturnModal={(b) =>
                    setBorrowReturnModalConfig({ isOpen: true, mode: 'RETURN', equipment: null, borrowRecord: b })
                  }
                  onOpenCustomerCallModal={(b) => setCallModalBorrowRecord(b)}
                  onOpenRecordPMModal={(eq) => setPmModalEquipment(eq)}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'equipment' && (
                <EquipmentList
                  equipmentList={equipmentList}
                  currentUser={currentUser}
                  borrowRecords={borrowRecords}
                  maintenanceList={maintenanceList}
                  catalog={catalog}
                  onOpenEquipmentDetail={(eq) => setDetailEquipment(eq)}
                  onOpenBorrowModal={(eq) =>
                    setBorrowReturnModalConfig({ isOpen: true, mode: 'BORROW', equipment: eq, borrowRecord: null })
                  }
                  onOpenReturnModal={(b) =>
                    setBorrowReturnModalConfig({ isOpen: true, mode: 'RETURN', equipment: null, borrowRecord: b })
                  }
                  onOpenRecordPMModal={(eq) => setPmModalEquipment(eq)}
                  onOpenStickerModal={(eq) => handleOpenStickerModalForEquipment(eq)}
                  onSaveEquipment={handleSaveEquipment}
                  onDeleteEquipment={handleDeleteEquipment}
                  onDeleteAllEquipment={handleDeleteAllEquipment}
                  onOpenMasterCatalogModal={() => setIsMasterCatalogModalOpen(true)}
                  onOpenBackupModal={() => setIsBackupModalOpen(true)}
                />
              )}

              {activeTab === 'borrows' && (
                <BorrowList
                  borrowRecords={borrowRecords}
                  equipmentList={equipmentList}
                  currentUser={currentUser}
                  onOpenBorrowModalForDevice={() => {
                    setBorrowReturnModalConfig({ isOpen: true, mode: 'BORROW', equipment: null, borrowRecord: null });
                  }}
                  onOpenReturnModal={(b) =>
                    setBorrowReturnModalConfig({ isOpen: true, mode: 'RETURN', equipment: null, borrowRecord: b })
                  }
                  onOpenCustomerCallModal={(b) => setCallModalBorrowRecord(b)}
                  onToggleCustomerCallStatus={handleToggleCustomerCallStatus}
                  onOpenEquipmentDetail={(eq) => setDetailEquipment(eq)}
                  onDeleteBorrowRecord={handleDeleteBorrowRecord}
                />
              )}

              {activeTab === 'pm_cal' && (
                <PMCalAlerts
                  equipmentList={equipmentList}
                  pmRecords={pmRecords}
                  onOpenRecordPMModal={(eq) => setPmModalEquipment(eq)}
                  onOpenEquipmentDetail={(eq) => setDetailEquipment(eq)}
                />
              )}

              {activeTab === 'maintenance' && (
                <MaintenanceView
                  maintenanceList={maintenanceList}
                  equipmentList={equipmentList}
                  currentUser={currentUser}
                  onRefreshData={refreshData}
                  onDeleteMaintenanceRecord={handleDeleteMaintenanceRecord}
                />
              )}

              {activeTab === 'calls' && (
                <CustomerCallTracker
                  borrowRecords={borrowRecords}
                  onOpenCustomerCallModal={(b) => setCallModalBorrowRecord(b)}
                  onToggleCustomerCallStatus={handleToggleCustomerCallStatus}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsAnalyticsView
                  equipmentList={equipmentList}
                  borrowList={borrowRecords}
                  pmList={pmRecords}
                  maintenanceList={maintenanceList}
                />
              )}

              {activeTab === 'users' && (
                <UserManagement
                  users={users}
                  currentUser={currentUser}
                  onApproveUser={handleApproveUser}
                  onRejectUser={handleRejectUser}
                  onDeleteUser={handleDeleteUser}
                />
              )}

              {activeTab === 'stickers' && !isStickerModalOpen && (
                <div className="p-8 text-center bg-white dark:bg-slate-900 border-2 border-blue-300 dark:border-blue-800 rounded-3xl shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">หน้าพิมพ์สติ๊กเกอร์ QR Code</h3>
                  <button
                    onClick={() => setIsStickerModalOpen(true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    เปิดหน้าต่างพิมพ์สติ๊กเกอร์
                  </button>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* ALL SYSTEM MODALS */}
      
      {/* Auth Modal (Login / Register / Account Switch) */}
      <AuthModal
        isOpen={isAuthModalOpen || !isLoggedIn}
        onClose={() => setIsAuthModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onRegisterUser={handleRegisterUser}
        isDismissible={isLoggedIn}
      />

      {/* 1. Equipment Detail Modal */}
      {detailEquipment && (
        <EquipmentDetailModal
          equipment={detailEquipment}
          borrowRecords={borrowRecords}
          pmRecords={pmRecords}
          onClose={() => setDetailEquipment(null)}
          onOpenBorrowModal={(eq) => {
            setDetailEquipment(null);
            setBorrowReturnModalConfig({ isOpen: true, mode: 'BORROW', equipment: eq, borrowRecord: null });
          }}
          onOpenReturnModal={(b) => {
            setDetailEquipment(null);
            setBorrowReturnModalConfig({ isOpen: true, mode: 'RETURN', equipment: null, borrowRecord: b });
          }}
          onOpenRecordPMModal={(eq) => {
            setDetailEquipment(null);
            setPmModalEquipment(eq);
          }}
          onOpenStickerModal={(eq) => {
            setDetailEquipment(null);
            handleOpenStickerModalForEquipment(eq);
          }}
          onOpenCustomerCallModal={(b) => {
            setDetailEquipment(null);
            setCallModalBorrowRecord(b);
          }}
          onDeleteEquipment={handleDeleteEquipment}
        />
      )}

      {/* 2. Borrow & Return Form Modal */}
      {borrowReturnModalConfig.isOpen && (
        <BorrowReturnModal
          mode={borrowReturnModalConfig.mode}
          equipment={borrowReturnModalConfig.equipment}
          equipmentList={equipmentList}
          borrowRecord={borrowReturnModalConfig.borrowRecord}
          currentUser={currentUser}
          users={users}
          onClose={() => setBorrowReturnModalConfig({ ...borrowReturnModalConfig, isOpen: false })}
          onConfirmBorrow={handleConfirmBorrow}
          onConfirmReturn={handleConfirmReturn}
        />
      )}

      {/* 3. PM / Cal Completion Modal */}
      {pmModalEquipment && (
        <PMCalModal
          equipment={pmModalEquipment}
          technicianName={currentUser.name}
          onClose={() => setPmModalEquipment(null)}
          onSavePM={handleSavePM}
        />
      )}

      {/* 4. Sticker Print Preview Modal */}
      {isStickerModalOpen && (
        <StickerPrintModal
          selectedEquipment={stickerModalEquipment}
          allEquipment={equipmentList}
          onClose={() => {
            setIsStickerModalOpen(false);
            setStickerModalEquipment(null);
          }}
        />
      )}

      {/* 5. QR Code Scanner Simulation Modal */}
      {isQRScannerOpen && (
        <QRScannerModal
          equipmentList={equipmentList}
          onClose={() => setIsQRScannerOpen(false)}
          onSelectEquipment={(eq) => {
            setIsQRScannerOpen(false);
            setDetailEquipment(eq);
          }}
        />
      )}

      {/* 6. Customer Call Log Modal */}
      {callModalBorrowRecord && (
        <CustomerCallModal
          borrowRecord={callModalBorrowRecord}
          callerStaffName={currentUser.name}
          onClose={() => setCallModalBorrowRecord(null)}
          onSaveCallLog={handleSaveCallLog}
        />
      )}

      {/* 7. Master Catalog Management Modal */}
      <MasterCatalogModal
        isOpen={isMasterCatalogModalOpen}
        onClose={() => setIsMasterCatalogModalOpen(false)}
        catalog={catalog}
        onRefreshData={refreshData}
        isAdmin={currentUser.permissionRole === 'ADMIN'}
      />

      {/* 8. Data Backup & Restore Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataImported={() => {
          refreshData();
        }}
        currentCount={equipmentList.length}
      />

    </div>
  );
}
