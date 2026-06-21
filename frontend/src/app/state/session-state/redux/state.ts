export interface SessionState {
  token: string | null;
  nombre: string | null;
  email: string | null;
  rol: string | null;
  isAuthenticated: boolean;
}

export const initialSessionState: SessionState = {
  token: null,
  nombre: null,
  email: null,
  rol: null,
  isAuthenticated: false
};

const getInitialSessionState = (): SessionState => {
  if (typeof localStorage === 'undefined') {
    return initialSessionState;
  }

  const token = localStorage.getItem('token');
  const nombre = localStorage.getItem('nombre');
  const email = localStorage.getItem('email');
  const rol = localStorage.getItem('rol');

  return {
    token,
    nombre,
    email,
    rol,
    isAuthenticated: !!token
  };
};

export const hydratedSessionState: SessionState = getInitialSessionState();
