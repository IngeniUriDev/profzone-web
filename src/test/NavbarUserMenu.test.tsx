import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../components/common/Navbar';
import type { UserProfile } from '../types/database';

describe('Navbar - User Session and Dropdown Menu', () => {
  const defaultProps = {
    onOpenRegister: vi.fn(),
    onOpenAdmin: vi.fn(),
    onOpenAuth: vi.fn(),
    onOpenFeedback: vi.fn(),
    onOpenAbout: vi.fn(),
    onOpenContact: vi.fn(),
    onGoHome: vi.fn(),
    onOpenMyBusinesses: vi.fn(),
    myBusinessesCount: 2,
    activeView: 'all' as const,
    currentUser: null,
    onSignOut: vi.fn(),
    pendingCount: 0,
    unreadFeedbackCount: 0,
    onOpenNotifications: vi.fn(),
    theme: 'light' as const,
    onToggleTheme: vi.fn(),
  };

  it('hides "Mis Negocios" completely when user is not logged in', () => {
    render(<Navbar {...defaultProps} currentUser={null} />);

    // Unauthenticated visitors should see "Ingresar" and not "Mis Negocios"
    expect(screen.getByText('Ingresar')).toBeInTheDocument();
    expect(screen.queryByText('Mis Negocios')).toBeNull();
    expect(screen.queryByTestId('user-dropdown-menu')).toBeNull();
  });

  it('renders "Mis Negocios" and user menu trigger when user is logged in', () => {
    const mockUser: UserProfile = {
      id: 'usr-123',
      provider: 'google',
      full_name: 'Juan Perez',
      email: 'juan@example.com',
      role: 'user',
      created_at: new Date().toISOString(),
    };

    render(<Navbar {...defaultProps} currentUser={mockUser} />);

    // "Mis Negocios" should be visible
    expect(screen.getByText('Mis Negocios')).toBeInTheDocument();
    expect(screen.getByText('Juan Perez')).toBeInTheDocument();

    // User dropdown trigger should exist
    const userMenuBtn = screen.getByRole('button', { name: /Menú de funciones de usuario/i });
    expect(userMenuBtn).toBeInTheDocument();

    // Click user menu button to open dropdown
    fireEvent.click(userMenuBtn);

    // Dropdown should be visible with user options
    expect(screen.getByText('Registrar Nuevo Negocio')).toBeInTheDocument();
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  it('calls onSignOut when clicking "Cerrar Sesión" inside the user dropdown', () => {
    const onSignOut = vi.fn();
    const mockUser: UserProfile = {
      id: 'usr-123',
      provider: 'google',
      full_name: 'Juan Perez',
      email: 'juan@example.com',
      role: 'user',
      created_at: new Date().toISOString(),
    };

    render(<Navbar {...defaultProps} currentUser={mockUser} onSignOut={onSignOut} />);

    const userMenuBtn = screen.getByRole('button', { name: /Menú de funciones de usuario/i });
    fireEvent.click(userMenuBtn);

    const logoutBtn = screen.getByText('Cerrar Sesión');
    fireEvent.click(logoutBtn);

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('renders admin options inside user dropdown when user has admin role', () => {
    const onOpenAdmin = vi.fn();
    const mockAdmin: UserProfile = {
      id: 'adm-001',
      provider: 'phone',
      full_name: 'Administrador Principal',
      phone: '7141087330',
      role: 'admin',
      created_at: new Date().toISOString(),
    };

    render(<Navbar {...defaultProps} currentUser={mockAdmin} onOpenAdmin={onOpenAdmin} pendingCount={3} />);

    const userMenuBtn = screen.getByRole('button', { name: /Menú de funciones de usuario/i });
    fireEvent.click(userMenuBtn);

    expect(screen.getByText('ADMINISTRACIÓN')).toBeInTheDocument();
    const adminPanelBtn = screen.getByRole('button', { name: /Panel Administrador 3/i });
    expect(adminPanelBtn).toBeInTheDocument();

    fireEvent.click(adminPanelBtn);
    expect(onOpenAdmin).toHaveBeenCalledTimes(1);
  });
});
