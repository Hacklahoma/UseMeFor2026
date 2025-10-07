import React, { createContext, useContext, useRef, ReactNode } from 'react';

interface OriginTarget {
  element: HTMLElement;
  id: string;
}

interface OriginContextType {
  registerOrigin: (element: HTMLElement, id: string) => void;
  unregisterOrigin: (id: string) => void;
  getOriginCenter: (id?: string) => { x: number; y: number } | null;
  getAllOrigins: () => OriginTarget[];
}

const OriginContext = createContext<OriginContextType | null>(null);

export const OriginProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const originsRef = useRef<Map<string, HTMLElement>>(new Map());

  const registerOrigin = (element: HTMLElement, id: string) => {
    originsRef.current.set(id, element);
  };

  const unregisterOrigin = (id: string) => {
    originsRef.current.delete(id);
  };

  const getOriginCenter = (id?: string) => {
    // If no ID provided, use the first registered origin
    const targetId = id || originsRef.current.keys().next().value;
    if (!targetId) return null;

    const element = originsRef.current.get(targetId);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    
    // Calculate center of the element
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Convert to normalized coordinates (0-1 scale)
    return {
      x: centerX / window.innerWidth,
      y: centerY / window.innerHeight
    };
  };

  const getAllOrigins = (): OriginTarget[] => {
    return Array.from(originsRef.current.entries()).map(([id, element]) => ({
      id,
      element
    }));
  };

  return (
    <OriginContext.Provider value={{
      registerOrigin,
      unregisterOrigin,
      getOriginCenter,
      getAllOrigins
    }}>
      {children}
    </OriginContext.Provider>
  );
};

// Hook for components to register themselves as origin targets
export const useOriginTarget = (id: string) => {
  const context = useContext(OriginContext);
  if (!context) {
    throw new Error('useOriginTarget must be used within an OriginProvider');
  }

  const elementRef = useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (elementRef.current) {
      context.registerOrigin(elementRef.current, id);
    }

    return () => {
      context.unregisterOrigin(id);
    };
  }, [context, id]);

  return elementRef;
};

// Hook for components to access origin information
export const useOriginDetection = () => {
  const context = useContext(OriginContext);
  if (!context) {
    throw new Error('useOriginDetection must be used within an OriginProvider');
  }

  return context;
};
