import { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuthenticatedLayout } from '../../hooks/layout';
import { Button } from '../ui/button';

const ClipSelectorModal = lazy(() => import('../pages/monitoring/ClipSelectorModal'));
const ActivityLogPreviewModal = lazy(() => import('../pages/monitoring/ActivityLogPreviewModal'));
const XiaomiLoginModal = lazy(() => import('../pages/monitoring/XiaomiLoginModal'));

export default function AuthenticatedLayout() {
  const state = useAuthenticatedLayout();

  if (!state.currentUser) {
    // No login page locally — render layout without user-specific features
  }

  return (
    <div id="hotel-app-root" className="flex bg-slate-50 w-full h-screen text-slate-800 font-sans leading-relaxed text-sm antialiased overflow-x-hidden">
      <Sidebar
        activeTab={state.activeTab}
        setActiveTab={state.handleNavigateTab}
        hasUnsentLogs={state.hasUnsentLogs}
        role={state.currentUser.role}
        isOpen={state.isSidebarOpen}
        onClose={() => state.setIsSidebarOpen(false)}
        adminName={`${state.currentUser.lastName}${state.currentUser.firstName}`}
        userEmail={state.currentUser.email ?? state.currentUser.phoneNumber ?? state.currentUser.emailOrPhone}
        onLogout={state.handleLogout}
        onMenuClick={() => state.setIsSidebarOpen(true)}
        xiaomiConnected={state.xiaomiConnected}
        onXiaomiLogout={state.handleXiaomiLogout}
      />

      <div id="main-scroller" className="flex-1 flex flex-col min-h-screen min-w-0 relative">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 py-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => state.setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>

        <main id="app-main-viewport" className="flex-1 overflow-y-auto pb-16">
          <Outlet
            context={{
              selectedPetId: state.selectedPetId,
              setSelectedPetId: state.setSelectedPetId,
              petsList: state.petsList,
              setPetsList: state.setPetsList,
              onSelectCamera: state.handleSelectCameraFromOverview,
              onSelectPet: state.handleSelectPetFromOverview,
              onOpenClipsModal: () => state.setIsClipsOpen(true),
              onGenerateLog: () => state.setIsLogPreviewOpen(true),
              onOpenXiaomiLogin: () => state.setIsXiaomiLoginOpen(true),
              onXiaomiLogout: state.handleXiaomiLogout,
              xiaomiConnected: state.xiaomiConnected,
              showToast: state.showToast,
              navigate: state.navigate,
            }}
          />
        </main>
      </div>

      {state.isClipsOpen && (
        <Suspense fallback={null}>
          <ClipSelectorModal
            petName={state.activePetObj.name}
            clips={state.monitorClips}
            getVideoUrl={(clip) => clip.videoUrl ? state.getMonitorClipVideoUrl(clip.videoUrl) : null}
            onClose={() => state.setIsClipsOpen(false)}
          />
        </Suspense>
      )}

      {state.isLogPreviewOpen && (
        <Suspense fallback={null}>
          <ActivityLogPreviewModal
            petId={state.selectedPetId}
            onClose={() => state.setIsLogPreviewOpen(false)}
            onSendSuccess={() => state.handleLogSendSuccess()}
          />
        </Suspense>
      )}

      {state.isXiaomiLoginOpen && (
        <Suspense fallback={null}>
          <XiaomiLoginModal
            open={state.isXiaomiLoginOpen}
            onClose={() => state.setIsXiaomiLoginOpen(false)}
            onSuccess={() => { state.setIsXiaomiLoginOpen(false); state.refreshXiaomiStatus(); }}
            onStatusChange={() => state.refreshXiaomiStatus()}
          />
        </Suspense>
      )}
    </div>
  );
}
