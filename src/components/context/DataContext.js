import { useState, createContext } from "react";

export const DataContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function DataStateProvider(props) {
  const [groupMounted, setGroupMounted] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [groupData, setGroupData] = useState({
    name: "",
    image: { url: "", filename: "", thumbnail: "" },
    channels: {
      text: [],
      task: [],
    },
  });

  // * you can also put functions here and export them
  // * push this this to array etc

  const dataState = {
    groupData,
    setGroupData,
    groupMounted,
    setGroupMounted,
    isLoggedIn,
    setIsLoggedIn,
  };

  return (
    <DataContext.Provider value={dataState}>
      {props.children}
    </DataContext.Provider>
  );
}
