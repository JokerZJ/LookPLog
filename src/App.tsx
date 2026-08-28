import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { ClothingProvider } from './contexts/ClothingContext'
import { LooksProvider } from './contexts/LooksContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { AddClothingPage } from './pages/AddClothingPage'
import { EditClothingPage } from './pages/EditClothingPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { OutfitsPage } from './pages/OutfitsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ActivityManagementPage } from './pages/settings/ActivityManagementPage'
import { BirthdayManagementPage } from './pages/settings/BirthdayManagementPage'
import { ConfigManagementPage } from './pages/settings/ConfigManagementPage'
import { WardrobePage } from './pages/WardrobePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <ClothingProvider>
                <LooksProvider>
                  <SettingsProvider>
                    <AppLayout />
                  </SettingsProvider>
                </LooksProvider>
              </ClothingProvider>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="wardrobe" element={<WardrobePage />} />
            <Route path="wardrobe/edit/:id" element={<EditClothingPage />} />
            <Route path="outfits" element={<OutfitsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/birthdays" element={<BirthdayManagementPage />} />
            <Route path="settings/events" element={<ActivityManagementPage />} />
            <Route path="settings/config" element={<ConfigManagementPage />} />
            <Route path="add" element={<AddClothingPage />} />
            <Route path="fitting" element={<Navigate to="/outfits" replace />} />
            <Route path="looks" element={<Navigate to="/outfits" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
