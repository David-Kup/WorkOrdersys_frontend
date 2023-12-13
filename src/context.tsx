import React, { createContext, Dispatch, SetStateAction } from 'react';

interface MyContextType {
  language: string;
  setLanguage: Dispatch<SetStateAction<string>>;
  // ... other context values and setters
}

const MyContext = createContext<MyContextType>({
  language: 'en', // default language
  setLanguage: () => {},
  // ... default values for other context properties
});

export default MyContext;
