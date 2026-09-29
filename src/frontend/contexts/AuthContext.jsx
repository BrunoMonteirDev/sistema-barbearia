import { createContext, useContext, useEffect, useState } from "react";
import { api, authStorage } from "@/lib/api";
const Context = createContext(undefined);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!authStorage.get()) {
      setLoading(false);
      return;
    }
    api.usuarios
      .me()
      .then(setUser)
      .catch(() => {
        authStorage.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);
  const signIn = async (email, password) => {
    const resultado = await api.auth.login({ email, password });
    authStorage.set(resultado.token);
    setUser(resultado.user);
  };
  const signInGoogle = async (idToken) => {
    const resultado = await api.auth.google(idToken);
    authStorage.set(resultado.token);
    setUser(resultado.user);
    return resultado.user;
  };
  const signUp = async (nome, email, password) => {
    const resultado = await api.auth.register({ nome, email, password });
    authStorage.set(resultado.token);
    setUser(resultado.user);
  };
  const atualizarUsuario = (usuario) => setUser(usuario);
  const signOut = () => {
    authStorage.clear();
    setUser(null);
  };
  return (
    <Context.Provider
      value={{
        user,
        loading,
        signIn,
        signInGoogle,
        signUp,
        atualizarUsuario,
        signOut,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return value;
}
